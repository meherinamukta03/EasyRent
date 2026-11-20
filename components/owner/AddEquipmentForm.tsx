
"use client";

import Image from "next/image";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "../ui/toast";

const categories = [
  "Electronics",
  "Construction",
  "Agriculture",
  "Vehicles",
  "Tools",
  "Other",
];

const rentalTypes = ["Daily", "Weekly", "Monthly"];

const conditions = ["New", "Like New", "Good", "Fair"];

export default function AddEquipmentForm() {
  const { data: session } = authClient.useSession();

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  // Handle Image Change
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.err("Please select an image file");
        return;
      }

      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Collect form data
    const data = new FormData(e.currentTarget);

    // Add image
    if (image) {
      data.append("image", image);
    }

    // Add owner information
    data.append(
      "ownerInfo",
      JSON.stringify({
        name: session?.user?.name,
        email: session?.user?.email,
      })
    );

    // Add equipment status
    data.append("status", "Pending");

    console.log(Object.fromEntries(data.entries()));

    // =====================================
    // Backend API Integration
    // =====================================
    // এখানে fetch() দিয়ে backend এ POST request করবে।
    // FormData-কে request body হিসেবে পাঠাবে।
    // Backend response handle করবে।
    // =====================================
  };

  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm md:p-8">

      {/* Form Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Add New Equipment
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Provide equipment details to list it for rent.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Equipment Name */}
        <div>
          <label className="mb-2 block font-medium">
            Equipment Name
          </label>

          <input
            type="text"
            name="name"
            placeholder="Enter equipment name"
            required
            className="w-full rounded-lg border p-3 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block font-medium">
            Description
          </label>

          <textarea
            name="description"
            placeholder="Describe your equipment"
            rows={4}
            required
            className="w-full rounded-lg border p-3 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category and Location */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Category
            </label>

            <select
              name="category"
              required
              className="w-full rounded-lg border p-3"
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Location
            </label>

            <input
              type="text"
              name="location"
              placeholder="Enter location"
              required
              className="w-full rounded-lg border p-3"
            />
          </div>
        </div>

        {/* Rental Price and Type */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Rental Price (৳)
            </label>

            <input
              type="number"
              name="rentalPrice"
              placeholder="Enter rental price"
              min="1"
              required
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Rental Type
            </label>

            <select
              name="rentalType"
              defaultValue="Daily"
              className="w-full rounded-lg border p-3"
            >
              {rentalTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity and Condition */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Available Quantity
            </label>

            <input
              type="number"
              name="quantity"
              placeholder="Enter quantity"
              min="1"
              required
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Equipment Condition
            </label>

            <select
              name="condition"
              required
              className="w-full rounded-lg border p-3"
            >
              <option value="">Select condition</option>

              {conditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Brand and Model */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Brand
            </label>

            <input
              type="text"
              name="brand"
              placeholder="Enter brand"
              required
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Model
            </label>

            <input
              type="text"
              name="model"
              placeholder="Enter model"
              required
              className="w-full rounded-lg border p-3"
            />
          </div>
        </div>

        {/* Owner Information */}
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Owner Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium">
                Owner Name
              </label>

              <input
                type="text"
                value={session?.user?.name || ""}
                readOnly
                className="w-full rounded-lg border bg-gray-50 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Owner Email
              </label>

              <input
                type="email"
                value={session?.user?.email || ""}
                readOnly
                className="w-full rounded-lg border bg-gray-50 p-3"
              />
            </div>
          </div>
        </div>

        {/* Equipment Image */}
        <div>
          <label className="mb-2 block font-medium">
            Equipment Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            className="w-full rounded-lg border p-3"
          />

          {preview && (
            <div className="relative mt-4 h-64 w-full overflow-hidden rounded-xl">
              <Image
                src={preview}
                alt="Equipment Preview"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Terms and Conditions */}
        <div>
          <label className="mb-2 block font-medium">
            Rental Terms and Conditions
          </label>

          <textarea
            name="terms"
            placeholder="Write rental terms and conditions"
            rows={4}
            required
            className="w-full rounded-lg border p-3 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Status */}
        <div className="rounded-lg bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-700">
            Equipment Status: Pending
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          Add Equipment
        </button>

      </form>
    </div>
  );
}
