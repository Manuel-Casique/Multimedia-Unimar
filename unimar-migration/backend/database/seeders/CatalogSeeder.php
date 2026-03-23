<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // ─── Ubicaciones (predefined_locations) ──────────────────────
        $locations = [
            'Aula 16',
            'Sala de Conferencias',
            'Sala de Conferencias II',
            'Aula Magna',
            'Aula Abierta',
            'INNOVAR',
            'Cancha',
            'Entrada Principal',
        ];

        foreach ($locations as $name) {
            DB::table('predefined_locations')->updateOrInsert(
                ['name' => $name],
                ['name' => $name, 'created_at' => $now, 'updated_at' => $now]
            );
        }

        // ─── Categorías ──────────────────────────────────────────────
        $categories = [
            ['name' => 'Acto de Grado', 'description' => 'Ceremonias de graduación y actos académicos'],
            ['name' => 'Eventos',        'description' => 'Eventos institucionales y universitarios'],
            ['name' => 'Noticias',       'description' => 'Noticias y comunicados oficiales de UNIMAR'],
        ];

        foreach ($categories as $cat) {
            DB::table('categories')->updateOrInsert(
                ['name' => $cat['name']],
                [
                    'name'        => $cat['name'],
                    'slug'        => Str::slug($cat['name']),
                    'description' => $cat['description'],
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ]
            );
        }

        // ─── Tags ─────────────────────────────────────────────────────
        $tags = [
            'Graduación 2025 I',
            'Graduación 2025 II',
            'Masterclass',
            'Conferencia',
            'Taller',
            'Deporte',
            'Cultura',
            'Investigación',
            'Estudiantes',
            'Charla',
            'Foro',
        ];

        foreach ($tags as $tag) {
            DB::table('tags')->updateOrInsert(
                ['name' => $tag],
                [
                    'name'       => $tag,
                    'slug'       => Str::slug($tag),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        // ─── Autores ──────────────────────────────────────────────────
        $authors = [
            'Flavio Rosales',
            'Yemnel Torcat',
            'César Requena',
        ];

        foreach ($authors as $author) {
            DB::table('authors')->updateOrInsert(
                ['name' => $author],
                ['name' => $author, 'created_at' => $now, 'updated_at' => $now]
            );
        }
    }
}
