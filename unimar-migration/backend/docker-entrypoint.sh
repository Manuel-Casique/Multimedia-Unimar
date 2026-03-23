#!/usr/bin/env sh
set -e

# Rebuild package manifest (clears any stale provider references from removed packages)
php artisan clear-compiled
php artisan package:discover --ansi 2>/dev/null || true

# Cache configuration, routes and views with the actual runtime env vars
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ensure public/storage symlink exists
php artisan storage:link --force 2>/dev/null || true

# Run pending migrations
php artisan migrate --force

# Seed initial data (roles, default users, catalog)
php artisan db:seed --force

# Start Laravel Octane with FrankenPHP
exec php artisan octane:start \
    --server=frankenphp \
    --host=0.0.0.0 \
    --port=8000 \
    --workers=auto \
    --max-requests=500
