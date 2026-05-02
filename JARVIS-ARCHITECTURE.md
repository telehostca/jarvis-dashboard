# Jarvis — Arquitectura completa del ecosistema

> Documento generado por análisis forense del 2026-05-02.
> Fuente: lectura directa de `jarvis-dashboard` (filesystem) + análisis remoto
> de los repos públicos `telehostca/jarvis-client-php` y `telehostca/jarvis-client-node`.
> Falta cubrir: `jarvis-agent` (repo privado).

---

## 1. Visión del producto

**Jarvis** es un SaaS de monitoreo construido por **TeleHost C.A.** (Venezuela 🇻🇪).
Tagline: *"Your DevOps team on WhatsApp, 24/7"*.

**Propuesta de valor:**
- Monitorea apps de clientes vía endpoint estandarizado `/jarvis/health`
- Envía alertas por **WhatsApp** (no Slack, no dashboards)
- AI-powered, never hallucinates, evidence-based
- Setup en 3 minutos: signup → SDK → 5 closures

**Planes:**

| Plan       | Precio | Apps | Polling | Recipients |
|------------|--------|------|---------|------------|
| Free       | $0     | 1    | 60 min  | 1          |
| Pro        | $19    | 5    | 30 min  | 3          |
| Business   | $49    | 20   | 15 min  | 10         |
| Enterprise | $199   | ∞    | 5 min   | ∞          |

---

## 2. Topología de repositorios

| Repo                          | Visibilidad | Stack                           | Rol                     |
|-------------------------------|-------------|---------------------------------|-------------------------|
| `telehostca/jarvis-dashboard` | Público     | Next.js 15 + Vercel AI SDK      | Frontend, landing, UI   |
| `telehostca/jarvis-agent`     | **Privado** | Fastify + `@anthropic-ai/sdk`   | Backend AI + dispatcher |
| `telehostca/jarvis-client-php`| Público     | Laravel 10/11/12, PHP ≥8.1      | SDK Laravel             |
| `telehostca/jarvis-client-node`| Público    | TypeScript ESM, Node ≥18        | SDK Node                |

**Hosting:**
- Dashboard: `dashboard.jarvis.telehost.net` (Coolify, Dockerfile)
- Agent:     `agent.telehost.net` (no visible públicamente)
- Infraestructura: Proxmox + Coolify + algunos en spanel/Apache

**Distribución de paquetes:**
- Composer: `telehost/jarvis-client`
- npm:      `@telehost/jarvis-client`

---

## 3. jarvis-dashboard — Forensia completa

### 3.1 Stack
- **Next.js 15.3.4** App Router (pin específico — `15.5.15` tenía bug `<Html>`)
- **React 19**
- **Vercel AI SDK** (`ai@^4.3`, `@ai-sdk/anthropic@^1.2`, `@ai-sdk/groq@^1.2`, `@ai-sdk/react@^1.2`)
- **Tailwind CSS v4 beta**
- **react-markdown**, **lucide-react**, **zod**
- **Modelo:** `claude-haiku-4-5` (visible en `app/api/chat/route.ts:38`)

### 3.2 File tree

```
jarvis-dashboard/
├── .env.example
├── Dockerfile (multi-stage Node 22 Alpine)
├── README.md
├── next.config.mjs, postcss.config.mjs, tsconfig.json
├── package.json
├── public/
├── components/
│   └── jarvis-chat.tsx          # widget de chat demo (useChat hook)
├── lib/
│   ├── api.ts                   # cliente HTTP a jarvis-agent (server-side only)
│   └── session.ts               # getSession() vía cookie + /api/v1/auth/me
└── app/
    ├── layout.tsx, globals.css
    ├── error.tsx, not-found.tsx, icon.svg
    ├── page.tsx                 # landing: hero, demo chat, pricing, footer
    ├── api/chat/route.ts        # POST /api/chat → streamText con Haiku
    ├── signin/{page,actions}.tsx
    ├── signup/{page,actions}.tsx
    └── dashboard/
        ├── page.tsx             # vista principal: apps, recipients, members
        ├── apps/new/{page.tsx, success/{page,copy-button}.tsx}
        ├── members/new/page.tsx
        └── recipients/new/page.tsx
```

### 3.3 Auth flow (cliente)
1. **Signup:** `email + phone + company_name` → POST `/api/v1/auth/signup` → `otp_id`
2. **Verify:** `otp_id + 6-digit code` → POST `/api/v1/auth/verify` → `session_token` (cookie 7 días) + opcional `api_key` en primer signup (cookie `jarvis_new_api_key`, 5min TTL, no httpOnly para que el cliente lo lea una vez)
3. **Signin:** mismo flujo pero solo `phone`
4. **Sesión:** cookie `jarvis_session` (httpOnly, secure, sameSite=lax)
5. **getSession():** `lib/session.ts:29` — lee cookie, verifica con `GET /api/v1/auth/me`, redirect a `/signin` si falla

### 3.4 Cliente HTTP del agente — `lib/api.ts`
```typescript
const AGENT_URL = process.env.JARVIS_API_URL
  || process.env.NEXT_PUBLIC_JARVIS_API
  || "https://agent.telehost.net";

export async function agent<T>(path, init?: RequestInit & { token?: string })
```
- Server-side only (env var no expuesta)
- Bearer token vía `init.token`
- Logs `[agent] →`/`[agent] ←` para debugging
- `cache: "no-store"` siempre
- Maneja non-JSON responses (errores plain-text del agente)

### 3.5 Demo chat — `app/api/chat/route.ts`
- `streamText` con `claude-haiku-4-5`
- System prompt hardcoded (líneas 16-30): identidad, idioma, anti-alucinación
- `temperature: 0.3, maxTokens: 500`
- 30s `maxDuration`
- **No autenticado** — abierto al público para preview en landing

### 3.6 Pages observadas
| Ruta                              | Uso                                                                  |
|-----------------------------------|----------------------------------------------------------------------|
| `/`                               | Landing: hero, ejemplo de alerta, chat demo, pricing, features       |
| `/signin`, `/signup`              | Auth con OTP por WhatsApp                                            |
| `/dashboard`                      | Resumen tenant: usage stats, apps, recipients, members               |
| `/dashboard/apps/new`             | Form: name + URL → POST `/api/v1/tenant/apps` → token (one-time)     |
| `/dashboard/apps/new/success`     | Muestra `JARVIS_TOKEN` + snippets de install Laravel/Node.js         |
| `/dashboard/members/new`          | Add member (phone + role: admin\|viewer)                             |
| `/dashboard/recipients/new`       | Add WhatsApp recipient (solo phone)                                  |

### 3.7 Estado
- **v0.1.0** — landing + auth + dashboard básico funcional
- Todavía no implementado (per README roadmap):
  - Real-time status widget (poll `/debug/severity`)
  - Audit log viewer
  - Multi-language i18n
  - App registration con SDK install instructions (parcial — ya tiene success page)

### 3.8 Bugs/inconsistencias observadas
- `app/page.tsx:170` — link al footer apunta a `https://github.com/telehostca/jarvis-agent` (404, repo es privado)

---

## 4. jarvis-agent — Contrato API (inferido desde dashboard)

> ⚠️ Repo PRIVADO. Esta sección documenta el contrato observable, no la implementación.

### 4.1 Endpoints inferidos de las llamadas en dashboard

| Método | Path                            | Auth         | Body request                          | Body response                                                                                                          | Origen call site                |
|--------|---------------------------------|--------------|---------------------------------------|------------------------------------------------------------------------------------------------------------------------|---------------------------------|
| POST   | `/api/v1/auth/signup`           | —            | `{email, phone, company_name}`        | `{otp_id, phone, tenant_id}`                                                                                            | `app/signup/actions.ts:32`      |
| POST   | `/api/v1/auth/signin`           | —            | `{phone}`                             | `{otp_id, phone}`                                                                                                       | `app/signin/actions.ts:25`      |
| POST   | `/api/v1/auth/verify`           | —            | `{otp_id, code}`                      | `{session_token, api_key?, tenant?}`                                                                                    | `app/{signin,signup}/actions.ts`|
| GET    | `/api/v1/auth/me`               | Bearer       | —                                     | `{tenant: SessionTenant, session: {tenant_id, phone, expires_at}}`                                                      | `lib/session.ts:42`             |
| GET    | `/api/v1/tenant/me`             | Bearer       | —                                     | `{tenant, limits, usage, apps[], recipients[], members[]}`                                                              | `app/dashboard/page.tsx:21`     |
| POST   | `/api/v1/tenant/apps`           | Bearer       | `{name, url}`                         | `{token, install}`                                                                                                      | `app/dashboard/apps/new/page.tsx:18`|
| POST   | `/api/v1/tenant/recipients`     | Bearer       | `{phone}`                             | `{}` (or error)                                                                                                         | `app/dashboard/recipients/new/page.tsx:14`|
| POST   | `/api/v1/tenant/members`        | Bearer       | `{phone, role}`                       | `{}` (or error)                                                                                                         | `app/dashboard/members/new/page.tsx:14`|

### 4.2 Modelo de dominio (deducido)

```
Tenant
├── id: string
├── name: string
├── slug: string
├── plan: "free" | "pro" | "business" | "enterprise"
├── status: string
├── limits: { max_apps, max_recipients, max_members, cron_interval_minutes }
└── usage: { apps_count, recipients_count, members_count }

App
├── name: string (slug-like)
├── url: string (health endpoint)
├── created_at: number (epoch ms)
└── token: string (one-time, returned at create only — not stored on client)

Recipient
└── phone: string (country code, no +)

Member
├── phone: string
└── role: "admin" | "viewer"

OtpFlow (server-side ephemeral)
├── otp_id
├── phone
└── code (6 digits, sent via WhatsApp)

Session
├── tenant_id
├── phone
└── expires_at
```

### 4.3 Lo que el agente DEBE hacer (no podemos verificar implementación)
1. **Cron de polling** por tenant — interval según plan (60/30/15/5 min)
2. **Llamar `GET <app.url>` con `Authorization: Bearer <app.token>`** y parsear `JarvisPayload`
3. **AI analysis** — pasar payload a Claude (probablemente Haiku) con system prompt anti-alucinación
4. **Dedupe** — un alert por incidente; resolved cuando se normaliza
5. **WhatsApp dispatch** — a cada `recipient.phone` del tenant
6. **OTP send/verify** — usa el mismo gateway WhatsApp para los códigos
7. **Persistencia** — tenants, apps, recipients, members, sessions, otps, alerts, polls

### 4.4 Stack confirmado por el usuario
- **Fastify** como framework
- **`@anthropic-ai/sdk`** directo (sin Claude Agent SDK)
- Probablemente Node ≥18 + TypeScript

### 4.5 Brechas (gap analysis)
**Sin acceso al código no podemos confirmar si tiene/no tiene:**
- Anthropic prompt caching (`cache_control` en system prompt)
- Context compression para inputs largos
- Error classifier por tipo de error
- Retry utils con exponential backoff
- Rate limit tracking
- Persistent agent memory / FTS5 search
- Skills procedurales (auto-skill creation)
- MCP integration
- Trajectory/execution logs

---

## 5. jarvis-client-php — Forensia completa

### 5.1 Package info
- **Composer:** `telehost/jarvis-client`
- **License:** MIT (TeleHost C.A.)
- **PHP:** `^8.1`
- **Laravel:** `^10.0|^11.0|^12.0` (illuminate/contracts, support, http)
- **Auto-discovery:** `TeleHost\Jarvis\JarvisServiceProvider`
- **Dev deps:** `orchestra/testbench ^8|^9`, `phpunit ^10|^11`, `laravel/pint ^1`

### 5.2 File tree (TODO el repo)
```
jarvis-client-php/
├── .gitignore
├── LICENSE.md
├── README.md
├── composer.json
├── config/
│   └── jarvis.php
├── src/
│   ├── JarvisAuth.php              (middleware Bearer + X-Jarvis-Token)
│   ├── JarvisHealthController.php  (invokable, GET handler)
│   ├── JarvisManager.php           (core: metrics/alerts/custom + buildPayload)
│   └── JarvisServiceProvider.php   (auto-registra ruta + middleware)
└── tests/
    └── JarvisManagerTest.php       (5 tests, sin orchestra)
```

**Solo 4 archivos PHP de fuente. ~150 LOC totales.**

### 5.3 Configuración (`config/jarvis.php`)

| Key                    | ENV                | Default          | Tipo                  |
|------------------------|--------------------|------------------|-----------------------|
| `token`                | `JARVIS_TOKEN`     | null             | string\|null          |
| `path`                 | `JARVIS_PATH`      | `/jarvis/health` | string                |
| `auto_register_route`  | —                  | `true`           | bool                  |
| `middleware`           | —                  | `[]`             | string[]              |
| `app_version`          | `APP_VERSION`      | `'1.0'`          | string                |
| `metrics`              | —                  | `[]`             | array<string, Closure>|
| `alerts`               | —                  | `[]`             | array<string, Closure>|
| `custom`               | —                  | `[]`             | array<string, Closure>|

### 5.4 Public API
- `app(JarvisManager::class)` (singleton)
- Métodos fluent: `metric()`, `alert()`, `custom()`, `setAppName()`, `buildPayload()`
- **No hay Facade, no hay attributes, no hay traits, no hay artisan commands.**

### 5.5 Endpoint `/jarvis/health`
- Registrado en `JarvisServiceProvider::registerRoute()` con `Route::get`
- Middleware: `[JarvisAuth::class, ...config('jarvis.middleware')]`
- Controller: `JarvisHealthController` (single-action invokable)
- HTTP: 200 si `status='healthy'|'degraded'`, 503 si `status='down'` (**dead branch — `down` nunca se asigna**)

### 5.6 Auth (`JarvisAuth.php`)
- Lee `Authorization: Bearer <token>` o fallback `X-Jarvis-Token`
- `hash_equals()` para timing-safe comparison
- 503 si `config('jarvis.token')` está vacío (`jarvis_not_configured`)
- 401 si token inválido (`unauthorized`)

### 5.7 Payload (`JarvisManager::buildPayload()`)
```json
{
  "app": "<config('app.name')>",
  "version": "<config('jarvis.app_version')>",
  "timestamp": "<ISO 8601>",
  "status": "healthy" | "degraded",
  "metrics": { "<key>": <scalar|array|{error: string}> },
  "alerts":  [ { "severity": "info|warning|critical", "message": "..." } ],
  "custom":  { "<key>": <any|{error: string}> }
}
```
- `status='degraded'` ⇔ existe algún alert con `severity='critical'`
- Error isolation: closure throws → `{error: <truncated 200 chars>}`
- Timestamp: `Carbon::now()->toIso8601String()`

---

## 6. jarvis-client-node — Forensia completa

### 6.1 Package info
- **npm:** `@telehost/jarvis-client@0.1.0`
- **License:** MIT (TeleHost C.A. 2026)
- **Node:** `≥18.0.0`
- **Type:** ESM (`"type": "module"`)
- **Lang:** TypeScript strict, ES2022, declaration + sourcemap
- **Build:** `tsc → dist/`
- **Tests:** `vitest`
- **Runtime deps:** **CERO** (no peer deps tampoco)

### 6.2 File tree (TODO el repo)
```
jarvis-client-node/
├── .gitignore, LICENSE, README.md
├── package.json, package-lock.json, tsconfig.json
└── src/
    ├── index.ts                   (re-exports)
    ├── manager.ts                 (JarvisManager + tipos)
    ├── manager.test.ts            (6 tests con vitest)
    ├── auth.ts                    (timing-safe equality custom, no usa crypto)
    └── adapters/
        ├── express.ts             (jarvisHealth)
        ├── fastify.ts             (jarvisPlugin)
        └── hono.ts                (jarvisHandler)
```

**7 archivos. Cero dependencias. Súper limpio.**

### 6.3 Public API
```typescript
import { JarvisManager, extractAndValidateToken } from '@telehost/jarvis-client';
import { jarvisHealth } from '@telehost/jarvis-client/express';
import { jarvisPlugin } from '@telehost/jarvis-client/fastify';
import { jarvisHandler } from '@telehost/jarvis-client/hono';
```

### 6.4 Configuración (`JarvisManagerOptions`)
```typescript
{
  appName?: string;          // default "Unknown"
  appVersion?: string;       // default "1.0"
  metrics?: Record<string, MetricFn>;
  alerts?: Record<string, AlertFn>;
  custom?: Record<string, MetricFn>;
  metricTimeoutMs?: number;  // default 5000
}
```
Adapter options agregan `token: string` (Fastify además `path?: string`).
**No carga env vars internamente** — el cliente lee `process.env.JARVIS_TOKEN` y lo pasa.

### 6.5 Diferencias vs PHP
| Aspecto                | PHP                          | Node                              |
|------------------------|------------------------------|-----------------------------------|
| Closure buckets        | metrics, alerts, custom (3)  | metrics, alerts, custom (3)       |
| App name               | `config('app.name')` auto    | `appName` opt, default "Unknown"  |
| App version            | `config('jarvis.app_version')`| `appVersion` opt, default "1.0"  |
| Per-metric timeout     | **No**                       | **Sí** (5s default)               |
| Concurrency metrics    | Sequential `foreach`          | **Promise.all** (paralelo)       |
| Concurrency alerts     | Sequential                    | Sequential (inconsistencia)      |
| Frameworks soportados  | Laravel only                  | Express, Fastify, Hono            |
| Deps                   | illuminate/*                  | Cero                              |
| Auth lib               | `hash_equals` (PHP nativo)    | XOR loop manual (runtime-agnostic)|

### 6.6 Bug compartido: dead branch `'down'`
Ambos SDKs (PHP y Node) tienen un mapping HTTP que devuelve 503 cuando `status === 'down'`, pero **`buildPayload()` jamás asigna ese valor**. Solo emite `'healthy'` o `'degraded'`. Es código muerto en ambos lados.

---

## 7. Simetrías y asimetrías cross-SDK

### 7.1 Contrato wire — IDÉNTICO
Ambos SDKs producen exactamente el mismo `JarvisPayload`:
```
{ app, version, timestamp, status, metrics, alerts, custom }
```

### 7.2 Auth — IDÉNTICO
- Header primario: `Authorization: Bearer <token>`
- Header fallback: `X-Jarvis-Token: <token>`
- Comparación timing-safe (PHP `hash_equals`, Node XOR manual)
- 401 unauthorized / 503 not_configured / 200 OK / 503 down

### 7.3 Error isolation — IDÉNTICO
Cada closure en try/catch → en error, valor del key se reemplaza por `{error: <truncated 200 chars>}`

### 7.4 Asimetrías a corregir
1. **Per-metric timeout** — Node lo tiene, PHP no
2. **Paralelismo** — Node ejecuta metrics en paralelo, PHP no
3. **Alerts sequential vs parallel** — incluso Node es inconsistente (metrics paralelos pero alerts sequential)
4. **App name resolution** — PHP usa Laravel container, Node requiere param explícito

### 7.5 Limitaciones compartidas (read-only by design)
| Capacidad           | PHP | Node | Status |
|---------------------|-----|------|--------|
| GET /jarvis/health  | ✅   | ✅    | Funciona |
| POST /jarvis/invoke | ❌   | ❌    | No existe |
| Tool/action registry| ❌   | ❌    | No existe |
| Log streaming/SSE   | ❌   | ❌    | No existe |
| Tail laravel.log    | ❌   | ❌    | No existe |
| Artisan as MCP tool | ❌   | ❌    | No existe |
| Per-action authz    | ❌   | ❌    | Token único, scope total |
| Idempotency / audit | ❌   | ❌    | No relevante (read-only) |

---

## 8. Diagrama completo del sistema

```
┌──────────────────────────────────────────────────────────────────────┐
│                    USUARIO (TeleHost client)                         │
│                                                                      │
│   ┌──────────────────┐         WhatsApp              ┌────────────┐ │
│   │  Browser         │ ─────────────────────────────▶│ +58 412... │ │
│   │  dashboard.      │                                │  (alerts)  │ │
│   │  jarvis.         │                                └────────────┘ │
│   │  telehost.net    │                                       ▲       │
│   └────────┬─────────┘                                       │       │
└────────────┼─────────────────────────────────────────────────┼───────┘
             │ HTTPS                                           │
             ▼                                                 │
┌──────────────────────────────────────────────────────────────┼───────┐
│   jarvis-dashboard (Next.js 15 — Coolify)                    │       │
│   ──────────────────────────────────                         │       │
│   • Server actions (signup/signin/verify)                    │       │
│   • Demo chat (Anthropic Haiku 4.5, no auth)                 │       │
│   • lib/api.ts → server-side fetch                           │       │
│   • Cookie httpOnly: jarvis_session                          │       │
└────────────┬─────────────────────────────────────────────────┼───────┘
             │ Bearer token                                    │
             │ /api/v1/{auth,tenant}/*                         │
             ▼                                                 │
┌──────────────────────────────────────────────────────────────┴───────┐
│   jarvis-agent (Fastify + @anthropic-ai/sdk — agent.telehost.net)    │
│   ════════════════════════════════════════════════════                │
│   ⚠️  REPO PRIVADO — implementación no auditada                       │
│                                                                       │
│   • POST /api/v1/auth/signup,signin,verify  → OTP via WhatsApp        │
│   • GET  /api/v1/auth/me, /tenant/me                                  │
│   • POST /api/v1/tenant/apps,recipients,members                       │
│   • Cron de polling por tenant (5/15/30/60 min según plan)            │
│   • Llama health endpoints de clientes                                │
│   • Análisis con Claude → genera/dedup alerts                         │
│   • Dispatch WhatsApp                                                 │
└──────────────┬─────────────┬─────────────────────────────────────────┘
               │             │
               │ Bearer       │ Bearer
               │ poll GET     │ poll GET
               ▼             ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│  Customer Laravel app   │ │  Customer Node app      │
│  ────────────────────   │ │  ──────────────────     │
│  composer require       │ │  npm install            │
│   telehost/jarvis-client│ │   @telehost/jarvis-client│
│                         │ │                         │
│  config/jarvis.php      │ │  jarvisHealth({         │
│   • metrics: closures   │ │    token, appName,      │
│   • alerts:  closures   │ │    metrics, alerts,     │
│   • custom:  closures   │ │    custom               │
│                         │ │  })                     │
│  ────────────────────   │ │  ──────────────────     │
│  GET /jarvis/health     │ │  GET /jarvis/health     │
│  ↓                      │ │  ↓                      │
│  JarvisAuth (Bearer)    │ │  extractAndValidate     │
│  ↓                      │ │  ↓                      │
│  JarvisHealthController │ │  JarvisManager          │
│  ↓                      │ │  ↓                      │
│  JarvisManager          │ │  buildPayload (paralelo │
│  buildPayload           │ │  con timeouts)          │
│  ↓                      │ │  ↓                      │
│  JarvisPayload (JSON)   │ │  JarvisPayload (JSON)   │
└─────────────────────────┘ └─────────────────────────┘
```

---

## 9. Hermes-inspired roadmap — qué adoptar concretamente

### 9.1 Filosofía
**No copiamos Hermes**. Extraemos patrones específicos que llenan brechas reales del ecosistema Jarvis. Cada propuesta cita el archivo de origen en Hermes y el destino en Jarvis.

### 9.2 Tier 1 — Mejoras al `jarvis-agent` (cuando obtengamos acceso)

| # | Origen Hermes | Destino jarvis-agent | Beneficio |
|---|---------------|----------------------|-----------|
| 1 | `agent/prompt_caching.py` | Wrapper en `@anthropic-ai/sdk` para `cache_control` en system prompt + tenant context | **70-90% reducción de tokens** en alertas recurrentes |
| 2 | `agent/context_compressor.py` | Compresor de payloads largos (logs, métricas históricas) antes de pasarlos a Claude | Evita explosión de contexto, baja costo, reduce alucinaciones |
| 3 | `agent/error_classifier.py` + `retry_utils.py` | Clasificador de errores de poll (timeout / 5xx / schema-invalid / network) con retry strategy distinta por categoría | Menos falsos positivos, mejor UX de alerts |
| 4 | `agent/rate_limit_tracker.py` | Tracker de rate limits Anthropic + WhatsApp gateway por tenant | Evita 429 cascadas en horas pico |
| 5 | `tools/registry.py` (patrón) | `ActionRegistry` extensible con tipo + handler + autz scope | Base para auto-fix tier (Sprint 1) |

### 9.3 Tier 2 — Mejoras a los SDKs (PHP + Node, simétricos)

#### 9.3.1 Fix dead branch `'down'`
**Ambos SDKs**: o bien hacer que `buildPayload()` emita `'down'` cuando todos los metrics fallan, o bien eliminar el chequeo HTTP 503. Lo correcto es:
```
status = 'healthy' si no hay alerts
       | 'degraded' si hay alert critical
       | 'down' si TODOS los metrics fallaron (todos tienen .error)
```

#### 9.3.2 Paridad PHP-Node
- Agregar `metricTimeoutMs` a PHP (con `pcntl_alarm` o set_time_limit, o ejecutar en sub-process)
- Agregar paralelismo a alerts en Node (consistencia con metrics)
- O ejecutar alerts en paralelo con metrics (mismo `Promise.all`)

#### 9.3.3 Nuevo bag: `tools[]` (capability declaration)
Inspirado en MCP de Hermes (`tools/mcp_tool.py`). Agregar al `JarvisPayload`:
```json
{
  "tools": [
    {
      "name": "queue:restart",
      "description": "Restart Laravel queue worker",
      "input_schema": { "type": "object", "properties": {} },
      "auth_scope": "admin"
    },
    {
      "name": "cache:clear",
      "description": "Clear application cache",
      "input_schema": { ... },
      "auth_scope": "admin"
    }
  ]
}
```
- En PHP: `app(JarvisManager::class)->tool('cache:clear', $schema, fn() => Artisan::call('cache:clear'))`
- En Node: `manager.tool('memory:gc', schema, async () => global.gc?.())`
- **Read-only safety:** tools NO se ejecutan en GET. El payload solo los **declara**.

#### 9.3.4 Nuevo endpoint: `POST /jarvis/invoke`
```
POST /jarvis/invoke
Authorization: Bearer <ACTION_TOKEN>  ← token DISTINTO al de health (scope diferente)
Body: { "tool": "cache:clear", "input": {}, "request_id": "uuid", "idempotency_key": "..." }
Response: { "ok": true, "output": ..., "duration_ms": 123 }
```
- Control de seguridad: **token de acción separado** del token de health (per-tool scope)
- Idempotencia: `request_id` + `idempotency_key` (cache 24h)
- Audit log: cada invocación se persiste en el cliente (tabla `jarvis_invocations`)
- Allow-list explícita: cliente declara qué tools están habilitados en `config/jarvis.php` (PHP) u opciones (Node)

#### 9.3.5 Log streaming endpoint: `GET /jarvis/logs/tail` (SSE)
Inspirado en `agent/trajectory.py` de Hermes (event streaming).
```
GET /jarvis/logs/tail?since=<iso>&filter=ERROR|CRITICAL
Authorization: Bearer <READ_TOKEN>
Content-Type: text/event-stream

event: log
data: {"timestamp": "...", "level": "ERROR", "message": "...", "context": {...}}
```
- En PHP: monitorear `storage/logs/laravel.log` (tail-f estilo)
- En Node: capturar console.error o eventos de un logger configurable
- Permite que jarvis-agent obtenga contexto rico para análisis IA, no solo métricas

### 9.4 Tier 3 — Mejoras al jarvis-dashboard

#### 9.4.1 Fix link 404 (rápido)
`app/page.tsx:170` — quitar el link a `https://github.com/telehostca/jarvis-agent` (es 404). O cambiar a "Self-hosted (contact us)".

#### 9.4.2 Nueva pestaña: `/dashboard/auto-fixes` (cuando llegue Tier 2 del agent)
- Lista de PRs propuestos por jarvis para apps con auto-fix activado
- Estado: pending / merged / closed
- Link directo al PR en GitHub
- Métricas: fixes propuestos / aceptados / rate

#### 9.4.3 Nueva pestaña: `/dashboard/reports`
- Reportes semanales por tenant (cron domingo 9am)
- Top 3 issues, tendencias, refactors recomendados
- Generados por jarvis-agent, almacenados como `weekly_reports` table

#### 9.4.4 Status widget en tiempo real
Roadmap del README ya lo menciona — poll a `/debug/severity` (TODO en jarvis-agent).

### 9.5 Lo que NO copiamos de Hermes (anti-features para Jarvis)

| Hermes feature | Por qué NO en Jarvis |
|----------------|----------------------|
| Multi-platform gateway (Telegram, Discord, Slack, Teams) | Jarvis es **WhatsApp-first by design** — diferenciador, no gap |
| `tools/browser_*.py` (browser automation) | Fuera de scope monitoreo |
| `tools/tts_tool.py`, `voice_tools.py` | Fuera de scope |
| Honcho (dialectic user modeling) | Overkill para monitoring |
| `tools/mcp_oauth.py` (OAuth flows en MCP) | Solo si llega tier Enterprise con tools custom de cliente |
| `agent/skill_*` (auto-skill creation) | **Considerar Tier 4** cuando haya mucho dato — ahora prematuro |
| Hermes `setup` wizard | Jarvis ya tiene su propio onboarding (3 steps en `/dashboard`) |

---

## 10. Plan de ejecución sugerido

### Fase 0 — Desbloquear acceso a `jarvis-agent` (USUARIO)
Sin esto, no podemos hacer Tier 1. Opciones:
1. Hacer público el repo
2. Subir tarball del agente al working directory de este chat
3. Push branch temporal pública con código del agent
4. Otorgar GitHub token con read-only

### Fase 1 — Quick wins en SDKs (1 sprint)
1. Fix dead branch `'down'` en ambos SDKs (~30 min cada uno)
2. Paridad: agregar `metricTimeoutMs` a PHP
3. Paridad: paralelizar alerts en Node SDK
4. Bump versión: ambos a 0.2.0
5. Re-publish a Packagist + npm

### Fase 2 — Hardening del agent (2-3 sprints, requiere Fase 0)
1. Anthropic prompt caching wrapper
2. Context compressor para payloads largos
3. Error classifier + retry utils
4. Rate limit tracker

### Fase 3 — Auto-fix MVP (3-4 sprints)
1. SDKs: nuevo bag `tools[]` en payload
2. SDKs: `POST /jarvis/invoke` endpoint con allow-list
3. SDKs: bump a 0.3.0
4. Agent: action token generation + audit log
5. Agent: integración con GitHub para crear PRs (vía `octokit`)
6. Dashboard: pestaña `/dashboard/auto-fixes`

### Fase 4 — Reportes semanales (1 sprint)
1. Agent: cron Sunday 9am por tenant + analysis con Claude
2. Dashboard: pestaña `/dashboard/reports`
3. WhatsApp: link al reporte

### Fase 5 — Log streaming (2 sprints)
1. SDKs: `GET /jarvis/logs/tail` SSE en PHP y Node
2. Agent: consume SSE, alimenta análisis Claude
3. Bump SDKs a 0.4.0

---

## 11. Anexos — referencias de archivos

### 11.1 Files leídos directamente (filesystem)
- `/home/user/jarvis-dashboard/package.json`
- `/home/user/jarvis-dashboard/README.md`
- `/home/user/jarvis-dashboard/.env.example`
- `/home/user/jarvis-dashboard/Dockerfile`
- `/home/user/jarvis-dashboard/lib/api.ts`
- `/home/user/jarvis-dashboard/lib/session.ts`
- `/home/user/jarvis-dashboard/components/jarvis-chat.tsx`
- `/home/user/jarvis-dashboard/app/layout.tsx`
- `/home/user/jarvis-dashboard/app/page.tsx`
- `/home/user/jarvis-dashboard/app/api/chat/route.ts`
- `/home/user/jarvis-dashboard/app/signin/{page,actions}.tsx`
- `/home/user/jarvis-dashboard/app/signup/{page,actions}.tsx`
- `/home/user/jarvis-dashboard/app/dashboard/page.tsx`
- `/home/user/jarvis-dashboard/app/dashboard/apps/new/{page,success/page}.tsx`
- `/home/user/jarvis-dashboard/app/dashboard/{members,recipients}/new/page.tsx`

### 11.2 Files leídos remotamente (github raw)
**telehostca/jarvis-client-php** (repo completo): composer.json, README.md, LICENSE.md, .gitignore, config/jarvis.php, src/JarvisServiceProvider.php, src/JarvisHealthController.php, src/JarvisAuth.php, src/JarvisManager.php, tests/JarvisManagerTest.php

**telehostca/jarvis-client-node** (repo completo): package.json, package-lock.json, tsconfig.json, README.md, LICENSE, .gitignore, src/index.ts, src/manager.ts, src/manager.test.ts, src/auth.ts, src/adapters/express.ts, src/adapters/fastify.ts, src/adapters/hono.ts

### 11.3 Hermes Agent — referencias citadas
- `agent/prompt_caching.py`
- `agent/context_compressor.py`
- `agent/context_engine.py`
- `agent/error_classifier.py`
- `agent/retry_utils.py`
- `agent/rate_limit_tracker.py`
- `agent/skill_*` (skill_commands.py, skill_preprocessing.py, skill_utils.py)
- `agent/trajectory.py`
- `tools/registry.py`
- `tools/mcp_tool.py`
- `tools/mcp_oauth.py`
- Hermes `croniter` integration

---

**Última actualización:** 2026-05-02
**Maintainer:** Claude Code (analyst), TeleHost C.A. (owner)
