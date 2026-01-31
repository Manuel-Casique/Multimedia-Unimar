<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use App\Models\PublicationType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class PublicationController extends Controller
{
    /**
     * Listar publicaciones públicas (publicadas)
     */
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

    /**
     * Listar publicaciones del usuario autenticado
     */
    public function myPublications(Request $request): JsonResponse
    {
        $publications = Publication::where('user_id', $request->user()->id)
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($publications);
    }

    /**
     * Ver una publicación por slug
     */
    public function show(string $slug): JsonResponse
    {
        $publication = Publication::where('slug', $slug)
            ->where('status', 'published')
            ->with(['blocks', 'authors', 'types'])
            ->firstOrFail();

        return response()->json($publication);
    }

    /**
     * Ver una publicación por ID (para edición)
     */
    public function showById(Request $request, int $id): JsonResponse
    {
        $publication = Publication::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json($publication);
    }

    /**
     * Obtener tipos de publicación
     */
    public function types(): JsonResponse
    {
        return response()->json(PublicationType::all());
    }

    /**
     * Crear nueva publicación
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'publication_date' => 'nullable|date',
            'thumbnail_url' => 'nullable|string',
            'status' => 'nullable|in:draft,published,archived',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = $validated['status'] ?? 'draft';
        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);
        $validated['publication_date'] = $validated['publication_date'] ?? now()->toDateString();

        $publication = Publication::create($validated);
        
        // Asignar autor
        $publication->authors()->attach($request->user()->id);

        return response()->json($publication, 201);
    }

    /**
     * Actualizar publicación
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $publication = Publication::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'content' => 'sometimes|nullable|string',
            'status' => 'sometimes|in:draft,published,archived',
            'publication_date' => 'sometimes|nullable|date',
            'thumbnail_url' => 'sometimes|nullable|string',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $publication->title) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);
        }

        if (isset($validated['status']) && $validated['status'] === 'published' && !$publication->published_at) {
            $validated['published_at'] = now();
        }

        $publication->update($validated);

        return response()->json($publication);
    }

    /**
     * Eliminar publicación
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $publication = Publication::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $publication->delete();

        return response()->json(['message' => 'Publicación eliminada']);
    }

    /**
     * Track view
     */
    public function trackView(string $slug): JsonResponse
    {
        $publication = Publication::where('slug', $slug)->firstOrFail();
        $publication->increment('views_count');
        
        return response()->json(['success' => true]);
    }
}
