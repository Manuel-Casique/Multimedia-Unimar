<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthorController extends Controller
{
    public function index()
    {
        $authors = \App\Models\Author::orderBy('name')->get();
        return response()->json($authors);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:authors,name'
        ]);

        $author = \App\Models\Author::create($validated);
        return response()->json($author, 201);
    }

    public function show(string $id)
    {
        $author = \App\Models\Author::findOrFail($id);
        return response()->json($author);
    }

    public function update(Request $request, string $id)
    {
        $author = \App\Models\Author::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:authors,name,' . $author->id
        ]);

        $author->update($validated);
        return response()->json($author);
    }

    public function destroy(string $id)
    {
        $author = \App\Models\Author::findOrFail($id);
        $author->delete();
        
        return response()->json(null, 204);
    }
}
