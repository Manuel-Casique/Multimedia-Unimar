<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class TagController extends Controller
{
    /**
     * GET /api/tags
     * Lista todos los tags. Soporta búsqueda por nombre y filtro por categoría.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tag::with('category')->orderBy('name');

        // Búsqueda por nombre
        if ($request->filled('q')) {
            $query->where('name', 'like', '%' . $request->q . '%');
        }

        // Filtro por categoría
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $tags = $query->get()->map(fn($tag) => [
            'id'            => $tag->id,
            'name'          => $tag->name,
            'slug'          => $tag->slug,
            'category_id'   => $tag->category_id,
            'category_name' => $tag->category?->name,
        ]);

        return response()->json($tags);
    }

    /**
     * POST /api/tags  (solo admin)
     * Crea un tag nuevo. Valida unicidad por slug para evitar duplicados tipo "UNIMAR" / "unimar".
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'category_id' => 'required|exists:categories,id',
        ]);

        // Generar slug normalizado (minúsculas, sin tildes, sin espacios extra)
        $slug = $this->generateSlug($validated['name']);

        // Verificar duplicado por slug
        if (Tag::where('slug', $slug)->exists()) {
            $existing = Tag::where('slug', $slug)->first();
            return response()->json([
                'error'   => 'Ya existe un tag con ese nombre.',
                'message' => "El tag \"{$existing->name}\" ya existe (slug: {$slug}).",
            ], 422);
        }

        $tag = Tag::create([
            'name'        => trim($validated['name']),
            'slug'        => $slug,
            'category_id' => $validated['category_id'],
        ]);

        return response()->json([
            'id'            => $tag->id,
            'name'          => $tag->name,
            'slug'          => $tag->slug,
            'category_id'   => $tag->category_id,
            'category_name' => $tag->category?->name,
        ], 201);
    }

    /**
     * PUT /api/tags/{id}  (solo admin)
     * Actualiza el nombre o categoría de un tag.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $tag = Tag::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:100',
            'category_id' => 'required|exists:categories,id',
        ]);

        if (isset($validated['name'])) {
            $newSlug = $this->generateSlug($validated['name']);

            // Verificar si el nuovo slug ya lo tiene otro tag
            if (Tag::where('slug', $newSlug)->where('id', '!=', $id)->exists()) {
                $existing = Tag::where('slug', $newSlug)->where('id', '!=', $id)->first();
                return response()->json([
                    'error'   => 'Ya existe un tag con ese nombre.',
                    'message' => "El tag \"{$existing->name}\" ya tiene ese slug ({$newSlug}).",
                ], 422);
            }

            $tag->name = trim($validated['name']);
            $tag->slug = $newSlug;
        }

        if (array_key_exists('category_id', $validated)) {
            $tag->category_id = $validated['category_id'];
        }

        $tag->save();

        return response()->json([
            'id'            => $tag->id,
            'name'          => $tag->name,
            'slug'          => $tag->slug,
            'category_id'   => $tag->category_id,
            'category_name' => $tag->category?->name,
        ]);
    }

    /**
     * DELETE /api/tags/{id}  (solo admin)
     * Elimina un tag. Si está en uso, devuelve advertencia con conteo de usos.
     */
    public function destroy($id): JsonResponse
    {
        $tag = Tag::withCount(['mediaAssets', 'publications'])->findOrFail($id);

        $totalUses = $tag->media_assets_count + $tag->publications_count;

        if ($totalUses > 0) {
            return response()->json([
                'error'   => 'El tag está en uso.',
                'message' => "Este tag está asociado a {$totalUses} elemento(s). Elimínalo de esos elementos primero.",
                'uses'    => $totalUses,
            ], 409);
        }

        $tag->delete();

        return response()->json(['message' => 'Tag eliminado correctamente.']);
    }

    /**
     * Genera un slug normalizado: minúsculas, sin tildes, guiones en lugar de espacios.
     */
    private function generateSlug(string $name): string
    {
        return Str::slug($name, '-');
    }
}
