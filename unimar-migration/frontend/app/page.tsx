export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-unimar-light to-white">
      {/* Header con colores UNIMAR */}
      <header className="bg-unimar-primary text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Sistema Multimedia UNIMAR</h1>
          <p className="text-unimar-light mt-2">Migración Laravel 11 + Next.js 14</p>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-12">
        {/* Tarjetas de verificación */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 - Backend */}
          <div className="card p-6">
            <div className="w-12 h-12 bg-unimar-primary rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-unimar-primary mb-2">Backend Laravel 11</h3>
            <p className="text-gray-600">
              Sanctum, Spatie Permission, Intervention Image, Gemini SDK instalados
            </p>
          </div>

          {/* Card 2 - Frontend */}
          <div className="card p-6">
            <div className="w-12 h-12 bg-unimar-accent rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-unimar-accent mb-2">Frontend Next.js 14</h3>
            <p className="text-gray-600">
              TypeScript, Tailwind, Quill.js, React Query, Recharts instalados
            </p>
          </div>

          {/* Card 3 - Identidad */}
          <div className="card p-6">
            <div className="w-12 h-12 bg-unimar-state-success rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-unimar-state-success mb-2">Identidad UNIMAR</h3>
            <p className="text-gray-600">
              Colores institucionales y fuente Montserrat aplicados
            </p>
          </div>
        </div>

        {/* Sección de colores */}
        <div className="card p-8 mb-12">
          <h2 className="text-2xl font-bold text-unimar-primary mb-6">Paleta de Colores UNIMAR</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="w-full h-24 bg-unimar-primary rounded-lg mb-2"></div>
              <p className="font-semibold">Primary</p>
              <p className="text-sm text-gray-600">#0b3d91</p>
            </div>
            <div>
              <div className="w-full h-24 bg-unimar-light rounded-lg mb-2"></div>
              <p className="font-semibold">Light</p>
              <p className="text-sm text-gray-600">#d0e0fc</p>
            </div>
            <div>
              <div className="w-full h-24 bg-unimar-accent rounded-lg mb-2"></div>
              <p className="font-semibold">Accent</p>
              <p className="text-sm text-gray-600">#336699</p>
            </div>
          </div>
        </div>

        {/* Botones de prueba */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-unimar-primary mb-6">Componentes de Prueba</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">
              Botón Primario
            </button>
            <button className="bg-unimar-accent text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors">
              Botón Accent
            </button>
            <button className="bg-unimar-state-success text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors">
              Botón Success
            </button>
          </div>
        </div>

        {/* Verificación de fuente */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Esta página usa la fuente <span className="font-bold">Montserrat</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Inspecciona cualquier elemento para verificar
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-unimar-primary text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>Universidad de Margarita - Sistema Multimedia</p>
          <p className="text-sm text-unimar-light mt-2">Módulo 1: Configuración Inicial ✅</p>
        </div>
      </footer>
    </div>
  );
}
