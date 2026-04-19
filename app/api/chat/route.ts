import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
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

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: anthropic("claude-haiku-4-5"),
      system: DEMO_SYSTEM_PROMPT,
      messages,
      temperature: 0.3,
      maxTokens: 500,
    });

    return result.toDataStreamResponse();
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
