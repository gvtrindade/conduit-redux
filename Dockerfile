# syntax=docker/dockerfile:1

FROM oven/bun:1 AS base

# ---------- Dependencies ----------
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# ---------- Build ----------
FROM deps AS builder
WORKDIR /app

# Coolify injects your environment variables as build args (disable in
# Advanced → Inject Build Args if you prefer to manage these manually).
ARG NEXT_APPLICATION_URL
ARG BETTER_AUTH_SECRET
ARG DATABASE_URL
ARG AUTH_GOOGLE_ID
ARG AUTH_GOOGLE_SECRET
ARG RESEND_API_KEY
ARG RESEND_SENDER
ARG SENTRY_DSN
ARG SENTRY_AUTH_TOKEN
ARG VERSION

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_APPLICATION_URL=$NEXT_APPLICATION_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV AUTH_GOOGLE_ID=$AUTH_GOOGLE_ID
ENV AUTH_GOOGLE_SECRET=$AUTH_GOOGLE_SECRET
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV RESEND_SENDER=$RESEND_SENDER
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
ENV VERSION=$VERSION

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run prisma generate
RUN bun run build

# ---------- Runner ----------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# The base image already ships a non-root `bun` user (UID/GID 1000), which
# matches Coolify's convention so persistent storage volumes are usable.
COPY --from=builder /app ./
USER bun
EXPOSE 3000

# Run database migrations, then start the Next.js server.
CMD ["sh", "-c", "bun run prisma migrate deploy && bun run start"]