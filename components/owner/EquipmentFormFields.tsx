import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  EQUIPMENT_RENTAL_TYPES,
} from "@/constants/equipment";
import type { Equipment } from "@/types/equipment";

export const equipmentInputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70";

export const equipmentLabelClass =
  "mb-2 block text-sm font-semibold text-slate-700";

interface EquipmentFormFieldsProps {
  defaultValues?: Partial<Equipment>;
  disabled?: boolean;
}

function withCurrentValue(
  options: readonly string[],
  currentValue?: string
) {
  if (!currentValue || options.includes(currentValue)) {
    return [...options];
  }

  return [...options, currentValue];
}

export default function EquipmentFormFields({
  defaultValues = {},
  disabled = false,
}: EquipmentFormFieldsProps) {
  const categories = withCurrentValue(
    EQUIPMENT_CATEGORIES,
    defaultValues.category
  );

  const rentalTypes = withCurrentValue(
    EQUIPMENT_RENTAL_TYPES,
    defaultValues.rentalType
  );

  const conditions = withCurrentValue(
    EQUIPMENT_CONDITIONS,
    defaultValues.condition
  );

  return (
    <>
      {/* Basic Information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Basic Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter your equipment details.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className={equipmentLabelClass} htmlFor="equipment-name">
              Equipment Name *
            </label>

            <input
              id="equipment-name"
              type="text"
              name="name"
              placeholder="e.g. Heavy Duty Tractor"
              required
              disabled={disabled}
              defaultValue={defaultValues.name ?? ""}
              className={equipmentInputClass}
            />
          </div>

          <div>
            <label
              className={equipmentLabelClass}
              htmlFor="equipment-description"
            >
              Description *
            </label>

            <textarea
              id="equipment-description"
              name="description"
              rows={4}
              placeholder="Describe your equipment..."
              required
              disabled={disabled}
              defaultValue={defaultValues.description ?? ""}
              className={`${equipmentInputClass} resize-none`}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                className={equipmentLabelClass}
                htmlFor="equipment-category"
              >
                Category *
              </label>

              <select
                id="equipment-category"
                name="category"
                required
                disabled={disabled}
                defaultValue={defaultValues.category ?? ""}
                className={equipmentInputClass}
              >
                <option value="" disabled>
                  Select category
                </option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={equipmentLabelClass}
                htmlFor="equipment-location"
              >
                Location *
              </label>

              <input
                id="equipment-location"
                type="text"
                name="location"
                placeholder="e.g. Cumilla, Bangladesh"
                required
                disabled={disabled}
                defaultValue={defaultValues.location ?? ""}
                className={equipmentInputClass}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Rental Information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Rental Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Set your rental price and availability.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              className={equipmentLabelClass}
              htmlFor="equipment-rental-price"
            >
              Rental Price (৳) *
            </label>

            <input
              id="equipment-rental-price"
              type="number"
              name="rentalPrice"
              placeholder="Enter price"
              min="1"
              step="1"
              required
              disabled={disabled}
              defaultValue={defaultValues.rentalPrice ?? ""}
              className={equipmentInputClass}
            />
          </div>

          <div>
            <label
              className={equipmentLabelClass}
              htmlFor="equipment-rental-type"
            >
              Rental Type *
            </label>

            <select
              id="equipment-rental-type"
              name="rentalType"
              required
              disabled={disabled}
              defaultValue={defaultValues.rentalType ?? ""}
              className={equipmentInputClass}
            >
              <option value="" disabled>
                Select rental type
              </option>

              {rentalTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className={equipmentLabelClass}
              htmlFor="equipment-quantity"
            >
              Available Quantity *
            </label>

            <input
              id="equipment-quantity"
              type="number"
              name="quantity"
              placeholder="Enter quantity"
              min="1"
              step="1"
              required
              disabled={disabled}
              defaultValue={defaultValues.quantity ?? ""}
              className={equipmentInputClass}
            />
          </div>

          <div>
            <label
              className={equipmentLabelClass}
              htmlFor="equipment-condition"
            >
              Equipment Condition *
            </label>

            <select
              id="equipment-condition"
              name="condition"
              required
              disabled={disabled}
              defaultValue={defaultValues.condition ?? ""}
              className={equipmentInputClass}
            >
              <option value="" disabled>
                Select condition
              </option>

              {conditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Equipment Details */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Equipment Details
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add brand and model information.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={equipmentLabelClass} htmlFor="equipment-brand">
              Brand *
            </label>

            <input
              id="equipment-brand"
              type="text"
              name="brand"
              placeholder="e.g. John Deere"
              required
              disabled={disabled}
              defaultValue={defaultValues.brand ?? ""}
              className={equipmentInputClass}
            />
          </div>

          <div>
            <label className={equipmentLabelClass} htmlFor="equipment-model">
              Model *
            </label>

            <input
              id="equipment-model"
              type="text"
              name="model"
              placeholder="Enter model"
              required
              disabled={disabled}
              defaultValue={defaultValues.model ?? ""}
              className={equipmentInputClass}
            />
          </div>
        </div>
      </section>

      {/* Rental Terms */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Rental Terms &amp; Conditions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            These terms are shown to customers when they rent your equipment.
          </p>
        </div>

        <textarea
          id="equipment-terms"
          name="terms"
          rows={4}
          placeholder="Write your rental terms and conditions..."
          required
          disabled={disabled}
          defaultValue={defaultValues.terms ?? ""}
          className={`${equipmentInputClass} resize-none`}
        />
      </section>
    </>
  );
}
