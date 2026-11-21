"use client";

import { Loader2, Search, X } from "lucide-react";

interface EquipmentSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSearching?: boolean;
}

export default function EquipmentSearch({
  value,
  onChange,
  onSubmit,
  isSearching = false,
}: EquipmentSearchProps) {
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex w-full flex-col gap-3 sm:flex-row"
    >
      <div className="relative min-w-0 flex-1">
        <label htmlFor="equipment-search" className="sr-only">
          Search equipment by name or location
        </label>

        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400"
        />

        <input
          id="equipment-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by equipment name or location..."
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-11 pl-11 text-sm text-slate-800 shadow-sm shadow-slate-900/[0.02] outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 [&::-webkit-search-cancel-button]:hidden"
        />

        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSearching}
        className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSearching ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Search className="size-4" aria-hidden="true" />
        )}
        Search
      </button>
    </form>
  );
}
