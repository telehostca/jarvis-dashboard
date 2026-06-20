import { streamText, type LanguageModelV1 } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import type { NextRequest } from "next/server";

/**
 * Chat proxy — sends messages to Claude Haiku for a live preview of
 * what Jarvis can do. Users can try it before signing up.
 *
 * In production (authenticated), this would route through the Jarvis
 * agent with the user's tenant scope. For now (preview), it's a demo
 * using the same Haiku model.
 */
export const runtime = "nodejs";
export const maxDuration = 30;

const DEMO_SYSTEM_PROMPT = `You are Jarvis, a demo of an autonomous monitoring agent built by TeleHost C.A.

You help developers understand what Jarvis does:
- Monitors apps via a standardized /jarvis/health endpoint
- Alerts via WhatsApp when something breaks
- Never hallucinates — always cites sources
- Suggests concrete actions with evidence

Rules for this demo:
- Keep responses short (max 400 chars, it's WhatsApp-style)
- Answer in Spanish if user writes in Spanish, English otherwise
- If asked what you can do, give examples of real alerts
- If asked about pricing, mention Free/Pro/Business/Enterprise tiers
- NEVER make up numbers about "their system" — you don't have access to any real data yet
- Encourage them to sign up to connect their real apps`;

// The dashboard manages its own LLM key. Prefer DeepSeek-V3 (the TeleHost stack),
// then OpenRouter, then Anthropic — whichever key is configured here.
function demoModel(): LanguageModelV1 | null {
  if (process.env.DEEPSEEK_API_KEY) {
    return createOpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
      compatibility: "compatible",
    }).chat("deepseek-chat");
  }
  if (process.env.OPENROUTER_API_KEY) {
    return createOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      compatibility: "compatible",
    }).chat("deepseek/deepseek-chat");
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic("claude-haiku-4-5-20251001");
  }
  return null;
}

export async function POST(req: NextRequest) {
  const model = demoModel();
  if (!model) {
    console.error("[api/chat] no LLM key configured");
    return new Response(
      JSON.stringify({
        error:
          "Chat demo no configurado: falta una API key de LLM (DEEPSEEK_API_KEY, OPENROUTER_API_KEY o ANTHROPIC_API_KEY).",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages } = await req.json();

    const result = streamText({
      model,
      system: DEMO_SYSTEM_PROMPT,
      messages,
      temperature: 0.3,
      maxTokens: 500,
      // API/auth/credit errors surface during streaming (after this returns),
      // so the route try/catch can't see them — log them here instead.
      onError: ({ error }) => {
        console.error("[api/chat] stream error:", error);
      },
    });

    // Without getErrorMessage the AI SDK masks the cause as "An error occurred",
    // which is why the demo failed silently. Surface a useful message instead.
    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("[api/chat] surfaced error:", msg);
        if (/authentication|401|api[_-]?key|credit|quota|billing/i.test(msg)) {
          return "El servicio de IA rechazó la credencial o no tiene saldo. Revisá ANTHROPIC_API_KEY.";
        }
        return `No pude responder: ${msg.slice(0, 160)}`;
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
