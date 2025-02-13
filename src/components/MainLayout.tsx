
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
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="h-12 flex items-center px-4 justify-between border-b">
            <SidebarTrigger />
            <Button onClick={handleSignOut}>Sign Out</Button>
          </div>
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
