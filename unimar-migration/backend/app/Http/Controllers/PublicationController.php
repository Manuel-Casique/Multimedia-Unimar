<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use App\Models\PublicationType;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

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
            ->with(['authors', 'types', 'tags', 'category'])
            ->firstOrFail();

        return response()->json($publication);
    }

    /**
     * Ver una publicación por ID (para edición) — incluye tags
     */
    public function showById(Request $request, int $id): JsonResponse
    {
        $publication = Publication::where('id', $id)
            ->with(['tags', 'types', 'authors', 'category'])
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
            'category_id'      => 'nullable|exists:categories,id',
            'location'         => 'nullable|string|max:255',
            'publication_date' => 'nullable|date',
            'thumbnail_url'    => 'nullable|string',
            'status'           => 'nullable|in:draft,published,archived',
            'tags'             => 'required|array|min:1',
            'tags.*'           => 'string',
            'author_ids'       => 'sometimes|array',
            'author_ids.*'     => 'exists:authors,id',
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

        // Asignar autores
        $authorIds = isset($validated['author_ids']) && count($validated['author_ids']) > 0 
            ? $validated['author_ids'] 
            : []; // Opcional
        
        $publication->authors()->attach($authorIds);

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
            'category_id'      => 'sometimes|nullable|exists:categories,id',
            'location'         => 'sometimes|nullable|string|max:255',
            'status'           => 'sometimes|in:draft,published,archived',
            'publication_date' => 'sometimes|nullable|date',
            'thumbnail_url'    => 'sometimes|nullable|string',
            'tags'             => 'sometimes|array',
            'tags.*'           => 'string',
            'author_ids'       => 'sometimes|array',
            'author_ids.*'     => 'exists:users,id',
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

        // Sincronizar autores si se enviaron
        if (isset($validated['author_ids'])) {
            $authorIds = count($validated['author_ids']) > 0 
                ? $validated['author_ids'] 
                : []; // Opcional
            $publication->authors()->sync($authorIds);
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
     * Publication statistics
     */
    public function stats(Request $request): JsonResponse
    {
        $query = Publication::query();

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $total = (clone $query)->count();
        $totalShares = (clone $query)->sum('shares_count');

        $statusCounts = (clone $query)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $perDay = (clone $query)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->map(fn($item) => [
                'date' => Carbon::parse($item->date)->format('d/m'),
                'fullDate' => $item->date,
                'count' => $item->count,
            ]);

        $byCategory = (clone $query)
            ->join('categories', 'publications.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('count(*) as count'))
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('count')
            ->toBase()
            ->get()
            ->map(fn($item) => ['name' => $item->name, 'count' => $item->count]);

        $byAuthor = Publication::join('author_publication', 'publications.id', '=', 'author_publication.publication_id')
            ->join('authors', 'author_publication.author_id', '=', 'authors.id')
            ->select('authors.name', DB::raw('count(*) as count'))
            ->groupBy('authors.id', 'authors.name')
            ->orderByDesc('count')
            ->limit(10)
            ->toBase()
            ->get()
            ->map(fn($item) => ['name' => $item->name, 'count' => $item->count]);



        $recent = Publication::with('tags')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'status' => $p->status,
                'time_ago' => $p->created_at->diffForHumans(),
                'tags' => $p->tags->pluck('name'),
            ]);

        return response()->json([
            'total' => $total,
            'total_shares' => $totalShares,
            'status_counts' => $statusCounts,
            'per_day' => $perDay,
            'by_category' => $byCategory,
            'by_author' => $byAuthor,
            'recent' => $recent,
        ]);
    }

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
