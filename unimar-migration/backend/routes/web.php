<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Ruta de verificación del Módulo 1
Route::get('/verificar', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Módulo 1: Configuración Inicial ✅',
        'laravel_version' => app()->version(),
        'php_version' => PHP_VERSION,
        'database' => [
            'connection' => config('database.default'),
            'database' => config('database.connections.mysql.database'),
        ],
        'dependencias' => [
            'sanctum' => class_exists('Laravel\Sanctum\Sanctum'),
            'spatie_permission' => class_exists('Spatie\Permission\PermissionServiceProvider'),
            'intervention_image' => class_exists('Intervention\Image\ImageManager'),
            'gemini' => class_exists('Gemini\Client'),
        ],
        'configuracion' => [
            'gemini_configured' => !empty(config('services.gemini.api_key', '')),
            'app_url' => config('app.url'),
        ],
    ]);
});

// Rutas de autenticación con Google OAuth
Route::prefix('auth')->group(function () {
    Route::get('/google', [AuthController::class, 'redirectToGoogle'])->name('auth.google');
    Route::get('/google/callback', [AuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');
});
