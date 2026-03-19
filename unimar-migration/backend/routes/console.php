<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Schedule::command('backup:run')->dailyAt('13:10');
Schedule::command('backup:clean')->dailyAt('01:30');
Schedule::command('backup:monitor')->dailyAt('03:00');
