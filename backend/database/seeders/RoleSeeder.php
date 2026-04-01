<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\Team;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $teams = Team::all();

        foreach ($teams as $team) {
            Role::create(['name' => 'admin', 'team_id' => $team->id]);
            Role::create(['name' => 'employee', 'team_id' => $team->id]);
        }
    }
}
