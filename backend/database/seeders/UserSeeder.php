<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use App\Models\Team;
use Spatie\Permission\PermissionRegistrar;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $teams = Team::all();
        $permissions = Permission::pluck('name')->toArray();

        // Main Admin
        $admin = User::create([
            'name' => 'Developer Admin',
            'email' => 'hassanghanemsoftwares@gmail.com',
            'password' => bcrypt('Hassan@123'),
        ]);

        // Second Admin
        $secondAdmin = User::create([
            'name' => 'Mohammad Jaafar',
            'email' => 'mohammadjaafar@coverrestlb.com',
            'password' => bcrypt('Mohamad@123'),
        ]);

        // Employee
        $employee = User::create([
            'name' => 'Developer Employee',
            'email' => 'hassanghanemtrade@gmail.com',
            'password' => bcrypt('Hassan@123'),
        ]);

        foreach ($teams as $team) {
            setPermissionsTeamId($team->id);

            $adminRole = Role::where('name', 'admin')->where('team_id', $team->id)->first();
            $employeeRole = Role::where('name', 'employee')->where('team_id', $team->id)->first();

            // Give full permissions to admin roles
            $adminRole->givePermissionTo($permissions);

            // Limited permissions to employee roles
            $employeeRole->givePermissionTo(['view-profile', 'view-settings', 'view-category']);

            // Assign roles
            $admin->assignRole($adminRole);
            $secondAdmin->assignRole($adminRole);
            $employee->assignRole($employeeRole);
        }
    }
}
