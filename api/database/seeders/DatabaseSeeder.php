<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(MediaSeeder::class);

        User::updateOrCreate(
            ['email' => 'demo@flipplay.test'],
            ['name' => 'FlipPlay Demo User', 'password' => Hash::make('password')],
        );
    }
}
