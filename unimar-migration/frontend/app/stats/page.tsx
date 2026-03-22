'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import toast from '@/lib/toast';
import { unimarLogoBase64 } from '@/lib/logoBase64';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhotoFilm, 
  faBolt, 
  faImage,
  faVideo,
  faCalendarDays,
  faFilter,
  faFilePdf,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

interface StatsData {
  total_files: number;
  total_size: number;
  total_size_formatted: string;
  type_counts: {
    image?: number;
    video?: number;
    audio?: number;
    other?: number;
  };
  timeline_data: Array<{ date: string; fullDate: string; count: number }>;
  hourly_data: Array<{ hour: string; count: number }>;
  author_distribution?: Array<{ name: string; count: number }>;
}

const COLORS = ['#30669a', '#22c55e', '#a855f7', '#f59e0b', '#ef4444'];

type PeriodType = 'mes' | 'bimestre' | 'trimestre' | 'semestre' | 'anual' | 'custom';

export default function StatsPage() {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Date filter states
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('semestre');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    } else if (_hasHydrated && isAuthenticated) {
      // Set default dates (last 6 months)
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 6);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, [isAuthenticated, _hasHydrated, router]);

  // Fetch stats when dates change
  useEffect(() => {
    if (startDate && endDate && isAuthenticated) {
      fetchStats();
    }
  }, [startDate, endDate, isAuthenticated]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats', error);
      setStats({
        total_files: 0,
        total_size: 0,
        total_size_formatted: '0 KB',
        type_counts: {},
        timeline_data: [],
        hourly_data: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
    const end = new Date();
    const start = new Date();
    
    switch (period) {
      case 'mes':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'bimestre':
        start.setMonth(start.getMonth() - 2);
        break;
      case 'trimestre':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'semestre':
        start.setMonth(start.getMonth() - 6);
        break;
      case 'anual':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        return; // custom - don't change dates
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  // ─── Format helper ──────────────────────────────────────────────────────────
  const formatDate = (d: string) => {
    if (!d) return '';
    return new Date(d + 'T12:00:00').toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // ─── Export PDF (Native Structured Document) ──────────────────────────────
  const exportPDF = async () => {
    if (!stats) return;
    setExporting(true);
    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      // Portrait A4
      const doc = new jsPDF('portrait', 'mm', 'a4');
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();

      // 1) Header helper (with UNIMAR logo)
      const drawHeaderFooter = (pageDoc: any) => {
        pageDoc.setFillColor(48, 102, 154); // UNIMAR blue
        pageDoc.rect(0, 0, W, 28, 'F');
        // Logo
        try { pageDoc.addImage(unimarLogoBase64, 'PNG', 12, 4, 20, 20); } catch (_) {}
        pageDoc.setFontSize(15);
        pageDoc.setTextColor(255, 255, 255);
        pageDoc.text('Universidad de Margarita \u2014 Alma Mater del Caribe', 36, 13);
        pageDoc.setFontSize(10);
        pageDoc.text('Reporte de Estad\u00edsticas Multimedia', 36, 21);
        // Footer
        pageDoc.setFontSize(8);
        pageDoc.setTextColor(120);
        pageDoc.text('MMU \u2014 Sistema Multimedia UNIMAR', 14, H - 8);
        const pgInfo = pageDoc.internal.getCurrentPageInfo();
        pageDoc.text(`P\u00e1gina ${pgInfo.pageNumber}`, W - 22, H - 8);
      };

      drawHeaderFooter(doc);
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(`Per\u00edodo: ${formatDate(startDate)} \u2014 ${formatDate(endDate)}`, 14, 40);
      doc.text(`Generado el: ${new Date().toLocaleString('es-VE')}`, 14, 46);
      doc.text(`Usuario: ${user?.first_name ?? ''} ${user?.last_name ?? ''}`, 14, 52);

      // 3) Tabla 1: Resumen General
      doc.setFontSize(12);
      doc.setTextColor(48, 102, 154);
      doc.text('Resumen General', 14, 60);
      
      autoTable(doc, {
        startY: 66,
        head: [['Métrica', 'Valor']],
        body: [
          ['Total Archivos', stats.total_files.toString()],
          ['Espacio Usado', stats.total_size_formatted],
          ['Imágenes', (stats.type_counts.image || 0).toString()],
          ['Videos', (stats.type_counts.video || 0).toString()],
          ['Audio', (stats.type_counts.audio || 0).toString()]
        ],
        headStyles: { fillColor: [48, 102, 154], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 4 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 }
      });

      // 4) Tabla 2: Distribución por Autor
      let currentY = (doc as any).lastAutoTable.finalY + 15;
      if (stats.author_distribution && stats.author_distribution.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(48, 102, 154);
        doc.text('Distribución por Autor', 14, currentY);
        
        const authorBody = stats.author_distribution.map(a => [a.name, a.count.toString()]);
        autoTable(doc, {
          startY: currentY + 5,
          head: [['Autor', 'Archivos Subidos']],
          body: authorBody,
          headStyles: { fillColor: [48, 102, 154] },
          styles: { fontSize: 10, cellPadding: 3 },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          margin: { left: 14, right: 14 }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // Check page break length
      if (currentY > H - 50) {
        doc.addPage();
        drawHeaderFooter(doc);
        currentY = 35;
      }

      // 5) Tabla 3: Archivos Subidos por Fecha (Timeline)
      if (stats.timeline_data && stats.timeline_data.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(48, 102, 154);
        doc.text('Archivos Subidos por Fecha', 14, currentY);
        
        const timelineBody = stats.timeline_data.map(d => [d.fullDate || d.date, d.count.toString()]);
        autoTable(doc, {
          startY: currentY + 5,
          head: [['Fecha', 'Cantidad']],
          body: timelineBody,
          headStyles: { fillColor: [48, 102, 154] },
          styles: { fontSize: 10, cellPadding: 3 },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          margin: { left: 14, right: 14 }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // Check page break again
      if (currentY > H - 50) {
        doc.addPage();
        drawHeaderFooter(doc);
        currentY = 35;
      }

      // 6) Tabla 4: Actividad por Hora
      if (stats.hourly_data && stats.hourly_data.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(48, 102, 154);
        doc.text('Actividad por Hora del Día', 14, currentY);
        
        const hourlyBody = stats.hourly_data.map(d => [d.hour, d.count.toString()]);
        autoTable(doc, {
          startY: currentY + 5,
          head: [['Hora', 'Archivos']],
          body: hourlyBody,
          headStyles: { fillColor: [48, 102, 154] },
          styles: { fontSize: 10, cellPadding: 3 },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          margin: { left: 14, right: 14 }
        });
      }

      // 7) Ensure all pages get the header/footer perfectly if autotable caused page breaks
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 2; i <= totalPages; i++) {
        doc.setPage(i);
        // Only draw header if it hasn't been drawn manually on this page
        // A simple way is to draw a clean rect at the top and write text to guarantee it
        doc.setFillColor(48, 102, 154);
        doc.rect(0, 0, W, 28, 'F');
        try { doc.addImage(unimarLogoBase64, 'PNG', 12, 4, 20, 20); } catch (_) {}
        doc.setFontSize(15);
        doc.setTextColor(255, 255, 255);
        doc.text('Universidad de Margarita \u2014 Alma Mater del Caribe', 36, 13);
        doc.setFontSize(10);
        doc.text('Reporte de Estad\u00edsticas Multimedia', 36, 21);
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text('MMU \u2014 Sistema Multimedia UNIMAR', 14, H - 8);
        doc.text(`P\u00e1gina ${i}`, W - 22, H - 8);
      }

      // Force correct filename by creating a named download anchor
      const pdfFilename = `Reporte_Estadisticas_UNIMAR_${startDate}_${endDate}.pdf`;
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const anchor = document.createElement('a');
      anchor.href = pdfUrl;
      anchor.download = pdfFilename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000);
      toast.success('PDF descargado', `Revisa tu carpeta de Descargas \u2014 ${pdfFilename}`);
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Error', 'No se pudo generar el PDF.');
    } finally {
      setExporting(false);
    }
  };


  if (!_hasHydrated || (isAuthenticated && !user)) return null;

  // Prepare pie chart data
  const pieData = stats ? Object.entries(stats.type_counts).map(([name, value]) => ({
    name: name === 'image' ? 'Imágenes' : name === 'video' ? 'Videos' : name === 'audio' ? 'Audio' : 'Otros',
    value: value || 0
  })).filter(item => item.value > 0) : [];

  // Prepare author distribution data
  const authorData = stats?.author_distribution || [];

  // Calculate totals for summary cards
  const totalFiles = stats?.total_files || 0;
  const totalSize = stats?.total_size_formatted || '0 KB';
  const imageCount = stats?.type_counts?.image || 0;
  const videoCount = stats?.type_counts?.video || 0;

  const periodButtons: { label: string; value: PeriodType }[] = [
    { label: 'Mes', value: 'mes' },
    { label: 'Bimestre', value: 'bimestre' },
    { label: 'Trimestre', value: 'trimestre' },
    { label: 'Semestre', value: 'semestre' },
    { label: 'Anual', value: 'anual' },
  ];

  return (
    <AdminLayout
      pageTitle="Estadísticas"
      pageDescription="Análisis detallado de tus recursos multimedia."
    >
      {/* Date Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <FontAwesomeIcon icon={faFilter} className="text-[#30669a]" />
            <span className="font-medium">Filtrar por fecha:</span>
          </div>
          
          {/* Period Buttons */}
          <div className="flex gap-2">
            {periodButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => handlePeriodChange(btn.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPeriod === btn.value
                    ? 'bg-[#30669a] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
          
          {/* Date Inputs */}
          <div className="flex items-center gap-2 ml-auto">
            <FontAwesomeIcon icon={faCalendarDays} className="text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setSelectedPeriod('custom');
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#30669a] focus:border-transparent"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setSelectedPeriod('custom');
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#30669a] focus:border-transparent"
            />
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={exportPDF}
              disabled={exporting || loading || !stats}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 shadow-sm"
            >
              <FontAwesomeIcon icon={exporting ? faSpinner : faFilePdf} className={exporting ? 'animate-spin' : ''} />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report area — Native PDF does not use html2canvas anymore, but we keep the structure for screen view */}
      <div ref={reportRef}>
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#30669a] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div id="stats-summary" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <FontAwesomeIcon icon={faPhotoFilm} className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Archivos</p>
                <p className="text-2xl font-bold text-slate-800">{totalFiles.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                <FontAwesomeIcon icon={faBolt} className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Espacio Usado</p>
                <p className="text-2xl font-bold text-slate-800">{totalSize}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <FontAwesomeIcon icon={faImage} className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Imágenes</p>
                <p className="text-2xl font-bold text-slate-800">{imageCount.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                <FontAwesomeIcon icon={faVideo} className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Videos</p>
                <p className="text-2xl font-bold text-slate-800">{videoCount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Charts - Row 1 */}
          <div id="stats-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Timeline Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Archivos Subidos (Timeline)</h3>
              <div className="h-80">
                {stats?.timeline_data && stats.timeline_data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.timeline_data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [value, 'Archivos']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#30669a" 
                        strokeWidth={3}
                        dot={{ fill: '#30669a', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#1e4a73' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faPhotoFilm} className="text-4xl mb-2 opacity-50" />
                      <p>No hay datos en este período</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bar Chart - By Type */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Distribución por Tipo</h3>
              <div className="h-80">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pieData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [value, 'Archivos']}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={48}>
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faPhotoFilm} className="text-4xl mb-2 opacity-50" />
                      <p>No hay datos de tipos</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Charts - Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hourly Activity — styled line chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Actividad por Hora del Día</h3>
              <div className="h-80">
                {stats?.hourly_data && stats.hourly_data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.hourly_data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#d4d8e8" strokeDasharray="" vertical={true} horizontal={true} />
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 11, fill: '#666' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: '#666' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [value, 'Archivos']}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Archivos"
                        stroke="#30669a"
                        strokeWidth={3}
                        dot={{ fill: '#30669a', strokeWidth: 2, r: 5, stroke: '#fff' }}
                        activeDot={{ r: 7, fill: '#1e4a73' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faPhotoFilm} className="text-4xl mb-2 opacity-50" />
                      <p>No hay datos de actividad</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Author Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Distribución por Autor</h3>
              <div className="h-80">
                {authorData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={authorData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [value, 'Archivos subidos']}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#30669a" 
                        radius={[0, 4, 4, 0]} 
                        barSize={30}
                      >
                        {authorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faPhotoFilm} className="text-4xl mb-2 opacity-50" />
                      <p>No hay autores registrados</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div> {/* end reportRef */}
    </AdminLayout>
  );
}
