#!/usr/bin/env bash
set -euo pipefail

GHCR_USER="${GHCR_USER:?Variable GHCR_USER no definida}"
GHCR_TOKEN="${GHCR_TOKEN:?Variable GHCR_TOKEN no definida}"
GITHUB_OWNER="${GITHUB_OWNER:?Variable GITHUB_OWNER no definida}"

echo "→ Login en GHCR..."
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin

echo "→ Pulling imágenes..."
GITHUB_OWNER="$GITHUB_OWNER" docker compose -f docker-compose.prod.yml pull

echo "→ Levantando servicios..."
GITHUB_OWNER="$GITHUB_OWNER" docker compose -f docker-compose.prod.yml up -d

echo ""
echo "✓ Listo. App disponible en http://unimar.localhost"
echo "  (Asegúrate de tener 127.0.0.1 unimar.localhost en /etc/hosts)"
