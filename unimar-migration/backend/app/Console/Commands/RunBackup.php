<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class RunBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:unimar {--only-db : Only backup the database}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run the spatie/laravel-backup command for MMU UNIMAR';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting backup process...');
        Log::info('Backup triggered via unimar wrapper');

        try {
            if ($this->option('only-db')) {
                Artisan::call('backup:run', ['--only-db' => true]);
            } else {
                Artisan::call('backup:run');
            }

            $this->info('Backup completed successfully.');
            Log::info('Backup completed successfully.');
        } catch (\Exception $e) {
            $this->error('Backup failed: ' . $e->getMessage());
            Log::error('Backup failed: ' . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
