# MÓDULO 8: Testing, Optimización y Deploy

## 🎯 Objetivo

Implementar tests, optimizar rendimiento y preparar para producción.

---

## 📋 Testing Backend (Laravel)

### **8.1 Tests de Feature**

- [ ] Crear `tests/Feature/PublicationTest.php`:

  ```php
  <?php

  namespace Tests\Feature;

  use App\Models\User;
  use App\Models\Publication;
  use Illuminate\Foundation\Testing\RefreshDatabase;
  use Tests\TestCase;

  class PublicationTest extends TestCase
  {
      use RefreshDatabase;

      public function test_can_list_publications()
      {
          Publication::factory()->count(5)->create(['status' => 'published']);

          $response = $this->getJson('/api/publications');

          $response->assertStatus(200)
                   ->assertJsonCount(5, 'data');
      }

      public function test_admin_can_create_publication()
      {
          $admin = User::factory()->create(['role' => 'admin']);

          $response = $this->actingAs($admin, 'sanctum')
                           ->postJson('/api/publications', [
                               'title' => 'Test Publication',
                               'description' => 'Test description',
                               'publication_date' => now()->format('Y-m-d'),
                           ]);

          $response->assertStatus(201);
          $this->assertDatabaseHas('publications', [
              'title' => 'Test Publication',
          ]);
      }

      public function test_user_cannot_create_publication()
      {
          $user = User::factory()->create(['role' => 'user']);

          $response = $this->actingAs($user, 'sanctum')
                           ->postJson('/api/publications', [
                               'title' => 'Test',
                           ]);

          $response->assertStatus(403);
      }
  }
  ```

- [ ] Ejecutar tests:
  ```bash
  php artisan test
  ```

---

## 📋 Testing Frontend (Next.js)

### **8.2 Configurar Jest**

- [ ] Instalar dependencias:

  ```bash
  npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
  ```

- [ ] Crear `jest.config.js`:

  ```javascript
  const nextJest = require("next/jest");

  const createJestConfig = nextJest({
    dir: "./",
  });

  const customJestConfig = {
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    testEnvironment: "jest-environment-jsdom",
  };

  module.exports = createJestConfig(customJestConfig);
  ```

- [ ] Crear `jest.setup.js`:
  ```javascript
  import "@testing-library/jest-dom";
  ```

---

## 📋 Optimizaciones

### **8.3 Backend (Laravel)**

- [ ] Implementar caché:

  ```php
  // En PublicationController
  public function index()
  {
      $publications = Cache::remember('publications.latest', 3600, function () {
          return Publication::published()
              ->with(['authors', 'types'])
              ->latest('publication_date')
              ->paginate(10);
      });

      return PublicationResource::collection($publications);
  }
  ```

- [ ] Optimizar queries con Eager Loading:

  ```php
  Publication::with(['authors', 'types', 'blocks'])->get();
  ```

- [ ] Configurar índices en BD (ya hecho en migraciones)

---

### **8.4 Frontend (Next.js)**

- [ ] Lazy loading de componentes:

  ```typescript
  const AdminDashboard = dynamic(() => import("./Dashboard"), {
    loading: () => <p>Cargando...</p>,
  });
  ```

- [ ] Optimizar imágenes:

  ```typescript
  import Image from "next/image";

  <Image
    src={publication.thumbnail_url}
    alt={publication.title}
    width={800}
    height={600}
    loading="lazy"
  />;
  ```

---

## 📋 Deploy

### **8.5 Backend Laravel (VPS)**

- [ ] Configurar servidor (Ubuntu):

  ```bash
  # Instalar PHP, MySQL, Nginx
  sudo apt update
  sudo apt install php8.3-fpm php8.3-mysql nginx mysql-server
  ```

- [ ] Configurar Nginx:

  ```nginx
  server {
      listen 80;
      server_name api.mmu.unimar.edu.ve;
      root /var/www/mmu-backend/public;

      index index.php;

      location / {
          try_files $uri $uri/ /index.php?$query_string;
      }

      location ~ \.php$ {
          fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
          fastcgi_index index.php;
          include fastcgi_params;
      }
  }
  ```

- [ ] Configurar SSL:

  ```bash
  sudo certbot --nginx -d api.mmu.unimar.edu.ve
  ```

- [ ] Optimizar Laravel:
  ```bash
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  ```

---

### **8.6 Frontend Next.js (Vercel)**

- [ ] Conectar repositorio a Vercel

- [ ] Configurar variables de entorno en Vercel:

  ```
  NEXT_PUBLIC_API_URL=https://api.mmu.unimar.edu.ve/api
  ```

- [ ] Deploy automático desde Git

---

## ✅ Checklist de Finalización

- [ ] Tests backend con >70% cobertura
- [ ] Tests frontend básicos
- [ ] Caché implementado
- [ ] Queries optimizadas
- [ ] Laravel deployado en VPS
- [ ] Next.js deployado en Vercel
- [ ] SSL configurado
- [ ] Dominio funcionando

---

## ⏱️ Tiempo Estimado

**3-5 días**
