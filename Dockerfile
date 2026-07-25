# Production image for the Hamrah Next.js frontend.
# Multi-stage build using `output: "standalone"` (see next.config.ts):
#   deps    → install node_modules with npm ci
#   builder → `next build` (inlines NEXT_PUBLIC_* here, at build time)
#   runner  → slim runtime: only server.js + static assets, non-root, port 3010
#
# Caddy (infrastructure project) reverse-proxies https://hamrah-ride.ir to
# `hamrah-frontend:3010`, so the runner listens on 3010 and is NOT published
# to the host — it is reachable only through the shared `caddy` network.

# ── deps ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── builder ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* vars are inlined into the client bundle at compile time, so
# they must be present during `next build` — passing them at runtime alone
# would have no effect on already-compiled code.
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_NESHAN_API_KEY
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_NESHAN_API_KEY=$NEXT_PUBLIC_NESHAN_API_KEY \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── runner ───────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3010 \
    HOSTNAME=0.0.0.0

# Run as an unprivileged user.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# `.next/standalone` already contains server.js, a pruned node_modules, and
# package.json. Static assets and /public are served from disk, so copy them
# in alongside.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3010

# node:alpine ships no curl/wget, so probe the server with node itself.
# `/` is a public page that returns < 500 even when the API is unreachable,
# which makes it a stable liveness signal.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "const http=require('http');const r=http.get({host:'127.0.0.1',port:process.env.PORT,path:'/'},x=>{process.exit(x.statusCode<500?0:1)});r.on('error',()=>process.exit(1));"

CMD ["node", "server.js"]
