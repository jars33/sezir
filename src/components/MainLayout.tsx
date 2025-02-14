
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "./AuthProvider"
import { Calendar, Users, LayoutDashboard, Inbox, FolderOpen, Moon, Sun, Hash } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, loading } = useAuth()
  const { theme, setTheme } = useTheme()
  const [showDecimals, setShowDecimals] = useLocalStorage<boolean>("showDecimals", true)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate("/auth")
  }

  const handleToggleDecimals = () => {
    setShowDecimals(!showDecimals)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!session) {
    navigate("/auth")
    return null
  }

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar className="h-screen fixed left-0 top-0 w-[150px]" />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 pl-[150px]">
        <header className="h-12 flex items-center border-b border-border bg-background sticky top-0 z-10">
          <div className="flex-1" />
          <div className="px-4 flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleDecimals}
                    className="text-foreground"
                  >
                    <Hash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show decimals: {showDecimals ? "On" : "Off"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-foreground"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Sign Out
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
