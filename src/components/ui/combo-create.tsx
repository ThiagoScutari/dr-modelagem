"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { Search, Plus, X, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CreateField {
  name: string;
  label: string;
  type?: "text" | "tel" | "email" | "number";
  required?: boolean;
  placeholder?: string;
}

interface ComboCreateProps<T> {
  items: T[];
  value: string | null;
  onChange: (value: string) => void;
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  placeholder?: string;
  createLabel: string;
  onCreateSubmit: (data: Record<string, string>) => Promise<T>;
  createFields: CreateField[];
  loading?: boolean;
  emptyIcon?: ReactNode;
}

export function ComboCreate<T>({
  items,
  value,
  onChange,
  getLabel,
  getValue,
  placeholder = "Buscar...",
  createLabel,
  onCreateSubmit,
  createFields,
  loading = false,
}: ComboCreateProps<T>) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find((item) => getValue(item) === value);

  const filtered = items.filter((item) =>
    getLabel(item).toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowCreateForm(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(item: T) {
    onChange(getValue(item));
    setQuery("");
    setOpen(false);
    setShowCreateForm(false);
  }

  function handleClear() {
    onChange("");
    setQuery("");
    setOpen(true);
  }

  async function handleCreate() {
    const requiredFields = createFields.filter((f) => f.required);
    const hasRequired = requiredFields.every((f) => formData[f.name]?.trim());
    if (!hasRequired) return;

    setCreating(true);
    const newItem = await onCreateSubmit(formData);
    setCreating(false);
    setFormData({});
    setShowCreateForm(false);
    handleSelect(newItem);
  }

  if (selectedItem && !open) {
    return (
      <div className="flex items-center justify-between input-base">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-floresta" />
          <span className="text-sm">{getLabel(selectedItem)}</span>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-noite/40 hover:text-noite/60"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-noite/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setShowCreateForm(false);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="input-base pl-9"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-ceu/20 bg-white shadow-float max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-mar" />
            </div>
          ) : filtered.length > 0 ? (
            <ul className="py-1">
              {filtered.map((item) => (
                <li key={getValue(item)}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full px-4 py-2.5 text-left text-sm text-noite hover:bg-espuma/30 transition-colors"
                  >
                    {getLabel(item)}
                  </button>
                </li>
              ))}
            </ul>
          ) : !showCreateForm ? (
            <div className="px-4 py-4 text-center">
              <p className="text-sm text-noite/50 mb-3">
                Nenhum resultado para &ldquo;{query}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(true);
                  setFormData(
                    createFields.reduce(
                      (acc, f) => {
                        acc[f.name] = f.name === createFields[0].name ? query : "";
                        return acc;
                      },
                      {} as Record<string, string>
                    )
                  );
                }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-mar hover:text-mar-dark"
              >
                <Plus className="h-4 w-4" />
                {createLabel} &ldquo;{query}&rdquo;
              </button>
            </div>
          ) : null}

          {/* Mini-formulário inline */}
          {showCreateForm && (
            <div className="border-t border-ceu/15 p-4 space-y-3">
              <p className="text-xs font-semibold text-noite/60 uppercase tracking-wide">
                {createLabel}
              </p>
              {createFields.map((field) => (
                <input
                  key={field.name}
                  type={field.type ?? "text"}
                  placeholder={field.placeholder ?? field.label}
                  value={formData[field.name] ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.name]: e.target.value,
                    }))
                  }
                  required={field.required}
                  className="input-base text-sm"
                />
              ))}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({});
                  }}
                  className="flex-1 rounded-lg border border-ceu/30 py-2 text-xs font-medium text-noite/60 hover:bg-creme"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating}
                  className={cn(
                    "flex-1 rounded-lg bg-mar py-2 text-xs font-medium text-white hover:bg-mar-dark disabled:opacity-60",
                    "inline-flex items-center justify-center gap-1"
                  )}
                >
                  {creating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Salvar e usar"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
