<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IngestController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicationController;
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
    
    // Gallery Routes
    Route::get('/media', [MediaController::class, 'index']);
    Route::delete('/media/batch', [MediaController::class, 'destroyBatch']);
    Route::delete('/media/{media}', [MediaController::class, 'destroy']);

    // Dashboard & Settings
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::put('/user/profile', [SettingsController::class, 'updateProfile']);
    Route::post('/user/photo', [ProfileController::class, 'updatePhoto']);

    // Publications (protegidas)
    Route::get('/publications/my', [PublicationController::class, 'myPublications']);
    Route::get('/publications/{id}/edit', [PublicationController::class, 'showById']);
    Route::post('/publications', [PublicationController::class, 'store']);
    Route::put('/publications/{id}', [PublicationController::class, 'update']);
    Route::delete('/publications/{id}', [PublicationController::class, 'destroy']);
});
