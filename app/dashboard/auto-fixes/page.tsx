import { getSession } from "@/lib/session";
import { agent } from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  GitPullRequest,
  AlertTriangle,
  GitBranch,
  Lock,
} from "lucide-react";

interface TrackedError {
  fingerprint: string;
  app: string;
  message: string;
  count: number;
  first_seen: number;
  last_seen: number;
}

const BUSINESS_PLANS = ["business", "enterprise"];

export default async function AutoFixesPage() {
  const session = await getSession(true);
  if (!session) return null;

  const plan = session.tenant.plan;
  const hasAccess = BUSINESS_PLANS.includes(plan);

  let errors: TrackedError[] = [];
  let threshold = 3;
  if (hasAccess) {
    const { ok, data } = await agent<{ errors?: TrackedError[]; threshold?: number }>(
      "/api/v1/tenant/errors",
      { token: session.token }
    );
    if (ok) {
      errors = data.errors ?? [];
      threshold = data.threshold ?? 3;
    }
  }

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
          <span className="font-semibold">Auto-fixes</span>
          <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-300 rounded-full ml-2">
            beta
          </span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <GitPullRequest className="w-7 h-7 text-cyan-400" />
          <h1 className="text-3xl font-bold">Auto-fixes</h1>
        </div>
        <p className="text-gray-400 mb-8">
          Cuando un error se repite {threshold}+ veces en tu app, Jarvis lo
          detecta. En la próxima fase analizará el stack trace y abrirá un Pull
          Request con un fix propuesto en tu repo de GitHub.
        </p>

        {!hasAccess ? (
          <div className="bg-white/5 border border-white/10 border-dashed rounded-xl p-10 text-center">
            <Lock className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold mb-2">Disponible en planes Business+</h2>
            <p className="text-gray-400 mb-4 max-w-lg mx-auto">
              La detección de errores recurrentes y los PRs automáticos están
              disponibles en los planes Business y Enterprise.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Tu plan actual: <span className="font-mono">{plan}</span>
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-cyan-500 hover:bg-cyan-400 text-black font-medium px-5 py-2.5 rounded-lg transition"
            >
              Ver planes
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Errores recurrentes</h2>
              <span className="text-sm text-gray-400">
                {errors.length} con {threshold}+ ocurrencias
              </span>
            </div>

            {errors.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <AlertTriangle className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-300 mb-1">
                  Aún no se detectaron errores recurrentes.
                </p>
                <p className="text-sm text-gray-500">
                  Reporta los errores de tu app a Jarvis para que los cuente.
                </p>
              </div>
            ) : (
              <div className="space-y-3 mb-8">
                {errors.map((err) => (
                  <div
                    key={`${err.app}:${err.fingerprint}`}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono bg-black/30 border border-white/10 rounded px-2 py-0.5">
                            {err.app}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">
                            {err.fingerprint}
                          </span>
                        </div>
                        <p className="text-sm text-gray-200 break-words">{err.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Última vez: {new Date(err.last_seen).toLocaleString()}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold bg-red-500/15 text-red-300 rounded-full px-3 py-1">
                        ×{err.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold">Generación de PRs — próxima fase</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Conectá un repo de GitHub por app y Jarvis abrirá un PR con el fix
                propuesto cuando un error cruce el umbral. (Requiere conectar GitHub.)
              </p>
              <details className="text-sm">
                <summary className="cursor-pointer text-cyan-400">
                  Cómo reportar errores ahora
                </summary>
                <pre className="mt-3 bg-black/40 border border-white/10 rounded-lg p-3 overflow-x-auto text-xs text-gray-300">
{`POST https://agent.telehost.net/api/v1/tenant/errors
Authorization: Bearer <tu API key jrv_...>
Content-Type: application/json

{ "app": "mi-app", "message": "TypeError: x is undefined", "stack": "..." }`}
                </pre>
              </details>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
