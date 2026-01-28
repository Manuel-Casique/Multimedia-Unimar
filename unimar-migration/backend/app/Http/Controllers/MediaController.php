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

        // Simple search by title
        if ($request->has('q') && $request->q) {
            $query->where('title', 'like', '%' . $request->q . '%');
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
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:media_assets,id'
        ]);

        $ids = $request->input('ids');
        $assets = MediaAsset::whereIn('id', $ids)->where('user_id', auth()->id())->get();

        $count = 0;
        foreach ($assets as $asset) {
            if ($asset->file_path) {
                \Storage::disk('public')->delete($asset->file_path);
            }
            $asset->delete();
            $count++;
        }

        return response()->json(['message' => "{$count} archivos eliminados"]);
    }
}
