<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use App\Models\PublicationType;
use App\Models\Tag;
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
            ->with(['types', 'authors', 'mediaAssets', 'tags'])
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
        $userId = $request->user()->id;
        $publications = Publication::with(['types', 'authors', 'tags'])
            ->where(function($q) use ($userId) {
                $q->whereIn('status', ['published', 'archived'])
                  ->orWhere(function($subQ) use ($userId) {
                      $subQ->where('status', 'draft')
                           ->where('created_by', $userId);
                  });
            })
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
            ->with(['blocks', 'authors', 'types', 'tags'])
            ->firstOrFail();

        return response()->json($publication);
    }

    /**
     * Ver una publicación por ID (para edición) — incluye tags
     */
    public function showById(Request $request, int $id): JsonResponse
    {
        $publication = Publication::where('id', $id)
            ->with(['tags', 'types', 'authors'])
            ->firstOrFail();

        $this->authorizePublicationAccess($request->user(), $publication);

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
     * Requiere: title (no vacío), mínimo 1 tag
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'content'          => 'nullable|string',
            'publication_date' => 'nullable|date',
            'thumbnail_url'    => 'nullable|string',
            'status'           => 'nullable|in:draft,published,archived',
            'tags'             => 'nullable|array',
            'tags.*'           => 'string',
        ]);

        // Validación: mínimo 1 tag
        if (empty($validated['tags'])) {
            return response()->json([
                'error'   => 'Se requiere al menos una etiqueta.',
                'message' => 'Selecciona al menos un tag antes de guardar.',
            ], 422);
        }

        $validated['created_by']       = $request->user()->id;
        $validated['status']           = $validated['status'] ?? 'draft';
        $validated['description']      = $validated['description'] ?? '';
        $validated['content']          = $validated['content'] ?? '';
        $validated['slug']             = Str::slug($validated['title']) . '-' . Str::random(6);
        $validated['publication_date'] = $validated['publication_date'] ?? now()->toDateString();

        $publication = Publication::create($validated);

        // Asignar autor
        $publication->authors()->attach($request->user()->id);

        // Sincronizar tags por nombre (resolviendo a IDs)
        $this->syncTagsByName($publication, $validated['tags'] ?? []);

        return response()->json($publication->load('tags'), 201);
    }

    /**
     * Actualizar publicación — sincroniza tags si se envían
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $publication = Publication::where('id', $id)->firstOrFail();
        $this->authorizePublicationAccess($request->user(), $publication);

        $validated = $request->validate([
            'title'            => 'sometimes|string|max:255',
            'description'      => 'sometimes|nullable|string',
            'content'          => 'sometimes|nullable|string',
            'status'           => 'sometimes|in:draft,published,archived',
            'publication_date' => 'sometimes|nullable|date',
            'thumbnail_url'    => 'sometimes|nullable|string',
            'tags'             => 'sometimes|array',
            'tags.*'           => 'string',
        ]);

        // Validación: si se envían tags, deben ser mínimo 1
        if (array_key_exists('tags', $validated) && empty($validated['tags'])) {
            return response()->json([
                'error'   => 'Se requiere al menos una etiqueta.',
                'message' => 'Selecciona al menos un tag antes de guardar.',
            ], 422);
        }

        if (isset($validated['title']) && $validated['title'] !== $publication->title) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);
        }

        if (isset($validated['status']) && $validated['status'] === 'published' && !$publication->published_at) {
            $validated['published_at'] = now();
        }

        // Extraer tags antes de actualizar (no es campo fillable)
        $tagsToSync = $validated['tags'] ?? null;
        unset($validated['tags']);

        $publication->update($validated);

        // Sincronizar tags si se enviaron
        if ($tagsToSync !== null) {
            $this->syncTagsByName($publication, $tagsToSync);
        }

        return response()->json($publication->load('tags'));
    }

    /**
     * Eliminar publicación
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $publication = Publication::where('id', $id)->firstOrFail();
        $this->authorizePublicationAccess($request->user(), $publication);

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

    /**
     * Helper de Autorización Privada
     */
    private function authorizePublicationAccess($user, $publication)
    {
        $isAuthor     = $publication->created_by === $user->id;
        $isDraft      = $publication->status === 'draft';
        $hasPrivileges = $user->hasAnyRole(['admin', 'editor']);

        if ($isDraft && !$isAuthor) {
            abort(403, 'No tienes permiso para ver o editar este borrador, solo su autor puede hacerlo.');
        }

        if (!$isAuthor && !$hasPrivileges) {
            abort(403, 'No tienes privilegios para interactuar con esta publicación.');
        }
    }

    /**
     * Sincroniza los tags de una publicación a partir de un array de nombres de tag.
     * Usa el slug normalizado para encontrar el tag correcto.
     */
    private function syncTagsByName(Publication $publication, array $tagNames): void
    {
        $tagIds = Tag::whereIn('slug', array_map(fn($name) => Str::slug($name, '-'), $tagNames))
            ->pluck('id')
            ->toArray();

        $publication->tags()->sync($tagIds);
    }
}
