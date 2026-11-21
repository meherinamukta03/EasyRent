export interface RentalQuote {
  rentalDays: number;
  rentalDuration: number;
  totalAmount: number;
}

/**
 * Client-side mirror of the backend `calculateRental` helper. It is used only
 * to show the customer an estimate; the API always recalculates the final
 * amount and never trusts a total sent by the browser.
 */
export function calculateRentalQuote(
  rentalPrice: number,
  rentalType: string | undefined,
  startDate: string,
  endDate: string,
  quantity: number
): RentalQuote | null {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const price = Number(rentalPrice);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start ||
    !Number.isFinite(price) ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    return null;
  }

  const rentalDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / 86_400_000)
  );
  const type = String(rentalType || "Daily").toLowerCase();

  let rentalDuration = rentalDays;

  if (type === "weekly") {
    rentalDuration = Math.max(1, Math.ceil(rentalDays / 7));
  } else if (type === "monthly") {
    rentalDuration = Math.max(1, Math.ceil(rentalDays / 30));
  }

  return {
    rentalDays,
    rentalDuration,
    totalAmount: price * rentalDuration * quantity,
  };
}

export function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return "—";

  return `৳${value.toLocaleString("en-US")}`;
}
