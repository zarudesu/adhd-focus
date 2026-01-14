# ADHD Focus - Self-Hosted Deployment

Minimal Docker Compose stack for self-hosting ADHD Focus.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                    Caddy                         │
│            (Reverse Proxy + HTTPS)               │
│                   :80, :443                      │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│              Next.js Web App                     │
│        (Frontend + API + Auth)                   │
│                   :3000                          │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│               PostgreSQL 17                      │
│                (Database)                        │
│                   :5432                          │
└─────────────────────────────────────────────────┘
```

## Quick Start

### 1. Clone and Configure

```bash
git clone https://github.com/zarudesu/adhd-focus.git
cd adhd-focus/docker

# Create environment file
cp .env.example .env
```

### 2. Edit Configuration

Edit `.env` with your settings:

```bash
# Required
DOMAIN=adhd-focus.example.com
SITE_URL=https://adhd-focus.example.com
POSTGRES_PASSWORD=$(openssl rand -base64 24)
AUTH_SECRET=$(openssl rand -base64 32)
```

### 3. Deploy

```bash
docker compose up -d
```

### 4. Initialize Database

On first run, apply database migrations:

```bash
# Connect to the web container and run migrations
docker exec -it adhd-focus-web npm run db:push
```

## Configuration

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `DOMAIN` | Your domain for HTTPS (e.g., `adhd-focus.example.com`) |
| `SITE_URL` | Full URL with protocol (e.g., `https://adhd-focus.example.com`) |
| `POSTGRES_PASSWORD` | Database password (generate with `openssl rand -base64 24`) |
| `AUTH_SECRET` | NextAuth.js secret (generate with `openssl rand -base64 32`) |

### Optional Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | `adhd_focus` | Database name |
| `POSTGRES_PORT` | `5432` | Local PostgreSQL port |
| `WEB_VERSION` | `latest` | Web app Docker image tag |

### Google OAuth (Optional)

To enable Google Sign-In:

1. Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com)
2. Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google`
3. Set in `.env`:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

## Local Development

For local development without Docker:

```bash
cd apps/web

# Create local .env
cat > .env.local << EOF
DATABASE_URL=postgres://postgres:postgres@localhost:5432/adhd_focus
AUTH_SECRET=$(openssl rand -base64 32)
EOF

# Start local PostgreSQL (if not running)
docker run -d --name adhd-focus-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=adhd_focus \
  -p 5432:5432 \
  postgres:17-alpine

# Apply migrations and start dev server
npm run db:push
npm run dev
```

## Maintenance

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f web
docker compose logs -f db
```

### Backup Database

```bash
docker exec adhd-focus-db pg_dump -U postgres adhd_focus > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker exec -i adhd-focus-db psql -U postgres adhd_focus
```

### Update

```bash
docker compose pull
docker compose up -d
docker exec -it adhd-focus-web npm run db:push
```

## Troubleshooting

### Database Connection Issues

Check if PostgreSQL is healthy:

```bash
docker compose ps
docker exec adhd-focus-db pg_isready -U postgres
```

### SSL/HTTPS Issues

Caddy automatically obtains SSL certificates. If issues:

```bash
docker compose logs caddy
```

Ensure ports 80 and 443 are open and domain points to your server.

### Reset Everything

```bash
docker compose down -v
docker compose up -d
```

## Tech Stack

- **Web**: Next.js 16, React 19, TypeScript
- **Database**: PostgreSQL 17 with Drizzle ORM
- **Auth**: NextAuth.js v5 (credentials + OAuth)
- **Proxy**: Caddy (automatic HTTPS)
- **Container**: Docker Compose
