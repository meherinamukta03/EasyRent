import type { UserRole } from "@/lib/roles"
import type { Equipment } from "@/types/equipment"

/**
 * Admin-facing DTOs. These deliberately contain only the fields the dashboard
 * renders. The API projections never include password hashes, account records
 * or session tokens.
 */
export interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  address?: string
  image?: string | null
  emailVerified?: boolean
  createdAt?: string | null
  updatedAt?: string | null
}

export type AdminEquipmentStatus = "Pending" | "Approved" | "Rejected"

export interface AdminEquipment extends Equipment {
  _id: string
  status?: string
  ownerInfo?: { name?: string; email?: string }
  createdAt?: string
  updatedAt?: string
}

export interface AdminEquipmentUpdateInput {
  id: string
  name: string
  description: string
  category: string
  location: string
  rentalPrice: number
  rentalType: string
  quantity: number
  condition: string
  brand: string
  model: string
  terms: string
}

export interface AdminRental {
  _id: string
  customerName?: string
  customerEmail?: string
  contactNumber?: string
  ownerName?: string
  ownerEmail?: string
  equipmentName?: string
  equipmentImage?: string
  rentalStartDate?: string
  rentalEndDate?: string
  rentalDays?: number
  rentalDuration?: number
  rentalType?: string
  requiredQuantity?: number
  totalAmount?: number
  bookingStatus?: string
  paymentStatus?: string
  stripePaymentIntentId?: string
  stripeSessionId?: string
  paidAt?: string | null
  createdAt?: string | null
}

export interface AdminRentalsFilters {
  search?: string
  bookingStatus?: string
  paymentStatus?: string
  page?: number
  limit?: number
}

export interface MonthlyStat {
  month: string
  label: string
  bookings: number
  amount: number
}

export interface AdminAnalytics {
  userCount: number
  totalUsers: number
  totalEquipment: number
  equipment: { total: number; pending: number; approved: number; rejected: number }
  pendingApprovals: number
  rentalCount: number
  totalBookings: number
  completedRentals: number
  revenue: number
  totalRevenue: number
  monthlyBookings: MonthlyStat[]
}

export interface OwnerAnalytics {
  equipmentCount: number
  totalEquipment: number
  rentalCount: number
  totalBookings: number
  pendingRequests: number
  completedRentals: number
  earnings: number
  totalEarnings: number
  monthlyEarnings: MonthlyStat[]
}

export interface AdminRentalsResponse {
  rentals: AdminRental[]
  total: number
  page: number
  limit: number
  pages: number
}
