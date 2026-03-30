<?php

namespace App\Console\Commands;

use App\Models\MediaAsset;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class RunBackup extends Command
{
    protected $signature = 'backup:unimar {--only-db : Only backup the database}';
    protected $description = 'Run the spatie/laravel-backup command for MMU UNIMAR';

    public function handle()
    {
        $this->info('Starting backup process...');
        Log::info('Backup triggered via unimar wrapper');

        Cache::put('backup_status', 'running', now()->addMinutes(30));

        try {
            // Clean up orphaned files before backing up
            $this->cleanOrphanedFiles();

            if ($this->option('only-db')) {
                Artisan::call('backup:run', ['--only-db' => true]);
            } else {
                Artisan::call('backup:run');
            }

            Cache::put('backup_status', 'completed', now()->addMinutes(5));
            $this->info('Backup completed successfully.');
            Log::info('Backup completed successfully.');
        } catch (\Exception $e) {
            Cache::put('backup_status', 'failed', now()->addMinutes(5));
            $this->error('Backup failed: ' . $e->getMessage());
            Log::error('Backup failed: ' . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }

    /**
     * Remove physical files from storage that no longer have a record in the database.
     * This ensures backups only contain files actually present in the gallery.
     */
    private function cleanOrphanedFiles(): void
    {
        $this->info('Cleaning orphaned files...');

        $disk = Storage::disk('public');

        // Get all file paths currently referenced in the database
        $dbFilePaths = MediaAsset::pluck('file_path')->filter()->toArray();
        $dbThumbPaths = MediaAsset::pluck('thumbnail_path')->filter()->toArray();
        $knownPaths = array_merge($dbFilePaths, $dbThumbPaths);

        // Normalize paths (remove 'public/' prefix if present for comparison)
        $knownPaths = array_map(function ($path) {
            return str_replace('public/', '', $path);
        }, $knownPaths);

        // Scan the media directories on disk
        $directories = ['media', 'thumbnails'];
        $orphanCount = 0;

        foreach ($directories as $dir) {
            if (!$disk->exists($dir)) continue;

            $diskFiles = $disk->allFiles($dir);

            foreach ($diskFiles as $file) {
                // Check both with and without 'public/' prefix
                if (!in_array($file, $knownPaths) && !in_array('public/' . $file, $knownPaths)) {
                    $disk->delete($file);
                    $orphanCount++;
                }
            }
        }

        if ($orphanCount > 0) {
            $this->info("Removed {$orphanCount} orphaned file(s).");
            Log::info("Backup pre-cleanup: removed {$orphanCount} orphaned files.");
        } else {
            $this->info('No orphaned files found.');
        }
    }
}
