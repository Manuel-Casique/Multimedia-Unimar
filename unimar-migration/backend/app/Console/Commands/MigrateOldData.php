<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Publication;
use App\Models\PublicationBlock;
use App\Models\User;

class MigrateOldData extends Command
{
    protected $signature = 'migrate:old-data';
    protected $description = 'Migrar datos del sistema PHP antiguo';

    public function handle()
    {
        $this->info('Iniciando migración de datos...');

        // 1. Migrar usuarios (hashear contraseñas)
        $this->migrateUsers();

        // 2. Migrar publicaciones
        $this->migratePublications();

        // 3. Copiar archivos
        $this->copyFiles();

        $this->info('Migración completada!');
    }

    private function migrateUsers()
    {
        // Leer usuarios del sistema viejo
        $oldUsers = DB::connection('old_mysql')->table('usuarios')->get();

        foreach ($oldUsers as $oldUser) {
            User::create([
                'first_name' => $oldUser->nombre,
                'last_name' => $oldUser->apellido,
                'email' => $oldUser->email,
                'password' => Hash::make($oldUser->password), // Re-hashear
                'role' => $oldUser->rol,
            ]);
        }
    }

    private function migratePublications()
    {
        // Convertir publicaciones antiguas a bloques
        $oldPublications = DB::connection('old_mysql')->table('publicaciones')->get();

        foreach ($oldPublications as $old) {
            $publication = Publication::create([
                'title' => $old->titulo,
                'slug' => Str::slug($old->titulo),
                'description' => Str::limit($old->descripcion, 200),
                'status' => 'published',
                'publication_date' => $old->fecha_publicacion,
                'published_at' => $old->fecha_publicacion,
            ]);

            // Crear bloque de texto con la descripción
            PublicationBlock::create([
                'publication_id' => $publication->id,
                'type' => 'text',
                'content' => [
                    'html' => "<p>{$old->descripcion}</p>",
                    'plain_text' => $old->descripcion,
                ],
                'order' => 0,
            ]);
        }
    }

    private function copyFiles()
    {
        // Copiar archivos de Recursos/ a storage/app/public/uploads/
        $this->info('Copiando archivos...');
        // Implementar lógica de copia
    }
}
