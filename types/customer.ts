export interface RentalBooking {
  _id: string
  equipmentId?: string
  equipmentIdString?: string
  equipmentName?: string
  equipmentImage?: string
  customerEmail?: string
  customerId?: string
  customerName?: string
  ownerEmail?: string
  rentalStartDate?: string
  rentalEndDate?: string
  rentalDays?: number
  rentalDuration?: number
  rentalType?: string
  requiredQuantity?: number
  rentalPrice?: number
  totalAmount?: number
  contactNumber?: string
  deliveryAddress?: string
  notes?: string
  bookingStatus?: string
  paymentStatus?: string
  stripeSessionId?: string
  stripeCurrency?: string
  stripeCheckoutUrl?: string
  stripePaymentIntentId?: string
  paidAt?: string
  createdAt?: string
}

/** Rental row returned by the owner-scoped rentals endpoint. */
export interface OwnerRental {
  _id: string
  customerName?: string
  customerEmail?: string
  contactNumber?: string
  equipmentName?: string
  equipmentImage?: string
  rentalStartDate?: string
  rentalEndDate?: string
  rentalType?: string
  requiredQuantity?: number
  totalAmount?: number
  paymentStatus?: string
  bookingStatus?: string
  ownerEmail?: string
  refundStatus?: string
  createdAt?: string
}

export interface FavoriteEquipment {
  _id?: string
  name?: string
  image?: string
  category?: string
  rentalPrice?: number
  rentalType?: string
  location?: string
  quantity?: number
}

export interface FavoriteItem {
  _id: string
  customerEmail: string
  customerId?: string
  equipmentId: string
  equipment: FavoriteEquipment
  createdAt?: string
}

export interface BookingInput {
  equipmentId: string
  rentalStartDate: string
  rentalEndDate: string
  requiredQuantity: number
  contactNumber: string
  deliveryAddress: string
  notes?: string
}
