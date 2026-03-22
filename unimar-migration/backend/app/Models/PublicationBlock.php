<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PublicationBlock extends Model
{
    protected $fillable = [
        'publication_id',
        'type',
        'content',
        'order',
    ];

    protected $casts = [
        'content' => 'array',
        'order'   => 'integer',
    ];

    /**
     * Get the publication that owns this block.
     */
    public function publication(): BelongsTo
    {
        return $this->belongsTo(Publication::class);
    }
}
