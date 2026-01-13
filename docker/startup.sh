#!/bin/bash
# ADHD Focus - Startup Script
# Run this to start all services with proper initialization

set -e

echo "=== ADHD Focus Startup ==="

# Start all services
echo "Starting services..."
docker compose up -d

# Wait for database to be healthy (with migrations applied)
echo "Waiting for database to be ready..."
until docker compose exec -T db pg_isready -U postgres && \
      docker compose exec -T db psql -U postgres -d postgres -c 'SELECT 1 FROM public.profiles LIMIT 1' >/dev/null 2>&1; do
  echo "  Waiting for database and migrations..."
  sleep 5
done
echo "Database is ready!"

# Notify PostgREST to reload schema cache
echo "Reloading PostgREST schema cache..."
docker compose exec -T db psql -U postgres -d postgres -c "NOTIFY pgrst, 'reload schema';"

# Restart rest to pick up schema changes (belt and suspenders)
echo "Restarting PostgREST..."
docker compose restart rest

# Wait a moment for rest to come back up
sleep 3

# Check status
echo ""
echo "=== Service Status ==="
docker compose ps

echo ""
echo "=== Startup Complete ==="
echo ""
echo "Web app: https://${DOMAIN:-localhost}"
echo "API:     https://${API_DOMAIN:-api.localhost}"
echo ""
