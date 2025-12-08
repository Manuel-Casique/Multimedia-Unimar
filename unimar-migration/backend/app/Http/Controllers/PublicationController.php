<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PublicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Publication::where('status', 'published')
            ->orderBy('publication_date', 'desc');

        if ($request->has('type')) {
            $query->whereHas('types', function ($q) use ($request) {
                $q->where('slug', $request->type);
            });
        }

        return response()->json($query->paginate(12));
    }

    public function show(string $slug): JsonResponse
    {
        $publication = Publication::where('slug', $slug)
            ->where('status', 'published')
            ->with(['blocks', 'authors', 'types', 'tags'])
            ->firstOrFail();

        return response()->json($publication);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'publication_date' => 'required|date',
            'types' => 'required|array',
            'types.*' => 'exists:publication_types,id',
        ]);

        $validated['status'] = 'draft';
        $validated['slug'] = \Str::slug($validated['title']);

        $publication = Publication::create($validated);
        $publication->types()->attach($validated['types']);
        
        // Asignar autor actual (requiere autenticación)
        if ($request->user()) {
            $publication->authors()->attach($request->user()->id);
        }

        return response()->json($publication, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $publication = Publication::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'status' => 'sometimes|in:draft,published,archived',
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = \Str::slug($validated['title']);
        }

        $publication->update($validated);

        return response()->json($publication);
    }

    public function destroy(int $id): JsonResponse
    {
        $publication = Publication::findOrFail($id);
        $publication->delete();

        return response()->json(['message' => 'Publicación eliminada']);
    }
}
