# ── deps ──────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY admin-ui/package.json admin-ui/package-lock.json* ./
RUN npm ci --legacy-peer-deps

# ── builder ───────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
# Copy prisma INTO the app dir so project root is /app (where package.json lives)
COPY prisma ./prisma
COPY admin-ui ./

RUN ./node_modules/.bin/prisma generate --schema=./prisma/schema.prisma
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npm run build

# ── runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN mkdir -p /data

EXPOSE 3002

CMD ["node", "server.js"]
