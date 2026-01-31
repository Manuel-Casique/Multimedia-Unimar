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

            // Extract EXIF data for images
            $exifData = null;
            $extractedDateTaken = null;
            $extractedLocation = null;
            $extractedAuthor = null;
            
            if ($type === 'image') {
                $fullPath = storage_path('app/public/' . $path);
                $exifData = $this->extractExifData($fullPath);
                
                if ($exifData) {
                    // Extract date taken
                    if (isset($exifData['DateTimeOriginal'])) {
                        try {
                            $extractedDateTaken = \Carbon\Carbon::createFromFormat('Y:m:d H:i:s', $exifData['DateTimeOriginal']);
                        } catch (\Exception $e) {
                            // Ignore parsing errors
                        }
                    }
                    
                    // Extract location from GPS
                    if (isset($exifData['GPSLatitude']) && isset($exifData['GPSLongitude'])) {
                        $lat = $this->gpsToDecimal($exifData['GPSLatitude'], $exifData['GPSLatitudeRef'] ?? 'N');
                        $lng = $this->gpsToDecimal($exifData['GPSLongitude'], $exifData['GPSLongitudeRef'] ?? 'E');
                        $extractedLocation = "{$lat}, {$lng}";
                    }
                    
                    // Extract author/artist
                    if (isset($exifData['Artist'])) {
                        $extractedAuthor = $exifData['Artist'];
                    } elseif (isset($exifData['Author'])) {
                        $extractedAuthor = $exifData['Author'];
                    }
                }
            }

            // Create MediaAsset record
            // User-provided metadata takes priority, then extracted EXIF, then defaults
            $asset = MediaAsset::create([
                'upload_batch_id' => $batch->id,
                'user_id' => $user->id,
                'title' => $currentMetadata['title'] ?? $originalName,
                'description' => $currentMetadata['description'] ?? null,
                'file_path' => $path,
                'original_name' => $originalName,
                'mime_type' => $mimeType,
                'file_size' => $file->getSize(),
                'status' => 'uploaded',
                'category' => $currentMetadata['category'] ?? null,
                'tags' => $currentMetadata['tags'] ?? [],
                'date_taken' => $currentMetadata['date_taken'] ?? $extractedDateTaken,
                'author' => $currentMetadata['author'] ?? $extractedAuthor,
                'location' => $currentMetadata['location'] ?? $extractedLocation,
                'exif_data' => $exifData,
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

    /**
     * Extract EXIF data from an image file
     */
    private function extractExifData(string $filePath): ?array
    {
        if (!file_exists($filePath)) {
            return null;
        }

        // Check if exif_read_data is available
        if (!function_exists('exif_read_data')) {
            return null;
        }

        try {
            // Suppress warnings for invalid EXIF data
            $exif = @exif_read_data($filePath, 'ANY_TAG', true);
            
            if (!$exif) {
                return null;
            }

            // Flatten and clean EXIF data
            $cleanExif = [];
            
            // Keep only useful sections
            $sections = ['FILE', 'COMPUTED', 'IFD0', 'EXIF', 'GPS'];
            
            foreach ($sections as $section) {
                if (isset($exif[$section])) {
                    foreach ($exif[$section] as $key => $value) {
                        // Skip binary data and very long strings
                        if (is_string($value) && strlen($value) > 500) {
                            continue;
                        }
                        if (is_array($value)) {
                            $cleanExif[$key] = $value;
                        } else {
                            $cleanExif[$key] = $value;
                        }
                    }
                }
            }

            return empty($cleanExif) ? null : $cleanExif;
            
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Convert GPS coordinates from EXIF format to decimal degrees
     */
    private function gpsToDecimal(array $gps, string $ref): float
    {
        $degrees = $this->fractionToDecimal($gps[0] ?? 0);
        $minutes = $this->fractionToDecimal($gps[1] ?? 0);
        $seconds = $this->fractionToDecimal($gps[2] ?? 0);

        $decimal = $degrees + ($minutes / 60) + ($seconds / 3600);

        if ($ref === 'S' || $ref === 'W') {
            $decimal *= -1;
        }

        return round($decimal, 6);
    }

    /**
     * Convert EXIF fraction string to decimal
     */
    private function fractionToDecimal($value): float
    {
        if (is_string($value) && strpos($value, '/') !== false) {
            $parts = explode('/', $value);
            if (count($parts) === 2 && $parts[1] != 0) {
                return (float) $parts[0] / (float) $parts[1];
            }
        }
        return (float) $value;
    }
}
