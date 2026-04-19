/**
 * Thin client for the Jarvis agent API.
 * Server-side only (uses env var), never exposed to the browser.
 */

const AGENT_URL =
  process.env.JARVIS_API_URL || process.env.NEXT_PUBLIC_JARVIS_API || "https://agent.telehost.net";

export async function agent<T = unknown>(
  path: string,
  init?: RequestInit & { token?: string }
): Promise<{ ok: boolean; status: number; data: T; raw?: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.token) headers["Authorization"] = `Bearer ${init.token}`;

  const url = `${AGENT_URL}${path}`;
  console.log(`[agent] → ${init?.method ?? "GET"} ${url}`);

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch (e) {
    console.error(`[agent] fetch failed for ${url}:`, e);
    throw e;
  }

  const text = await res.text();
  let data: T;
  let parseOk = true;
  try {
    data = JSON.parse(text) as T;
  } catch {
    parseOk = false;
    data = text as unknown as T;
  }

  if (!res.ok) {
    console.error(
      `[agent] ← ${res.status} ${url} parsed=${parseOk} body=${text.slice(0, 500)}`
    );
  } else {
    console.log(`[agent] ← ${res.status} ${url}`);
  }

  return { ok: res.ok, status: res.status, data, raw: parseOk ? undefined : text };
}
