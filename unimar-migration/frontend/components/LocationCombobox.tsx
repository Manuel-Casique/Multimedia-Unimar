"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import api from "@/lib/api";

export interface PredefinedLocation {
  id: number;
  name: string;
  detail?: string;
}

// Overloads for single vs multiple mode
interface LocationComboboxSingleProps {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  darkMode?: boolean;
}

interface LocationComboboxMultipleProps {
  multiple: true;
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  darkMode?: boolean;
}

type LocationComboboxProps = LocationComboboxSingleProps | LocationComboboxMultipleProps;

export default function LocationCombobox(props: LocationComboboxProps) {
  const {
    multiple = false,
    placeholder = "Buscar ubicación...",
    className = "",
    darkMode = false,
  } = props;

  // For single mode
  const singleValue = !multiple ? (props.value as string) : "";
  const onChangeSingle = !multiple ? (props.onChange as (v: string) => void) : () => {};

  // For multiple mode
  const multiValue = multiple ? (props.value as string[]) : [];
  const onChangeMulti = multiple ? (props.onChange as (v: string[]) => void) : () => {};

  const [inputValue, setInputValue] = useState(multiple ? "" : singleValue);
  const [locations, setLocations] = useState<PredefinedLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Sync single value → input (only in single mode)
  useEffect(() => {
    if (!multiple) {
      setInputValue(singleValue);
    }
  }, [singleValue, multiple]);

  // Load location catalog
  const fetchLocations = useCallback(async () => {
    if (locations.length > 0) return;
    setLoading(true);
    try {
      const res = await api.get("/locations");
      setLocations(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Lazy load instead of on mount
  // useEffect(() => { fetchLocations(); }, [fetchLocations]);

  // Calculate dropdown position (position:fixed)
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

  const openDropdown = () => { 
    updateDropdownPosition(); 
    setIsOpen(true); 
    fetchLocations();
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Element;
      if (containerRef.current && !containerRef.current.contains(target) && !target.closest("[data-loc-dropdown]")) {
        setIsOpen(false);
        if (multiple) setInputValue("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [multiple]);

  // Recalculate on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const update = () => updateDropdownPosition();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [isOpen, updateDropdownPosition]);

  // Filter locations (in multiple mode, exclude already selected)
  const filtered = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      (multiple ? !multiValue.includes(l.name) : true)
  );

  const handleSelect = (loc: PredefinedLocation) => {
    if (multiple) {
      onChangeMulti([...multiValue, loc.name]);
      setInputValue("");
      inputRef.current?.focus();
      updateDropdownPosition();
    } else {
      setInputValue(loc.name);
      onChangeSingle(loc.name);
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!multiple) onChangeSingle(e.target.value);
    openDropdown();
  };

  const handleClear = () => {
    if (multiple) {
      // Clear all
      onChangeMulti([]);
    } else {
      setInputValue("");
      onChangeSingle("");
    }
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemoveChip = (name: string) => {
    if (multiple) onChangeMulti(multiValue.filter((v) => v !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && inputValue === "" && multiple && multiValue.length > 0) {
      onChangeMulti(multiValue.slice(0, -1));
    }
    if (e.key === "Escape") { setIsOpen(false); setInputValue(""); }
    if (e.key === "Tab") { setIsOpen(false); }
  };

  // Styles
  const baseContainer = darkMode
    ? "bg-slate-800 border-slate-700 text-white"
    : "bg-white border-slate-200 text-slate-800";
  const chipBg = darkMode
    ? "bg-[#30669a]/60 text-white"
    : "bg-[#30669a]/10 text-[#30669a]";
  const inputColor = darkMode
    ? "text-white placeholder-slate-400"
    : "text-slate-800 placeholder-slate-400";
  const dropdownBg = darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const itemHover = darkMode ? "hover:bg-slate-700 text-white" : "hover:bg-slate-50 text-slate-700";

  const dropdown = isOpen && mounted ? createPortal(
    <div data-loc-dropdown style={dropdownStyle} className={`border rounded-lg shadow-xl max-h-52 overflow-y-auto ${dropdownBg}`}>
      {loading ? (
        <div className="py-3 px-3 text-xs text-slate-400">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="py-3 px-3 text-xs text-slate-400 italic">
          {inputValue ? `Sin resultados para "${inputValue}"` : "No hay ubicaciones en el catálogo"}
        </div>
      ) : (
        filtered.map((loc) => (
          <button
            key={loc.id}
            type="button"
            data-loc-dropdown
            className={`w-full text-left px-3 py-2 text-sm transition-colors flex flex-col ${itemHover}`}
            onMouseDown={(e) => { e.preventDefault(); handleSelect(loc); }}
          >
            <span className="font-medium">{loc.name}</span>
            {loc.detail && <span className="text-xs opacity-60">{loc.detail}</span>}
          </button>
        ))
      )}
    </div>,
    document.body
  ) : null;

  // MULTIPLE mode render
  if (multiple) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <div
          className={`flex flex-wrap gap-1.5 items-center min-h-[38px] px-2 py-1.5 border rounded-lg cursor-text transition-all focus-within:ring-2 focus-within:ring-[#30669a]/30 focus-within:border-[#30669a] ${baseContainer}`}
          onClick={() => { inputRef.current?.focus(); openDropdown(); }}
        >
          {/* Chips */}
          {multiValue.map((name) => (
            <span key={name} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${chipBg}`}>
              {name}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemoveChip(name); }}
                className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity leading-none"
                aria-label={`Quitar ${name}`}
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
            onChange={handleInputChange}
            onFocus={() => openDropdown()}
            onKeyDown={handleKeyDown}
            placeholder={multiValue.length === 0 ? placeholder : ""}
            className={`flex-1 min-w-[120px] bg-transparent outline-none text-sm ${inputColor}`}
          />
        </div>
        {dropdown}
      </div>
    );
  }

  // SINGLE mode render (original behavior)
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className={`flex items-center border rounded-lg overflow-hidden transition-all focus-within:ring-2 focus-within:ring-[#30669a]/30 focus-within:border-[#30669a] ${baseContainer}`}>
        {/* Location icon */}
        <svg className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => openDropdown()}
          onKeyDown={(e) => { if (e.key === "Escape") { setIsOpen(false); } }}
          placeholder={placeholder}
          className="flex-1 px-2 py-2 bg-transparent outline-none text-sm"
        />
        {inputValue && (
          <button type="button" onClick={handleClear} className="px-2 text-slate-400 hover:text-slate-600">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {dropdown}
    </div>
  );
}
