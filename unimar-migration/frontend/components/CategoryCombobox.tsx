"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import api from "@/lib/api";

export interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CategoryComboboxProps {
  value: Category[];
  onChange: (categories: Category[]) => void;
  placeholder?: string;
  className?: string;
  darkMode?: boolean;
}

export default function CategoryCombobox({
  value = [],
  onChange,
  placeholder = "Filtrar por categoría...",
  className = "",
  darkMode = false,
}: CategoryComboboxProps) {
  const [inputValue, setInputValue] = useState("");
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/categories");
      setAllCategories(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const updateDropdownPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow >= 200 || spaceBelow > rect.top) {
      setDropdownStyle({ position: "fixed", top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 });
    } else {
      setDropdownStyle({ position: "fixed", bottom: window.innerHeight - rect.top + 4, left: rect.left, width: rect.width, zIndex: 9999 });
    }
  }, []);

  const openDropdown = () => { updateDropdownPosition(); setIsOpen(true); };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Element;
      if (containerRef.current && !containerRef.current.contains(target) && !target.closest("[data-cat-dropdown]")) {
        setIsOpen(false);
        setInputValue("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const update = () => updateDropdownPosition();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [isOpen, updateDropdownPosition]);

  const filtered = allCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.some((v) => v.id === cat.id)
  );

  const handleSelect = (cat: Category) => {
    onChange([...value, cat]);
    setInputValue("");
    inputRef.current?.focus();
    updateDropdownPosition();
  };

  const handleRemove = (id: number) => {
    onChange(value.filter((c) => c.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      handleRemove(value[value.length - 1].id);
    }
    if (e.key === "Escape") { setIsOpen(false); setInputValue(""); }
    if (e.key === "Tab") { setIsOpen(false); }
  };

  // Styles
  const baseContainer = darkMode
    ? "bg-slate-800 border-slate-700 text-white"
    : "bg-white border-slate-300 text-slate-800";
  const chipBg = darkMode
    ? "bg-purple-700/60 text-white"
    : "bg-purple-100 text-purple-700";
  const inputColor = darkMode ? "text-white placeholder-slate-400" : "text-slate-800 placeholder-slate-400";
  const dropdownBg = darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const itemHover = darkMode ? "hover:bg-slate-700 text-white" : "hover:bg-slate-50 text-slate-700";

  const dropdown = isOpen && mounted ? createPortal(
    <div
      data-cat-dropdown
      style={dropdownStyle}
      className={`border rounded-lg shadow-xl max-h-52 overflow-y-auto ${dropdownBg}`}
    >
      {loading ? (
        <div className="flex items-center justify-center py-4 text-slate-400">
          <svg className="w-4 h-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs">Cargando categorías...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-3 px-3 text-xs text-slate-400 italic">
          {inputValue ? `Sin resultados para "${inputValue}"` : "No hay categorías disponibles"}
        </div>
      ) : (
        filtered.map((cat) => (
          <button
            key={cat.id}
            type="button"
            data-cat-dropdown
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${itemHover}`}
            onMouseDown={(e) => { e.preventDefault(); handleSelect(cat); }}
          >
            {cat.name}
          </button>
        ))
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`flex flex-wrap gap-1.5 items-center min-h-[38px] px-2 py-1.5 border rounded-lg cursor-text transition-all focus-within:ring-2 focus-within:ring-purple-500/30 focus-within:border-purple-400 ${baseContainer}`}
        onClick={() => { inputRef.current?.focus(); openDropdown(); }}
      >
        {/* Chips */}
        {value.map((cat) => (
          <span key={cat.id} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${chipBg}`}>
            {cat.name}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemove(cat.id); }}
              className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity leading-none"
              aria-label={`Quitar ${cat.name}`}
            >
              ×
            </button>
          </span>
        ))}
        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); openDropdown(); }}
          onFocus={() => openDropdown()}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className={`flex-1 min-w-[120px] bg-transparent outline-none text-sm ${inputColor}`}
        />
      </div>
      {dropdown}
    </div>
  );
}
