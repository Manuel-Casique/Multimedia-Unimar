<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class AssignAdminRole extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:assign-admin-role';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $user = \App\Models\User::where('email', 'admin@unimar.edu.ve')->first();
        if ($user) {
            $user->assignRole('admin');
            $this->info("Rol 'admin' asignado correctamente al usuario administrador.");
        } else {
            $this->error("Usuario no encontrado.");
        }
    }
}
