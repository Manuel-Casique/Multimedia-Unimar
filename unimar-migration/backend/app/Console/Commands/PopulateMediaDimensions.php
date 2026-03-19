<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use App\Models\MediaAsset;
use FFMpeg\FFMpeg;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class PopulateMediaDimensions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:populate-dimensions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Populate width and height for existing media assets';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $assets = MediaAsset::whereNull('width')
            ->orWhereNull('height')
            ->orWhereNull('thumbnail_path')
            ->get();
            
        $this->info("Found {$assets->count()} assets missing dimensions or thumbnails.");

        $ffmpeg = null;
        try {
            $ffmpeg = FFMpeg::create([
                'ffmpeg.binaries'  => 'C:/ffmpeg/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe',
                'ffprobe.binaries' => 'C:/ffmpeg/ffmpeg-master-latest-win64-gpl/bin/ffprobe.exe',
                'timeout'          => 3600,
            ]);
        } catch (\Exception $e) {
            $this->warn("FFMpeg could not be initialized. Video dimensions will be skipped.");
        }

        $bar = $this->output->createProgressBar(count($assets));
        $bar->start();

        foreach ($assets as $asset) {
            $path = storage_path('app/' . $asset->file_path);
            if (!file_exists($path)) {
                $path = storage_path('app/public/' . str_replace('public/', '', $asset->file_path));
            }

            if (!file_exists($path)) {
                $bar->advance();
                continue;
            }

            $width = null;
            $height = null;

            if (str_starts_with($asset->mime_type, 'image/')) {
                $size = @getimagesize($path);
                if ($size) {
                    $width = $size[0];
                    $height = $size[1];
                }
                
                // Generar miniatura si no tiene
                if (!$asset->thumbnail_path) {
                    try {
                        $manager = new ImageManager(new Driver());
                        $image = $manager->read($path);
                        $image->scaleDown(width: 400);
                        
                        // Si no tiene uuid (archivos viejísimos), generamos uno
                        $uuid = Str::uuid();
                        $thumbnailFilename = "{$uuid}.jpg";
                        $thumbnailRelativePath = "media/thumbnails/{$thumbnailFilename}";
                        $thumbnailAbsolutePath = storage_path("app/public/{$thumbnailRelativePath}");
                        
                        if (!file_exists(dirname($thumbnailAbsolutePath))) {
                            mkdir(dirname($thumbnailAbsolutePath), 0755, true);
                        }
                        
                        $image->save($thumbnailAbsolutePath, 60);
                        $asset->thumbnail_path = $thumbnailRelativePath;
                    } catch (\Exception $e) {
                         $this->warn("Could not generate thumbnail for: {$asset->title}: " . $e->getMessage());
                    }
                }

            } elseif (str_starts_with($asset->mime_type, 'video/') && $ffmpeg) {
                try {
                    $video = $ffmpeg->open($path);
                    $dimension = $video->getStreams()->videos()->first()->getDimensions();
                    if ($dimension) {
                        $width = $dimension->getWidth();
                        $height = $dimension->getHeight();
                    }
                } catch (\Exception $e) {
                    // Skip
                }
            }

            if ($width !== null && $height !== null && (!$asset->width || !$asset->height)) {
                $asset->width = $width;
                $asset->height = $height;
            }
            // Always save to persist either dims or thumbnail_path
            $asset->save();

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Dimensions populated successfully.');
    }
}
