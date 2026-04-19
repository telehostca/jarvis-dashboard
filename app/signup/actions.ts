"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { agent } from "@/lib/api";

export type SignupState = {
  error?: string;
  otp_id?: string;
  phone?: string;
};

export async function startSignup(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const company = String(formData.get("company_name") ?? "").trim();

  if (!email || !phone || !company) {
    return { error: "All fields are required" };
  }

  try {
    const { ok, status, data, raw } = await agent<{
      otp_id?: string;
      phone?: string;
      tenant_id?: string;
      error?: string;
      message?: string;
    }>("/api/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, phone, company_name: company }),
    });

    console.log("[signup] agent response:", { status, ok, data, raw });

    if (!ok) {
      // If agent returned non-JSON (plain text error), surface it
      if (raw) {
        return { error: `Agent ${status}: ${raw.slice(0, 200)}` };
      }
      return {
        error:
          data.message ||
          data.error ||
          `Agent HTTP ${status}`,
      };
    }

    if (!data.otp_id) {
      return {
        error: "Missing otp_id. Raw: " + JSON.stringify(data).slice(0, 300),
      };
    }

    return { otp_id: data.otp_id, phone: data.phone };
  } catch (e) {
    console.error("[signup] network error:", e);
    return { error: "Network: " + (e as Error).message };
  }
}

export async function verifyOtp(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const otp_id = String(formData.get("otp_id") ?? "");
  const code = String(formData.get("code") ?? "").trim();

  if (!otp_id || !code || code.length !== 6) {
    return { error: "Code must be 6 digits" };
  }

  const { ok, status, data } = await agent<{
    error?: string;
    message?: string;
    session_token?: string;
    api_key?: string;
    tenant?: { id: string; name: string };
  }>("/api/v1/auth/verify", {
    method: "POST",
    body: JSON.stringify({ otp_id, code }),
  });

  if (!ok || !data.session_token) {
    return { error: data.message || data.error || `HTTP ${status}` };
  }

  // Set session cookie on Next.js side too
  const cookieStore = await cookies();
  cookieStore.set("jarvis_session", data.session_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 3600,
    path: "/",
  });

  // If API key was returned (first signup), stash it temporarily to show in dashboard
  if (data.api_key) {
    cookieStore.set("jarvis_new_api_key", data.api_key, {
      httpOnly: false, // client will read it once
      secure: true,
      sameSite: "lax",
      maxAge: 300, // 5 min
      path: "/",
    });
  }

  redirect("/dashboard");
}
