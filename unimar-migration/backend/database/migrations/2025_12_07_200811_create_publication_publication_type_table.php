<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('publication_publication_type', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publication_id')
                  ->constrained('publications')
                  ->onDelete('cascade');
            $table->foreignId('publication_type_id')
                  ->constrained('publication_types')
                  ->onDelete('cascade');
            $table->timestamps();

            // Evitar duplicados
            $table->unique(['publication_id', 'publication_type_id'], 'pub_type_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('publication_publication_type');
    }
};
