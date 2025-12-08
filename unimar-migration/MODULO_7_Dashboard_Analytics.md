# MÓDULO 7: Dashboard y Analytics

## 🎯 Objetivo

Crear dashboard con estadísticas y métricas de publicaciones.

---

## 📋 Tareas Backend

### **7.1 AnalyticsService**

- [ ] Crear `app/Services/AnalyticsService.php`:

  ```php
  <?php

  namespace App\Services;

  use App\Models\Publication;
  use App\Models\AnalyticsEvent;
  use Carbon\Carbon;
  use Illuminate\Support\Facades\DB;

  class AnalyticsService
  {
      /**
       * Registrar evento
       */
      public function trackEvent(
          string $eventType,
          ?Publication $publication = null,
          array $metadata = []
      ): void {
          AnalyticsEvent::create([
              'publication_id' => $publication?->id,
              'event_type' => $eventType,
              'user_agent' => request()->userAgent(),
              'ip_address' => request()->ip(),
              'referrer' => request()->header('referer'),
              'metadata' => $metadata,
          ]);

          // Incrementar contador en publicación
          if ($publication && $eventType === 'view') {
              $publication->increment('views_count');
          }
      }

      /**
       * Resumen general
       */
      public function getOverview(Carbon $startDate, Carbon $endDate): array
      {
          return [
              'total_views' => $this->getTotalViews($startDate, $endDate),
              'total_publications' => Publication::published()->count(),
              'total_shares' => $this->getTotalShares($startDate, $endDate),
              'avg_time_spent' => $this->getAverageTimeSpent($startDate, $endDate),
              'views_by_day' => $this->getViewsByDay($startDate, $endDate),
              'top_publications' => $this->getTopPublications(10),
              'recent_activities' => $this->getRecentActivities(20),
          ];
      }

      /**
       * Total de vistas
       */
      private function getTotalViews(Carbon $startDate, Carbon $endDate): int
      {
          return AnalyticsEvent::where('event_type', 'view')
              ->whereBetween('created_at', [$startDate, $endDate])
              ->count();
      }

      /**
       * Total de compartidos
       */
      private function getTotalShares(Carbon $startDate, Carbon $endDate): int
      {
          return AnalyticsEvent::where('event_type', 'share')
              ->whereBetween('created_at', [$startDate, $endDate])
              ->count();
      }

      /**
       * Tiempo promedio de lectura
       */
      private function getAverageTimeSpent(Carbon $startDate, Carbon $endDate): int
      {
          return (int) AnalyticsEvent::where('event_type', 'view')
              ->whereBetween('created_at', [$startDate, $endDate])
              ->whereNotNull('time_spent')
              ->avg('time_spent');
      }

      /**
       * Vistas por día
       */
      private function getViewsByDay(Carbon $startDate, Carbon $endDate): array
      {
          $views = AnalyticsEvent::where('event_type', 'view')
              ->whereBetween('created_at', [$startDate, $endDate])
              ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
              ->groupBy('date')
              ->orderBy('date')
              ->get();

          return $views->map(fn($v) => [
              'date' => $v->date,
              'views' => $v->count,
          ])->toArray();
      }

      /**
       * Publicaciones más vistas
       */
      private function getTopPublications(int $limit = 10): array
      {
          return Publication::published()
              ->orderBy('views_count', 'desc')
              ->limit($limit)
              ->get(['id', 'title', 'slug', 'views_count', 'thumbnail_url'])
              ->toArray();
      }

      /**
       * Actividad reciente
       */
      private function getRecentActivities(int $limit = 20): array
      {
          return AnalyticsEvent::with('publication:id,title,slug')
              ->latest()
              ->limit($limit)
              ->get()
              ->map(fn($event) => [
                  'event_type' => $event->event_type,
                  'publication' => $event->publication?->title,
                  'created_at' => $event->created_at->diffForHumans(),
              ])
              ->toArray();
      }

      /**
       * Estadísticas de una publicación
       */
      public function getPublicationStats(Publication $publication): array
      {
          return [
              'total_views' => $publication->views_count,
              'total_shares' => $publication->shares_count,
              'views_by_day' => $this->getPublicationViewsByDay($publication),
              'referrers' => $this->getTopReferrers($publication),
          ];
      }

      private function getPublicationViewsByDay(Publication $publication): array
      {
          $views = AnalyticsEvent::where('publication_id', $publication->id)
              ->where('event_type', 'view')
              ->where('created_at', '>=', now()->subDays(30))
              ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
              ->groupBy('date')
              ->orderBy('date')
              ->get();

          return $views->map(fn($v) => [
              'date' => $v->date,
              'views' => $v->count,
          ])->toArray();
      }

      private function getTopReferrers(Publication $publication): array
      {
          return AnalyticsEvent::where('publication_id', $publication->id)
              ->where('event_type', 'view')
              ->whereNotNull('referrer')
              ->select('referrer', DB::raw('COUNT(*) as count'))
              ->groupBy('referrer')
              ->orderBy('count', 'desc')
              ->limit(5)
              ->get()
              ->toArray();
      }
  }
  ```

---

### **7.2 AnalyticsController**

- [ ] Crear `app/Http/Controllers/AnalyticsController.php`:

  ```php
  <?php

  namespace App\Http\Controllers;

  use App\Services\AnalyticsService;
  use App\Models\Publication;
  use Illuminate\Http\Request;
  use Carbon\Carbon;

  class AnalyticsController extends Controller
  {
      protected $analytics;

      public function __construct(AnalyticsService $analytics)
      {
          $this->analytics = $analytics;
      }

      /**
       * Resumen general
       * GET /api/analytics/overview
       */
      public function overview(Request $request)
      {
          $startDate = $request->input('start_date')
              ? Carbon::parse($request->input('start_date'))
              : now()->subDays(30);

          $endDate = $request->input('end_date')
              ? Carbon::parse($request->input('end_date'))
              : now();

          $data = $this->analytics->getOverview($startDate, $endDate);

          return response()->json($data);
      }

      /**
       * Estadísticas de publicación
       * GET /api/analytics/publications/{id}
       */
      public function publicationStats(int $id)
      {
          $publication = Publication::findOrFail($id);
          $stats = $this->analytics->getPublicationStats($publication);

          return response()->json($stats);
      }

      /**
       * Registrar vista (público)
       * POST /api/publications/{slug}/track-view
       */
      public function trackView(string $slug)
      {
          $publication = Publication::where('slug', $slug)->firstOrFail();

          $this->analytics->trackEvent('view', $publication);

          return response()->json(['message' => 'Vista registrada']);
      }
  }
  ```

---

## 📋 Tareas Frontend

### **7.3 Página de Dashboard**

- [ ] Crear `app/(admin)/dashboard/page.tsx`:

  ```typescript
  "use client";

  import { useQuery } from "@tanstack/react-query";
  import { api } from "@/lib/api";
  import StatCard from "@/components/dashboard/StatCard";
  import ViewsChart from "@/components/dashboard/ViewsChart";
  import TopPublicationsTable from "@/components/dashboard/TopPublicationsTable";
  import { Eye, FileText, Share2, Clock } from "lucide-react";

  export default function DashboardPage() {
    const { data: stats, isLoading } = useQuery({
      queryKey: ["analytics", "overview"],
      queryFn: async () => {
        const response = await api.get("/analytics/overview");
        return response.data;
      },
    });

    if (isLoading) {
      return <div>Cargando...</div>;
    }

    return (
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Vistas"
            value={stats.total_views}
            icon={Eye}
            color="blue"
          />
          <StatCard
            title="Publicaciones"
            value={stats.total_publications}
            icon={FileText}
            color="purple"
          />
          <StatCard
            title="Compartidos"
            value={stats.total_shares}
            icon={Share2}
            color="green"
          />
          <StatCard
            title="Tiempo Promedio"
            value={`${Math.floor(stats.avg_time_spent / 60)}m`}
            icon={Clock}
            color="orange"
          />
        </div>

        {/* Gráfico de vistas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Vistas por Día</h2>
          <ViewsChart data={stats.views_by_day} />
        </div>

        {/* Top publicaciones */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Publicaciones Más Vistas
          </h2>
          <TopPublicationsTable publications={stats.top_publications} />
        </div>
      </div>
    );
  }
  ```

---

### **7.4 Componentes de Dashboard**

- [ ] Crear `components/dashboard/StatCard.tsx`:

  ```typescript
  import { LucideIcon } from "lucide-react";

  interface StatCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    color: "blue" | "purple" | "green" | "orange";
  }

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
  };

  export default function StatCard({
    title,
    value,
    icon: Icon,
    color,
  }: StatCardProps) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] Crear `components/dashboard/ViewsChart.tsx`:

  ```typescript
  "use client";

  import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from "recharts";

  interface ViewsChartProps {
    data: Array<{ date: string; views: number }>;
  }

  export default function ViewsChart({ data }: ViewsChartProps) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: "#8b5cf6" }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }
  ```

- [ ] Crear `components/dashboard/TopPublicationsTable.tsx`:

  ```typescript
  interface Publication {
    id: number;
    title: string;
    slug: string;
    views_count: number;
    thumbnail_url: string;
  }

  export default function TopPublicationsTable({
    publications,
  }: {
    publications: Publication[];
  }) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Publicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Vistas
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {publications.map((pub) => (
              <tr key={pub.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={pub.thumbnail_url}
                      alt={pub.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <span className="font-medium text-gray-900">
                      {pub.title}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {pub.views_count.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  ```

---

## ✅ Checklist de Finalización

- [ ] AnalyticsService completo
- [ ] Dashboard con KPIs
- [ ] Gráficos con Recharts
- [ ] Tabla de top publicaciones
- [ ] Tracking de vistas funcionando

---

## ⏱️ Tiempo Estimado

**4-6 días**
