<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UploadBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'total_files',
        'processed_files',
    ];

    protected $casts = [
        'total_files' => 'integer',
        'processed_files' => 'integer',
    ];

    /**
     * Estados posibles del lote
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';

    /**
     * Get the user that owns the batch.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the media assets for this batch.
     */
    public function mediaAssets(): HasMany
    {
        return $this->hasMany(MediaAsset::class);
    }

    /**
     * Check if the batch is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if the batch is still processing.
     */
    public function isProcessing(): bool
    {
        return $this->status === self::STATUS_PROCESSING;
    }

    /**
     * Get the progress percentage.
     */
    public function getProgressAttribute(): float
    {
        if ($this->total_files === 0) {
            return 0;
        }
        return round(($this->processed_files / $this->total_files) * 100, 2);
    }
}
