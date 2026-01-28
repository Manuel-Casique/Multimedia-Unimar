<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\MediaAsset;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $userId = $request->user()->id;

        // Total Count
        $totalFiles = MediaAsset::where('user_id', $userId)->count();

        // Total Size
        $totalSize = MediaAsset::where('user_id', $userId)->sum('file_size');

        // Distribution by Type (mime_type prefix)
        $typeCounts = MediaAsset::where('user_id', $userId)
            ->select(DB::raw("SUBSTRING_INDEX(mime_type, '/', 1) as type, count(*) as count"))
            ->groupBy('type')
            ->pluck('count', 'type');

        // Distribution by Category
        $categoryData = MediaAsset::where('user_id', $userId)
            ->select('category', DB::raw('count(*) as count'))
            ->whereNotNull('category')
            ->groupBy('category')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => ucfirst($item->category),
                    'count' => $item->count
                ];
            });

        // Recent Activity (last 5 files)
        $recentActivity = MediaAsset::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                $type = explode('/', $item->mime_type)[0] ?? 'other';
                $timeAgo = $item->created_at->diffForHumans();
                
                return [
                    'id' => $item->id,
                    'title' => $item->title ?? $item->original_name,
                    'type' => $type,
                    'action' => 'upload',
                    'time' => "Subido {$timeAgo}",
                    'status' => $item->status === 'uploaded' ? 'completed' : ($item->status === 'pending' ? 'pending' : 'processing'),
                ];
            });

        // Pending count
        $pendingCount = MediaAsset::where('user_id', $userId)
            ->where('status', 'pending')
            ->count();

        return response()->json([
            'total_files' => $totalFiles,
            'total_size' => $totalSize,
            'total_size_formatted' => $this->formatBytes($totalSize),
            'type_counts' => $typeCounts,
            'category_data' => $categoryData,
            'recent_activity' => $recentActivity,
            'pending_count' => $pendingCount,
        ]);
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
