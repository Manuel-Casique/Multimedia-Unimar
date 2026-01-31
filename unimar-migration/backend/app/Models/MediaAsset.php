<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MediaAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'upload_batch_id',
        'user_id',
        'title',
        'description',
        'category',
        'tags',
        'file_path',
        'original_name',
        'thumbnail_path',
        'mime_type',
        'file_size',
        'status',
        'date_taken',
        'author',
        'location',
        'exif_data',
    ];

    protected $casts = [
        'tags' => 'array',
        'exif_data' => 'array',
        'file_size' => 'integer',
        'date_taken' => 'datetime',
    ];

    /**
     * Accessors to append to model's array/JSON representation.
     */
    protected $appends = [
        'file_url',
        'thumbnail_url',
        'formatted_size',
        'width',
        'height',
    ];

    /**
     * Estados posibles del asset
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_UPLOADED = 'uploaded';
    public const STATUS_FAILED = 'failed';

    /**
     * Get the user that owns the asset.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the upload batch that this asset belongs to.
     */
    public function uploadBatch(): BelongsTo
    {
        return $this->belongsTo(UploadBatch::class);
    }

    /**
     * Check if the asset is uploaded successfully.
     */
    public function isUploaded(): bool
    {
        return $this->status === self::STATUS_UPLOADED;
    }

    /**
     * Get the full URL for the file.
     */
    public function getFileUrlAttribute(): string
    {
        return asset('storage/' . str_replace('public/', '', $this->file_path));
    }

    /**
     * Get the thumbnail URL.
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        if (!$this->thumbnail_path) {
            return null;
        }
        return asset('storage/' . str_replace('public/', '', $this->thumbnail_path));
    }

    /**
     * Get formatted file size.
     */
    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->file_size;
        
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }

    /**
     * Get image width (for images only).
     */
    public function getWidthAttribute(): ?int
    {
        if (!$this->file_path || !str_starts_with($this->mime_type ?? '', 'image/')) {
            return null;
        }
        
        try {
            $path = storage_path('app/' . $this->file_path);
            if (!file_exists($path)) {
                $path = storage_path('app/public/' . str_replace('public/', '', $this->file_path));
            }
            
            if (file_exists($path)) {
                $size = @getimagesize($path);
                if ($size) {
                    return $size[0];
                }
            }
        } catch (\Exception $e) {
            // Silently fail
        }
        
        return null;
    }

    /**
     * Get image height (for images only).
     */
    public function getHeightAttribute(): ?int
    {
        if (!$this->file_path || !str_starts_with($this->mime_type ?? '', 'image/')) {
            return null;
        }
        
        try {
            $path = storage_path('app/' . $this->file_path);
            if (!file_exists($path)) {
                $path = storage_path('app/public/' . str_replace('public/', '', $this->file_path));
            }
            
            if (file_exists($path)) {
                $size = @getimagesize($path);
                if ($size) {
                    return $size[1];
                }
            }
        } catch (\Exception $e) {
            // Silently fail
        }
        
        return null;
    }
}
