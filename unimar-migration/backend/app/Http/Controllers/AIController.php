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
                'error'   => 'Error al mejorar texto',
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
            'content'   => 'required|string|max:10000',
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

    public function optimizeSEO(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'   => 'required|string|max:200',
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

    /**
     * Generar título y descripción para un MediaAsset ya guardado (desde su imagen en storage)
     * POST /api/ai/media/{id}/metadata
     */
    public function generateMetadataForMedia($id): JsonResponse
    {
        try {
            $media = \App\Models\MediaAsset::findOrFail($id);

            $imagePath = storage_path('app/public/' . str_replace('public/', '', $media->file_path));

            if (!file_exists($imagePath)) {
                $imagePath = null;
            }

            $metadata = $this->gemini->generateTitleAndDescription(
                title: $media->title ?? '',
                imagePath: $imagePath,
                mimeType: $media->mime_type ?? 'image/jpeg',
                description: $media->description ?? ''
            );

            return response()->json($metadata);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Error al generar metadatos con IA',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Analizar imagen en Base64 desde el frontend ANTES de subirla
     * POST /api/ai/media/analyze-base64
     * Devuelve: { title, description }  — sin tags
     */
    public function analyzeBase64(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image_base64' => 'required|string',
            'mime_type'    => 'required|string',
            'title'        => 'nullable|string|max:200',
            'description'  => 'nullable|string|max:1000',
        ]);

        try {
            $base64Data = preg_replace('#^data:image/\w+;base64,#i', '', $validated['image_base64']);
            $tempImage  = tempnam(sys_get_temp_dir(), 'gemini_img_');
            file_put_contents($tempImage, base64_decode($base64Data));

            $metadata = $this->gemini->generateTitleAndDescription(
                title: $validated['title'] ?? 'Sin título',
                imagePath: $tempImage,
                mimeType: $validated['mime_type'],
                description: $validated['description'] ?? ''
            );

            if (file_exists($tempImage)) {
                unlink($tempImage);
            }

            return response()->json($metadata);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Error al analizar imagen con IA',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
