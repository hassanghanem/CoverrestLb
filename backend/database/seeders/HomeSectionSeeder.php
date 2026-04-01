<?php

namespace Database\Seeders;

use App\Models\HomeSection;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class HomeSectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $homesections = [
            ['type' => 'category_section', 'arrangement' => '1'],
        ];

        foreach ($homesections as $homesection) {
            HomeSection::create($homesection);
        }
    }
}
