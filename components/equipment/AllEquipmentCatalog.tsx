"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, PackageSearch, RotateCcw } from "lucide-react";

import EquipmentCard from "@/components/equipment/EquipmentCard";
import EquipmentFilters, {
  type EquipmentFilterState,
} from "@/components/equipment/EquipmentFilters";
import EquipmentSearch from "@/components/equipment/EquipmentSearch";
import type { Equipment } from "@/types/equipment";

const DEBOUNCE_MS = 350;

const DEFAULT_FILTERS: EquipmentFilterState = {
  category: "",
  rentalType: "",
  minPrice: "",
  maxPrice: "",
  availability: "",
  sort: "recent",
};

interface AllEquipmentCatalogProps {
  initialEquipment: Equipment[];
  initialError?: boolean;
  initialCategory?: string;
}

interface CatalogRequest {
  search: string;
  filters: EquipmentFilterState;
}

function getPriceError(filters: EquipmentFilterState) {
  const { minPrice, maxPrice } = filters;

  if (!minPrice || !maxPrice) return "";

  return Number(minPrice) > Number(maxPrice)
    ? "Minimum price cannot be greater than maximum price."
    : "";
}

function CatalogSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="aspect-[4/3] animate-pulse rounded-xl bg-slate-100" />
          <div className="space-y-3 p-2">
            <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AllEquipmentCatalog({
  initialEquipment,
  initialError = false,
  initialCategory = "",
}: AllEquipmentCatalogProps) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<EquipmentFilterState>(() => ({
    ...DEFAULT_FILTERS,
    category: initialCategory,
  }));
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    initialError
      ? "We could not load the equipment right now. Please try again."
      : null
  );

  const isFirstRenderRef = useRef(true);
  const requestIdRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRequestRef = useRef<CatalogRequest>({ search, filters });

  const priceError = getPriceError(filters);

  const runFetch = useCallback(async (requestId: number) => {
    const { search: latestSearch, filters: latestFilters } =
      latestRequestRef.current;
    const params = new URLSearchParams();
    const trimmedSearch = latestSearch.trim();

    if (trimmedSearch) params.set("search", trimmedSearch);
    if (latestFilters.category) params.set("category", latestFilters.category);
    if (latestFilters.rentalType) {
      params.set("rentalType", latestFilters.rentalType);
    }
    if (latestFilters.minPrice) params.set("minPrice", latestFilters.minPrice);
    if (latestFilters.maxPrice) params.set("maxPrice", latestFilters.maxPrice);
    if (latestFilters.availability) {
      params.set("availability", latestFilters.availability);
    }
    params.set("sort", latestFilters.sort);

    const query = params.toString();

    try {
      const response = await fetch(
        `/api/public-equipments${query ? `?${query}` : ""}`,
        { cache: "no-store" }
      );
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : "Failed to load equipment. Please try again."
        );
      }

      if (requestIdRef.current !== requestId) return;

      setEquipment(Array.isArray(data) ? (data as Equipment[]) : []);
      setError(null);
    } catch (fetchError) {
      if (requestIdRef.current !== requestId) return;

      setEquipment([]);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load equipment. Please try again."
      );
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // The server already provided the initial catalogue.
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    // With an invalid price range, wait for the user to correct it so no
    // meaningless request is sent to the backend.
    if (priceError) return;

    latestRequestRef.current = { search, filters };
    const requestId = ++requestIdRef.current;
    const timer = setTimeout(() => {
      debounceTimerRef.current = null;
      void runFetch(requestId);
    }, DEBOUNCE_MS);

    debounceTimerRef.current = timer;

    return () => {
      clearTimeout(timer);

      if (debounceTimerRef.current === timer) {
        debounceTimerRef.current = null;
      }
    };
  }, [search, filters, priceError, runFetch]);

  function fetchNow() {
    if (priceError) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    latestRequestRef.current = { search, filters };
    const requestId = ++requestIdRef.current;

    setIsLoading(true);
    setError(null);
    void runFetch(requestId);
  }

  function handleSearchChange(value: string) {
    setSearch(value);

    if (!priceError) {
      setIsLoading(true);
      setError(null);
    }
  }

  function handleFilterChange<K extends keyof EquipmentFilterState>(
    key: K,
    value: EquipmentFilterState[K]
  ) {
    const nextFilters = { ...filters, [key]: value };

    setFilters(nextFilters);

    if (!getPriceError(nextFilters)) {
      setIsLoading(true);
      setError(null);
    }
  }

  function resetAll() {
    setSearch("");
    setFilters(DEFAULT_FILTERS);
  }

  const activeFilterCount =
    Number(Boolean(search.trim())) +
    Number(Boolean(filters.category)) +
    Number(Boolean(filters.rentalType)) +
    Number(Boolean(filters.minPrice)) +
    Number(Boolean(filters.maxPrice)) +
    Number(Boolean(filters.availability)) +
    Number(filters.sort !== "recent");

  return (
    <div className="space-y-6">
      <section
        aria-label="Search equipment"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03] md:p-6"
      >
        <EquipmentSearch
          value={search}
          onChange={handleSearchChange}
          onSubmit={fetchNow}
          isSearching={isLoading}
        />
      </section>

      <EquipmentFilters
        filters={filters}
        priceError={priceError}
        activeFilterCount={activeFilterCount}
        onChange={handleFilterChange}
        onReset={resetAll}
      />

      <div
        aria-live="polite"
        className="flex min-h-6 flex-wrap items-center justify-between gap-2"
      >
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">
            {equipment.length}
          </span>{" "}
          {equipment.length === 1 ? "item" : "items"} found
        </p>

        {isLoading ? (
          <p className="text-xs font-medium text-emerald-700">
            Updating results...
          </p>
        ) : null}
      </div>

      {error ? (
        <div
          role="alert"
          className="flex flex-col items-center rounded-2xl border border-red-100 bg-white px-6 py-14 text-center shadow-sm"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Something went wrong
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-600">{error}</p>
          <button
            type="button"
            onClick={fetchNow}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : isLoading && equipment.length === 0 ? (
        <CatalogSkeleton />
      ) : equipment.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <PackageSearch className="size-7" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-slate-900">
            No equipment found
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-600">
            Try a different name or location, or adjust your filters.
          </p>
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={resetAll}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {equipment.map((item) => (
            <div key={item._id} className="flex h-full">
              <EquipmentCard equipment={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
