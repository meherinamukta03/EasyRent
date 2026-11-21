"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  MapPin,
  XCircle,
} from "lucide-react";

import {
  isEquipmentAvailable,
  type Equipment,
} from "@/types/equipment";

const PLACEHOLDER_IMAGE = "/images/equipment-placeholder.svg";

interface EquipmentCardProps {
  equipment: Equipment;
}

function formatPrice(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Price on request";
  }

  return `৳${value.toLocaleString("en-US")}`;
}

export default function EquipmentCard({ equipment }: EquipmentCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const available = isEquipmentAvailable(equipment.quantity);
  const imageSrc =
    !equipment.image || imageFailed ? PLACEHOLDER_IMAGE : equipment.image;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/[0.07]">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={equipment.name}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <span className="absolute top-3 left-3 inline-flex max-w-[70%] truncate rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-900/5 backdrop-blur">
          {equipment.category || "Equipment"}
        </span>

        <span
          className={`absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 backdrop-blur ${
            available
              ? "bg-emerald-50/95 text-emerald-700 ring-emerald-600/10"
              : "bg-red-50/95 text-red-700 ring-red-600/10"
          }`}
        >
          {available ? (
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
          ) : (
            <XCircle className="size-3.5" aria-hidden="true" />
          )}
          {available ? "Available" : "Unavailable"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 min-h-12 text-lg leading-6 font-bold tracking-tight text-slate-900">
          {equipment.name}
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span className="line-clamp-1">{equipment.location || "Location not specified"}</span>
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
            <CalendarClock className="size-3.5" aria-hidden="true" />
            {equipment.rentalType || "Daily"} rental
          </span>

          {typeof equipment.quantity === "number" ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
              {equipment.quantity} available
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-slate-400 uppercase">
              Rental price
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatPrice(equipment.rentalPrice)}
              {typeof equipment.rentalPrice === "number" ? (
                <span className="text-sm font-medium text-slate-500">
                  {" "}
                  / {(equipment.rentalType || "day").toLowerCase()}
                </span>
              ) : null}
            </p>
          </div>

          <Link
            href={`/all-equipment/${equipment._id}`}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            View Details
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
