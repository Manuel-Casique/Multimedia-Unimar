<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'first_name' => 'Manuel',
            'last_name' => 'Casique',
            'email' => 'mcasique@uni.edu.ve',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Editor
        User::create([
            'first_name' => 'Gil',
            'last_name' => 'Mata',
            'email' => 'gmata@uni.edu.ve',
            'password' => Hash::make('password'),
            'role' => 'editor',
            'email_verified_at' => now(),
        ]);

        // Usuario normal
        User::create([
            'first_name' => 'Ana',
            'last_name' => 'López',
            'email' => 'ana.lopez@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'email_verified_at' => now(),
        ]);
    }
}
