<?php

namespace Database\Seeders;

use App\Models\PublicationType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PublicationTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Artículo', 'description' => 'Publicación tipo artículo científico o académico'],
            ['name' => 'Evento', 'description' => 'Publicación relacionada a eventos y actividades'],
            ['name' => 'Noticia', 'description' => 'Publicación de noticias generales'],
            ['name' => 'Acto de grado', 'description' => 'Ceremonias de graduación'],
            ['name' => 'Curso extracurricular', 'description' => 'Cursos para estudiantes'],
        ];

        foreach ($types as $type) {
            PublicationType::create([
                'name' => $type['name'],
                'slug' => Str::slug($type['name']),
                'description' => $type['description'],
            ]);
        }
    }
}
