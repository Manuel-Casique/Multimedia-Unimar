<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     * Usage in routes: ->middleware('role:admin') or ->middleware('role:editor|admin')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !$user->role) {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        if (!in_array($user->role->name, $roles)) {
            return response()->json(['message' => 'No tienes permisos suficientes para esta acción.'], 403);
        }

        return $next($request);
    }
}
