<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('publications', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description'); // Descripción corta
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->date('publication_date');
            $table->timestamp('published_at')->nullable();

            // Thumbnail (miniatura principal)
            $table->string('thumbnail_url')->nullable();

            // Estadísticas
            $table->integer('views_count')->default(0);
            $table->integer('shares_count')->default(0);

            // SEO
            $table->json('seo_metadata')->nullable(); // {meta_title, meta_description, keywords[]}

            // IA
            $table->text('ai_summary')->nullable(); // Resumen generado por IA

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index('slug');
            $table->index('status');
            $table->index('publication_date');
            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('publications');
    }
};
