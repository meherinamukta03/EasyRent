"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";

import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_RENTAL_TYPES,
} from "@/constants/equipment";
import type {
  EquipmentAvailability,
  PublicEquipmentSort,
} from "@/types/equipment";

export interface EquipmentFilterState {
  category: string;
  rentalType: string;
  minPrice: string;
  maxPrice: string;
  availability: EquipmentAvailability | "";
  sort: PublicEquipmentSort;
}

interface EquipmentFiltersProps {
  filters: EquipmentFilterState;
  priceError?: string;
  activeFilterCount: number;
  onChange: <K extends keyof EquipmentFilterState>(
    key: K,
    value: EquipmentFilterState[K]
  ) => void;
  onReset: () => void;
}

const labelClass =
  "mb-2 block text-xs font-semibold tracking-wide text-slate-600 uppercase";

const controlClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export default function EquipmentFilters({
  filters,
  priceError,
  activeFilterCount,
  onChange,
  onReset,
}: EquipmentFiltersProps) {
  return (
    <section
      aria-labelledby="equipment-filters-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03] md:p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
          </span>

          <div>
            <h2
              id="equipment-filters-heading"
              className="text-base font-bold text-slate-900"
            >
              Filter Equipment
            </h2>
            <p className="text-xs text-slate-500">
              Narrow results by category, rental type, price, and availability.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={activeFilterCount === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reset Filters
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div>
          <label htmlFor="filter-category" className={labelClass}>
            Category
          </label>

          <select
            id="filter-category"
            value={filters.category}
            onChange={(event) => onChange("category", event.target.value)}
            className={controlClass}
          >
            <option value="">All Categories</option>
            {EQUIPMENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-rental-type" className={labelClass}>
            Rental Type
          </label>

          <select
            id="filter-rental-type"
            value={filters.rentalType}
            onChange={(event) => onChange("rentalType", event.target.value)}
            className={controlClass}
          >
            <option value="">All Rental Types</option>
            {EQUIPMENT_RENTAL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-availability" className={labelClass}>
            Availability
          </label>

          <select
            id="filter-availability"
            value={filters.availability}
            onChange={(event) =>
              onChange(
                "availability",
                event.target.value as EquipmentFilterState["availability"]
              )
            }
            className={controlClass}
          >
            <option value="">All availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-sort" className={labelClass}>
            Sort By
          </label>

          <select
            id="filter-sort"
            value={filters.sort}
            onChange={(event) =>
              onChange("sort", event.target.value as PublicEquipmentSort)
            }
            className={controlClass}
          >
            <option value="recent">Recently Added</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-min-price" className={labelClass}>
            Min Price (৳)
          </label>

          <input
            id="filter-min-price"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="0"
            value={filters.minPrice}
            onChange={(event) => onChange("minPrice", event.target.value)}
            className={controlClass}
          />
        </div>

        <div>
          <label htmlFor="filter-max-price" className={labelClass}>
            Max Price (৳)
          </label>

          <input
            id="filter-max-price"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Any"
            value={filters.maxPrice}
            onChange={(event) => onChange("maxPrice", event.target.value)}
            className={controlClass}
          />
        </div>
      </div>

      {priceError ? (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
          {priceError}
        </p>
      ) : null}

      {activeFilterCount > 0 ? (
        <p className="mt-4 text-xs font-medium text-slate-500">
          {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"} active
        </p>
      ) : null}
    </section>
  );
}
