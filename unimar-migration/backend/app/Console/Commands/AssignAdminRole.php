<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Role;

class AssignAdminRole extends Command
{
    protected $signature = 'app:assign-admin-role';
    protected $description = 'Asigna el rol de administrador al usuario admin@unimar.edu.ve';

    public function handle()
    {
        $user = \App\Models\User::where('email', 'admin@unimar.edu.ve')->first();
        if (!$user) {
            $this->error('Usuario no encontrado.');
            return;
        }

        $adminRole = Role::where('name', 'admin')->first();
        if (!$adminRole) {
            $this->error("Rol 'admin' no encontrado en la tabla roles. Corre los seeders primero.");
            return;
        }

        $user->update(['role_id' => $adminRole->id]);
        $this->info("Rol 'admin' asignado correctamente al usuario administrador.");
    }
}
