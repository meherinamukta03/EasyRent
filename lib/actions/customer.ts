"use server";

import { requireRole, requireUser } from "@/lib/auth-server";
import {
  fetchEquipmentAvailability,
  getApiBaseUrl,
  type AvailabilityResult,
} from "@/services/equipment.service";
import type {
  BookingInput,
  FavoriteEquipment,
  FavoriteItem,
  RentalBooking,
} from "@/types/customer";

/**
 * All customer actions derive the email from the verified server session.
 * No email or user id supplied by the browser is ever trusted.
 */
async function getCurrentUser() {
  const session = await requireUser();

  if (!session.user.email) {
    throw new Error("Your account is missing an email address");
  }

  return session.user;
}

async function getCurrentCustomer() {
  const session = await requireRole("customer");

  if (!session.user.email) {
    throw new Error("Your account is missing an email address");
  }

  return session.user;
}

export async function getMyRentals(): Promise<RentalBooking[]> {
  const user = await getCurrentUser();

  const response = await fetch(
    `${getApiBaseUrl()}/customer/rentals?email=${encodeURIComponent(user.email)}`,
    { cache: "no-store" }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Failed to load your rentals"
    );
  }

  return Array.isArray(data) ? (data as RentalBooking[]) : [];
}

export async function getMyFavorites(): Promise<FavoriteItem[]> {
  const user = await getCurrentCustomer();

  const response = await fetch(
    `${getApiBaseUrl()}/favorites?email=${encodeURIComponent(user.email)}`,
    { cache: "no-store" }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Failed to load your favorites"
    );
  }

  return Array.isArray(data) ? (data as FavoriteItem[]) : [];
}

export async function addFavorite(equipment: FavoriteEquipment) {
  const user = await getCurrentCustomer();
  const equipmentId = String(equipment?._id || "").trim();

  if (!equipmentId || !String(equipment?.name || "").trim()) {
    throw new Error("Invalid equipment");
  }

  // Only known fields are stored with the favorite snapshot.
  const payload = {
    customerEmail: user.email,
    customerId: user.id,
    equipmentId,
    equipment: {
      _id: equipmentId,
      name: String(equipment.name),
      image: typeof equipment.image === "string" ? equipment.image : "",
      category:
        typeof equipment.category === "string" ? equipment.category : "",
      rentalPrice:
        typeof equipment.rentalPrice === "number" ? equipment.rentalPrice : 0,
      rentalType:
        typeof equipment.rentalType === "string" ? equipment.rentalType : "",
      location: typeof equipment.location === "string" ? equipment.location : "",
      quantity: typeof equipment.quantity === "number" ? equipment.quantity : 0,
    },
  };

  const response = await fetch(`${getApiBaseUrl()}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Failed to add favorite"
    );
  }

  return data as { message?: string; favorite?: FavoriteItem };
}

export async function removeFavorite(equipmentId: string) {
  const user = await getCurrentCustomer();
  const id = String(equipmentId || "").trim();

  if (!id) {
    throw new Error("Invalid equipment");
  }

  const response = await fetch(
    `${getApiBaseUrl()}/favorites?email=${encodeURIComponent(
      user.email
    )}&equipmentId=${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Failed to remove favorite"
    );
  }

  return data as { message?: string; deletedCount?: number };
}

export async function checkBookingAvailability(
  equipmentId: string,
  startDate: string,
  endDate: string
): Promise<AvailabilityResult> {
  if (!equipmentId || !startDate || !endDate) {
    throw new Error("Select rental dates to check availability");
  }

  // Availability is public data; the session check keeps this action private.
  await requireUser();

  return fetchEquipmentAvailability(equipmentId, startDate, endDate);
}

/**
 * Creates a Stripe Checkout Session for a booking that already exists. The
 * backend re-reads the booking and its server-calculated amount; the browser
 * only sends the booking id plus the session-derived email.
 */
export async function createCheckoutSession(
  bookingId: string
): Promise<{ checkoutUrl: string; sessionId: string }> {
  const user = await getCurrentCustomer();

  if (!bookingId) {
    throw new Error("Invalid booking");
  }

  const response = await fetch(`${getApiBaseUrl()}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, customerEmail: user.email }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Failed to start secure checkout"
    );
  }

  if (typeof data?.checkoutUrl !== "string" || !data.checkoutUrl) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return {
    checkoutUrl: data.checkoutUrl,
    sessionId: typeof data.sessionId === "string" ? data.sessionId : "",
  };
}

export async function getMyBookingById(
  id: string
): Promise<RentalBooking | null> {
  if (!id) return null;

  // Reuse the customer-scoped fetch so another user's booking can never be
  // returned even if its id is known.
  const bookings = await getMyRentals();

  return bookings.find((booking) => booking._id === id) ?? null;
}

export async function createBooking(input: BookingInput): Promise<RentalBooking> {
  const user = await getCurrentCustomer();

  const equipmentId = String(input?.equipmentId || "").trim();
  const startDate = String(input?.rentalStartDate || "").trim();
  const endDate = String(input?.rentalEndDate || "").trim();
  const requiredQuantity = Number(input?.requiredQuantity);
  const contactNumber = String(input?.contactNumber || "").trim();
  const deliveryAddress = String(input?.deliveryAddress || "").trim();

  if (!equipmentId) {
    throw new Error("Invalid equipment");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Select valid rental dates");
  }

  const startDay = new Date(start);
  startDay.setHours(0, 0, 0, 0);

  if (startDay < today) {
    throw new Error("Rental start date cannot be in the past");
  }

  if (end <= start) {
    throw new Error("Rental end date must be after the start date");
  }

  if (!Number.isInteger(requiredQuantity) || requiredQuantity < 1) {
    throw new Error("Required quantity must be a positive whole number");
  }

  if (!/^\d{7,15}$/.test(contactNumber.replace(/[\s-]/g, ""))) {
    throw new Error("Enter a valid contact number");
  }

  if (deliveryAddress.length < 5) {
    throw new Error("Enter a valid delivery address");
  }

  // No amount is sent from the browser. The API re-reads the equipment,
  // recalculates the total, and re-checks overlapping availability.
  const payload = {
    equipmentId,
    customerEmail: user.email,
    customerId: user.id,
    customerName: user.name || "",
    rentalStartDate: startDate,
    rentalEndDate: endDate,
    requiredQuantity,
    contactNumber,
    deliveryAddress,
    notes: String(input?.notes || "").trim(),
  };

  const response = await fetch(`${getApiBaseUrl()}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Failed to create booking"
    );
  }

  return data?.booking as RentalBooking;
}
