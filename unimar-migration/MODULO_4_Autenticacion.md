# MÓDULO 4: Autenticación y Autorización

## 🎯 Objetivo

Implementar sistema de autenticación con Laravel Sanctum y gestión de roles.

---

## 📋 Tareas Backend

### **4.1 AuthController**

- [ ] Crear `app/Http/Controllers/AuthController.php`:

  ```php
  <?php

  namespace App\Http\Controllers;

  use App\Models\User;
  use Illuminate\Http\Request;
  use Illuminate\Http\JsonResponse;
  use Illuminate\Support\Facades\Hash;
  use Illuminate\Support\Facades\Auth;
  use Illuminate\Validation\ValidationException;

  class AuthController extends Controller
  {
      /**
       * Registro de usuario
       * POST /api/register
       */
      public function register(Request $request): JsonResponse
      {
          $validated = $request->validate([
              'first_name' => 'required|string|max:100',
              'last_name' => 'required|string|max:100',
              'email' => 'required|email|unique:users,email',
              'password' => 'required|string|min:8|confirmed',
          ]);

          $user = User::create([
              'first_name' => $validated['first_name'],
              'last_name' => $validated['last_name'],
              'email' => $validated['email'],
              'password' => Hash::make($validated['password']),
              'role' => 'user', // Por defecto
          ]);

          $token = $user->createToken('auth_token')->plainTextToken;

          return response()->json([
              'user' => [
                  'id' => $user->id,
                  'first_name' => $user->first_name,
                  'last_name' => $user->last_name,
                  'email' => $user->email,
                  'role' => $user->role,
              ],
              'token' => $token,
          ], 201);
      }

      /**
       * Login
       * POST /api/login
       */
      public function login(Request $request): JsonResponse
      {
          $request->validate([
              'email' => 'required|email',
              'password' => 'required',
          ]);

          $user = User::where('email', $request->email)->first();

          if (!$user || !Hash::check($request->password, $user->password)) {
              throw ValidationException::withMessages([
                  'email' => ['Las credenciales son incorrectas.'],
              ]);
          }

          $token = $user->createToken('auth_token')->plainTextToken;

          return response()->json([
              'user' => [
                  'id' => $user->id,
                  'first_name' => $user->first_name,
                  'last_name' => $user->last_name,
                  'email' => $user->email,
                  'role' => $user->role,
              ],
              'token' => $token,
          ]);
      }

      /**
       * Logout
       * POST /api/logout
       */
      public function logout(Request $request): JsonResponse
      {
          $request->user()->currentAccessToken()->delete();

          return response()->json([
              'message' => 'Sesión cerrada correctamente',
          ]);
      }

      /**
       * Usuario actual
       * GET /api/me
       */
      public function me(Request $request): JsonResponse
      {
          return response()->json([
              'user' => $request->user(),
          ]);
      }
  }
  ```

---

### **4.2 Middleware de Roles**

- [ ] Crear `app/Http/Middleware/CheckRole.php`:

  ```php
  <?php

  namespace App\Http\Middleware;

  use Closure;
  use Illuminate\Http\Request;

  class CheckRole
  {
      public function handle(Request $request, Closure $next, ...$roles)
      {
          if (!$request->user()) {
              return response()->json(['message' => 'No autenticado'], 401);
          }

          if (!in_array($request->user()->role, $roles)) {
              return response()->json([
                  'message' => 'No tienes permisos para acceder a este recurso'
              ], 403);
          }

          return $next($request);
      }
  }
  ```

- [ ] Registrar middleware en `app/Http/Kernel.php`:
  ```php
  protected $middlewareAliases = [
      // ... otros middlewares
      'role' => \App\Http\Middleware\CheckRole::class,
  ];
  ```

---

### **4.3 Modelo User**

- [ ] Actualizar `app/Models/User.php`:

  ```php
  <?php

  namespace App\Models;

  use Illuminate\Database\Eloquent\Factories\HasFactory;
  use Illuminate\Database\Eloquent\SoftDeletes;
  use Illuminate\Foundation\Auth\User as Authenticatable;
  use Illuminate\Notifications\Notifiable;
  use Laravel\Sanctum\HasApiTokens;

  class User extends Authenticatable
  {
      use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

      protected $fillable = [
          'first_name',
          'last_name',
          'email',
          'password',
          'role',
      ];

      protected $hidden = [
          'password',
          'remember_token',
      ];

      protected $casts = [
          'email_verified_at' => 'datetime',
          'password' => 'hashed',
      ];

      // Relaciones
      public function publications()
      {
          return $this->belongsToMany(Publication::class, 'publication_author');
      }

      // Accessors
      public function getFullNameAttribute(): string
      {
          return "{$this->first_name} {$this->last_name}";
      }

      // Scopes
      public function scopeAdmins($query)
      {
          return $query->where('role', 'admin');
      }

      public function scopeEditors($query)
      {
          return $query->where('role', 'editor');
      }
  }
  ```

---

## 📋 Tareas Frontend

### **4.4 Cliente API**

- [ ] Crear `lib/api.ts`:

  ```typescript
  import axios from "axios";

  export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // Interceptor para agregar token
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Interceptor para manejar errores
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
  ```

---

### **4.5 Contexto de Autenticación**

- [ ] Crear `context/AuthContext.tsx`:

  ```typescript
  "use client";

  import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
  } from "react";
  import { api } from "@/lib/api";

  interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: "admin" | "editor" | "user";
  }

  interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (data: any) => Promise<void>;
  }

  const AuthContext = createContext<AuthContextType | undefined>(undefined);

  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
        api
          .get("/me")
          .then((res) => setUser(res.data.user))
          .catch(() => localStorage.removeItem("token"))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }, []);

    const login = async (email: string, password: string) => {
      const response = await api.post("/login", { email, password });
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
    };

    const logout = async () => {
      await api.post("/logout");
      localStorage.removeItem("token");
      setUser(null);
    };

    const register = async (data: any) => {
      const response = await api.post("/register", data);
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
    };

    return (
      <AuthContext.Provider value={{ user, loading, login, logout, register }}>
        {children}
      </AuthContext.Provider>
    );
  }

  export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
  }
  ```

---

### **4.6 Componente ProtectedRoute**

- [ ] Crear `components/ProtectedRoute.tsx`:

  ```typescript
  "use client";

  import { useAuth } from "@/context/AuthContext";
  import { useRouter } from "next/navigation";
  import { useEffect } from "react";

  interface ProtectedRouteProps {
    children: React.ReactNode;
    roles?: string[];
  }

  export default function ProtectedRoute({
    children,
    roles,
  }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push("/login");
        } else if (roles && !roles.includes(user.role)) {
          router.push("/");
        }
      }
    }, [user, loading, roles, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      );
    }

    if (!user || (roles && !roles.includes(user.role))) {
      return null;
    }

    return <>{children}</>;
  }
  ```

---

## ✅ Checklist de Finalización

- [ ] AuthController creado
- [ ] Middleware de roles funcionando
- [ ] Sanctum configurado
- [ ] AuthContext en Next.js
- [ ] ProtectedRoute funcionando
- [ ] Login/Logout testeado

---

## ⏱️ Tiempo Estimado

**2-3 días**
