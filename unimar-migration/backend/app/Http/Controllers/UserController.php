<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * List all users
     */
    public function index()
    {
        $users = User::with('roles')->get();
        return response()->json($users);
    }

    /**
     * Change a user's role
     */
    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|string|in:admin,editor,usuario'
        ]);

        $user = User::findOrFail($id);
        
        // Sync roles (remove old, add new)
        $user->syncRoles([$request->role]);

        return response()->json([
            'message' => 'Rol actualizado correctamente',
            'user' => $user->load('roles')
        ]);
    }
}
