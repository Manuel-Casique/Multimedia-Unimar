<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PublicationTypeSeeder::class,
            UserSeeder::class,
            // PublicationSeeder::class, // Crear después
        ]);
    }
}
