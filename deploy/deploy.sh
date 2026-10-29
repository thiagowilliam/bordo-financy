#!/usr/bin/env bash
# Updates the running stack to the latest `main`. Run on the server, from anywhere.
#   ./deploy/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."
compose=(docker compose -f compose.prod.yaml --env-file .env.production)

git fetch origin main
git checkout main
git pull --ff-only origin main

# Rebuilds changed images and recreates only what changed. `migrate` runs before `api` starts.
"${compose[@]}" up -d --build --remove-orphans
docker image prune -f >/dev/null

"${compose[@]}" ps
