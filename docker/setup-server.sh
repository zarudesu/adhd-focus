#!/bin/bash
# ADHD Focus - Server Setup Script
# Run this on your server to set up the deployment environment

set -e

echo "=== ADHD Focus Server Setup ==="

# Create app directory
APP_DIR="/opt/adhd-focus"
mkdir -p $APP_DIR
cd $APP_DIR

# Generate secrets if not exists
if [ ! -f .env ]; then
    echo "Creating .env file with random secrets..."

    POSTGRES_PASSWORD=$(openssl rand -base64 24)
    AUTH_SECRET=$(openssl rand -base64 32)

    cat > .env << EOF
# ===================
# Domain Configuration
# ===================
DOMAIN=adhd-focus.example.com
SITE_URL=https://adhd-focus.example.com

# ===================
# Database
# ===================
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=adhd_focus
POSTGRES_PORT=5432

# ===================
# Authentication
# ===================
AUTH_SECRET=$AUTH_SECRET

# ===================
# Optional: Google OAuth
# ===================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ===================
# Versions
# ===================
WEB_VERSION=latest
EOF
    echo "Created .env with generated secrets."
    echo "IMPORTANT: Edit .env and update DOMAIN and SITE_URL!"
else
    echo ".env already exists, skipping..."
fi

# Download docker-compose and config files
echo "Downloading configuration files..."
REPO_URL="https://raw.githubusercontent.com/zarudesu/adhd-focus/main/docker"

curl -sL "$REPO_URL/docker-compose.yml" -o docker-compose.yml
curl -sL "$REPO_URL/Caddyfile" -o Caddyfile

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Edit .env file: nano $APP_DIR/.env"
echo "   - Update DOMAIN to your domain"
echo "   - Update SITE_URL to https://your-domain"
echo ""
echo "2. Start services:"
echo "   docker compose up -d"
echo ""
echo "3. Apply database migrations:"
echo "   docker exec -it adhd-focus-web npm run db:push"
echo ""
echo "4. Check status:"
echo "   docker compose ps"
echo ""
