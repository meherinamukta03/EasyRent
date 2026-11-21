"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";

import { showError, showSuccess } from "@/components/ui/toast";
import {
  addFavorite,
  getMyFavorites,
  removeFavorite,
} from "@/lib/actions/customer";
import { authClient } from "@/lib/auth-client";
import type { FavoriteEquipment } from "@/types/customer";

interface FavoriteButtonProps {
  equipmentId: string;
  equipment: FavoriteEquipment;
}

export default function FavoriteButton({
  equipmentId,
  equipment,
}: FavoriteButtonProps) {
  const { data: session, isPending } = authClient.useSession();
  const isCustomer = session?.user?.role === "customer";
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!isCustomer) return;

    let active = true;

    getMyFavorites()
      .then((items) => {
        if (active) {
          setIsFavorite(items.some((item) => item.equipmentId === equipmentId));
        }
      })
      .catch(() => {
        // Favorite state is optional UI; failures are not worth an error toast.
      });

    return () => {
      active = false;
    };
  }, [equipmentId, isCustomer]);

  async function handleToggle() {
    if (isBusy || !isCustomer) return;

    setIsBusy(true);

    try {
      if (isFavorite) {
        await removeFavorite(equipmentId);
        setIsFavorite(false);
        showSuccess("Removed from favorites");
      } else {
        await addFavorite({ ...equipment, _id: equipmentId });
        setIsFavorite(true);
        showSuccess("Added to favorites");
      }
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Could not update favorites"
      );
    } finally {
      setIsBusy(false);
    }
  }

  if (isPending) {
    return <div className="size-11 animate-pulse rounded-xl bg-slate-100" />;
  }

  // Only customers can save favorites. Owners/admins see no action here.
  if (session?.user && !isCustomer) {
    return null;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
      >
        <Heart className="size-4" aria-hidden="true" />
        Sign in to save
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void handleToggle()}
      disabled={isBusy}
      aria-pressed={isFavorite}
      className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isFavorite
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
      }`}
    >
      {isBusy ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Heart
          className="size-4"
          fill={isFavorite ? "currentColor" : "none"}
          aria-hidden="true"
        />
      )}
      {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
    </button>
  );
}
