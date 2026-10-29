#!/usr/bin/env bash
# Backs up the database and the uploaded photos into ./backups (kept for 14 days).
#   ./deploy/backup.sh
# Daily at 03:00 (crontab -e):  0 3 * * * /home/deploy/bordo/deploy/backup.sh >> /home/deploy/bordo/backups/backup.log 2>&1
set -euo pipefail

cd "$(dirname "$0")/.."
compose=(docker compose -f compose.prod.yaml --env-file .env.production)
stamp=$(date +%Y%m%d-%H%M%S)
mkdir -p backups

"${compose[@]}" exec -T postgres pg_dump -U bordo -d bordo --format=custom > "backups/db-$stamp.dump"
# Photos live in a named volume: read it through the API container.
"${compose[@]}" exec -T api tar -C /app/storage -cf - . > "backups/photos-$stamp.tar"

find backups -type f \( -name 'db-*.dump' -o -name 'photos-*.tar' \) -mtime +14 -delete
echo "backup $stamp done"
