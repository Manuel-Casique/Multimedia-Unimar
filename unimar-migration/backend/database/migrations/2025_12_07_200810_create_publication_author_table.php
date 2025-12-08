<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('publication_author', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publication_id')
                  ->constrained('publications')
                  ->onDelete('cascade');
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            $table->timestamps();

            // Evitar duplicados
            $table->unique(['publication_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('publication_author');
    }
};
