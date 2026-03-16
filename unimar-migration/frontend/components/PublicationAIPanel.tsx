'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWandMagicSparkles, faSpellCheck, faLanguage, faPenFancy, faSpinner, faCheck, faTimes, faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface PublicationAIPanelProps {
  content: string;
  onApplyContent: (newContent: string) => void;
}

type AIAction = 'improve' | 'fix-spelling' | 'change-tone';

const TONES = [
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'academico', label: 'Académico' },
  { value: 'periodistico', label: 'Periodístico' },
];

export default function PublicationAIPanel({ content, onApplyContent }: PublicationAIPanelProps) {
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showToneMenu, setShowToneMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Strip HTML tags for sending plain text to AI
  const stripHtml = (html: string): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleAction = async (action: AIAction, tone?: string) => {
    const plainText = stripHtml(content);
    if (!plainText.trim()) {
      setError('Escribe algo de contenido primero.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setActiveAction(action);
    setPreview(null);
    setError(null);
    setShowToneMenu(false);

    try {
      let response;
      switch (action) {
        case 'improve':
          response = await api.post('/ai/improve-text', { text: plainText });
          setPreview(response.data.improved_text);
          break;
        case 'fix-spelling':
          response = await api.post('/ai/fix-spelling', { text: plainText });
          setPreview(response.data.result);
          break;
        case 'change-tone':
          response = await api.post('/ai/change-tone', { text: plainText, tone: tone || 'formal' });
          setPreview(response.data.result);
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocurrió un error al procesar con IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (preview) {
      // Wrap in paragraph tags to maintain Quill compatibility
      const htmlContent = preview.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('');
      onApplyContent(htmlContent);
      setPreview(null);
      setActiveAction(null);
    }
  };

  const handleReject = () => {
    setPreview(null);
    setActiveAction(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[#30669a]" />
        <h3 className="text-sm font-semibold text-slate-700">Asistente IA</h3>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Action buttons */}
      {!preview && (
        <div className="space-y-2">
          {/* Fix Spelling */}
          <button
            onClick={() => handleAction('fix-spelling')}
            disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-blue-50 hover:border-[#30669a] border border-slate-200 rounded-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading && activeAction === 'fix-spelling' ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#30669a] w-4 h-4" />
            ) : (
              <FontAwesomeIcon icon={faSpellCheck} className="text-[#30669a] w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-700">Corregir ortografía</p>
              <p className="text-xs text-slate-400">Corrige errores gramaticales y ortográficos</p>
            </div>
          </button>

          {/* Change Tone */}
          <div className="relative">
            <button
              onClick={() => setShowToneMenu(!showToneMenu)}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-blue-50 hover:border-[#30669a] border border-slate-200 rounded-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading && activeAction === 'change-tone' ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#30669a] w-4 h-4" />
              ) : (
                <FontAwesomeIcon icon={faLanguage} className="text-[#30669a] w-4 h-4 group-hover:scale-110 transition-transform" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">Cambiar tono</p>
                <p className="text-xs text-slate-400">Reescribe con un tono diferente</p>
              </div>
              <FontAwesomeIcon icon={faChevronDown} className={`text-slate-400 w-3 h-3 transition-transform ${showToneMenu ? 'rotate-180' : ''}`} />
            </button>

            {showToneMenu && !loading && (
              <div className="mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-10">
                {TONES.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => handleAction('change-tone', tone.value)}
                    className="w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-[#30669a] text-left transition-colors border-b border-slate-100 last:border-0"
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Improve Text */}
          <button
            onClick={() => handleAction('improve')}
            disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-blue-50 hover:border-[#30669a] border border-slate-200 rounded-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading && activeAction === 'improve' ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#30669a] w-4 h-4" />
            ) : (
              <FontAwesomeIcon icon={faPenFancy} className="text-[#30669a] w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-700">Mejorar texto</p>
              <p className="text-xs text-slate-400">Mejora gramática, estilo y redacción</p>
            </div>
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#30669a]" />
          <p className="text-sm text-[#30669a] font-medium">Procesando con IA...</p>
        </div>
      )}

      {/* Preview */}
      {preview && !loading && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Vista previa del resultado:</p>
          <div className="max-h-60 overflow-y-auto bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 leading-relaxed">
            {preview}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleApply}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
            >
              <FontAwesomeIcon icon={faCheck} />
              Aplicar
            </button>
            <button
              onClick={handleReject}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
            >
              <FontAwesomeIcon icon={faTimes} />
              Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
