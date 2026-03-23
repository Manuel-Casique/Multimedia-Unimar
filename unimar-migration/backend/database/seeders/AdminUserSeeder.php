<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Nos aseguramos que todos los roles existan
        $adminRole   = Role::firstOrCreate(['name' => 'admin'],   ['description' => 'Administrador del sistema']);
        $editorRole  = Role::firstOrCreate(['name' => 'editor'],  ['description' => 'Editor de contenido']);
        $usuarioRole = Role::firstOrCreate(['name' => 'usuario'], ['description' => 'Usuario estándar de la plataforma']);

        // ─── Administrador ───────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'admin@unimar.edu.ve'],
            [
                'first_name'        => 'Admin',
                'last_name'         => 'UNIMAR',
                'password'          => Hash::make('admin123'),
                'email_verified_at' => now(),
                'role_id'           => $adminRole->id,
            ]
        );

        // ─── Editor ───────────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'editor@unimar.edu.ve'],
            [
                'first_name'        => 'Editor',
                'last_name'         => 'UNIMAR',
                'password'          => Hash::make('editor123'),
                'email_verified_at' => now(),
                'role_id'           => $editorRole->id,
            ]
        );

        // ─── Usuario común ────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'usuario@unimar.edu.ve'],
            [
                'first_name'        => 'Usuario',
                'last_name'         => 'UNIMAR',
                'password'          => Hash::make('usuario123'),
                'email_verified_at' => now(),
                'role_id'           => $usuarioRole->id,
            ]
        );
    }
}
