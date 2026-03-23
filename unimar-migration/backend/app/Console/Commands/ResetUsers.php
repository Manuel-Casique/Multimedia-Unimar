<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ResetUsers extends Command
{
    protected $signature = 'app:reset-users';
    protected $description = 'Resetea los usuarios de prueba manteniendo al admin';

    public function handle()
    {
        $adminRole  = Role::where('name', 'admin')->firstOrFail();
        $editorRole = Role::where('name', 'editor')->firstOrFail();
        $userRole   = Role::where('name', 'usuario')->firstOrFail();

        // Mantener admin, eliminar el resto
        User::where('email', '!=', 'admin@unimar.edu.ve')->forceDelete();

        // Asegurar que el admin tenga su rol
        $admin = User::where('email', 'admin@unimar.edu.ve')->first();
        if ($admin) {
            $admin->update(['role_id' => $adminRole->id]);
        }

        // Crear Editor de prueba
        User::create([
            'first_name' => 'Vanessa',
            'last_name'  => 'Casique',
            'email'      => 'vane@unimar.edu.ve',
            'password'   => Hash::make('vane123'),
            'role_id'    => $editorRole->id,
        ]);

        // Crear Usuario de prueba
        User::create([
            'first_name' => 'Guillermo',
            'last_name'  => 'García',
            'email'      => 'guille@unimar.edu.ve',
            'password'   => Hash::make('Guille123'),
            'role_id'    => $userRole->id,
        ]);

        $this->info('Usuarios reseteados correctamente.');
    }
}
