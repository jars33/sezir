
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "./AuthProvider"
import { Calendar, Users, LayoutDashboard, Inbox, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, loading } = useAuth()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate("/auth")
  }

  const navigationItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/projects", label: "Projects", icon: FolderOpen },
    { path: "/team", label: "Team", icon: Users },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/inbox", label: "Inbox", icon: Inbox },
  ]

  if (loading) {
    return <div>Loading...</div>
  }

  if (!session) {
    navigate("/auth")
    return null
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <Sidebar>
          <SidebarContent>
            <nav className="flex-1 p-2">
              <ul className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.path || 
                    (item.path !== "/" && location.pathname.startsWith(item.path))
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                          isActive
                            ? "bg-[#f1f1f1] text-black"
                            : "text-[#6B6F76] hover:bg-[#f1f1f1] hover:text-black"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </SidebarContent>
        </Sidebar>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center px-3 gap-2 border-b border-[#e5e5e5] bg-white">
            <SidebarTrigger />
            <div className="flex-1" />
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-[#6B6F76] hover:bg-[#f1f1f1] hover:text-black"
            >
              Sign Out
            </Button>
          </header>
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
