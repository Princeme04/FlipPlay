<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Media;
use Illuminate\Support\Facades\File;

class MediaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $json = preg_replace('/^\xEF\xBB\xBF/', '', File::get(database_path('seeders/books-catalog.json')));
        $catalog = json_decode($json, true, flags: JSON_THROW_ON_ERROR);

        foreach ($catalog as $item) {
            Media::updateOrCreate(['title' => $item['title']], $item);
        }
    }
}
