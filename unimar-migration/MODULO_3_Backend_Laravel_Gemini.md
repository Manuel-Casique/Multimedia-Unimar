# MÓDULO 3: Backend Laravel + Gemini API

## 🎯 Objetivo

Crear API REST completa con integración de Gemini (solo sugerencias manuales, SIN autocompletado).

---

## 📋 Tareas

### **3.1 Configuración de Gemini**

- [ ] Agregar configuración en `config/services.php`:

  ```php
  <?php

  return [
      // ... otros servicios

      'gemini' => [
          'api_key' => env('GEMINI_API_KEY'),
          'model' => env('GEMINI_MODEL', 'gemini-pro'),
          'max_tokens' => env('GEMINI_MAX_TOKENS', 2048),
      ],
  ];
  ```

- [ ] Obtener API Key de Gemini:
  - Ir a https://makersuite.google.com/app/apikey
  - Crear API key
  - Agregar a `.env`: `GEMINI_API_KEY=tu_api_key_aqui`

---

### **3.2 Servicio Gemini (SIN autocompletado)**

- [ ] Crear `app/Services/GeminiService.php`:

  ```php
  <?php

  namespace App\Services;

  use Google\GenerativeAI\Client;
  use Google\GenerativeAI\GenerateContentRequest;

  class GeminiService
  {
      protected $client;
      protected $model;

      public function __construct()
      {
          $this->client = new Client(config('services.gemini.api_key'));
          $this->model = config('services.gemini.model');
      }

      /**
       * Método base para generar texto
       */
      private function generateText(string $prompt): string
      {
          try {
              $response = $this->client->generateContent([
                  'model' => $this->model,
                  'contents' => [
                      ['parts' => [['text' => $prompt]]]
                  ],
                  'generationConfig' => [
                      'maxOutputTokens' => config('services.gemini.max_tokens'),
                      'temperature' => 0.7,
                  ],
              ]);

              return $response->text() ?? '';
          } catch (\Exception $e) {
              \Log::error('Gemini API Error: ' . $e->getMessage());
              throw new \Exception('Error al comunicarse con Gemini API');
          }
      }

      /**
       * Mejorar texto seleccionado
       * Uso: Usuario selecciona texto y hace clic en "Mejorar con IA"
       */
      public function improveText(string $text): string
      {
          $prompt = <<<PROMPT
  Mejora el siguiente texto corrigiendo gramática, ortografía y estilo.
  Mantén el significado original y el tono profesional.
  No agregues información nueva, solo mejora lo existente.

  Texto a mejorar:
  {$text}

  Responde SOLO con el texto mejorado, sin explicaciones adicionales.
  PROMPT;

          return $this->generateText($prompt);
      }

      /**
       * Generar títulos desde contenido
       * Uso: Usuario escribe contenido y hace clic en "Generar títulos con IA"
       */
      public function generateTitles(string $content): array
      {
          $prompt = <<<PROMPT
  Genera 3 títulos atractivos, profesionales y SEO-friendly para el siguiente contenido.
  Los títulos deben ser concisos (máximo 60 caracteres) y captar la atención.

  Contenido:
  {$content}

  Responde SOLO con los 3 títulos, uno por línea, sin numeración ni explicaciones.
  PROMPT;

          $response = $this->generateText($prompt);
          $titles = array_filter(array_map('trim', explode("\n", $response)));

          return array_slice($titles, 0, 3);
      }

      /**
       * Generar resumen
       * Uso: Usuario hace clic en "Generar resumen con IA"
       */
      public function generateSummary(string $content, int $maxWords = 150): string
      {
          $prompt = <<<PROMPT
  Genera un resumen profesional y conciso del siguiente contenido.
  El resumen debe tener máximo {$maxWords} palabras.
  Enfócate en los puntos clave y mantén un tono académico.

  Contenido:
  {$content}

  Responde SOLO con el resumen, sin introducción ni conclusión adicional.
  PROMPT;

          return $this->generateText($prompt);
      }

      /**
       * Optimizar SEO
       * Uso: Usuario hace clic en "Optimizar SEO con IA"
       */
      public function optimizeSEO(string $title, string $content): array
      {
          $prompt = <<<PROMPT
  Analiza el siguiente contenido y genera metadatos SEO optimizados.

  Título: {$title}
  Contenido: {$content}

  Genera:
  1. Meta title optimizado (máximo 60 caracteres)
  2. Meta description atractiva (máximo 160 caracteres)
  3. 5 keywords relevantes separadas por comas

  Responde en formato JSON exactamente así:
  {
    "meta_title": "...",
    "meta_description": "...",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
  }
  PROMPT;

          $response = $this->generateText($prompt);

          // Intentar parsear JSON
          $json = json_decode($response, true);

          if (!$json) {
              // Fallback si no es JSON válido
              return [
                  'meta_title' => substr($title, 0, 60),
                  'meta_description' => substr($content, 0, 160),
                  'keywords' => [],
              ];
          }

          return $json;
      }

      /**
       * Expandir idea
       * Uso: Usuario escribe una idea corta y hace clic en "Expandir con IA"
       */
      public function expandIdea(string $idea): string
      {
          $prompt = <<<PROMPT
  Expande la siguiente idea en un párrafo bien desarrollado (150-200 palabras).
  Mantén un tono profesional y académico.

  Idea:
  {$idea}

  Responde SOLO con el párrafo expandido.
  PROMPT;

          return $this->generateText($prompt);
      }

      /**
       * Sugerir siguiente bloque
       * Uso: Usuario hace clic en "¿Qué agregar después?" con IA
       */
      public function suggestNextBlock(array $existingBlocks): array
      {
          $context = $this->buildContextFromBlocks($existingBlocks);

          $prompt = <<<PROMPT
  Basándote en el siguiente contenido de una publicación, sugiere:
  1. Qué tipo de bloque sería apropiado agregar a continuación (texto, imagen, video)
  2. Una breve justificación (1 línea)

  Contenido actual:
  {$context}

  Responde en formato JSON:
  {
    "suggested_type": "text|image|video",
    "reason": "Breve justificación"
  }
  PROMPT;

          $response = $this->generateText($prompt);
          $json = json_decode($response, true);

          return $json ?? [
              'suggested_type' => 'text',
              'reason' => 'Continuar con más contenido textual',
          ];
      }

      /**
       * Construir contexto desde bloques
       */
      private function buildContextFromBlocks(array $blocks): string
      {
          $context = '';

          foreach ($blocks as $index => $block) {
              $num = $index + 1;
              $type = $block['type'];

              if ($type === 'text') {
                  $text = $block['content']['plain_text'] ?? '';
                  $context .= "Bloque {$num} [TEXTO]: " . substr($text, 0, 200) . "...\n";
              } elseif ($type === 'image') {
                  $caption = $block['content']['caption'] ?? 'Sin descripción';
                  $context .= "Bloque {$num} [IMAGEN]: {$caption}\n";
              } elseif ($type === 'video') {
                  $caption = $block['content']['caption'] ?? 'Sin descripción';
                  $context .= "Bloque {$num} [VIDEO]: {$caption}\n";
              }
          }

          return $context ?: 'No hay bloques aún';
      }
  }
  ```

---

### **3.3 Controlador de IA**

- [ ] Crear `app/Http/Controllers/AIController.php`:

  ```php
  <?php

  namespace App\Http\Controllers;

  use App\Services\GeminiService;
  use Illuminate\Http\Request;
  use Illuminate\Http\JsonResponse;

  class AIController extends Controller
  {
      protected $gemini;

      public function __construct(GeminiService $gemini)
      {
          $this->gemini = $gemini;
      }

      /**
       * Mejorar texto
       * POST /api/ai/improve
       */
      public function improveText(Request $request): JsonResponse
      {
          $validated = $request->validate([
              'text' => 'required|string|max:5000',
          ]);

          try {
              $improved = $this->gemini->improveText($validated['text']);

              return response()->json([
                  'improved_text' => $improved,
              ]);
          } catch (\Exception $e) {
              return response()->json([
                  'error' => 'Error al mejorar texto',
                  'message' => $e->getMessage(),
              ], 500);
          }
      }

      /**
       * Generar títulos
       * POST /api/ai/generate-titles
       */
      public function generateTitles(Request $request): JsonResponse
      {
          $validated = $request->validate([
              'content' => 'required|string|max:10000',
          ]);

          try {
              $titles = $this->gemini->generateTitles($validated['content']);

              return response()->json([
                  'titles' => $titles,
              ]);
          } catch (\Exception $e) {
              return response()->json([
                  'error' => 'Error al generar títulos',
              ], 500);
          }
      }

      /**
       * Generar resumen
       * POST /api/ai/generate-summary
       */
      public function generateSummary(Request $request): JsonResponse
      {
          $validated = $request->validate([
              'content' => 'required|string|max:10000',
              'max_words' => 'nullable|integer|min:50|max:300',
          ]);

          try {
              $summary = $this->gemini->generateSummary(
                  $validated['content'],
                  $validated['max_words'] ?? 150
              );

              return response()->json([
                  'summary' => $summary,
              ]);
          } catch (\Exception $e) {
              return response()->json([
                  'error' => 'Error al generar resumen',
              ], 500);
          }
      }

      /**
       * Optimizar SEO
       * POST /api/ai/optimize-seo
       */
      public function optimizeSEO(Request $request): JsonResponse
      {
          $validated = $request->validate([
              'title' => 'required|string|max:200',
              'content' => 'required|string|max:10000',
          ]);

          try {
              $seo = $this->gemini->optimizeSEO(
                  $validated['title'],
                  $validated['content']
              );

              return response()->json($seo);
          } catch (\Exception $e) {
              return response()->json([
                  'error' => 'Error al optimizar SEO',
              ], 500);
          }
      }

      /**
       * Expandir idea
       * POST /api/ai/expand-idea
       */
      public function expandIdea(Request $request): JsonResponse
      {
          $validated = $request->validate([
              'idea' => 'required|string|max:500',
          ]);

          try {
              $expanded = $this->gemini->expandIdea($validated['idea']);

              return response()->json([
                  'expanded_text' => $expanded,
              ]);
          } catch (\Exception $e) {
              return response()->json([
                  'error' => 'Error al expandir idea',
              ], 500);
          }
      }

      /**
       * Sugerir siguiente bloque
       * POST /api/ai/suggest-next-block
       */
      public function suggestNextBlock(Request $request): JsonResponse
      {
          $validated = $request->validate([
              'blocks' => 'required|array',
          ]);

          try {
              $suggestion = $this->gemini->suggestNextBlock($validated['blocks']);

              return response()->json($suggestion);
          } catch (\Exception $e) {
              return response()->json([
                  'error' => 'Error al sugerir bloque',
              ], 500);
          }
      }
  }
  ```

---

### **3.4 Controlador de Bloques**

- [ ] Crear `app/Http/Controllers/BlockController.php`:

  ```php
  <?php

  namespace App\Http\Controllers;

  use App\Models\Publication;
  use App\Models\PublicationBlock;
  use Illuminate\Http\Request;
  use Illuminate\Http\JsonResponse;

  class BlockController extends Controller
  {
      /**
       * Crear bloque
       * POST /api/publications/{id}/blocks
       */
      public function store(Request $request, int $publicationId): JsonResponse
      {
          $publication = Publication::findOrFail($publicationId);

          $validated = $request->validate([
              'type' => 'required|in:text,image,video,embed,divider',
              'content' => 'required|array',
              'order' => 'nullable|integer',
          ]);

          // Si no se especifica orden, ponerlo al final
          if (!isset($validated['order'])) {
              $validated['order'] = $publication->blocks()->max('order') + 1;
          }

          $block = $publication->blocks()->create($validated);

          return response()->json($block, 201);
      }

      /**
       * Actualizar bloque
       * PUT /api/blocks/{id}
       */
      public function update(Request $request, int $blockId): JsonResponse
      {
          $block = PublicationBlock::findOrFail($blockId);

          $validated = $request->validate([
              'content' => 'sometimes|array',
              'order' => 'sometimes|integer',
          ]);

          $block->update($validated);

          return response()->json($block);
      }

      /**
       * Eliminar bloque
       * DELETE /api/blocks/{id}
       */
      public function destroy(int $blockId): JsonResponse
      {
          $block = PublicationBlock::findOrFail($blockId);
          $block->delete();

          return response()->json(['message' => 'Bloque eliminado']);
      }

      /**
       * Reordenar bloques
       * POST /api/publications/{id}/blocks/reorder
       */
      public function reorder(Request $request, int $publicationId): JsonResponse
      {
          $validated = $request->validate([
              'blocks' => 'required|array',
              'blocks.*.id' => 'required|exists:publication_blocks,id',
              'blocks.*.order' => 'required|integer',
          ]);

          foreach ($validated['blocks'] as $blockData) {
              PublicationBlock::where('id', $blockData['id'])
                  ->update(['order' => $blockData['order']]);
          }

          return response()->json(['message' => 'Bloques reordenados']);
      }
  }
  ```

---

### **3.5 Rutas API**

- [ ] Configurar en `routes/api.php`:

  ```php
  <?php

  use App\Http\Controllers\AIController;
  use App\Http\Controllers\BlockController;
  use App\Http\Controllers\PublicationController;
  use App\Http\Controllers\AuthController;
  use Illuminate\Support\Facades\Route;

  // Rutas públicas
  Route::get('/publications', [PublicationController::class, 'index']);
  Route::get('/publications/{slug}', [PublicationController::class, 'show']);
  Route::get('/publication-types', [PublicationController::class, 'types']);

  // Tracking (público)
  Route::post('/publications/{slug}/track-view', [PublicationController::class, 'trackView']);

  // Autenticación
  Route::post('/register', [AuthController::class, 'register']);
  Route::post('/login', [AuthController::class, 'login']);

  // Rutas protegidas
  Route::middleware('auth:sanctum')->group(function () {
      Route::post('/logout', [AuthController::class, 'logout']);
      Route::get('/me', [AuthController::class, 'me']);

      // Publicaciones (admin/editor)
      Route::middleware('role:admin,editor')->group(function () {
          Route::post('/publications', [PublicationController::class, 'store']);
          Route::put('/publications/{id}', [PublicationController::class, 'update']);
          Route::delete('/publications/{id}', [PublicationController::class, 'destroy']);

          // Bloques
          Route::post('/publications/{id}/blocks', [BlockController::class, 'store']);
          Route::put('/blocks/{id}', [BlockController::class, 'update']);
          Route::delete('/blocks/{id}', [BlockController::class, 'destroy']);
          Route::post('/publications/{id}/blocks/reorder', [BlockController::class, 'reorder']);

          // IA
          Route::prefix('ai')->group(function () {
              Route::post('/improve', [AIController::class, 'improveText']);
              Route::post('/generate-titles', [AIController::class, 'generateTitles']);
              Route::post('/generate-summary', [AIController::class, 'generateSummary']);
              Route::post('/optimize-seo', [AIController::class, 'optimizeSEO']);
              Route::post('/expand-idea', [AIController::class, 'expandIdea']);
              Route::post('/suggest-next-block', [AIController::class, 'suggestNextBlock']);
          });
      });
  });
  ```

---

## ✅ Checklist de Finalización

- [ ] GeminiService creado (sin autocompletado)
- [ ] AIController con 6 endpoints
- [ ] BlockController con CRUD completo
- [ ] Rutas API configuradas
- [ ] Middleware de roles funcionando
- [ ] API de Gemini testeada

---

## ⏱️ Tiempo Estimado

**7-9 días**
