<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('publication_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publication_id')
                  ->constrained('publications')
                  ->onDelete('cascade');

            $table->string('type'); // text, image, video, embed, divider
            $table->json('content'); // Contenido flexible según tipo
            $table->integer('order')->default(0);
            $table->timestamps();

            // Índices
            $table->index(['publication_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('publication_blocks');
    }
};
