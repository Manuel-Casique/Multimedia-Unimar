<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $fillable = ['name', 'slug'];

    public function mediaAssets()
    {
        return $this->morphedByMany(MediaAsset::class, 'taggable');
    }

    public function publications()
    {
        return $this->morphedByMany(Publication::class, 'taggable');
    }
}
