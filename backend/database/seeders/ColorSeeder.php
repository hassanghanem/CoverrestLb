<?php

namespace Database\Seeders;

use App\Models\Color;
use App\Models\ColorSeason;
use Illuminate\Database\Seeder;

class ColorSeeder extends Seeder
{
    public function run(): void
    {
        $colors = [
            ['name' => ['en' => 'Red',       'ar' => 'أحمر'],      'code' => '#FF0000'],
            ['name' => ['en' => 'Green',     'ar' => 'أخضر'],      'code' => '#00FF00'],
            ['name' => ['en' => 'Blue',      'ar' => 'أزرق'],      'code' => '#0000FF'],
            ['name' => ['en' => 'Orange',    'ar' => 'برتقالي'],    'code' => '#FFA500'],
            ['name' => ['en' => 'Black',     'ar' => 'أسود'],      'code' => '#000000'],
            ['name' => ['en' => 'White',     'ar' => 'أبيض'],      'code' => '#FFFFFF'],
            ['name' => ['en' => 'Purple',    'ar' => 'أرجواني'],   'code' => '#800080'],
            ['name' => ['en' => 'Yellow',    'ar' => 'أصفر'],      'code' => '#FFFF00'],
            ['name' => ['en' => 'Brown',     'ar' => 'بني'],       'code' => '#A52A2A'],
            ['name' => ['en' => 'Pink',      'ar' => 'زهري'],      'code' => '#FFC0CB'],
            ['name' => ['en' => 'Gray',      'ar' => 'رمادي'],     'code' => '#808080'],
            ['name' => ['en' => 'Cyan',      'ar' => 'سماوي'],     'code' => '#00FFFF'],
            ['name' => ['en' => 'Magenta',   'ar' => 'أرجواني فاتح'], 'code' => '#FF00FF'],
            ['name' => ['en' => 'Lime',      'ar' => 'ليموني'],    'code' => '#00FF00'],
            ['name' => ['en' => 'Navy',      'ar' => 'كحلي'],      'code' => '#000080'],
            ['name' => ['en' => 'Olive',     'ar' => 'زيتي'],      'code' => '#808000'],
            ['name' => ['en' => 'Teal',      'ar' => 'أخضر مزرق'], 'code' => '#008080'],
            ['name' => ['en' => 'Maroon',    'ar' => 'كستنائي'],   'code' => '#800000'],
            ['name' => ['en' => 'Silver',    'ar' => 'فضي'],       'code' => '#C0C0C0'],
            ['name' => ['en' => 'Gold',      'ar' => 'ذهبي'],      'code' => '#FFD700'],
            ['name' => ['en' => 'Coral',     'ar' => 'مرجاني'],    'code' => '#FF7F50'],
            ['name' => ['en' => 'Turquoise', 'ar' => 'فيروزي'],    'code' => '#40E0D0'],
            ['name' => ['en' => 'Beige',     'ar' => 'بيج'],       'code' => '#F5F5DC'],
            ['name' => ['en' => 'Indigo',    'ar' => 'نيلي'],      'code' => '#4B0082'],
        ];


        foreach ($colors as $color) {
            Color::create([
                'name' => $color['name'],
                'code' => $color['code'],
            ]);
        }
    }
}
