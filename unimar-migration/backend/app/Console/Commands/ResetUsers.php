<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ResetUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:reset-users';

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
        // Keep admin, delete others
        \App\Models\User::where('email', '!=', 'admin@unimar.edu.ve')->delete();

        $admin = \App\Models\User::where('email', 'admin@unimar.edu.ve')->first();
        if ($admin) {
            $admin->syncRoles(['admin']);
        }

        // Create Editor
        $editor = \App\Models\User::create([
            'first_name' => 'Vanessa',
            'last_name' => 'Casique',
            'email' => 'vane@unimar.edu.ve',
            'password' => \Illuminate\Support\Facades\Hash::make('vane123'),
        ]);
        $editor->assignRole('editor');

        // Create Usuario
        $user = \App\Models\User::create([
            'first_name' => 'Guillermo',
            'last_name' => 'García',
            'email' => 'Guille@unimar.edu.ve',
            'password' => \Illuminate\Support\Facades\Hash::make('Guille123'),
        ]);
        $user->assignRole('usuario');

        $this->info('Usuarios reseteados correctamente.');
    }
}
