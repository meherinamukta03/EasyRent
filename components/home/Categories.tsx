"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowUpRight,
  Camera,
  HardHat,
  Laptop,
  Package,
  PartyPopper,
  RotateCcw,
  Tractor,
  Truck,
  type LucideIcon,
} from "lucide-react";

import type { EquipmentCategoryCount } from "@/types/equipment";

const EASE = [0.22, 1, 0.36, 1] as const;

const MotionLink = motion.create(Link);

interface CategoryDefinition {
  label: string;
  /** Stored category values that belong to this displayed category. */
  values: string[];
  description: string;
  icon: LucideIcon;
  iconClass: string;
}

interface DisplayCategory extends CategoryDefinition {
  count: number;
  /** Exact stored value used by the All Equipment category filter. */
  filterValue: string;
}

const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    label: "Construction Equipment",
    values: ["Construction", "Construction Equipment"],
    description: "Heavy machinery, tools and gear for every build site.",
    icon: HardHat,
    iconClass: "bg-amber-100 text-amber-700",
  },
  {
    label: "Photography Equipment",
    values: ["Photography", "Photography Equipment", "Camera", "Cameras"],
    description: "Cameras, lenses, lighting and studio accessories.",
    icon: Camera,
    iconClass: "bg-violet-100 text-violet-700",
  },
  {
    label: "Vehicles & Transportation",
    values: ["Vehicles", "Vehicle", "Vehicles & Transportation", "Transportation"],
    description: "Cars, vans and transport for people or cargo.",
    icon: Truck,
    iconClass: "bg-sky-100 text-sky-700",
  },
  {
    label: "Agriculture Equipment",
    values: ["Agriculture", "Agricultural", "Agriculture Equipment"],
    description: "Tractors, harvesters and modern farming tools.",
    icon: Tractor,
    iconClass: "bg-lime-100 text-lime-700",
  },
  {
    label: "Electronics",
    values: ["Electronics", "Electronic"],
    description: "Audio, monitoring and electronic devices of all kinds.",
    icon: Laptop,
    iconClass: "bg-indigo-100 text-indigo-700",
  },
  {
    label: "Event Equipment",
    values: ["Event", "Events", "Event Equipment"],
    description: "Stage, sound, lighting and party essentials.",
    icon: PartyPopper,
    iconClass: "bg-rose-100 text-rose-700",
  },
];

function buildCategories(raw: EquipmentCategoryCount[]): DisplayCategory[] {
  const counts = raw
    .map((entry) => ({
      value: String(entry.category || "").trim(),
      count: Number(entry.count) || 0,
    }))
    .filter((entry) => entry.value && entry.count > 0);

  return CATEGORY_DEFINITIONS.map((definition) => {
    const matches = counts.filter((entry) =>
      definition.values.some(
        (value) => value.toLowerCase() === entry.value.toLowerCase()
      )
    );

    // Prefer the stored value with the most equipment so the catalogue filter
    // opens on the variant that actually has listings.
    const primary = [...matches].sort((a, b) => b.count - a.count)[0];

    return {
      ...definition,
      count: matches.reduce((total, entry) => total + entry.count, 0),
      filterValue: primary?.value || definition.values[0],
    };
  }).filter((category) => category.count > 0);
}

function CategorySkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {CATEGORY_DEFINITIONS.map((category) => (
        <div
          key={category.label}
          className="rounded-2xl border border-amber-100/80 bg-white p-5 shadow-sm"
        >
          <div className="size-12 animate-pulse rounded-xl bg-slate-100" />
          <div className="mt-4 h-5 w-2/3 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-slate-100" />
          <div className="mt-2 h-4 w-4/5 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-5 h-6 w-20 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function Categories() {
  const shouldReduceMotion = useReducedMotion();

  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/public-categories", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            typeof data?.message === "string"
              ? data.message
              : "We could not load categories right now."
          );
        }

        if (controller.signal.aborted) return;

        setCategories(
          buildCategories(Array.isArray(data) ? (data as EquipmentCategoryCount[]) : [])
        );
        setError(null);
      })
      .catch((fetchError: unknown) => {
        if (controller.signal.aborted) return;

        setCategories([]);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "We could not load categories right now."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  function retry() {
    setIsLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }

  const headingVariants: Variants = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: EASE },
        },
      };

  return (
    <section
      aria-labelledby="categories-heading"
      className="relative isolate overflow-hidden bg-linear-to-b from-[#fffaf5] via-white to-white py-16 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="absolute top-10 left-1/2 -z-10 size-[26rem] -translate-x-1/2 rounded-full bg-amber-100/40 blur-3xl"
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={headingVariants}
          className="mb-10 text-center sm:mb-12"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-emerald-300 sm:w-12" />
            <span className="text-xs font-bold tracking-[0.2em] text-emerald-700 uppercase">
              Popular Categories
            </span>
            <span className="h-px w-8 bg-emerald-300 sm:w-12" />
          </div>

          <h2
            id="categories-heading"
            className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Explore Equipment by Category
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Discover verified equipment categories from our real-time database
            and find the right gear for your next project.
          </p>
        </motion.div>

        {error ? (
          <div
            role="alert"
            className="flex flex-col items-center rounded-2xl border border-red-100 bg-white px-6 py-14 text-center shadow-sm"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <RotateCcw className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Couldn&apos;t load categories
            </h3>
            <p className="mt-1 max-w-md text-sm text-slate-600">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <CategorySkeleton />
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              No categories available yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Categories appear here once approved equipment is listed. Check
              back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => {
              const Icon = category.icon;

              return (
                <MotionLink
                  key={category.label}
                  href={`/all-equipment?category=${encodeURIComponent(
                    category.filterValue
                  )}`}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : { y: -6, transition: { duration: 0.2, ease: "easeOut" } }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.45,
                    delay: shouldReduceMotion ? 0 : index * 0.07,
                    ease: EASE,
                  }}
                  className="group flex h-full flex-col rounded-2xl border border-amber-100 bg-white p-5 shadow-sm shadow-amber-900/[0.03] transition-colors duration-300 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/[0.06] focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <span
                    className={`flex size-12 items-center justify-center rounded-xl ${category.iconClass}`}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </span>

                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    {category.label}
                  </h3>

                  <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-500">
                    {category.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <Package className="size-3.5" aria-hidden="true" />
                      {category.count} {category.count === 1 ? "item" : "items"}
                    </span>

                    <ArrowUpRight
                      className="size-5 text-slate-300 transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600"
                      aria-hidden="true"
                    />
                  </div>
                </MotionLink>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
