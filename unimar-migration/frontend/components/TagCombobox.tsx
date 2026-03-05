"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import api from "@/lib/api";

export interface Tag {
  id: number;
  name: string;
  slug: string;
  category_id: number | null;
  category_name?: string;
}

interface TagComboboxProps {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
  placeholder?: string;
  categoryId?: number | null;
  className?: string;
  darkMode?: boolean;
}

export default function TagCombobox({
  value = [],
  onChange,
  placeholder = "Buscar etiqueta...",
  categoryId,
  className = "",
  darkMode = false,
}: TagComboboxProps) {
  const [inputValue, setInputValue] = useState("");
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Carga tags del catálogo
  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (categoryId) params.category_id = categoryId;
      const res = await api.get("/tags", { params });
      setAllTags(res.data);
    } catch (err) {
      console.error("Error loading tags:", err);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Recalcular posición del dropdown usando position:fixed para evitar clipping
  const updateDropdownPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = Math.min(208, 52 * 4); // max ~4 items visible

    // Si hay espacio abajo, abrir hacia abajo; si no, hacia arriba
    if (spaceBelow >= dropdownHeight || spaceBelow > rect.top) {
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    } else {
      setDropdownStyle({
        position: "fixed",
        bottom: window.innerHeight - rect.top + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, []);

  // Abrir dropdown y calcular posición
  const openDropdown = () => {
    updateDropdownPosition();
    setIsOpen(true);
  };

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        // También comprobar si el click fue en el portal del dropdown
        const target = e.target as Element;
        if (!target.closest("[data-tag-dropdown]")) {
          setIsOpen(false);
          setInputValue("");
        }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Recalcular posición al hacer scroll o resize
  useEffect(() => {
    if (!isOpen) return;
    const update = () => updateDropdownPosition();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen, updateDropdownPosition]);

  // Tags filtrados
  const filteredTags = allTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.some((v) => v.id === tag.id),
  );

  const handleSelect = (tag: Tag) => {
    onChange([...value, tag]);
    setInputValue("");
    inputRef.current?.focus();
    // Mantener abierto para selección múltiple
    updateDropdownPosition();
  };

  const handleRemove = (tagId: number) => {
    onChange(value.filter((t) => t.id !== tagId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      handleRemove(value[value.length - 1].id);
    }
    if (e.key === "Escape") {
      setIsOpen(false);
      setInputValue("");
    }
    if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  // Estilos
  const baseContainer = darkMode
    ? "bg-slate-800 border-slate-700 text-white"
    : "bg-white border-slate-300 text-slate-800";
  const chipBg = darkMode
    ? "bg-[#30669a]/60 text-white"
    : "bg-[#30669a]/10 text-[#30669a]";
  const inputColor = darkMode
    ? "text-white placeholder-slate-400"
    : "text-slate-800 placeholder-slate-400";
  const dropdownBg = darkMode
    ? "bg-slate-800 border-slate-700"
    : "bg-white border-slate-200";
  const itemHover = darkMode ? "hover:bg-slate-700" : "hover:bg-slate-50";

  const dropdown = isOpen && mounted ? (
    createPortal(
      <div
        data-tag-dropdown
        style={dropdownStyle}
        className={`border rounded-lg shadow-xl max-h-52 overflow-y-auto ${dropdownBg}`}
      >
        {loading ? (
          <div className="flex items-center justify-center py-4 text-slate-400">
            <svg className="w-4 h-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs">Cargando etiquetas...</span>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="py-3 px-3 text-xs text-slate-400 italic">
            {inputValue
              ? `Sin resultados para "${inputValue}"`
              : "No hay etiquetas disponibles en el catálogo"}
          </div>
        ) : (
          filteredTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              data-tag-dropdown
              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${itemHover} ${darkMode ? "text-white" : "text-slate-700"}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(tag);
              }}
            >
              <span>{tag.name}</span>
              {tag.category_name && (
                <span className="text-xs text-slate-400 ml-2">{tag.category_name}</span>
              )}
            </button>
          ))
        )}
      </div>,
      document.body
    )
  ) : null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input container con chips */}
      <div
        className={`flex flex-wrap gap-1.5 items-center min-h-[38px] px-2 py-1.5 border rounded-lg cursor-text transition-all focus-within:ring-2 focus-within:ring-[#30669a]/30 focus-within:border-[#30669a] ${baseContainer}`}
        onClick={() => {
          inputRef.current?.focus();
          openDropdown();
        }}
      >
        {/* Chips seleccionados */}
        {value.map((tag) => (
          <span
            key={tag.id}
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${chipBg}`}
          >
            {tag.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(tag.id);
              }}
              className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity leading-none"
              aria-label={`Quitar ${tag.name}`}
            >
              ×
            </button>
          </span>
        ))}

        {/* Input búsqueda */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            openDropdown();
          }}
          onFocus={() => openDropdown()}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className={`flex-1 min-w-[120px] bg-transparent outline-none text-sm ${inputColor}`}
        />
      </div>

      {/* Dropdown via portal (evita clipping por overflow del contenedor padre) */}
      {dropdown}
    </div>
  );
}
