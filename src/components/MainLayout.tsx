
import { Outlet, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "./AuthProvider"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"

export default function MainLayout() {
  const navigate = useNavigate()
  const { session, loading } = useAuth()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate("/auth")
  }

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
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center px-3 justify-between border-b border-[#e5e5e5] bg-white">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-[#6B6F76] hover:bg-[#f1f1f1] rounded-sm" />
            </div>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-[#6B6F76] hover:bg-[#f1f1f1] hover:text-black"
            >
              Sign Out
            </Button>
          </header>
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
