'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import toast, { Swal } from '@/lib/toast';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  tags_count: number;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  category_id: number | null;
  category_name?: string;
}

interface Location {
  id: number;
  name: string;
  detail?: string;
}

interface Author {
  id: number;
  name: string;
}

// ─── Slug preview helper ──────────────────────────────────────────────────────
function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Reusable modal wrapper ───────────────────────────────────────────────────
function confirmDelete(name: string, extra?: string) {
  return Swal.fire({
    title: `¿Eliminar "${name}"?`,
    html: extra ?? 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    customClass: { popup: 'rounded-2xl shadow-xl' },
  });
}

// ─── Tab button component ─────────────────────────────────────────────────────
function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all ${
        active
          ? 'border-[#30669a] text-[#30669a] bg-white'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CatalogPage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated, isAdmin } = useAuthStore();
  const [tab, setTab] = useState<'categories' | 'tags' | 'authors' | 'locations'>('categories');

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) router.push('/login');
    if (_hasHydrated && isAuthenticated && !isAdmin()) router.push('/dashboard');
  }, [isAuthenticated, _hasHydrated, router]);

  if (!_hasHydrated) return null;

  return (
    <AdminLayout pageTitle="Taxonomía del Sistema" pageDescription="Gestiona categorías, etiquetas y ubicaciones del sistema">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        <TabBtn active={tab === 'categories'} onClick={() => setTab('categories')}>
          <span className="inline-flex items-center gap-2">
            {/* fa-folder-open */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 576 512"><path d="M384 480h48c11.4 0 21.9-6 27.6-15.9l112-192c5.8-9.9 5.8-22.1 .1-32.1S555.5 224 544 224H144c-11.4 0-21.9 6-27.6 15.9L48 357.1V96c0-8.8 7.2-16 16-16H181.5c4.2 0 8.3 1.7 11.3 4.7l26.5 26.5c21 21 49.5 32.8 79.2 32.8H416c8.8 0 16 7.2 16 16v32h48V160c0-35.3-28.7-64-64-64H298.5c-17 0-33.3-6.7-45.3-18.7L226.7 50.7c-12-12-28.3-18.7-45.3-18.7H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H336c23.5 0 44.2-12.8 55.4-32H384z"/></svg>
            Categorías
          </span>
        </TabBtn>
        <TabBtn active={tab === 'tags'} onClick={() => setTab('tags')}>
          <span className="inline-flex items-center gap-2">
            {/* fa-tag */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512"><path d="M0 80V229.5c0 17 6.7 33.3 18.7 45.3l176 176c25 25 65.5 25 90.5 0L418.7 317.3c25-25 25-65.5 0-90.5l-176-176c-12-12-28.3-18.7-45.3-18.7H48C21.5 32 0 53.5 0 80zm112 32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>
            Etiquetas
          </span>
        </TabBtn>
        <TabBtn active={tab === 'authors'} onClick={() => setTab('authors')}>
          <span className="inline-flex items-center gap-2">
            {/* fa-users */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 640 512"><path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM609.3 512H471.4c5.4-9.4 8.6-20.3 8.6-32v-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2h61.4C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"/></svg>
            Autores
          </span>
        </TabBtn>
        <TabBtn active={tab === 'locations'} onClick={() => setTab('locations')}>
          <span className="inline-flex items-center gap-2">
            {/* fa-location-dot */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
            Ubicaciones
          </span>
        </TabBtn>
      </div>

      {tab === 'categories' && <CategoriesTab />}
      {tab === 'tags' && <TagsTab />}
      {tab === 'authors' && <AuthorsTab />}
      {tab === 'locations' && <LocationsTab />}
    </AdminLayout>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 1 — CATEGORÍAS
// ═════════════════════════════════════════════════════════════════════════════
function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description ?? '' });
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, form);
      } else {
        await api.post('/categories', form);
      }
      setShowForm(false);
      load();
      toast.success(editing ? 'Categoría actualizada' : 'Categoría creada');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const res = await confirmDelete(cat.name,
      cat.tags_count > 0
        ? `<span class="text-red-600 font-semibold">Esta categoría tiene ${cat.tags_count} etiqueta(s).</span> Reasígnalas antes de eliminarla.`
        : undefined
    );
    if (!res.isConfirmed) return;
    try {
      await api.delete(`/categories/${cat.id}`);
      load();
    } catch (e: any) {
      toast.error('Error', e.response?.data?.message || 'No se pudo eliminar.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{categories.length} categoría(s)</p>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#30669a] hover:bg-[#255080] text-white text-sm font-medium rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Nueva Categoría
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="mb-4 p-4 border border-[#30669a]/30 rounded-xl bg-blue-50/50">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">{editing ? 'Editar categoría' : 'Nueva categoría'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Nombre *</label>
              <input
                type="text" autoFocus
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30669a]/30 focus:border-[#30669a]"
                placeholder="ej: Eventos, Infraestructura..."
              />
              {form.name && (
                <p className="text-[10px] text-slate-400 mt-0.5">slug: <code>{toSlug(form.name)}</code></p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Descripción</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30669a]/30 focus:border-[#30669a]"
                placeholder="Descripción opcional..."
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#30669a] text-white text-sm rounded-lg hover:bg-[#255080] disabled:opacity-50 transition-colors">
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#30669a] border-t-transparent rounded-full animate-spin"/></div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="currentColor" viewBox="0 0 576 512"><path d="M384 480h48c11.4 0 21.9-6 27.6-15.9l112-192c5.8-9.9 5.8-22.1 .1-32.1S555.5 224 544 224H144c-11.4 0-21.9 6-27.6 15.9L48 357.1V96c0-8.8 7.2-16 16-16H181.5c4.2 0 8.3 1.7 11.3 4.7l26.5 26.5c21 21 49.5 32.8 79.2 32.8H416c8.8 0 16 7.2 16 16v32h48V160c0-35.3-28.7-64-64-64H298.5c-17 0-33.3-6.7-45.3-18.7L226.7 50.7c-12-12-28.3-18.7-45.3-18.7H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H336c23.5 0 44.2-12.8 55.4-32H384z"/></svg>
          <p className="text-sm">No hay categorías. Crea la primera.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 hidden sm:table-cell">Descripción</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Etiquetas</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-800">{cat.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{cat.slug}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-sm text-slate-500 truncate max-w-[200px]">{cat.description || <span className="italic opacity-50">—</span>}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full ${cat.tags_count > 0 ? 'bg-[#30669a]/10 text-[#30669a]' : 'bg-slate-100 text-slate-400'}`}>
                      {cat.tags_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(cat)} className="p-1.5 text-slate-400 hover:text-[#30669a] hover:bg-slate-100 rounded-lg transition-colors" title="Editar">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(cat)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 2 — ETIQUETAS
// ═════════════════════════════════════════════════════════════════════════════
function TagsTab() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [form, setForm] = useState({ name: '', category_id: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [slugConflict, setSlugConflict] = useState(false);
  const [filterCat, setFilterCat] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tagsRes, catsRes] = await Promise.all([api.get('/tags'), api.get('/categories')]);
      setTags(tagsRes.data);
      setCategories(catsRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Validación de slug en tiempo real
  useEffect(() => {
    const slug = toSlug(form.name);
    const conflict = tags.some(t => t.slug === slug && t.id !== editing?.id);
    setSlugConflict(conflict);
  }, [form.name, tags, editing]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', category_id: '' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (tag: Tag) => {
    setEditing(tag);
    setForm({ name: tag.name, category_id: tag.category_id?.toString() ?? '' });
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    if (!form.category_id) { setError('La categoría es obligatoria.'); return; }
    if (slugConflict) { setError('Ya existe una etiqueta con ese nombre (slug duplicado).'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        category_id: parseInt(form.category_id),
      };
      if (editing) {
        await api.put(`/tags/${editing.id}`, payload);
      } else {
        await api.post('/tags', payload);
      }
      setShowForm(false);
      load();
      toast.success(editing ? 'Etiqueta actualizada' : 'Etiqueta creada');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tag: Tag) => {
    const res = await confirmDelete(tag.name);
    if (!res.isConfirmed) return;
    try {
      await api.delete(`/tags/${tag.id}`);
      load();
    } catch (e: any) {
      toast.error('Etiqueta en uso', e.response?.data?.message || 'No se pudo eliminar.');
    }
  };

  const filtered = filterCat ? tags.filter(t => t.category_id?.toString() === filterCat) : tags;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <p className="text-sm text-slate-500">{filtered.length} etiqueta(s)</p>
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#30669a]/20"
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#30669a] hover:bg-[#255080] text-white text-sm font-medium rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Nueva Etiqueta
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="mb-4 p-4 border border-[#30669a]/30 rounded-xl bg-blue-50/50">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">{editing ? 'Editar etiqueta' : 'Nueva etiqueta'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Nombre *</label>
              <input
                type="text" autoFocus
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30669a]/30 transition-colors ${slugConflict ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-[#30669a]'}`}
                placeholder="ej: Graduación, Campus, Decanato..."
              />
              {form.name && (
                <p className={`text-[10px] mt-0.5 ${slugConflict ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                  slug: <code>{toSlug(form.name)}</code>
                  {slugConflict && ' ← ¡Ya existe!'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Categoría <span className="text-red-500">*</span></label>
              <select
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30669a]/30 focus:border-[#30669a] transition-colors ${!form.category_id && error ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
              >
                <option value="">-- Selecciona una categoría --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} disabled={saving || slugConflict} className="px-4 py-2 bg-[#30669a] text-white text-sm rounded-lg hover:bg-[#255080] disabled:opacity-50 transition-colors">
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#30669a] border-t-transparent rounded-full animate-spin"/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="currentColor" viewBox="0 0 448 512"><path d="M0 80V229.5c0 17 6.7 33.3 18.7 45.3l176 176c25 25 65.5 25 90.5 0L418.7 317.3c25-25 25-65.5 0-90.5l-176-176c-12-12-28.3-18.7-45.3-18.7H48C21.5 32 0 53.5 0 80zm112 32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>
          <p className="text-sm">{filterCat ? 'No hay etiquetas en esta categoría.' : 'No hay etiquetas. Crea la primera.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Etiqueta</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 hidden sm:table-cell">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Categoría</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(tag => (
                <tr key={tag.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm font-medium px-2.5 py-0.5 rounded-full bg-[#30669a]/10 text-[#30669a]">
                      {tag.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <code className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{tag.slug}</code>
                  </td>
                  <td className="px-4 py-3">
                    {tag.category_name ? (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tag.category_name}</span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sin categoría</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(tag)} className="p-1.5 text-slate-400 hover:text-[#30669a] hover:bg-slate-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(tag)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 3 — UBICACIONES
// ═════════════════════════════════════════════════════════════════════════════
function LocationsTab() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [form, setForm] = useState({ name: '', detail: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/locations');
      setLocations(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', detail: '' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (loc: Location) => {
    setEditing(loc);
    setForm({ name: loc.name, detail: loc.detail ?? '' });
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/locations/${editing.id}`, form);
      } else {
        await api.post('/locations', form);
      }
      setShowForm(false);
      load();
      toast.success(editing ? 'Ubicación actualizada' : 'Ubicación creada');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (loc: Location) => {
    const res = await confirmDelete(loc.name);
    if (!res.isConfirmed) return;
    try {
      await api.delete(`/locations/${loc.id}`);
      load();
    } catch (e: any) {
      toast.error('Error', e.response?.data?.message || 'No se pudo eliminar.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{locations.length} ubicación(es)</p>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#30669a] hover:bg-[#255080] text-white text-sm font-medium rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Nueva Ubicación
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="mb-4 p-4 border border-[#30669a]/30 rounded-xl bg-blue-50/50">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">{editing ? 'Editar ubicación' : 'Nueva ubicación'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Nombre del lugar *</label>
              <input
                type="text" autoFocus
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30669a]/30 focus:border-[#30669a]"
                placeholder="ej: Auditorio UNIMAR"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Detalle</label>
              <input
                type="text"
                value={form.detail}
                onChange={e => setForm({ ...form, detail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30669a]/30 focus:border-[#30669a]"
                placeholder="ej: Sede Porlamar, Piso 2..."
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#30669a] text-white text-sm rounded-lg hover:bg-[#255080] disabled:opacity-50 transition-colors">
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#30669a] border-t-transparent rounded-full animate-spin"/></div>
      ) : locations.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="currentColor" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
          <p className="text-sm">No hay ubicaciones. Crea la primera.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Lugar</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 hidden sm:table-cell">Detalle</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locations.map(loc => (
                <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#30669a] flex-shrink-0" fill="currentColor" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
                      <p className="text-sm font-medium text-slate-800">{loc.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-sm text-slate-500">{loc.detail || <span className="italic opacity-50">—</span>}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(loc)} className="p-1.5 text-slate-400 hover:text-[#30669a] hover:bg-slate-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(loc)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 4 — AUTORES
// ═════════════════════════════════════════════════════════════════════════════
function AuthorsTab() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Author | null>(null);
  const [form, setForm] = useState({ name: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/authors');
      setAuthors(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (author: Author) => {
    setEditing(author);
    setForm({ name: author.name });
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/authors/${editing.id}`, form);
      } else {
        await api.post('/authors', form);
      }
      setShowForm(false);
      load();
      toast.success(editing ? 'Autor actualizado' : 'Autor creado');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (author: Author) => {
    const res = await confirmDelete(author.name, 'Esta acción no se puede deshacer.');
    if (!res.isConfirmed) return;
    try {
      await api.delete(`/authors/${author.id}`);
      load();
    } catch (e: any) {
      toast.error('Error', e.response?.data?.message || 'No se pudo eliminar.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{authors.length} autor(es)</p>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#30669a] hover:bg-[#255080] text-white text-sm font-medium rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Nuevo Autor
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="mb-4 p-4 border border-[#30669a]/30 rounded-xl bg-blue-50/50">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">{editing ? 'Editar autor' : 'Nuevo autor'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Nombre completo *</label>
              <input
                type="text" autoFocus
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30669a]/30 focus:border-[#30669a]"
                placeholder="ej: Juan Pérez"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#30669a] text-white text-sm rounded-lg hover:bg-[#255080] disabled:opacity-50 transition-colors">
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#30669a] border-t-transparent rounded-full animate-spin"/></div>
      ) : authors.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="currentColor" viewBox="0 0 640 512"><path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM609.3 512H471.4c5.4-9.4 8.6-20.3 8.6-32v-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2h61.4C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"/></svg>
          <p className="text-sm">No hay autores. Crea el primero.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Nombre</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {authors.map(author => (
                <tr key={author.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#30669a] flex-shrink-0" fill="currentColor" viewBox="0 0 448 512"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg>
                      <p className="text-sm font-medium text-slate-800">{author.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(author)} className="p-1.5 text-slate-400 hover:text-[#30669a] hover:bg-slate-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(author)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
