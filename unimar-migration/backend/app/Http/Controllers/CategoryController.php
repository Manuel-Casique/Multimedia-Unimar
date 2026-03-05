<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::withCount('tags')->orderBy('name')->get();
        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        $slug = Str::slug($validated['name'], '-');

        if (Category::where('slug', $slug)->exists()) {
            $existing = Category::where('slug', $slug)->first();
            return response()->json([
                'error'   => 'Ya existe una categoría con ese nombre.',
                'message' => "La categoría \"{$existing->name}\" ya existe.",
            ], 422);
        }

        $category = Category::create([
            'name'        => trim($validated['name']),
            'slug'        => $slug,
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json($category->loadCount('tags'), 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        if (isset($validated['name'])) {
            $newSlug = Str::slug($validated['name'], '-');
            if (Category::where('slug', $newSlug)->where('id', '!=', $id)->exists()) {
                return response()->json(['error' => 'Ya existe una categoría con ese nombre.'], 422);
            }
            $category->name = trim($validated['name']);
            $category->slug = $newSlug;
        }

        if (array_key_exists('description', $validated)) {
            $category->description = $validated['description'];
        }

        $category->save();

        return response()->json($category->loadCount('tags'));
    }

    public function destroy($id): JsonResponse
    {
        $category = Category::withCount('tags')->findOrFail($id);

        if ($category->tags_count > 0) {
            return response()->json([
                'error'   => 'La categoría tiene tags asociados.',
                'message' => "Esta categoría tiene {$category->tags_count} tag(s). Reasígnalos antes de eliminarla.",
            ], 409);
        }

        $category->delete();
        return response()->json(['message' => 'Categoría eliminada correctamente.']);
    }
}
