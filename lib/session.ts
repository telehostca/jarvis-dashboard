"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { agent } from "./api";

export interface SessionTenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
}

export interface SessionInfo {
  tenant: SessionTenant;
  session: {
    tenant_id: string;
    phone: string;
    expires_at: number;
  };
  token: string;
}

/**
 * Read the current session from cookie and verify with the agent.
 * Returns null if not authenticated. If `required`, redirects to /signin.
 */
export async function getSession(required = false): Promise<SessionInfo | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("jarvis_session")?.value;

  if (!token) {
    if (required) redirect("/signin");
    return null;
  }

  const { ok, data } = await agent<{
    tenant: SessionTenant;
    session: { tenant_id: string; phone: string; expires_at: number };
    error?: string;
  }>("/api/v1/auth/me", { token });

  if (!ok || !data.tenant) {
    // invalid token — clear cookie and redirect
    cookieStore.delete("jarvis_session");
    if (required) redirect("/signin");
    return null;
  }

  return {
    tenant: data.tenant,
    session: data.session,
    token,
  };
}

export async function signout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("jarvis_session");
  redirect("/");
}
