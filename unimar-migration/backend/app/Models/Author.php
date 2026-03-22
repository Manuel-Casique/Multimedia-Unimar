<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Author extends Model
{
    protected $fillable = ['name'];

    /**
     * Get the media assets that belong to the author.
     */
    public function mediaAssets()
    {
        return $this->belongsToMany(MediaAsset::class, 'author_media_asset');
    }
}
