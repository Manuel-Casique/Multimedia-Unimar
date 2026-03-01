<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestGeminiTags extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:gemini-tags {media_id?}';
    protected $description = 'Prueba el etiquetado automático de Gemini para un Media Asset';

    public function handle(\App\Services\GeminiService $gemini)
    {
        $mediaId = $this->argument('media_id');
        
        if ($mediaId) {
            $media = \App\Models\MediaAsset::find($mediaId);
        } else {
            $media = \App\Models\MediaAsset::first();
        }

        if (!$media) {
            $this->error('No se encontró ningún MediaAsset para probar.');
            return;
        }

        $this->info("Probando con MediaAsset ID: {$media->id} - {$media->title}");
        $this->line("Consultando a Gemini...");

        $imagePath = storage_path('app/public/' . str_replace('public/', '', $media->file_path));
        
        if (!file_exists($imagePath)) {
            $this->warn("El archivo de imagen no existe físicamente en: {$imagePath}");
            $imagePath = null;
        }

        $tags = $gemini->generateTagsForMedia(
            title: $media->title ?? '',
            imagePath: $imagePath,
            mimeType: $media->mime_type ?? 'image/jpeg',
            description: $media->description ?? '',
            category: $media->category ?? ''
        );

        if (empty($tags)) {
            $this->warn('Gemini no devolvió etiquetas.');
            return;
        }

        $this->info('Etiquetas sugeridas: ' . implode(', ', $tags));

        // Sincronizar etiquetas polimórficas
        $tagIds = [];
        foreach ($tags as $tagName) {
            $slug = \Illuminate\Support\Str::slug($tagName);
            $tagModel = \App\Models\Tag::firstOrCreate(
                ['slug' => $slug],
                ['name' => ucfirst($tagName)]
            );
            $tagIds[] = $tagModel->id;
        }

        $media->tags()->sync($tagIds);

        $this->info('¡Etiquetas guardadas y sincronizadas exitosamente en la Base de Datos!');
        
        // Mostrar tags actuales cargando la relación
        $media->load('tags');
        $this->table(
            ['ID', 'Nombre', 'Slug'],
            $media->tags->map(fn($t) => [$t->id, $t->name, $t->slug])->toArray()
        );
    }
}
