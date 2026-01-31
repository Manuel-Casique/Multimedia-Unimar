<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Dominio permitido para autenticación
     */
    private const ALLOWED_DOMAIN = 'unimar.edu.ve';

    /**
     * Login con email y contraseña
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:5',
        ]);

        // Validar dominio institucional
        $email = $request->email;
        $domain = substr(strrchr($email, "@"), 1);

        if ($domain !== self::ALLOWED_DOMAIN) {
            return response()->json([
                'message' => 'Solo cuentas institucionales @unimar.edu.ve pueden acceder.'
            ], 403);
        }

        // Buscar usuario
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales incorrectas.'
            ], 401);
        }

        // Generar token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login exitoso',
            'token' => $token,
            'user' => $user,
        ]);
    }

    /**
     * Registrar nuevo usuario
     */
    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:5|confirmed',
        ]);

        // Validar dominio institucional
        $email = $request->email;
        $domain = substr(strrchr($email, "@"), 1);

        if ($domain !== self::ALLOWED_DOMAIN) {
            return response()->json([
                'message' => 'Solo cuentas institucionales @unimar.edu.ve pueden registrarse.'
            ], 403);
        }

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registro exitoso',
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    /**
     * Cerrar sesión - revoca todos los tokens
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    /**
     * Obtener usuario autenticado
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }
}
