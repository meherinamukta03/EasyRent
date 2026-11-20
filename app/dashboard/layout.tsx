
import DashBoardSidebar from "@/components/dashboard/DashboardSidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="min-h-[calc(100svh-4rem)]! lg:min-h-[calc(100svh-4.5rem)]!">
      <DashBoardSidebar></DashBoardSidebar>
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}

 