'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Guardar token en el store
      setToken(token);
      // Redirigir a la página de ingesta
      router.push('/ingest');
    } else {
      // Si no hay token, redirigir a login con error
      router.push('/login?error=oauth_failed');
    }
  }, [searchParams, setToken, router]);

  return (
    <div className="min-h-screen bg-unimar-light flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-unimar-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-unimar-primary font-medium">
          Verificando autenticación...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-unimar-light flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-unimar-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
