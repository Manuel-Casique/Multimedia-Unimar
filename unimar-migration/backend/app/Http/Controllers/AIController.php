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
