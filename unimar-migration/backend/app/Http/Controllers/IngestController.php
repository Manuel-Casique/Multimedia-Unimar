<?php

namespace App\Http\Controllers;

use App\Models\MediaAsset;
use App\Models\UploadBatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class IngestController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'required|file|max:512000', // 500MB max per file
            'file_metadata' => 'nullable|json', // metadata array matching files order
        ]);

        $user = $request->user();
        $metadata = $request->metadata ? json_decode($request->metadata, true) : [];
        
        $batch = null;

        // Start transaction
        return DB::transaction(function () use ($request, $user, $metadata) {
            
            // Create a new batch for this upload session
            $batch = UploadBatch::create([
                'user_id' => $user->id,
                'status' => 'processing',
                'total_files' => count($request->file('files')),
                'processed_files' => 0,
            ]);

            $savedAssets = [];

        $files = $request->file('files');
        $filesMetadata = $request->file_metadata ? json_decode($request->file_metadata, true) : [];

        foreach ($files as $index => $file) {
            // Generate a unique filename
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $uuid = (string) Str::uuid();
            $filename = "{$uuid}.{$extension}";
            
            // Store file
            $path = $file->storeAs('media/raw', $filename, 'public');

            // Determine file type
            $mimeType = $file->getMimeType();
            $type = 'other';
            if (str_starts_with($mimeType, 'image/')) $type = 'image';
            else if (str_starts_with($mimeType, 'video/')) $type = 'video';
            else if (str_starts_with($mimeType, 'audio/')) $type = 'audio';

            // Get specific metadata for this file index if available
            $currentMetadata = $filesMetadata[$index] ?? [];

            // Create MediaAsset record
            $asset = MediaAsset::create([
                'upload_batch_id' => $batch->id,
                'user_id' => $user->id,
                'title' => $currentMetadata['title'] ?? $originalName,
                'description' => $currentMetadata['description'] ?? null,
                'file_path' => $path,
                'original_name' => $originalName,
                'mime_type' => $mimeType,
                'file_size' => $file->getSize(),
                'status' => 'pending', // Pending processing/approval
                'category' => $currentMetadata['category'] ?? null,
                'tags' => $currentMetadata['tags'] ?? [],
                'date_taken' => $currentMetadata['date_taken'] ?? null,
                'author' => $currentMetadata['author'] ?? null,
                'location' => $currentMetadata['location'] ?? null,
            ]);

                $savedAssets[] = $asset;
                $batch->increment('processed_files');
            }

            $batch->update(['status' => 'completed']);

            return response()->json([
                'message' => 'Archivos subidos correctamente',
                'batch_id' => $batch->id,
                'files_count' => count($savedAssets),
                'assets' => $savedAssets
            ], 201);
        });
    }
}
