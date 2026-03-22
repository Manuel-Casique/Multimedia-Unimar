<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $fillable = ['name', 'slug', 'category_id'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function mediaAssets()
    {
        return $this->morphedByMany(MediaAsset::class, 'taggable');
    }

    public function publications()
    {
        return $this->morphedByMany(Publication::class, 'taggable');
    }
}
