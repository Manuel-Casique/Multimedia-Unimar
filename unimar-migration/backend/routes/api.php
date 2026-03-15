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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas públicas
Route::get('/publications', [PublicationController::class, 'index']);
Route::get('/publications/view/{slug}', [PublicationController::class, 'show']);
Route::get('/publication-types', [PublicationController::class, 'types']);
Route::post('/publications/{slug}/track-view', [PublicationController::class, 'trackView']);

// Autenticación - Rutas públicas
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Autenticación - Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Ingest Routes
    Route::post('/ingest/upload', [IngestController::class, 'upload']);
    Route::post('/ingest/upload-chunk', [IngestController::class, 'uploadChunk']);

    // Gallery Routes
    Route::get('/media', [MediaController::class, 'index']);
    Route::delete('/media/batch', [MediaController::class, 'destroyBatch']);
    Route::put('/media/{id}', [MediaController::class, 'update']);
    Route::delete('/media/{media}', [MediaController::class, 'destroy']);

    // Dashboard & Settings
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::put('/user/profile', [SettingsController::class, 'updateProfile']);
    Route::post('/user/photo', [ProfileController::class, 'updatePhoto']);

    // Tags, Locations & Authors — lectura para todos los autenticados
    Route::get('/tags', [TagController::class, 'index']);
    Route::get('/locations', [LocationController::class, 'index']);
    Route::get('/authors', [AuthorController::class, 'index']);

    // Publications (protegidas)
    Route::get('/publications/my', [PublicationController::class, 'myPublications']);
    Route::get('/publications/{id}/edit', [PublicationController::class, 'showById']);
    Route::post('/publications', [PublicationController::class, 'store']);
    Route::put('/publications/{id}', [PublicationController::class, 'update']);
    Route::delete('/publications/{id}', [PublicationController::class, 'destroy']);

    // AI Integrations
    Route::post('/ai/media/{id}/metadata', [\App\Http\Controllers\AIController::class, 'generateMetadataForMedia']);
    Route::post('/ai/media/analyze-base64', [\App\Http\Controllers\AIController::class, 'analyzeBase64']);

    // Admin only
    Route::middleware('role:admin')->group(function () {
        // Users
        Route::get('/users', [UserController::class, 'index']);
        Route::put('/users/{id}/role', [UserController::class, 'updateRole']);

        // Tags CRUD (admin)
        Route::post('/tags', [TagController::class, 'store']);
        Route::put('/tags/{id}', [TagController::class, 'update']);
        Route::delete('/tags/{id}', [TagController::class, 'destroy']);

        // Categories CRUD (admin)
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Predefined Locations CRUD (admin)
        Route::post('/locations', [LocationController::class, 'store']);
        Route::put('/locations/{id}', [LocationController::class, 'update']);
        Route::delete('/locations/{id}', [LocationController::class, 'destroy']);

        // Authors CRUD (admin)
        Route::post('/authors', [AuthorController::class, 'store']);
        Route::put('/authors/{id}', [AuthorController::class, 'update']);
        Route::delete('/authors/{id}', [AuthorController::class, 'destroy']);
    });
});
