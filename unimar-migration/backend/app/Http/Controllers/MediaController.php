<?php

namespace App\Http\Controllers;

use App\Models\MediaAsset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = MediaAsset::with(['user', 'tags.category', 'authors'])
            ->orderBy('created_at', 'desc');

        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Simple search by title or description
        if ($request->has('q') && $request->q) {
            $searchTerm = $request->q;
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', '%' . $searchTerm . '%')
                  ->orWhere('description', 'like', '%' . $searchTerm . '%');
            });
        }

        // Filter by media type (image, video, etc)
        if ($request->has('type') && current((array)$request->type) && current((array)$request->type) !== 'all') {
            $type = current((array)$request->type);
            $query->where('mime_type', 'like', $type . '/%');
        }

        // Filter by orientation
        if ($request->has('orientation') && !empty($request->orientation) && current((array)$request->orientation) !== 'all') {
            $orientation = current((array)$request->orientation);
            
            // Only apply if width and height are available
            $query->whereNotNull('width')->whereNotNull('height');
            
            if ($orientation === 'horizontal') {
                $query->whereRaw('width > height');
            } elseif ($orientation === 'vertical') {
                $query->whereRaw('width < height');
            } elseif ($orientation === 'square') {
                $query->whereRaw('width = height');
            }
        }

        // Filter by location (supports multiple values via locations[])
        if ($request->has('locations') && !empty($request->locations)) {
            $locs = array_filter((array) $request->locations);
            if (!empty($locs)) {
                $query->where(function($q) use ($locs) {
                    foreach ($locs as $loc) {
                        $q->orWhere('location', 'like', '%' . $loc . '%');
                    }
                });
            }
        } elseif ($request->has('location') && $request->location) {
            // backward compat single
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        // Filtrar por tags (soporta múltiples via tags[])
        if ($request->has('tags') && !empty($request->tags)) {
            $tagNames = array_filter((array) $request->tags);
            if (!empty($tagNames)) {
                $slugs = array_map(fn($n) => \Illuminate\Support\Str::slug($n), $tagNames);
                $query->whereHas('tags', function ($q) use ($tagNames, $slugs) {
                    $q->where(function($inner) use ($tagNames, $slugs) {
                        $inner->whereIn(\Illuminate\Support\Facades\DB::raw('LOWER(name)'),
                            array_map('strtolower', $tagNames))
                              ->orWhereIn('slug', $slugs);
                    });
                });
            }
        }

        // Filtrar por categorías (via tags con category_id)
        if ($request->has('categories') && !empty($request->categories)) {
            $categoryIds = array_filter(array_map('intval', (array) $request->categories));
            if (!empty($categoryIds)) {
                $query->whereHas('tags', function ($q) use ($categoryIds) {
                    $q->whereIn('category_id', $categoryIds);
                });
            }
        }

        // Filtrar por autores (via authors[])
        if ($request->has('authors') && !empty($request->authors)) {
            $authorsParam = array_filter((array) $request->authors);
            if (!empty($authorsParam)) {
                // Support both IDs (numeric) and names (string)
                $authorIds  = array_filter($authorsParam, 'is_numeric');
                $authorNames = array_filter($authorsParam, fn($v) => !is_numeric($v));
                $query->whereHas('authors', function ($q) use ($authorIds, $authorNames) {
                    $q->where(function($inner) use ($authorIds, $authorNames) {
                        if (!empty($authorIds)) {
                            $inner->orWhereIn('authors.id', array_map('intval', $authorIds));
                        }
                        if (!empty($authorNames)) {
                            foreach ($authorNames as $name) {
                                $inner->orWhere('authors.name', 'like', '%' . $name . '%');
                            }
                        }
                    });
                });
            }
        }

        $media = $query->paginate(20);

        return response()->json($media);
    }

    /**
     * Update the specified media asset in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $media = MediaAsset::findOrFail($id);

            // Permitir actualización si es el dueño o si tiene rol de admin
            $user = auth()->user();
            if ($media->user_id !== $user->id && !$user->hasRole('admin')) {
                return response()->json(['message' => 'No tienes permiso para editar este archivo.'], 403);
            }

            $validated = $request->validate([
                'title' => 'string|max:255',
                'description' => 'nullable|string',
                'location' => 'nullable|string|max:150',
                'date_taken' => 'nullable|date',
                'tags' => 'nullable|array',
                'authors' => 'nullable|array',
                'authors.*' => 'integer|exists:authors,id',
            ]);

            // Filtrar del array validado lo que sea tags y authors porque se manejan diferente
            $fillableData = \Illuminate\Support\Arr::except($validated, ['tags', 'authors']);
            $media->update($fillableData);

            if (isset($validated['tags'])) {
                // Solo usar tags que ya existen en el catálogo (no crear on-the-fly)
                $tagIds = [];
                foreach ($validated['tags'] as $tagName) {
                    $slug = \Illuminate\Support\Str::slug($tagName);
                    $tagModel = \App\Models\Tag::where('slug', $slug)->first();
                    if ($tagModel) {
                        $tagIds[] = $tagModel->id;
                    }
                    // Si el tag no existe en el catálogo, se ignora silenciosamente
                    // Los tags solo se crean desde la pantalla de Configuración > Catálogo
                }
                $media->tags()->sync($tagIds);
            }

            if (isset($validated['authors'])) {
                $media->authors()->sync($validated['authors']);
            }

            // Recargar con relaciones para la respuesta
            $media->load(['tags', 'authors']);

            return response()->json([
                'message' => 'Archivo actualizado con éxito.',
                'media' => $media
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(MediaAsset $media)
    {
        $user = auth()->user();

        // Solo el dueño o el admin pueden eliminar
        if ($media->user_id !== $user->id && !$user->hasRole('admin')) {
            return response()->json(['message' => 'No tienes permiso para eliminar este archivo.'], 403);
        }

        if ($media->publications()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar este archivo porque está en uso en una o más publicaciones.'
            ], 422);
        }

        if ($media->file_path) {
            Storage::disk('public')->delete($media->file_path);
        }
        $media->delete();

        return response()->json(['message' => 'Archivo eliminado']);
    }

    public function destroyBatch(Request $request)
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'integer'
            ]);

            $ids = $request->input('ids');
            Log::info('Batch delete requested', ['ids' => $ids, 'user_id' => auth()->id()]);
            
            // Get assets - allow any logged in user to delete (we'll check ownership)
            $user = auth()->user();
            $assets = MediaAsset::whereIn('id', $ids)->get();

            if ($assets->count() === 0) {
                Log::warning('No assets found for deletion', ['requested_ids' => $ids]);
                return response()->json(['message' => 'No se encontraron archivos para eliminar'], 404);
            }

            $count = 0;
            $errors = [];
            
            foreach ($assets as $asset) {
                try {
                    // Solo el dueño o el admin pueden eliminar cada archivo
                    if ($asset->user_id !== $user->id && !$user->hasRole('admin')) {
                        $errors[] = [
                            'id'    => $asset->id,
                            'error' => 'No eres el propietario de este archivo'
                        ];
                        Log::warning('Batch delete blocked: asset not owned by user', ['asset_id' => $asset->id, 'user_id' => $user->id]);
                        continue;
                    }

                    // Check if used in publications
                    if ($asset->publications()->exists()) {
                        $errors[] = [
                            'id'    => $asset->id,
                            'error' => 'En uso por publicaciones'
                        ];
                        Log::warning('Cannot delete asset in use by publication', ['asset_id' => $asset->id]);
                        continue;
                    }

                    // Delete physical file if exists
                    if ($asset->file_path) {
                        $deleted = Storage::disk('public')->delete($asset->file_path);
                        if (!$deleted) {
                            Log::warning('Failed to delete file', ['file_path' => $asset->file_path, 'asset_id' => $asset->id]);
                        }
                    }

                    // Delete database record
                    $asset->delete();
                    $count++;
                    Log::info('Asset deleted successfully', ['asset_id' => $asset->id]);
                } catch (\Exception $e) {
                    $errors[] = [
                        'id' => $asset->id,
                        'error' => $e->getMessage()
                    ];
                    Log::error('Error deleting asset', [
                        'asset_id' => $asset->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            $response = ['message' => "{$count} archivos eliminados"];
            if (count($errors) > 0) {
                $response['errors'] = $errors;
                $response['partial'] = true;
            }

            return response()->json($response);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error in batch delete', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Unexpected error in batch delete', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al eliminar archivos: ' . $e->getMessage()
            ], 500);
        }
    }
}
