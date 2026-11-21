"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Heart,
  PackageSearch,
  RotateCcw,
  XCircle,
} from "lucide-react";

import { showError, showSuccess } from "@/components/ui/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyFavorites, removeFavorite } from "@/lib/actions/customer";
import { isEquipmentAvailable } from "@/types/equipment";
import type { FavoriteItem } from "@/types/customer";

const PLACEHOLDER_IMAGE = "/images/equipment-placeholder.svg";

function formatPrice(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";

  return `৳${value.toLocaleString("en-US")}`;
}

function FavoriteImage({ src, name }: { src?: string; name?: string }) {
  const [failed, setFailed] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={!src || failed ? PLACEHOLDER_IMAGE : src}
      alt={name || "Equipment"}
      loading="lazy"
      onError={() => setFailed(true)}
      className="size-14 rounded-lg border border-slate-200 bg-slate-100 object-cover"
    />
  );
}

function TableSkeleton() {
  return (
    <TableBody aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <TableRow key={index}>
          {Array.from({ length: 8 }).map((__, cell) => (
            <TableCell key={cell}>
              <div className="h-4 w-16 animate-pulse rounded-full bg-slate-100" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

export default function FavoritesTable() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const requestRef = useRef(0);

  const loadFavorites = useCallback(async () => {
    const currentRequest = ++requestRef.current;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getMyFavorites();

      if (requestRef.current !== currentRequest) return;
      setFavorites(data);
    } catch (fetchError) {
      if (requestRef.current !== currentRequest) return;
      setFavorites([]);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load your favorites"
      );
    } finally {
      if (requestRef.current === currentRequest) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Data fetching on mount; state updates happen after the async request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFavorites();
  }, [loadFavorites]);

  async function handleRemove(item: FavoriteItem) {
    if (removingId) return;

    setRemovingId(item.equipmentId);

    try {
      await removeFavorite(item.equipmentId);
      setFavorites((current) =>
        current.filter((favorite) => favorite._id !== item._id)
      );
      showSuccess("Removed from favorites");
    } catch (removeError) {
      showError(
        removeError instanceof Error
          ? removeError.message
          : "Failed to remove favorite"
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span className="inline-flex items-center gap-2">
            <AlertCircle className="size-4" aria-hidden="true" />
            {error}
          </span>
          <button
            type="button"
            onClick={() => void loadFavorites()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold transition hover:bg-red-50"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Equipment Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Rental Price</TableHead>
              <TableHead>Rental Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          {isLoading ? (
            <TableSkeleton />
          ) : favorites.length > 0 ? (
            <TableBody>
              {favorites.map((item) => {
                const equipment = item.equipment || {};
                const available = isEquipmentAvailable(equipment.quantity);

                return (
                  <TableRow key={item._id}>
                    <TableCell>
                      <FavoriteImage
                        src={equipment.image}
                        name={equipment.name}
                      />
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {equipment.name || "Equipment"}
                    </TableCell>
                    <TableCell>{equipment.category || "—"}</TableCell>
                    <TableCell className="font-semibold text-emerald-700">
                      {formatPrice(equipment.rentalPrice)}
                    </TableCell>
                    <TableCell>{equipment.rentalType || "—"}</TableCell>
                    <TableCell>{equipment.location || "—"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          available
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {available ? (
                          <CheckCircle2 className="size-3.5" aria-hidden="true" />
                        ) : (
                          <XCircle className="size-3.5" aria-hidden="true" />
                        )}
                        {available ? "Available" : "Unavailable"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/all-equipment/${item.equipmentId}`}
                          className="inline-flex h-8 items-center rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700"
                        >
                          View Details
                        </Link>
                        <button
                          type="button"
                          disabled={removingId === item.equipmentId}
                          onClick={() => void handleRemove(item)}
                          aria-label={`Remove ${equipment.name || "equipment"} from favorites`}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-red-500 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Heart
                            className="size-4"
                            fill="currentColor"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          ) : null}
        </Table>

        {!isLoading && !error && favorites.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <PackageSearch className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-900">
              No favorites yet
            </h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              Save equipment you like to find it quickly here later.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
