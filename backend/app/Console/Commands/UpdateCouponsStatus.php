<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Coupon;

class UpdateCouponsStatus extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'coupons:update-status';

    /**
     * The console command description.
     */
    protected $description = 'Automatically update coupon statuses based on validity and usage limits.';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        Coupon::autoUpdateCouponsStatus();
        $this->info('Coupon statuses updated successfully.');
    }
}
