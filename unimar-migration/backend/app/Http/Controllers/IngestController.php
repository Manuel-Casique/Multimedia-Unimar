<?php

namespace App\Http\Controllers;

use App\Models\MediaAsset;
use App\Models\UploadBatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use FFMpeg\FFMpeg;
use FFMpeg\Coordinate\TimeCode;

class IngestController extends Controller
{
    public function upload(Request $request)
    {
        // Prevent PHP from timing out or hitting memory restrictions when dealing with massive objects (e.g. 500MB videos)
        set_time_limit(0);
        ini_set('memory_limit', '2048M');

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
                'title' => !empty($currentMetadata['title']) ? $currentMetadata['title'] : $originalName,
                'description' => !empty($currentMetadata['description']) ? $currentMetadata['description'] : null,
                'file_path' => $path,
                'original_name' => $originalName,
                'mime_type' => $mimeType,
                'file_size' => $file->getSize(),
                'status' => 'uploaded',
                'date_taken' => !empty($currentMetadata['date_taken']) ? $currentMetadata['date_taken'] : $extractedDateTaken,
                'location' => !empty($currentMetadata['location']) ? $currentMetadata['location'] : $extractedLocation,
                'exif_data' => $exifData,
            ]);

            // Sync tags via the polymorphic relation
            $tagsToSync = $currentMetadata['tags'] ?? [];
            if (!empty($tagsToSync)) {
                $tagIds = [];
                foreach ((array)$tagsToSync as $tagName) {
                    $slug = Str::slug($tagName);
                    $tagModel = \App\Models\Tag::firstOrCreate(
                        ['slug' => $slug],
                        ['name' => ucfirst($tagName)]
                    );
                    $tagIds[] = $tagModel->id;
                }
                $asset->tags()->sync($tagIds);
            }

            // Sync authors
            $authorsToSync = $currentMetadata['authors'] ?? [];
            if (!empty($authorsToSync)) {
                $asset->authors()->sync($authorsToSync);
            }

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

    public function uploadChunk(Request $request)
    {
        // Aumentar tiempo límite y memoria porque procesar y armar archivos pesados puede tardar
        set_time_limit(0);
        ini_set('memory_limit', '2048M');

        $request->validate([
            'file' => 'required|file',
            'file_id' => 'required|string',
            'chunk_index' => 'required|integer',
            'total_chunks' => 'required|integer',
            'file_name' => 'required|string',
        ]);

        $fileId = $request->file_id;
        $chunkIndex = $request->chunk_index;
        $totalChunks = $request->total_chunks;
        $originalName = $request->file_name;
        
        $chunksDir = storage_path('app/public/media/chunks');
        if (!file_exists($chunksDir)) {
            mkdir($chunksDir, 0755, true);
        }

        $chunkPath = "{$chunksDir}/{$fileId}";
        
        // Adjuntar chunk al archivo temporal
        $chunkFile = $request->file('file');
        $out = fopen($chunkPath, $chunkIndex == 0 ? 'wb' : 'ab');
        if (!$out) {
            return response()->json(['error' => 'No se pudo abrir archivo temporal para escribir'], 500);
        }
        $in = fopen($chunkFile->getRealPath(), 'rb');
        stream_copy_to_stream($in, $out);
        fclose($in);
        fclose($out);

        // Si es el último chunk, construimos y procesamos el final
        if ($chunkIndex == $totalChunks - 1) {
            $user = $request->user();
            $metadataStr = $request->file_metadata;
            $metadata = $metadataStr ? json_decode($metadataStr, true) : [];
            $mimeType = $request->mime_type ?? 'application/octet-stream';

            // Generar ruta final con UUID
            $extension = pathinfo($originalName, PATHINFO_EXTENSION);
            if (!$extension && str_contains($originalName, '.')) {
                $extArr = explode('.', $originalName);
                $extension = end($extArr);
            }
            $uuid = (string) Str::uuid();
            $filename = "{$uuid}." . ($extension ?: 'bin');
            $finalRelativePath = "media/raw/{$filename}";
            $finalPath = storage_path("app/public/{$finalRelativePath}");

            if (!file_exists(dirname($finalPath))) {
                mkdir(dirname($finalPath), 0755, true);
            }

            rename($chunkPath, $finalPath);

            // Determinar tipo
            $type = 'other';
            if (str_starts_with($mimeType, 'image/')) $type = 'image';
            else if (str_starts_with($mimeType, 'video/')) $type = 'video';
            else if (str_starts_with($mimeType, 'audio/')) $type = 'audio';

            // Extraer EXIF (solo imágenes) y dimensiones
            $exifData = null;
            $extractedDateTaken = null;
            $extractedLocation = null;
            $extractedAuthor = null;
            $width = null;
            $height = null;
            $thumbnailPath = null;

            if ($type === 'image') {
                $exifData = $this->extractExifData($finalPath);
                
                // Get dims
                $size = @getimagesize($finalPath);
                if ($size) {
                    $width = $size[0];
                    $height = $size[1];
                }

                if ($exifData) {
                    if (isset($exifData['DateTimeOriginal'])) {
                        try {
                            $extractedDateTaken = \Carbon\Carbon::createFromFormat('Y:m:d H:i:s', $exifData['DateTimeOriginal']);
                        } catch (\Exception $e) {}
                    }
                    if (isset($exifData['GPSLatitude']) && isset($exifData['GPSLongitude'])) {
                        $lat = $this->gpsToDecimal($exifData['GPSLatitude'], $exifData['GPSLatitudeRef'] ?? 'N');
                        $lng = $this->gpsToDecimal($exifData['GPSLongitude'], $exifData['GPSLongitudeRef'] ?? 'E');
                        $extractedLocation = "{$lat}, {$lng}";
                    }
                }
                // Generate Thumbnail using Intervention Image v3
                try {
                    $manager = new ImageManager(new Driver());
                    $image = $manager->read($finalPath);
                    $image->scaleDown(width: 400); // Scale proportionally securely down to 400px width
                    
                    $thumbnailFilename = "{$uuid}.jpg"; // Always save thumbnails as jpg
                    $thumbnailRelativePath = "media/thumbnails/{$thumbnailFilename}";
                    $thumbnailAbsolutePath = storage_path("app/public/{$thumbnailRelativePath}");
                    
                    if (!file_exists(dirname($thumbnailAbsolutePath))) {
                        mkdir(dirname($thumbnailAbsolutePath), 0755, true);
                    }
                    
                    $image->save($thumbnailAbsolutePath, 60);
                    $thumbnailPath = $thumbnailRelativePath;
                } catch (\Exception $e) {
                    Log::error("Error generating image thumbnail: " . $e->getMessage());
                }
            } elseif ($type === 'video') {
                try {
                    $ffmpeg = FFMpeg::create([
                        'ffmpeg.binaries'  => 'C:/ffmpeg/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe',
                        'ffprobe.binaries' => 'C:/ffmpeg/ffmpeg-master-latest-win64-gpl/bin/ffprobe.exe',
                        'timeout'          => 3600,
                        'ffmpeg.threads'   => 12,
                    ]);

                    $video = $ffmpeg->open($finalPath);

                    // Extract Dimensions
                    $dimension = $video->getStreams()->videos()->first()->getDimensions();
                    if ($dimension) {
                        $width = $dimension->getWidth();
                        $height = $dimension->getHeight();
                    }

                    // Extract Thumbnail
                    $thumbnailRelativePath = "media/thumbnails/{$uuid}.jpg";
                    $thumbnailAbsolutePath = storage_path("app/public/{$thumbnailRelativePath}");
                    
                    if (!file_exists(dirname($thumbnailAbsolutePath))) {
                        mkdir(dirname($thumbnailAbsolutePath), 0755, true);
                    }

                    $video->frame(TimeCode::fromSeconds(1))->save($thumbnailAbsolutePath);
                    $thumbnailPath = $thumbnailRelativePath;

                } catch (\Exception $e) {
                    Log::error("FFMpeg Error processing video: " . $e->getMessage());
                }
            }

            // Transacción DB
            return DB::transaction(function () use ($user, $originalName, $metadata, $mimeType, $finalRelativePath, $finalPath, $extractedDateTaken, $extractedLocation, $exifData, $width, $height, $thumbnailPath) {
                // Creamos un lote (batch) por archivo
                $batch = UploadBatch::create([
                    'user_id' => $user->id,
                    'status' => 'completed',
                    'total_files' => 1,
                    'processed_files' => 1
                ]);

                // Create asset
                $asset = MediaAsset::create([
                    'upload_batch_id' => $batch->id,
                    'user_id' => $user->id,
                    'title' => !empty($metadata['title']) ? $metadata['title'] : $originalName,
                    'description' => !empty($metadata['description']) ? $metadata['description'] : null,
                    'file_path' => $finalRelativePath,
                    'thumbnail_path' => $thumbnailPath,
                    'original_name' => $originalName,
                    'mime_type' => $mimeType,
                    'file_size' => filesize($finalPath),
                    'width' => $width,
                    'height' => $height,
                    'status' => 'uploaded',
                    'date_taken' => !empty($metadata['date_taken']) ? $metadata['date_taken'] : $extractedDateTaken,
                    'location' => !empty($metadata['location']) ? $metadata['location'] : $extractedLocation,
                    'exif_data' => $exifData,
                ]);

                // Sync tags
                $tagsToSync = $metadata['tags'] ?? [];
                if (!empty($tagsToSync)) {
                    $tagIds = [];
                    foreach ((array)$tagsToSync as $tagName) {
                        $slug = Str::slug($tagName);
                        $tagModel = \App\Models\Tag::firstOrCreate(
                            ['slug' => $slug],
                            ['name' => ucfirst($tagName)]
                        );
                        $tagIds[] = $tagModel->id;
                    }
                    $asset->tags()->sync($tagIds);
                }

                // Sync authors
                $authorsToSync = $metadata['authors'] ?? [];
                if (!empty($authorsToSync)) {
                    $asset->authors()->sync($authorsToSync);
                }

                return response()->json([
                    'message' => 'Archivo procesado por completo',
                    'asset' => $asset
                ], 201);
            });
        }

        return response()->json(['message' => 'Chunk recibido', 'chunk' => $chunkIndex]);
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

            return empty($cleanExif) ? null : $this->sanitizeUtf8($cleanExif);
            
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Recursively sanitize data to ensure valid UTF-8 for JSON encoding
     */
    private function sanitizeUtf8($data)
    {
        if (is_array($data)) {
            $result = [];
            foreach ($data as $key => $value) {
                $result[$key] = $this->sanitizeUtf8($value);
            }
            return $result;
        }
        if (is_string($data)) {
            return mb_scrub($data, 'UTF-8');
        }
        return $data;
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
