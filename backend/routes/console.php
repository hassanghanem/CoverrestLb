<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Console\Scheduling\Schedule;
use App\Console\Commands\UpdateCouponsStatus;


Artisan::command('coupons:update-status', function () {
    $this->call(UpdateCouponsStatus::class);
})->describe('Automatically update coupon statuses based on validity and usage limits.');

tap(app(Schedule::class), function (Schedule $schedule) {

    // Clean old backups daily at 3 AM
    $schedule->command('backup:clean')
        ->dailyAt('03:00')
        ->withoutOverlapping()
        ->onOneServer()
        ->description('Clean old backups daily at 3 AM');

    // Optional: Keep monitoring backups health
    $schedule->command('backup:monitor')
        ->dailyAt('08:00')
        ->withoutOverlapping()
        ->onOneServer()
        ->description('Monitor backup health daily at 8 AM');

    // Other scheduled tasks
    $schedule->command('magic-links:cleanup')
        ->everyFifteenMinutes()
        ->withoutOverlapping()
        ->description('Clean up expired or used magic links');
        
    $schedule->command('backup:run')
        ->dailyAt('02:00')
        ->withoutOverlapping()
        ->onOneServer()
        ->description('Daily full backup at 2 AM');

    $schedule->command('backup:run --only-db')
        ->dailyAt('14:00')
        ->withoutOverlapping()
        ->onOneServer()
        ->description('Daily database backup at 2 PM');

});

