#!/bin/bash
set -e

echo "=== ADHD Focus Database Initialization ==="

# Apply migrations in order
for migration in /docker-entrypoint-initdb.d/migrations/*.sql; do
  if [ -f "$migration" ]; then
    echo "Applying migration: $(basename $migration)"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$migration"
  fi
done

echo "=== All migrations applied successfully ==="
