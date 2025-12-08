# MÓDULO 2: Base de Datos y Migraciones Laravel

## 🎯 Objetivo

Crear estructura de base de datos optimizada para Laravel con sistema de bloques flexibles.

---

## 📊 Diagrama de Relaciones

```
users (1) ----< (N) publication_author (N) >---- (1) publications
                                                        |
                                                        | (1)
                                                        |
                                                        v
                                                        | (N)
                                              publication_blocks

publications (N) >---- (N) publication_publication_type (N) >---- (1) publication_types

publications (1) ----< (N) analytics_events
```

---

## 📋 Migraciones en Orden

### **Migración 1: `users` (modificar existente)**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->after('id');
            $table->string('last_name')->after('first_name');
            $table->enum('role', ['admin', 'editor', 'user'])->default('user')->after('password');
            $table->softDeletes();

            // Renombrar 'name' a 'first_name' si existe
            if (Schema::hasColumn('users', 'name')) {
                $table->dropColumn('name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name', 'role']);
            $table->dropSoftDeletes();
        });
    }
};
```

**Campos:**

- `id` (PK, auto)
- `first_name` (string)
- `last_name` (string)
- `email` (string, unique)
- `password` (string, hashed)
- `role` (enum: admin, editor, user)
- `remember_token`
- `email_verified_at`
- `created_at`, `updated_at`
- `deleted_at` (soft delete)

---

### **Migración 2: `publication_types`**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('publication_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Artículo, Evento, Noticia, Acto de grado, Curso
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('publication_types');
    }
};
```

**Campos:**

- `id` (PK)
- `name` (string)
- `slug` (string, unique)
- `description` (text, nullable)
- `created_at`, `updated_at`

---

### **Migración 3: `publications`**

```php
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
```

**Campos:**

- `id` (PK)
- `title` (string)
- `slug` (string, unique)
- `description` (text) - Descripción corta
- `status` (enum: draft, published, archived)
- `publication_date` (date)
- `published_at` (timestamp, nullable)
- `thumbnail_url` (string, nullable)
- `views_count` (integer, default 0)
- `shares_count` (integer, default 0)
- `seo_metadata` (json, nullable)
- `ai_summary` (text, nullable)
- `created_at`, `updated_at`, `deleted_at`

---

### **Migración 4: `publication_blocks`** ⭐ CLAVE

```php
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
```

**Campos:**

- `id` (PK)
- `publication_id` (FK → publications)
- `type` (string: text, image, video, embed, divider)
- `content` (json) - Estructura flexible
- `order` (integer) - Orden de aparición
- `created_at`, `updated_at`

**Estructura JSON por tipo:**

```json
// type: "text"
{
  "html": "<p>Contenido con formato...</p>",
  "delta": { /* Delta de Quill.js */ },
  "plain_text": "Contenido sin formato"
}

// type: "image"
{
  "url": "/storage/uploads/image123.jpg",
  "caption": "Descripción",
  "alt": "Texto alternativo",
  "width": 1200,
  "height": 800,
  "alignment": "center"
}

// type: "video"
{
  "type": "upload",
  "url": "/storage/videos/video.mp4",
  "thumbnail": "/storage/thumbnails/thumb.jpg",
  "caption": "Descripción del video",
  "duration": 180
}

// type: "embed"
{
  "provider": "youtube",
  "url": "https://youtube.com/watch?v=...",
  "embed_code": "<iframe...></iframe>",
  "thumbnail": "https://img.youtube.com/..."
}

// type: "divider"
{
  "style": "line"
}
```

---

### **Migración 5: `publication_author` (pivot)**

```php
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
```

---

### **Migración 6: `publication_publication_type` (pivot)**

```php
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
```

---

### **Migración 7: `analytics_events`**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publication_id')
                  ->nullable()
                  ->constrained('publications')
                  ->onDelete('cascade');

            $table->string('event_type'); // view, share, download
            $table->integer('time_spent')->nullable(); // segundos
            $table->string('user_agent')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('referrer')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Índices para queries rápidas
            $table->index(['publication_id', 'event_type', 'created_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};
```

---

## 📋 Seeders

### **PublicationTypeSeeder**

```php
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
```

### **UserSeeder**

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'first_name' => 'Manuel',
            'last_name' => 'Casique',
            'email' => 'mcasique@uni.edu.ve',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Editor
        User::create([
            'first_name' => 'Gil',
            'last_name' => 'Mata',
            'email' => 'gmata@uni.edu.ve',
            'password' => Hash::make('password'),
            'role' => 'editor',
            'email_verified_at' => now(),
        ]);

        // Usuario normal
        User::create([
            'first_name' => 'Ana',
            'last_name' => 'López',
            'email' => 'ana.lopez@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'email_verified_at' => now(),
        ]);
    }
}
```

### **DatabaseSeeder**

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PublicationTypeSeeder::class,
            UserSeeder::class,
            // PublicationSeeder::class, // Crear después
        ]);
    }
}
```

---

## 🔄 Migración de Datos del Sistema Viejo

### **Comando Artisan para Importar**

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Publication;
use App\Models\PublicationBlock;
use App\Models\User;

class MigrateOldData extends Command
{
    protected $signature = 'migrate:old-data';
    protected $description = 'Migrar datos del sistema PHP antiguo';

    public function handle()
    {
        $this->info('Iniciando migración de datos...');

        // 1. Migrar usuarios (hashear contraseñas)
        $this->migrateUsers();

        // 2. Migrar publicaciones
        $this->migratePublications();

        // 3. Copiar archivos
        $this->copyFiles();

        $this->info('Migración completada!');
    }

    private function migrateUsers()
    {
        // Leer usuarios del sistema viejo
        $oldUsers = DB::connection('old_mysql')->table('usuarios')->get();

        foreach ($oldUsers as $oldUser) {
            User::create([
                'first_name' => $oldUser->nombre,
                'last_name' => $oldUser->apellido,
                'email' => $oldUser->email,
                'password' => Hash::make($oldUser->password), // Re-hashear
                'role' => $oldUser->rol,
            ]);
        }
    }

    private function migratePublications()
    {
        // Convertir publicaciones antiguas a bloques
        $oldPublications = DB::connection('old_mysql')->table('publicaciones')->get();

        foreach ($oldPublications as $old) {
            $publication = Publication::create([
                'title' => $old->titulo,
                'slug' => Str::slug($old->titulo),
                'description' => Str::limit($old->descripcion, 200),
                'status' => 'published',
                'publication_date' => $old->fecha_publicacion,
                'published_at' => $old->fecha_publicacion,
            ]);

            // Crear bloque de texto con la descripción
            PublicationBlock::create([
                'publication_id' => $publication->id,
                'type' => 'text',
                'content' => [
                    'html' => "<p>{$old->descripcion}</p>",
                    'plain_text' => $old->descripcion,
                ],
                'order' => 0,
            ]);
        }
    }

    private function copyFiles()
    {
        // Copiar archivos de Recursos/ a storage/app/public/uploads/
        $this->info('Copiando archivos...');
        // Implementar lógica de copia
    }
}
```

---

## ✅ Checklist de Finalización

- [ ] Todas las migraciones creadas
- [ ] Migraciones ejecutadas sin errores
- [ ] Seeders creados y ejecutados
- [ ] Relaciones de base de datos verificadas
- [ ] Índices creados correctamente
- [ ] Comando de migración de datos viejo funcional

---

## 🔧 Comandos

```bash
# Ejecutar migraciones
php artisan migrate

# Ejecutar seeders
php artisan db:seed

# Refrescar BD (cuidado, borra todo)
php artisan migrate:fresh --seed

# Migrar datos viejos
php artisan migrate:old-data
```

---

## ⏱️ Tiempo Estimado

**4-6 días** (incluye diseño, creación, testing y migración de datos)
