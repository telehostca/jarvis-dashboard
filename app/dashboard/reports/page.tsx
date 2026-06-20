import { getSession } from "@/lib/session";
import { agent } from "@/lib/api";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  FileBarChart2,
  Calendar,
  Users,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

async function sendTestReport() {
  "use server";
  const session = await getSession(true);
  if (!session) return;

  const { ok, data } = await agent<{
    ok?: boolean;
    recipients_sent?: number;
    message?: string;
    error?: string;
  }>("/api/v1/tenant/reports/weekly/test", {
    method: "POST",
    token: session.token,
    body: "{}",
  });

  if (!ok || !data.ok) {
    redirect(
      `/dashboard/reports?error=${encodeURIComponent(
        data.message ?? data.error ?? "No se pudo enviar el reporte"
      )}`
    );
  }
  redirect(`/dashboard/reports?sent=${data.recipients_sent ?? 0}`);
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const session = await getSession(true);
  if (!session) return null;
  const params = await searchParams;

  const { ok, data } = await agent<{ recipients?: string[]; apps?: unknown[] }>(
    "/api/v1/tenant/me",
    { token: session.token }
  );
  const recipients = ok ? data.recipients ?? [] : [];
  const appsCount = ok ? data.apps?.length ?? 0 : 0;
  const canSend = recipients.length > 0 && appsCount > 0;

  return (
    <main className="min-h-screen">
      <nav className="border-b border-white/5 bg-black/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold">Weekly reports</span>
          <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-300 rounded-full ml-2">
            activo
          </span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <FileBarChart2 className="w-7 h-7 text-cyan-400" />
          <h1 className="text-3xl font-bold">Weekly reports</h1>
        </div>
        <p className="text-gray-400 mb-8">
          Cada domingo Jarvis envía a tu WhatsApp un resumen de la semana: estado
          de tus apps, alertas nuevas/resueltas y la tendencia.
        </p>

        {params.sent !== undefined && (
          <div className="mb-6 flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-300 text-sm rounded-lg p-3">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Reporte de prueba enviado a {params.sent} destinatario(s). Revisa tu WhatsApp.
          </div>
        )}
        {params.error && (
          <div className="mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg p-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {params.error}
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <Calendar className="w-5 h-5 text-cyan-400 mb-2" />
            <div className="text-sm text-gray-400">Programado</div>
            <div className="font-semibold">Domingos 9:00 (VET)</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <Users className="w-5 h-5 text-cyan-400 mb-2" />
            <div className="text-sm text-gray-400">Destinatarios</div>
            <div className="font-semibold">{recipients.length}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <FileBarChart2 className="w-5 h-5 text-cyan-400 mb-2" />
            <div className="text-sm text-gray-400">Apps monitoreadas</div>
            <div className="font-semibold">{appsCount}</div>
          </div>
        </div>

        {recipients.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8">
            <div className="text-sm text-gray-400 mb-3">El reporte se envía a:</div>
            <div className="flex flex-wrap gap-2">
              {recipients.map((phone) => (
                <span
                  key={phone}
                  className="text-sm font-mono bg-black/30 border border-white/10 rounded-full px-3 py-1"
                >
                  +{phone}
                </span>
              ))}
            </div>
          </div>
        )}

        <form action={sendTestReport}>
          <button
            type="submit"
            disabled={!canSend}
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-medium px-5 py-3 rounded-lg transition"
          >
            <Send className="w-4 h-4" />
            Enviar reporte de prueba ahora
          </button>
        </form>
        {!canSend && (
          <p className="text-xs text-gray-500 mt-3">
            {appsCount === 0
              ? "Registra al menos una app para recibir el reporte."
              : "Agrega al menos un destinatario para recibir el reporte."}
          </p>
        )}
      </div>
    </main>
  );
}
