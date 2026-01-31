# MÓDULO 5: Frontend Next.js + Quill.js

## 🎯 Objetivo

Crear interfaz de usuario con Quill.js y panel de IA con sugerencias manuales (SIN autocompletado).

---

## 📋 Tareas

### **5.1 Configuración de Quill.js**

- [ ] Crear `lib/quill-config.ts`:

  ```typescript
  import Quill from "quill";
  import ImageResize from "quill-image-resize-module-react";
  import ImageUploader from "quill-image-uploader";

  // Registrar módulos
  Quill.register("modules/imageResize", ImageResize);
  Quill.register("modules/imageUploader", ImageUploader);

  export const quillModules = {
    toolbar: {
      container: "#quill-toolbar",
    },
    imageResize: {
      modules: ["Resize", "DisplaySize"],
    },
    imageUploader: {
      upload: async (file: File) => {
        const formData = new FormData();
        formData.append("image", file);

        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/upload-image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data = await response.json();
        return data.url;
      },
    },
  };

  export const quillFormats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "align",
    "code-block",
    "blockquote",
  ];
  ```

---

### **5.2 Componente QuillEditor (SIN autocompletado)**

- [ ] Crear `components/editor/QuillEditor.tsx`:

  ```typescript
  "use client";

  import { useRef, useState } from "react";
  import ReactQuill from "react-quill";
  import "react-quill/dist/quill.snow.css";
  import { quillModules, quillFormats } from "@/lib/quill-config";
  import QuillToolbar from "./QuillToolbar";
  import AIAssistantPanel from "./AIAssistantPanel";

  interface QuillEditorProps {
    value: string;
    onChange: (content: string, delta: any, plainText: string) => void;
    placeholder?: string;
  }

  export default function QuillEditor({
    value,
    onChange,
    placeholder,
  }: QuillEditorProps) {
    const quillRef = useRef<ReactQuill>(null);
    const [showAI, setShowAI] = useState(false);
    const [selectedText, setSelectedText] = useState("");
    const [selectionRange, setSelectionRange] = useState<any>(null);

    // Manejar cambios
    const handleChange = (
      content: string,
      delta: any,
      source: any,
      editor: any
    ) => {
      const plainText = editor.getText();
      onChange(content, delta, plainText);
    };

    // Detectar selección de texto
    const handleSelectionChange = (range: any) => {
      const quill = quillRef.current?.getEditor();
      if (!quill) return;

      if (range && range.length > 0) {
        const text = quill.getText(range.index, range.length);
        setSelectedText(text);
        setSelectionRange(range);
        setShowAI(true);
      } else {
        setShowAI(false);
      }
    };

    // Aplicar texto mejorado desde IA
    const applyImprovedText = (improvedText: string) => {
      const quill = quillRef.current?.getEditor();
      if (!quill || !selectionRange) return;

      quill.deleteText(selectionRange.index, selectionRange.length);
      quill.insertText(selectionRange.index, improvedText);

      setShowAI(false);
      setSelectedText("");
    };

    return (
      <div className="relative">
        {/* Toolbar personalizado */}
        <QuillToolbar />

        {/* Editor */}
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={handleChange}
          onChangeSelection={handleSelectionChange}
          modules={quillModules}
          formats={quillFormats}
          placeholder={placeholder || "Escribe aquí..."}
          className="min-h-[400px] bg-white"
        />

        {/* Panel de IA (solo si hay texto seleccionado) */}
        {showAI && selectedText && (
          <AIAssistantPanel
            selectedText={selectedText}
            onApply={applyImprovedText}
            onClose={() => setShowAI(false)}
          />
        )}
      </div>
    );
  }
  ```

---

### **5.3 Toolbar Personalizado**

- [ ] Crear `components/editor/QuillToolbar.tsx`:
  ```typescript
  export default function QuillToolbar() {
    return (
      <div
        id="quill-toolbar"
        className="border-b border-gray-300 bg-gray-50 p-2 flex items-center gap-1"
      >
        {/* Formato de texto */}
        <span className="ql-formats">
          <select className="ql-header" defaultValue="">
            <option value="1">Título 1</option>
            <option value="2">Título 2</option>
            <option value="3">Título 3</option>
            <option value="">Normal</option>
          </select>
        </span>

        {/* Estilos */}
        <span className="ql-formats">
          <button className="ql-bold" title="Negrita" />
          <button className="ql-italic" title="Cursiva" />
          <button className="ql-underline" title="Subrayado" />
          <button className="ql-strike" title="Tachado" />
        </span>

        {/* Colores */}
        <span className="ql-formats">
          <select className="ql-color" title="Color de texto" />
          <select className="ql-background" title="Color de fondo" />
        </span>

        {/* Listas */}
        <span className="ql-formats">
          <button className="ql-list" value="ordered" title="Lista numerada" />
          <button
            className="ql-list"
            value="bullet"
            title="Lista con viñetas"
          />
          <button className="ql-indent" value="-1" title="Reducir sangría" />
          <button className="ql-indent" value="+1" title="Aumentar sangría" />
        </span>

        {/* Media */}
        <span className="ql-formats">
          <button className="ql-link" title="Insertar enlace" />
          <button className="ql-image" title="Insertar imagen" />
          <button className="ql-video" title="Insertar video" />
        </span>

        {/* Alineación */}
        <span className="ql-formats">
          <select className="ql-align" title="Alineación" />
        </span>

        {/* Otros */}
        <span className="ql-formats">
          <button className="ql-code-block" title="Bloque de código" />
          <button className="ql-blockquote" title="Cita" />
        </span>

        {/* Limpiar formato */}
        <span className="ql-formats">
          <button className="ql-clean" title="Limpiar formato" />
        </span>

        {/* Info de IA */}
        <span className="ml-auto text-xs text-gray-500 px-2">
          💡 Selecciona texto para usar IA
        </span>
      </div>
    );
  }
  ```

---

### **5.4 Panel de IA (Solo Sugerencias Manuales)**

- [ ] Crear `components/editor/AIAssistantPanel.tsx`:

  ```typescript
  'use client';

  import { useState } from 'react';
  import { Sparkles, Wand2, FileText, Search, X, Loader2 } from 'lucide-react';

  interface AIAssistantPanelProps {
    selectedText: string;
    onApply: (improvedText: string) => void;
    onClose: () => void;
  }

  export default function AIAssistantPanel({ selectedText, onApply, onClose }: AIAssistantPanelProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [activeAction, setActiveAction] = useState<string | null>(null);

    const improveText = async () => {
      setLoading(true);
      setActiveAction('improve');
      setResult('');

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/improve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ text: selectedText }),
        });

        const data = await response.json();
        setResult(data.improved_text);
      } catch (error) {
        console.error(error);
        alert('Error al mejorar texto');
      } finally {
        setLoading(false);
      }
    };

    const summarizeText = async () {
      setLoading(true);
      setActiveAction('summarize');
      setResult('');

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate-summary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ content: selectedText }),
        });

        const data = await response.json();
        setResult(data.summary);
      } catch (error) {
        console.error(error);
        alert('Error al resumir texto');
      } finally {
        setLoading(false);
      }
    };

    const expandText = async () => {
      setLoading(true);
      setActiveAction('expand');
      setResult('');

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/expand-idea`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ idea: selectedText }),
        });

        const data = await response.json();
        setResult(data.expanded_text);
      } catch (error) {
        console.error(error);
        alert('Error al expandir texto');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed right-4 top-20 w-96 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Asistente IA</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Texto seleccionado */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Texto seleccionado:</p>
          <p className="text-sm text-gray-700 line-clamp-3">{selectedText}</p>
        </div>

        {/* Acciones */}
        <div className="p-4 space-y-2">
          <button
            onClick={improveText}
            disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition disabled:opacity-50"
          >
            {loading && activeAction === 'improve' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
            <span className="font-medium">Mejorar texto</span>
          </button>

          <button
            onClick={summarizeText}
            disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition disabled:opacity-50"
          >
            {loading && activeAction === 'summarize' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            <span className="font-medium">Resumir</span>
          </button>

          <button
            onClick={expandText}
            disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition disabled:opacity-50"
          >
            {loading && activeAction === 'expand' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span className="font-medium">Expandir idea</span>
          </button>
        </div>

        {/* Resultado */}
        {result && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 mb-2">Resultado:</p>
            <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{result}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onApply(result)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Aplicar
              </button>
              <button
                onClick={() => setResult('')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                Descartar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  ```

---

### **5.5 Gestor de Bloques**

- [ ] Crear `components/editor/BlockManager.tsx`:

  ```typescript
  "use client";

  import { useState } from "react";
  import {
    Plus,
    GripVertical,
    Trash2,
    Image,
    Video,
    Type,
    Minus,
  } from "lucide-react";
  import QuillEditor from "./QuillEditor";

  interface Block {
    id: string;
    type: "text" | "image" | "video";
    content: any;
    order: number;
  }

  export default function BlockManager({
    publicationId,
  }: {
    publicationId?: number;
  }) {
    const [blocks, setBlocks] = useState<Block[]>([]);

    const addBlock = (type: Block["type"]) => {
      const newBlock: Block = {
        id: `temp-${Date.now()}`,
        type,
        content: type === "text" ? { html: "", delta: {}, plain_text: "" } : {},
        order: blocks.length,
      };

      setBlocks([...blocks, newBlock]);
    };

    const updateBlock = (id: string, content: any) => {
      setBlocks(
        blocks.map((block) => (block.id === id ? { ...block, content } : block))
      );
    };

    const deleteBlock = (id: string) => {
      setBlocks(blocks.filter((block) => block.id !== id));
    };

    return (
      <div className="space-y-6">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="group relative border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition bg-white"
          >
            {/* Controles */}
            <div className="absolute -left-12 top-4 opacity-0 group-hover:opacity-100 transition flex flex-col gap-1">
              <button className="p-1.5 hover:bg-gray-100 rounded">
                <GripVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="absolute -right-12 top-4 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => deleteBlock(block.id)}
                className="p-1.5 hover:bg-red-100 rounded"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>

            {/* Contenido del bloque */}
            {block.type === "text" && (
              <QuillEditor
                value={block.content.html || ""}
                onChange={(html, delta, plainText) => {
                  updateBlock(block.id, { html, delta, plain_text: plainText });
                }}
                placeholder="Escribe aquí... Selecciona texto para usar IA"
              />
            )}

            {block.type === "image" && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-purple-400 transition cursor-pointer">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">
                  Arrastra una imagen aquí
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  o haz clic para seleccionar
                </p>
              </div>
            )}

            {block.type === "video" && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-purple-400 transition cursor-pointer">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Sube un video</p>
                <p className="text-sm text-gray-500 mt-1">
                  o pega un enlace de YouTube
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Botones para agregar bloques */}
        <div className="flex gap-3 justify-center pt-4">
          <button
            onClick={() => addBlock("text")}
            className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
          >
            <Type className="w-5 h-5" />
            <span className="font-medium">Texto</span>
          </button>

          <button
            onClick={() => addBlock("image")}
            className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <Image className="w-5 h-5" />
            <span className="font-medium">Imagen</span>
          </button>

          <button
            onClick={() => addBlock("video")}
            className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
          >
            <Video className="w-5 h-5" />
            <span className="font-medium">Video</span>
          </button>
        </div>
      </div>
    );
  }
  ```

---

## ✅ Checklist de Finalización

- [ ] Quill.js configurado
- [ ] QuillEditor funcionando
- [ ] Panel de IA con 3 acciones (mejorar, resumir, expandir)
- [ ] BlockManager con drag & drop
- [ ] Páginas públicas con SSG
- [ ] Páginas admin con SSR

---

## ⏱️ Tiempo Estimado

**10-14 días**
