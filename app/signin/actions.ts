"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { agent } from "@/lib/api";

export type SigninState = {
  error?: string;
  otp_id?: string;
  phone?: string;
};

export async function startSignin(
  _prev: SigninState,
  formData: FormData
): Promise<SigninState> {
  const phone = String(formData.get("phone") ?? "").trim();
  if (!phone) return { error: "Phone is required" };

  const { ok, status, data } = await agent<{
    otp_id?: string;
    phone?: string;
    error?: string;
    message?: string;
  }>("/api/v1/auth/signin", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });

  if (!ok) {
    return { error: data.message || data.error || `HTTP ${status}` };
  }

  return { otp_id: data.otp_id, phone: data.phone };
}

export async function verifyOtp(
  _prev: SigninState,
  formData: FormData
): Promise<SigninState> {
  const otp_id = String(formData.get("otp_id") ?? "");
  const code = String(formData.get("code") ?? "").trim();

  if (!otp_id || code.length !== 6) return { error: "Code must be 6 digits" };

  const { ok, status, data } = await agent<{
    error?: string;
    message?: string;
    session_token?: string;
  }>("/api/v1/auth/verify", {
    method: "POST",
    body: JSON.stringify({ otp_id, code }),
  });

  if (!ok || !data.session_token) {
    return { error: data.message || data.error || `HTTP ${status}` };
  }

  const cookieStore = await cookies();
  cookieStore.set("jarvis_session", data.session_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 3600,
    path: "/",
  });

  redirect("/dashboard");
}
