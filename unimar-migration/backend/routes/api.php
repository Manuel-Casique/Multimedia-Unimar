<?php

use App\Http\Controllers\AIController;
use App\Http\Controllers\BlockController;
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas públicas
Route::get('/publications', [PublicationController::class, 'index']);
Route::get('/publications/{slug}', [PublicationController::class, 'show']);
Route::get('/publication-types', [PublicationController::class, 'types']);

// Tracking (público)
Route::post('/publications/{slug}/track-view', [PublicationController::class, 'trackView']);

// Autenticación
// Route::post('/register', [AuthController::class, 'register']); // Implementar en Módulo 4
// Route::post('/login', [AuthController::class, 'login']); // Implementar en Módulo 4

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rutas protegidas (Placeholder para cuando se implemente Auth)
// Route::middleware('auth:sanctum')->group(function () {
    // Route::post('/logout', [AuthController::class, 'logout']);
    // Route::get('/me', [AuthController::class, 'me']);

    // Publicaciones (admin/editor) - TEMPORALMENTE ABIERTAS PARA TESTING SI NO HAY AUTH
    // RECOMENDACIÓN: Implementar AuthController pronto.
    
    // Rutas de Publicaciones (Admin)
    Route::post('/publications', [PublicationController::class, 'store']);
    Route::put('/publications/{id}', [PublicationController::class, 'update']);
    Route::delete('/publications/{id}', [PublicationController::class, 'destroy']);

    // Bloques
    Route::post('/publications/{id}/blocks', [BlockController::class, 'store']);
    Route::put('/blocks/{id}', [BlockController::class, 'update']);
    Route::delete('/blocks/{id}', [BlockController::class, 'destroy']);
    Route::post('/publications/{id}/blocks/reorder', [BlockController::class, 'reorder']);

    // IA
    Route::prefix('ai')->group(function () {
        Route::post('/improve', [AIController::class, 'improveText']);
        Route::post('/generate-titles', [AIController::class, 'generateTitles']);
        Route::post('/generate-summary', [AIController::class, 'generateSummary']);
        Route::post('/optimize-seo', [AIController::class, 'optimizeSEO']);
        Route::post('/expand-idea', [AIController::class, 'expandIdea']);
        Route::post('/suggest-next-block', [AIController::class, 'suggestNextBlock']);
    });
// });
