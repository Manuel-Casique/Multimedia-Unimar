<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Publication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'created_by',
        'title',
        'slug',
        'description',
        'content',
        'status',
        'publication_date',
        'published_at',
        'thumbnail_url',
        'views_count',
        'shares_count',
        'seo_metadata',
        'ai_summary',
    ];

    protected $casts = [
        'seo_metadata' => 'array',
        'published_at' => 'datetime',
        'publication_date' => 'date',
    ];

    public function authors()
    {
        return $this->belongsToMany(User::class, 'publication_author');
    }

    public function types()
    {
        return $this->belongsToMany(PublicationType::class, 'publication_publication_type');
    }

    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    public function mediaAssets()
    {
        return $this->belongsToMany(MediaAsset::class, 'media_asset_publication');
    }

    public function analytics()
    {
        return $this->hasMany(AnalyticsEvent::class);
    }
}
