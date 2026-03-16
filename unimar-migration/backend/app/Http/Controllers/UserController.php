<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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
     * Create a new user (admin only)
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => ['required', 'email', 'unique:users,email', 'regex:/^[^@]+@unimar\.edu\.ve$/i'],
            'password'   => 'required|string|min:6',
            'role'       => 'required|string|in:admin,editor,usuario',
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
        ]);

        $user->assignRole($request->role);

        return response()->json([
            'message' => 'Usuario creado exitosamente',
            'user'    => $user->load('roles'),
        ], 201);
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

