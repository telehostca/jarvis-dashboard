"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, MessageSquare } from "lucide-react";
import { startSignup, verifyOtp, type SignupState } from "./actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(
    startSignup,
    {}
  );
  const [verifyState, verifyAction, verifyPending] = useActionState<
    SignupState,
    FormData
  >(verifyOtp, {});

  // Step 1: email + phone + company
  if (!state.otp_id) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="flex items-center gap-2 mb-8 text-gray-400 hover:text-white"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Jarvis</span>
          </Link>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h1 className="text-2xl font-bold mb-2">Create your account</h1>
            <p className="text-gray-400 text-sm mb-6">
              Free forever. No credit card. Just answer 3 questions.
            </p>

            <form action={formAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company name
                </label>
                <input
                  name="company_name"
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  WhatsApp number
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="584121234567"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  With country code, no + sign. We&apos;ll send you a verification code.
                </p>
              </div>

              {state.error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg p-3">
                  {state.error}
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {pending ? "Sending code..." : "Send code to WhatsApp"}
                {!pending && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link href="/signin" className="text-cyan-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Step 2: verify OTP
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center gap-2 mb-8 text-gray-400 hover:text-white"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">Jarvis</span>
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Check WhatsApp</h1>
              <p className="text-sm text-gray-400">
                Code sent to +{state.phone}
              </p>
            </div>
          </div>

          <form action={verifyAction} className="space-y-4">
            <input type="hidden" name="otp_id" value={state.otp_id} />

            <div>
              <label className="block text-sm font-medium mb-1">
                6-digit code
              </label>
              <input
                name="code"
                type="text"
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoFocus
                placeholder="000000"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>

            {verifyState.error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg p-3">
                {verifyState.error}
              </div>
            )}

            <button
              type="submit"
              disabled={verifyPending}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-medium py-3 rounded-lg transition"
            >
              {verifyPending ? "Verifying..." : "Verify and continue"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-4">
            Didn&apos;t receive the code? Check your WhatsApp.
          </p>
        </div>
      </div>
    </main>
  );
}
