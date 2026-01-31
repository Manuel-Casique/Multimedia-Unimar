<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\MediaAsset;
use App\Models\Publication;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $userId = $request->user()->id;
        
        // Date filters
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        
        $query = MediaAsset::where('user_id', $userId);
        
        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        // Total Count (with filters)
        $totalFiles = (clone $query)->count();

        // Total Size (with filters)
        $totalSize = (clone $query)->sum('file_size');

        // Distribution by Type (mime_type prefix)
        $typeCounts = (clone $query)
            ->select(DB::raw("SUBSTRING_INDEX(mime_type, '/', 1) as type, count(*) as count"))
            ->groupBy('type')
            ->pluck('count', 'type');

        // Distribution by Category
        $categoryData = (clone $query)
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

        // Timeline Data (files per day)
        $timelineData = (clone $query)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => Carbon::parse($item->date)->format('d/m'),
                    'fullDate' => $item->date,
                    'count' => $item->count
                ];
            });

        // Author Data (files per author)
        $authorData = (clone $query)
            ->select('author', DB::raw('count(*) as count'))
            ->whereNotNull('author')
            ->where('author', '!=', '')
            ->groupBy('author')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->author,
                    'count' => $item->count
                ];
            });

        // Hourly Activity (files by hour of day)
        $hourlyData = (clone $query)
            ->select(DB::raw('HOUR(created_at) as hour'), DB::raw('count(*) as count'))
            ->groupBy('hour')
            ->orderBy('hour', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'hour' => sprintf('%02d:00', $item->hour),
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

        // --- PUBLICACIONES STATS ---
        $pubQuery = Publication::query(); // Si se requiere filtrar por usuario: ->where('user_id', $userId)

        $totalPublications = (clone $pubQuery)->count();
        
        $colStatus = 'status'; // Asumiendo columna 'status' en publications
        $pubStatusCounts = (clone $pubQuery)
            ->select($colStatus, DB::raw('count(*) as count'))
            ->groupBy($colStatus)
            ->pluck('count', $colStatus); // ['published' => 10, 'draft' => 5]

        $recentPublications = (clone $pubQuery)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($pub) {
                return [
                    'id' => $pub->id,
                    'title' => $pub->title,
                    'slug' => $pub->slug,
                    'status' => $pub->status,
                    'created_at' => $pub->created_at->toISOString(),
                    'time_ago' => $pub->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'total_files' => $totalFiles,
            'total_size' => $totalSize,
            'total_size_formatted' => $this->formatBytes($totalSize),
            'type_counts' => $typeCounts,
            'category_data' => $categoryData,
            'timeline_data' => $timelineData,
            'author_data' => $authorData,
            'hourly_data' => $hourlyData,
            'recent_activity' => $recentActivity,
            'pending_count' => $pendingCount,
            'publications' => [
                'total' => $totalPublications,
                'status_counts' => $pubStatusCounts,
                'recent' => $recentPublications
            ]
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
