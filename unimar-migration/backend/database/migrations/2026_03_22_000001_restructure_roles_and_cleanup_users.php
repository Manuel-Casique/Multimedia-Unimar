<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ────────────────────────────────────────────────────────────────
        // 1. Leer y guardar en memoria los roles de Spatie ANTES de borrar nada
        // ────────────────────────────────────────────────────────────────
        $spatieRoleMap = []; // [ user_id => role_name ]

        if (Schema::hasTable('model_has_roles') && Schema::hasTable('roles')) {
            $rows = DB::table('model_has_roles')
                ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                ->where('model_has_roles.model_type', 'App\\Models\\User')
                ->select('model_has_roles.model_id as user_id', 'roles.name as role_name')
                ->get();

            foreach ($rows as $row) {
                if (isset($row->role_name)) {
                    $spatieRoleMap[$row->user_id] = $row->role_name;
                }
            }
        }

        // ────────────────────────────────────────────────────────────────
        // 2. Eliminar TODAS las tablas de Spatie (incluyendo la tabla roles de Spatie)
        // Da disable a foreign key checks para poder borrar sin conflictos
        // ────────────────────────────────────────────────────────────────
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Schema::dropIfExists('model_has_permissions');
        Schema::dropIfExists('model_has_roles');
        Schema::dropIfExists('role_has_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');  // ← tabla de Spatie, la eliminamos aquí
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // ────────────────────────────────────────────────────────────────
        // 3. Crear la nueva tabla roles (nuestra, simple)
        // ────────────────────────────────────────────────────────────────
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        DB::table('roles')->insert([
            ['name' => 'admin',   'description' => 'Administrador del sistema',        'created_at' => now(), 'updated_at' => now()],
            ['name' => 'editor',  'description' => 'Editor de contenido',               'created_at' => now(), 'updated_at' => now()],
            ['name' => 'usuario', 'description' => 'Usuario estandar de la plataforma', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ────────────────────────────────────────────────────────────────
        // 4. Agregar role_id a users (nullable primero), solo si no existe ya
        // ────────────────────────────────────────────────────────────────
        if (!Schema::hasColumn('users', 'role_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unsignedBigInteger('role_id')->nullable()->after('email');
                $table->foreign('role_id')->references('id')->on('roles')->restrictOnDelete();
            });
        }

        // ────────────────────────────────────────────────────────────────
        // 5. Asignar role_id a cada usuario desde los datos de Spatie guardados
        // ────────────────────────────────────────────────────────────────
        foreach ($spatieRoleMap as $userId => $roleName) {
            $roleId = DB::table('roles')->where('name', $roleName)->value('id');
            if ($roleId) {
                DB::table('users')->where('id', $userId)->update(['role_id' => $roleId]);
            }
        }

        // Asignar 'usuario' a cualquier usuario que no tenga rol
        $defaultRoleId = DB::table('roles')->where('name', 'usuario')->value('id');
        DB::table('users')->whereNull('role_id')->update(['role_id' => $defaultRoleId]);

        // Hacer role_id NOT NULL (sin doctrine/dbal)
        DB::statement('ALTER TABLE users MODIFY COLUMN role_id BIGINT UNSIGNED NOT NULL');

        // ────────────────────────────────────────────────────────────────
        // 6. Migrar profile_photo_path → avatar y limpiar columnas basura
        // ────────────────────────────────────────────────────────────────
        if (Schema::hasColumn('users', 'profile_photo_path') && Schema::hasColumn('users', 'avatar')) {
            DB::update('UPDATE users SET avatar = profile_photo_path WHERE (avatar IS NULL OR avatar = ?) AND profile_photo_path IS NOT NULL', ['']);
        }

        Schema::table('users', function (Blueprint $table) {
            $toDrop = [];
            if (Schema::hasColumn('users', 'google_id'))          $toDrop[] = 'google_id';
            if (Schema::hasColumn('users', 'profile_photo_path')) $toDrop[] = 'profile_photo_path';
            if (Schema::hasColumn('users', 'remember_token'))     $toDrop[] = 'remember_token';

            if (!empty($toDrop)) {
                $table->dropColumn($toDrop);
            }
        });
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
            $table->string('google_id')->nullable()->unique()->after('email');
            $table->string('profile_photo_path', 2048)->nullable();
            $table->rememberToken();
        });

        Schema::dropIfExists('roles');

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
