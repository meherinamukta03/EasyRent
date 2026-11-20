"use client"

import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  CalendarCheck,
  Heart,
  ListChecks,
  Package,
  PackagePlus,
  Plus,
  User,
  Users,
} from "lucide-react"

import { authClient } from "@/lib/auth-client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

type UserRole = "customer" | "owner" | "admin"

type MenuItem = {
  id: string
  name: string
  url: string
  icon: LucideIcon
}

const menuItemsByRole: Record<UserRole, MenuItem[]> = {
  customer: [
    {
      id: "customer-rentals",
      name: "My Rentals",
      url: "/dashboard/customer/my-rentals",
      icon: CalendarCheck,
    },
    {
      id: "customer-favorites",
      name: "Favorites",
      url: "/dashboard/customer/favorites",
      icon: Heart,
    },
    {
      id: "customer-profile",
      name: "Profile",
      url: "/dashboard/profile",
      icon: User,
    },
  ],
  owner: [
    {
      id: "owner-equipment",
      name: "My Equipment",
      url: "/dashboard/owner/my-equipment",
      icon: Package,
    },
    {
      id: "owner-add-equipment",
      name: "Add Equipment",
      url: "/dashboard/owner/add-equipment",
      icon: PackagePlus,
    },
    {
      id: "owner-rentals",
      name: "My Rentals",
      url: "/dashboard/owner/my-rentals",
      icon: CalendarCheck,
    },
    {
      id: "owner-analytics",
      name: "Analytics",
      url: "/dashboard/owner/analytics",
      icon: BarChart3,
    },
    {
      id: "owner-profile",
      name: "Profile",
      url: "/dashboard/profile",
      icon: User,
    },
  ],
  admin: [
    {
      id: "admin-users",
      name: "Users",
      url: "/dashboard/admin/users",
      icon: Users,
    },
    {
      id: "admin-equipment",
      name: "Equipment",
      url: "/dashboard/admin/equipment",
      icon: Package,
    },
    {
      id: "admin-rentals",
      name: "Rentals",
      url: "/dashboard/admin/rentals",
      icon: ListChecks,
    },
    {
      id: "admin-analytics",
      name: "Analytics",
      url: "/dashboard/admin/analytics",
      icon: BarChart3,
    },
    {
      id: "admin-profile",
      name: "Profile",
      url: "/dashboard/profile",
      icon: User,
    },
  ],
}

export default  function DashBoardSidebar() {
  const { data } = authClient.useSession()
  const role = data?.user?.role

  const menuItems: MenuItem[] =
    role && role in menuItemsByRole
      ? menuItemsByRole[role as UserRole]
      : []

  return (
    <Sidebar className="top-16! h-auto! lg:top-[4.5rem]!">
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
         
          
        
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton render={<Link href={item.url} />}>
                    <item.icon />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
