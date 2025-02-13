
import { Outlet, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "./AuthProvider"

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
    <div className="min-h-screen flex flex-col w-full bg-white">
      <header className="h-12 flex items-center px-3 justify-end border-b border-[#e5e5e5] bg-white">
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
  )
}
