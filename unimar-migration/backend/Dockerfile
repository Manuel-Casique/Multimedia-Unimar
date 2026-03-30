FROM dunglas/frankenphp:1-php8.2-alpine

# System dependencies needed by PHP extensions
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    mysql-client \
    linux-headers \
    ffmpeg

# PHP extensions required by the application
RUN install-php-extensions \
    pdo_mysql \
    gd \
    zip \
    redis \
    opcache \
    exif \
    intl \
    bcmath \
    pcntl

# MariaDB connector plugin (must be installed AFTER PHP extensions to avoid .so conflicts)
# Provides caching_sha2_password.so required by mysqldump to connect to MySQL 8.4
RUN apk add --no-cache mariadb-connector-c

# Custom PHP limits for large file uploads (videos up to 1 GB)
COPY docker/php-uploads.ini /usr/local/etc/php/conf.d/99-uploads.ini

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Install dependencies first (layer cache)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-scripts --no-autoloader

# Copy application source (artisan must exist before dump-autoload runs scripts)
COPY . .

RUN composer dump-autoload --optimize --no-dev --no-scripts

# Storage and cache directories must be writable
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 755 storage bootstrap/cache \
    && chmod +x docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
