<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IngestController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\BackupController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas públicas — sin autenticación
Route::get('/publications', [PublicationController::class, 'index']);
Route::get('/publications/view/{slug}', [PublicationController::class, 'show']);
Route::get('/publication-types', [PublicationController::class, 'types']);
Route::post('/publications/{slug}/track-view', [PublicationController::class, 'trackView']);

// Autenticación — rutas públicas
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ─────────────────────────────────────────────────────────────────────────────
// RUTAS PROTEGIDAS — Todos los usuarios autenticados
// ─────────────────────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', fn(Request $request) => $request->user());
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Carga de archivos multimedia (todos los autenticados)
    Route::post('/ingest/upload', [IngestController::class, 'upload']);
    Route::post('/ingest/upload-chunk', [IngestController::class, 'uploadChunk']);

    // Galería — ver, editar y eliminar archivos propios
    Route::get('/media', [MediaController::class, 'index']);
    Route::put('/media/{id}', [MediaController::class, 'update']);
    Route::delete('/media/batch', [MediaController::class, 'destroyBatch']);
    Route::delete('/media/{media}', [MediaController::class, 'destroy']);

    // Dashboard y perfil propio
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::put('/user/profile', [SettingsController::class, 'updateProfile']);
    Route::put('/user/password', [SettingsController::class, 'updatePassword']);
    Route::post('/user/photo', [ProfileController::class, 'updatePhoto']);

    // Catálogo — solo lectura para todos los autenticados
    Route::get('/tags', [TagController::class, 'index']);
    Route::get('/locations', [LocationController::class, 'index']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/authors', [AuthorController::class, 'index']);

    // Publicaciones — solo lectura de las propias publicaciones
    Route::get('/publications/my', [PublicationController::class, 'myPublications']);
    Route::get('/publications/{id}/edit', [PublicationController::class, 'showById']);

    // IA / MAIA — disponible para todos los autenticados
    Route::post('/ai/media/{id}/metadata', [\App\Http\Controllers\AIController::class, 'generateMetadataForMedia']);
    Route::post('/ai/media/analyze-base64', [\App\Http\Controllers\AIController::class, 'analyzeBase64']);
    Route::post('/ai/improve-text', [\App\Http\Controllers\AIController::class, 'improveText']);
    Route::post('/ai/change-tone', [\App\Http\Controllers\AIController::class, 'changeTone']);
    Route::post('/ai/fix-spelling', [\App\Http\Controllers\AIController::class, 'fixSpelling']);

    // ─────────────────────────────────────────────────────────────────────────
    // RUTAS DE EDITOR Y ADMIN — Gestión editorial y acciones masivas
    // ─────────────────────────────────────────────────────────────────────────
    Route::middleware('role:editor|admin')->group(function () {

        // Publicaciones — CRUD completo (crear, editar, publicar, archivar, eliminar)
        Route::post('/publications', [PublicationController::class, 'store']);
        Route::put('/publications/{id}', [PublicationController::class, 'update']);
        Route::delete('/publications/{id}', [PublicationController::class, 'destroy']);

        // Estadísticas globales de publicaciones
        Route::get('/publications/stats', [PublicationController::class, 'stats']);

        // Eliminación masiva de archivos multimedia movida arriba para evitar colisión de rutas
    });

    // ─────────────────────────────────────────────────────────────────────────
    // RUTAS DE ADMIN — Administración del sistema
    // ─────────────────────────────────────────────────────────────────────────
    Route::middleware('role:admin')->group(function () {

        // Gestión de usuarios
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}/role', [UserController::class, 'updateRole']);

        // Catálogo — Tags
        Route::post('/tags', [TagController::class, 'store']);
        Route::put('/tags/{id}', [TagController::class, 'update']);
        Route::delete('/tags/{id}', [TagController::class, 'destroy']);

        // Catálogo — Categorías
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Catálogo — Ubicaciones predefinidas
        Route::post('/locations', [LocationController::class, 'store']);
        Route::put('/locations/{id}', [LocationController::class, 'update']);
        Route::delete('/locations/{id}', [LocationController::class, 'destroy']);

        // Catálogo — Autores
        Route::post('/authors', [AuthorController::class, 'store']);
        Route::put('/authors/{id}', [AuthorController::class, 'update']);
        Route::delete('/authors/{id}', [AuthorController::class, 'destroy']);

        // Respaldos en AWS S3
        Route::get('/backups', [BackupController::class, 'index']);
        Route::post('/backups', [BackupController::class, 'store']);
        Route::get('/backups/status', [BackupController::class, 'status']);
        Route::get('/backups/schedule', [BackupController::class, 'getSchedule']);
        Route::post('/backups/schedule', [BackupController::class, 'updateSchedule']);
        Route::get('/backups/{filename}/download', [BackupController::class, 'download'])->where('filename', '.*');
        Route::delete('/backups/{filename}', [BackupController::class, 'destroy'])->where('filename', '.*');
    });
});
