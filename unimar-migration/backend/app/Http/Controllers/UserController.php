<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * List all users with their roles
     */
    public function index()
    {
        $users = User::with('role')->get();
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

        $role = Role::where('name', $request->role)->firstOrFail();

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'role_id'    => $role->id,
        ]);

        return response()->json([
            'message' => 'Usuario creado exitosamente',
            'user'    => $user->load('role'),
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

        if ($request->user()->id == $id) {
            return response()->json(['message' => 'No puedes cambiar tu propio rol por razones de seguridad.'], 403);
        }

        $user = User::findOrFail($id);
        $role = Role::where('name', $request->role)->firstOrFail();

        $user->update(['role_id' => $role->id]);

        return response()->json([
            'message' => 'Rol actualizado correctamente',
            'user' => $user->load('role')
        ]);
    }
}
