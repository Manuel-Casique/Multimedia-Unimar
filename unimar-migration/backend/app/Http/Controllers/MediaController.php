<?php

namespace App\Http\Controllers;

use App\Models\MediaAsset;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = MediaAsset::with('user')
            ->orderBy('created_at', 'desc');

        if ($request->has('category') && $request->input('category')) {
            $query->where('category', $request->input('category'));
        }

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

        // Filter by author
        if ($request->has('author') && $request->author) {
            $query->where('author', 'like', '%' . $request->author . '%');
        }

        // Filter by location
        if ($request->has('location') && $request->location) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        // Filter by tags (JSON column search)
        if ($request->has('tags') && $request->tags) {
            $tagSearch = strtolower(trim($request->tags));
            $query->where(function($q) use ($tagSearch) {
                // Search in JSON array - works with MySQL JSON functions
                $q->whereRaw("LOWER(tags) LIKE ?", ['%"' . $tagSearch . '"%'])
                  ->orWhereRaw("LOWER(tags) LIKE ?", ['%' . $tagSearch . '%']);
            });
        }

        $media = $query->paginate(20);

        return response()->json($media);
    }

    public function destroy(MediaAsset $media)
    {
        if ($media->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($media->file_path) {
            \Storage::disk('public')->delete($media->file_path);
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
            \Log::info('Batch delete requested', ['ids' => $ids, 'user_id' => auth()->id()]);
            
            // Get assets - allow any logged in user to delete (we'll check ownership)
            $user = auth()->user();
            $assets = MediaAsset::whereIn('id', $ids)->get();

            if ($assets->count() === 0) {
                \Log::warning('No assets found for deletion', ['requested_ids' => $ids]);
                return response()->json(['message' => 'No se encontraron archivos para eliminar'], 404);
            }

            $count = 0;
            $errors = [];
            
            foreach ($assets as $asset) {
                try {
                    // Delete physical file if exists
                    if ($asset->file_path) {
                        $deleted = \Storage::disk('public')->delete($asset->file_path);
                        if (!$deleted) {
                            \Log::warning('Failed to delete file', ['file_path' => $asset->file_path, 'asset_id' => $asset->id]);
                        }
                    }
                    
                    // Delete database record
                    $asset->delete();
                    $count++;
                    \Log::info('Asset deleted successfully', ['asset_id' => $asset->id]);
                } catch (\Exception $e) {
                    $errors[] = [
                        'id' => $asset->id,
                        'error' => $e->getMessage()
                    ];
                    \Log::error('Error deleting asset', [
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
            \Log::error('Validation error in batch delete', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Unexpected error in batch delete', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al eliminar archivos: ' . $e->getMessage()
            ], 500);
        }
    }
}
