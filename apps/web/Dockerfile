# ADHD Focus - Web App Dockerfile
# Next.js 16 + Drizzle ORM + NextAuth.js

# Stage to install bcryptjs (needed for auth, not traced by Next.js)
FROM node:20-slim AS deps
WORKDIR /deps
RUN npm init -y && npm install bcryptjs@2.4.3

# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies for node-gyp (if needed)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy all package files for workspace resolution
COPY package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies in the web workspace
WORKDIR /app/apps/web
RUN npm install --legacy-peer-deps

# Copy source files
WORKDIR /app
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Build args for Next.js (public vars baked into client bundle)
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Build Next.js app
WORKDIR /app/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy built application
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy bcryptjs from deps stage (not traced by Next.js standalone)
COPY --from=deps /deps/node_modules/bcryptjs /app/node_modules/bcryptjs

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Runtime environment variables (provided at docker run):
# - DATABASE_URL: PostgreSQL connection string
# - AUTH_SECRET: NextAuth secret
# - AUTH_URL: NextAuth callback URL (same as NEXT_PUBLIC_SITE_URL)

CMD ["node", "apps/web/server.js"]
