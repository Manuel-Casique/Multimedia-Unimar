<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalyticsEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'publication_id',
        'event_type',
        'time_spent',
        'user_agent',
        'ip_address',
        'referrer',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function publication()
    {
        return $this->belongsTo(Publication::class);
    }
}
