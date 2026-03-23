<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Category;
use App\Models\Tag;
use App\Models\PredefinedLocation;

class PublicationSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::whereHas('role', function($q) { $q->where('name', 'admin'); })->first();
        if (!$admin) {
            $admin = User::first();
        }

        $categories = Category::all();
        $tags = Tag::all();
        $locations = PredefinedLocation::all();

        if ($categories->isEmpty() || $tags->isEmpty()) {
            $this->command->warn('Debes correr CatalogSeeder primero para tener categorias y tags.');
            return;
        }

        // Crear tipos de publicación si no existen
        $articleType = DB::table('publication_types')->where('slug', 'article')->first();
        if (!$articleType) {
            $typeId = DB::table('publication_types')->insertGetId([
                'name' => 'Artículo',
                'slug' => 'article',
                'description' => 'Publicación de texto estándar',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $typeId = $articleType->id;
        }

        $publications = [
            [
                'title' => 'Bienvenidos al nuevo periodo académico 2026',
                'description' => 'El rector da la bienvenida a los nuevos estudiantes de la Universidad de Margarita.',
                'content' => '{"time":1710000000000,"blocks":[{"id":"1","type":"paragraph","data":{"text":"Iniciamos un nuevo ciclo lleno de expectativas y nuevas metas académicas en nuestro campus."}}],"version":"2.28.2"}',
                'status' => 'published',
                'created_at' => Carbon::now()->subDays(2),
                'published_at' => Carbon::now()->subDays(2),
            ],
            [
                'title' => 'Jornada de Inoculación y Salud en el Campus',
                'description' => 'Estudiantes de enfermería realizan jornada de salud para toda la comunidad unimarista.',
                'content' => '{"time":1710000000000,"blocks":[{"id":"2","type":"paragraph","data":{"text":"Invitamos a profesores, alumnos y personal obrero a participar en la jornada de salud gratuita."}}],"version":"2.28.2"}',
                'status' => 'published',
                'created_at' => Carbon::now()->subDays(15),
                'published_at' => Carbon::now()->subDays(14),
            ],
            [
                'title' => 'Masterclass: Inteligencia Artificial en la Educación',
                'description' => 'Descubre cómo la IA está cambiando la forma de aprender y enseñar en la actualidad.',
                'content' => '{"time":1710000000000,"blocks":[{"id":"3","type":"paragraph","data":{"text":"Un evento con invitados especiales expertos en tecnología educativa."}}],"version":"2.28.2"}',
                'status' => 'published',
                'created_at' => Carbon::now()->subMonths(2),
                'published_at' => Carbon::now()->subMonths(2)->addDays(1),
            ],
            [
                'title' => 'Acto de Grado - Promoción LV',
                'description' => 'Revive los mejores momentos de la última ceremonia de graduación.',
                'content' => '{"time":1710000000000,"blocks":[{"id":"4","type":"paragraph","data":{"text":"Felicitaciones a los nuevos profesionales egresados de nuestra casa de estudio."}}],"version":"2.28.2"}',
                'status' => 'published',
                'created_at' => Carbon::now()->subMonths(5),
                'published_at' => Carbon::now()->subMonths(5),
            ],
            [
                'title' => 'Borrador: Torneo Interuniversitario de Voleibol',
                'description' => 'Preparativos para el próximo torneo deportivo.',
                'content' => '{"time":1710000000000,"blocks":[{"id":"5","type":"paragraph","data":{"text":"Aún ajustando fechas y detalles del evento."}}],"version":"2.28.2"}',
                'status' => 'draft',
                'created_at' => Carbon::now()->subHours(5),
                'published_at' => null,
            ],
        ];

        foreach ($publications as $pubData) {
            $categoryId = $categories->random()->id;
            
            $pubId = DB::table('publications')->insertGetId([
                'title' => $pubData['title'],
                'slug' => Str::slug($pubData['title']) . '-' . Str::random(4),
                'description' => $pubData['description'],
                'content' => $pubData['content'],
                'status' => $pubData['status'],
                'category_id' => $categoryId,
                'created_by' => $admin ? $admin->id : 1,
                'published_at' => $pubData['published_at'],
                'created_at' => $pubData['created_at'],
                'updated_at' => $pubData['created_at'],
                'publication_date' => $pubData['published_at'] ? Carbon::parse($pubData['published_at'])->toDateString() : null,
                'location' => $locations->count() > 0 && rand(0, 1) === 1 ? $locations->random()->name : null,
            ]);

            // Assign the PublicationType via Pivot
            DB::table('publication_publication_type')->insert([
                'publication_id' => $pubId,
                'publication_type_id' => $typeId
            ]);

            // Assign 2 to 4 random tags
            if ($tags->count() >= 2) {
                $randomTags = $tags->random(rand(2, min(4, $tags->count())))->pluck('id');
                foreach ($randomTags as $tagName) {
                    DB::table('taggables')->insert([
                        'tag_id' => $tagName,
                        'taggable_id' => $pubId,
                        'taggable_type' => 'App\Models\Publication'
                    ]);
                }
            }
        }
    }
}
