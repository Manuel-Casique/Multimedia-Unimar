<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Eliminar columna `role` redundante de users
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'role')) {
                $table->dropColumn('role');
            }
        });

        // 2. Limpiar tabla `media_assets` quitando `category` y `author`
        Schema::table('media_assets', function (Blueprint $table) {
            if (Schema::hasColumn('media_assets', 'category')) {
                $table->dropColumn('category');
            }
            if (Schema::hasColumn('media_assets', 'author')) {
                $table->dropColumn('author');
            }
        });

        // 3. Renombrar `user_id` a `created_by` en publicaciones
        Schema::table('publications', function (Blueprint $table) {
            if (Schema::hasColumn('publications', 'user_id') && !Schema::hasColumn('publications', 'created_by')) {
                $table->renameColumn('user_id', 'created_by');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['admin', 'editor', 'user'])->default('user');
            }
        });

        Schema::table('media_assets', function (Blueprint $table) {
            if (!Schema::hasColumn('media_assets', 'category')) {
                $table->string('category')->nullable();
            }
            if (!Schema::hasColumn('media_assets', 'author')) {
                $table->string('author')->nullable();
            }
        });

        Schema::table('publications', function (Blueprint $table) {
            if (Schema::hasColumn('publications', 'created_by')) {
                $table->renameColumn('created_by', 'user_id');
            }
        });
    }
};
