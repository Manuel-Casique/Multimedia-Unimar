<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Crear tabla categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2. Añadir category_id a tags
        Schema::table('tags', function (Blueprint $table) {
            $table->foreignId('category_id')
                  ->nullable()
                  ->constrained('categories')
                  ->nullOnDelete()
                  ->after('slug');
        });

        // 3. Crear tabla predefined_locations
        Schema::create('predefined_locations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('detail')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('tags', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });

        Schema::dropIfExists('predefined_locations');
        Schema::dropIfExists('categories');
    }
};
