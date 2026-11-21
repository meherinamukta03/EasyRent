
"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { getOwnerRentals } from "@/lib/actions/rental";

type Rental = {
  _id: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  equipmentInfo: {
    name: string;
    image?: string;
  };
  rentalDuration: {
    startDate: string;
    endDate: string;
  };
  requiredQuantity: number;
  bookingAmount: number;
  paymentStatus: string;
  bookingStatus: string;
};

export default function MyRentalsPage() {
  const { data: session, isPending } = authClient.useSession();

  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRentals = async () => {
      if (isPending) return;

      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getOwnerRentals(session.user.email);

        console.log("Rental Data:", data);

        if (Array.isArray(data)) {
          setRentals(data);
        } else {
          setRentals([]);
          setError("Invalid rental data received from server.");
        }
      } catch (error) {
        console.log("Fetch Rental Error:", error);
        setError("Failed to load rentals. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, [session?.user?.email, isPending]);

  // Session Loading
  if (isPending || loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-slate-500">Loading rentals...</p>
      </div>
    );
  }

  // User Not Logged In
  if (!session?.user?.email) {
    return (
      <div className="p-10 text-center">
        <h2 className="font-semibold text-slate-700">
          Please Login First
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Login to view your equipment rentals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          My Equipment Rentals
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage rental bookings for your equipment.
        </p>
      </div>

      {/* Total Rentals */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Total Rentals
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-800">
          {rentals.length}
        </h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Rental Table */}
      <div className="overflow-x-auto rounded-xl border bg-white">

        {rentals.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="font-semibold text-slate-700">
              No Rentals Found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              No one has rented your equipment yet.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[1100px] text-left text-sm">

            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4">Customer Information</th>
                <th className="p-4">Equipment Information</th>
                <th className="p-4">Rental Duration</th>
                <th className="p-4">Required Quantity</th>
                <th className="p-4">Booking Amount</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Booking Status</th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {rentals.map((rental) => (
                <tr
                  key={rental._id}
                  className="hover:bg-slate-50"
                >

                  {/* Customer Information */}
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">
                      {rental.customerInfo?.name || "N/A"}
                    </p>

                    <p className="text-xs text-slate-500">
                      {rental.customerInfo?.email || "N/A"}
                    </p>

                    <p className="text-xs text-slate-500">
                      {rental.customerInfo?.phone || "N/A"}
                    </p>
                  </td>

                  {/* Equipment Information */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">

                      {rental.equipmentInfo?.image && (
                        <img
                          src={rental.equipmentInfo.image}
                          alt={rental.equipmentInfo?.name || "Equipment"}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      )}

                      <span className="font-medium text-slate-700">
                        {rental.equipmentInfo?.name || "N/A"}
                      </span>

                    </div>
                  </td>

                  {/* Rental Duration */}
                  <td className="p-4">
                    <p>
                      {rental.rentalDuration?.startDate
                        ? new Date(
                            rental.rentalDuration.startDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>

                    <p className="text-xs text-slate-500">
                      To:{" "}
                      {rental.rentalDuration?.endDate
                        ? new Date(
                            rental.rentalDuration.endDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </td>

                  {/* Quantity */}
                  <td className="p-4">
                    {rental.requiredQuantity ?? "N/A"}
                  </td>

                  {/* Booking Amount */}
                  <td className="p-4 font-semibold">
                    ৳{rental.bookingAmount ?? 0}
                  </td>

                  {/* Payment Status */}
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        rental.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {rental.paymentStatus || "Pending"}
                    </span>
                  </td>

                  {/* Booking Status */}
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        rental.bookingStatus === "Approved"
                          ? "bg-green-100 text-green-700"
                          : rental.bookingStatus === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : rental.bookingStatus === "Completed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {rental.bookingStatus || "Pending"}
                    </span>
                  </td>

                </tr>
              ))}

            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}
