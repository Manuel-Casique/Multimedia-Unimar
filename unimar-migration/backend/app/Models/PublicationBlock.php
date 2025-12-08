<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicationBlock extends Model
{
    use HasFactory;

    protected $fillable = [
        'publication_id',
        'type',
        'content',
        'order',
    ];

    protected $casts = [
        'content' => 'array',
    ];

    public function publication()
    {
        return $this->belongsTo(Publication::class);
    }
}
