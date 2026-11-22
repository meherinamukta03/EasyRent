
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";

export default async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const user = session?.user;
  const pathname = request.nextUrl.pathname;

  // Check authentication
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = user.role?.toLowerCase();

  // Admin routes
  if (pathname.startsWith("/dashboard/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Owner routes
  const ownerRoutes = [
    "/dashboard/add-equipment",
    "/dashboard/my-equipment",
    "/dashboard/my-equipment-rental",
  ];

  if (ownerRoutes.some((route) => pathname.startsWith(route))) {
    if (role !== "owner") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Customer routes
  const customerRoutes = [
    "/dashboard/my-rentals",
    "/dashboard/favorites",
  ];

  if (customerRoutes.some((route) => pathname.startsWith(route))) {
    if (role !== "customer") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Equipment details - any authenticated user
  if (pathname.startsWith("/equipment/")) {
    return NextResponse.next();
  }

  // Shared profile route
  if (pathname === "/dashboard/profile") {
    if (!["customer", "owner", "admin"].includes(role ?? "")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/all-equipment/:path*",
  ],
};
