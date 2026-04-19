# ── Build stage ──
FROM node:22-alpine AS builder

WORKDIR /app

# Keep NODE_ENV=development for npm ci so devDeps (tailwind, typescript) install.
# The build script itself sets NODE_ENV=production internally.
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json* ./
RUN npm ci --include=dev --no-audit --no-fund

COPY . .

# Force NODE_ENV=production during next build so it uses production React bundles.
# (Coolify sometimes injects non-standard NODE_ENV values during build.)
RUN NODE_ENV=production npm run build

# ── Runtime stage ──
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund

# Copy the full build output (not standalone mode — that mode has
# "<Html> should not be imported" bugs on Alpine with Next 15).
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
    CMD curl -sf http://localhost:3000 || exit 1

CMD ["npm", "start"]
