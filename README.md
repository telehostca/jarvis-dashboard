# Jarvis Dashboard

Public-facing landing page + dashboard for Jarvis, the autonomous monitoring agent by TeleHost.

## Stack

- **Next.js 15** (App Router)
- **Vercel AI SDK** (`ai` + `@ai-sdk/react` + `@ai-sdk/anthropic`)
- **Claude Haiku 4.5** for the demo chat (live on landing)
- **Tailwind CSS v4** (beta) for styling
- **Lucide** for icons
- **Docker** ready for Coolify deploy

## Development

```bash
npm install
cp .env.example .env.local  # fill in ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000

## Structure

```
app/
├── page.tsx              # Landing page with hero, chat demo, pricing
├── layout.tsx            # Root layout with dark theme
├── globals.css           # Tailwind v4 imports + custom theme
└── api/
    └── chat/
        └── route.ts      # Claude Haiku streaming endpoint for demo chat

components/
└── jarvis-chat.tsx       # Chat widget (useChat from @ai-sdk/react)
```

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | yes | For demo chat on landing |
| `JARVIS_API_URL` | no | Backend URL (default: https://jarvis.telehost.net) |

## Deploy (Coolify)

1. Push to GitHub (public repo: `telehostca/jarvis-dashboard`)
2. In Coolify: new app → Dockerfile → link to repo
3. Set env vars: `ANTHROPIC_API_KEY`
4. Deploy

Point a domain like `dashboard.jarvis.telehost.net` to it.

## Next features (roadmap)

- [x] Landing page with live chat demo
- [ ] Signup flow (magic link to WhatsApp)
- [ ] Protected dashboard (apps, recipients, members, settings)
- [ ] App registration wizard with SDK install instructions
- [ ] Real-time status widget (polling `/debug/severity`)
- [ ] Audit log viewer
- [ ] Multi-language (English + Spanish)
