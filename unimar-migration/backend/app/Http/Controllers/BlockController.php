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
