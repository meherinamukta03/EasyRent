import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FileText,
  MapPin,
  Package,
  UserRound,
  XCircle,
} from "lucide-react";

import BookingModal from "@/components/equipment/BookingModal";
import FavoriteButton from "@/components/equipment/FavoriteButton";
import { requireUser } from "@/lib/auth-server";
import { getPublicEquipmentById } from "@/lib/actions/equipment";
import { isEquipmentAvailable } from "@/types/equipment";

const PLACEHOLDER_IMAGE = "/images/equipment-placeholder.svg";

interface EquipmentDetailsPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Equipment Details | EasyRent",
  description: "View details of approved rental equipment on EasyRent.",
};

function formatPrice(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Price on request";
  }

  return `৳${value.toLocaleString("en-US")}`;
}

function InfoCard({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Package;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
        <Icon className="size-3.5 text-emerald-600" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium break-words text-slate-900">
        {children}
      </dd>
    </div>
  );
}

export default async function EquipmentDetailsPage({
  params,
}: EquipmentDetailsPageProps) {
  // This route is private: guests are redirected by the shared auth helper.
  await requireUser();

  const { id } = await params;
  const equipment = await getPublicEquipmentById(id);

  if (!equipment) {
    notFound();
  }

  const available = isEquipmentAvailable(equipment.quantity);
  const rentalType = equipment.rentalType || "Daily";
  const owner = equipment.ownerInfo;

  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Link
          href="/all-equipment"
          className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:text-emerald-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to all equipment
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="aspect-[4/3] w-full bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={equipment.image || PLACEHOLDER_IMAGE}
                  alt={equipment.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileText className="size-4 text-emerald-600" aria-hidden="true" />
                Description
              </h2>
              <p className="mt-2 leading-7 text-slate-600 whitespace-pre-line">
                {equipment.description || "No description provided."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <Package className="size-3.5" aria-hidden="true" />
                  {equipment.category || "Equipment"}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
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
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                {equipment.name}
              </h1>

              <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="size-4 text-emerald-600" aria-hidden="true" />
                {equipment.location || "Location not specified"}
              </p>

              <div className="mt-6 rounded-xl bg-slate-50 p-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Rental price
                    </p>
                    <p className="mt-1 text-3xl font-bold text-slate-900">
                      {formatPrice(equipment.rentalPrice)}
                      <span className="text-base font-medium text-slate-500">
                        {" "}
                        / {rentalType.toLowerCase()}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Available quantity
                    </p>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">
                      {equipment.quantity ?? 0}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <BookingModal
                    equipment={{
                      id: equipment._id,
                      name: equipment.name,
                      image: equipment.image,
                      rentalPrice: equipment.rentalPrice,
                      rentalType: equipment.rentalType,
                      quantity: equipment.quantity,
                    }}
                  />
                  <FavoriteButton
                    equipmentId={equipment._id}
                    equipment={{
                      _id: equipment._id,
                      name: equipment.name,
                      image: equipment.image,
                      category: equipment.category,
                      rentalPrice: equipment.rentalPrice,
                      rentalType: equipment.rentalType,
                      location: equipment.location,
                      quantity: equipment.quantity,
                    }}
                  />
                </div>
              </div>

              <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
                <InfoCard icon={CalendarClock} label="Rental type">
                  {rentalType}
                </InfoCard>
                <InfoCard icon={Package} label="Category">
                  {equipment.category || "Equipment"}
                </InfoCard>
                <InfoCard icon={MapPin} label="Location">
                  {equipment.location || "Not specified"}
                </InfoCard>
                <InfoCard icon={Package} label="Quantity in stock">
                  {equipment.quantity ?? 0}
                </InfoCard>
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <UserRound
                  className="size-4 text-emerald-600"
                  aria-hidden="true"
                />
                Owner Information
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <InfoCard icon={UserRound} label="Name">
                  {owner?.name || "Not provided"}
                </InfoCard>
                <InfoCard icon={UserRound} label="Email">
                  {owner?.email || "Not provided"}
                </InfoCard>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileText
                  className="size-4 text-emerald-600"
                  aria-hidden="true"
                />
                Rental Terms & Conditions
              </h2>
              <p className="mt-2 leading-7 text-slate-600 whitespace-pre-line">
                {equipment.terms || "No special terms were provided for this equipment."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
