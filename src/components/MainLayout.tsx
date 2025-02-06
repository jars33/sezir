
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
        <div className="flex-1">
          <div className="border-b">
            <div className="flex h-16 items-center px-4">
              <SidebarTrigger />
              <div className="ml-auto flex items-center space-x-4">
                <Button onClick={handleSignOut}>Sign Out</Button>
              </div>
            </div>
          </div>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
