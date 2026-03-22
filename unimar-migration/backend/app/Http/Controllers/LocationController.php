<?php

namespace App\Http\Controllers;

use App\Models\PredefinedLocation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    public function index(): JsonResponse
    {
        $locations = PredefinedLocation::orderBy('name')->get();
        return response()->json($locations);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:150|unique:predefined_locations,name',
            'detail' => 'nullable|string|max:300',
        ]);

        $location = PredefinedLocation::create($validated);
        return response()->json($location, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $location = PredefinedLocation::findOrFail($id);

        $validated = $request->validate([
            'name'   => "sometimes|required|string|max:150|unique:predefined_locations,name,{$id}",
            'detail' => 'nullable|string|max:300',
        ]);

        $location->update($validated);
        return response()->json($location);
    }

    public function destroy($id): JsonResponse
    {
        PredefinedLocation::findOrFail($id)->delete();
        return response()->json(['message' => 'Ubicación eliminada correctamente.']);
    }
}
