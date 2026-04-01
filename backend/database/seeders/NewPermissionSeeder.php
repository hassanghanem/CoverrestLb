<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class NewPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // 🧩 Define all new report permissions php artisan db:seed --class=NewPermissionSeeder
        $reportPermissions = [
        ];

        // 🏗️ Create permissions if they don’t already exist
        foreach ($reportPermissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // 🔐 Get the Admin role (make sure it exists)
        $adminRole = Role::where('name', 'Admin')->first();

        if ($adminRole) {
            $adminRole->givePermissionTo($reportPermissions);
            $this->command->info('✅ Report permissions assigned to Admin role.');
        } else {
            $this->command->warn('⚠️ Admin role not found. Please create the Admin role first.');
        }

        // 👤 Optionally give permissions directly to admin users
        $adminUsers = User::whereHas('roles', fn($q) => $q->where('name', 'Admin'))->get();

        foreach ($adminUsers as $admin) {
            $admin->givePermissionTo($reportPermissions);
        }

        $this->command->info('✅ Report permissions assigned to Admin users.');
    }
}
