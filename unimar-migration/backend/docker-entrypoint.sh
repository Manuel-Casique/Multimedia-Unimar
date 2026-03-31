#!/usr/bin/env sh
set -e

# Forcefully delete cached files before booting Artisan (otherwise artisan will crash on boot)
rm -f bootstrap/cache/packages.php bootstrap/cache/services.php bootstrap/cache/config.php bootstrap/cache/routes.php

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

# Start the Laravel task scheduler in the background
# This is what fires automatic backups at the configured time.
# It runs a loop calling `schedule:run` every 60 seconds — no cron needed.
php artisan schedule:work --no-interaction &

# Start Laravel Octane with FrankenPHP
exec php artisan octane:start \
    --server=frankenphp \
    --host=0.0.0.0 \
    --port=8000 \
    --workers=auto \
    --max-requests=500
