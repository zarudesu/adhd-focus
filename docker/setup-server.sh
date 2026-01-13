#!/bin/bash
# ADHD Focus - Server Setup Script
# Run this on your server to set up the deployment environment

set -e

echo "=== ADHD Focus Server Setup ==="

# Create app directory
APP_DIR="/opt/adhd-focus"
mkdir -p $APP_DIR
cd $APP_DIR

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# ===================
# Domain Configuration
# ===================
DOMAIN=beatyour8.com
API_DOMAIN=api.beatyour8.com
SITE_URL=https://beatyour8.com
API_EXTERNAL_URL=https://api.beatyour8.com

# ===================
# Secrets (CHANGE THESE!)
# ===================
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
JWT_SECRET=CHANGE_ME_SUPER_SECRET_JWT_KEY_AT_LEAST_32_CHARS
SECRET_KEY_BASE=CHANGE_ME_ANOTHER_SECRET_64_CHARS_OR_MORE
ANON_KEY=CHANGE_ME_ANON_KEY
SERVICE_ROLE_KEY=CHANGE_ME_SERVICE_ROLE_KEY

# ===================
# Database
# ===================
POSTGRES_DB=postgres
POSTGRES_PORT=5432

# ===================
# Studio (Admin)
# ===================
STUDIO_PORT=54323
STUDIO_DEFAULT_ORGANIZATION=ADHD Focus
STUDIO_DEFAULT_PROJECT=adhd-focus

# ===================
# Email (Optional)
# ===================
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_ADMIN_EMAIL=

# ===================
# Features
# ===================
DISABLE_SIGNUP=false
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=true
JWT_EXPIRY=3600

# ===================
# Integrations (Optional)
# ===================
TELEGRAM_BOT_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ===================
# Versions
# ===================
WEB_VERSION=latest
EOF
    echo "IMPORTANT: Edit .env and update all CHANGE_ME values!"
fi

# Download docker-compose and config files
echo "Downloading configuration files..."
REPO_URL="https://raw.githubusercontent.com/zarudesu/adhd-focus/main/docker"

curl -sL "$REPO_URL/docker-compose.yml" -o docker-compose.yml
curl -sL "$REPO_URL/Caddyfile" -o Caddyfile
curl -sL "$REPO_URL/kong.yml" -o kong.yml
curl -sL "$REPO_URL/init-db.sh" -o init-db.sh
curl -sL "$REPO_URL/startup.sh" -o startup.sh
chmod +x init-db.sh startup.sh

# Create migrations directory
mkdir -p migrations

# Download migrations
echo "Downloading database migrations..."
MIGRATIONS_URL="https://raw.githubusercontent.com/zarudesu/adhd-focus/main/supabase/migrations"
curl -sL "$MIGRATIONS_URL/001_initial_schema.sql" -o migrations/001_initial_schema.sql
curl -sL "$MIGRATIONS_URL/002_integrations.sql" -o migrations/002_integrations.sql
echo "Downloaded $(ls migrations/*.sql 2>/dev/null | wc -l) migrations"

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Edit .env file: nano $APP_DIR/.env"
echo "   - Update DOMAIN and API_DOMAIN"
echo "   - Update all CHANGE_ME values"
echo ""
echo "2. Generate JWT keys (creates ANON_KEY, SERVICE_ROLE_KEY, JWT_SECRET):"
echo "   ./setup.sh"
echo ""
echo "3. Start services:"
echo "   ./startup.sh"
echo ""
echo "4. Check status:"
echo "   docker compose ps"
echo ""
