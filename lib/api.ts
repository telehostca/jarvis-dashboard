/**
 * Thin client for the Jarvis agent API.
 * Server-side only (uses env var), never exposed to the browser.
 */

const AGENT_URL =
  process.env.JARVIS_API_URL || process.env.NEXT_PUBLIC_JARVIS_API || "https://agent.telehost.net";

export async function agent<T = unknown>(
  path: string,
  init?: RequestInit & { token?: string }
): Promise<{ ok: boolean; status: number; data: T }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.token) headers["Authorization"] = `Bearer ${init.token}`;

  const res = await fetch(`${AGENT_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const text = await res.text();
  let data: T;
  try {
    data = JSON.parse(text) as T;
  } catch {
    data = text as unknown as T;
  }

  return { ok: res.ok, status: res.status, data };
}
