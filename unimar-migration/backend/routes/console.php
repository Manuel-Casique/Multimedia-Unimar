<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Dynamic backup scheduling: reads backup_time from the settings table.
// Falls back to 03:00 if the table doesn't exist yet (fresh install).
$backupTime = '03:00';
try {
    if (class_exists(\App\Models\Setting::class)) {
        $backupTime = \App\Models\Setting::getValue('backup_time', '03:00') ?: '03:00';
    }
} catch (\Throwable $e) {
    // Table may not exist yet (first migration run). Silently fall back.
}

Schedule::command('backup:run')->dailyAt($backupTime);
Schedule::command('backup:clean')->dailyAt('01:30');
Schedule::command('backup:monitor')->dailyAt('03:00');
