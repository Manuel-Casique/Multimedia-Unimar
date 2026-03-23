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
        
        $query = MediaAsset::query();
        
        if ($startDate) {
            $query->whereDate('media_assets.created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('media_assets.created_at', '<=', $endDate);
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
        $recentActivity = MediaAsset::orderBy('created_at', 'desc')
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
        $pendingCount = MediaAsset::where('status', 'pending')->count();

        // Author Distribution
        $authorDistribution = (clone $query)
            ->join('users', 'media_assets.user_id', '=', 'users.id')
            ->select('users.first_name', 'users.last_name', DB::raw('count(*) as count'))
            ->groupBy('users.id', 'users.first_name', 'users.last_name')
            ->orderByDesc('count')
            ->limit(10)
            ->toBase()
            ->get()
            ->map(function ($item) {
                return [
                    'name' => trim($item->first_name . ' ' . $item->last_name),
                    'count' => $item->count
                ];
            });

        // --- PUBLICACIONES STATS ---
        $pubQuery = Publication::query()->where(function($q) use ($userId) {
            $q->whereIn('status', ['published', 'archived'])
              ->orWhere(function($subQ) use ($userId) {
                  $subQ->where('status', 'draft')
                       ->where('created_by', $userId);
              });
        });

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

        $catalogStats = [
            'categories' => \App\Models\Category::count(),
            'tags' => \App\Models\Tag::count(),
            'locations' => \App\Models\PredefinedLocation::count(),
        ];

        $usersStats = [
            'admins' => \App\Models\User::whereHas('role', function($q){ $q->where('name', 'admin'); })->count(),
            'editors' => \App\Models\User::whereHas('role', function($q){ $q->where('name', 'editor'); })->count(),
            'users' => \App\Models\User::whereHas('role', function($q){ $q->where('name', 'usuario'); })->count(),
        ];

        return response()->json([
            'total_files' => $totalFiles,
            'total_size' => $totalSize,
            'total_size_formatted' => $this->formatBytes($totalSize),
            'type_counts' => $typeCounts,
            'timeline_data' => $timelineData,
            'hourly_data' => $hourlyData,
            'recent_activity' => $recentActivity,
            'pending_count' => $pendingCount,
            'author_distribution' => $authorDistribution,
            'publications' => [
                'total' => $totalPublications,
                'status_counts' => $pubStatusCounts,
                'recent' => $recentPublications
            ],
            'catalog' => $catalogStats,
            'users' => $usersStats
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
