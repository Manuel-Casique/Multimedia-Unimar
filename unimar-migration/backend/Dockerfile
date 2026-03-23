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
    mariadb-connector-c \
    linux-headers

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
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 755 storage bootstrap/cache \
    && chmod +x docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
