
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "./AuthProvider"
import { Calendar, Users, LayoutDashboard, Hash, Languages, Moon, Sun, MenuIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useLanguage } from "@/hooks/use-language"
import { useTranslation } from "react-i18next"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, loading } = useAuth()
  const { theme, setTheme } = useTheme()
  const [showDecimals, setShowDecimals] = useLocalStorage<boolean>("showDecimals", true)
  const { currentLanguage, changeLanguage, languages } = useLanguage()
  const { t } = useTranslation()
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>("sidebar-collapsed", false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate("/auth")
  }

  const handleToggleDecimals = () => {
    setShowDecimals(!showDecimals)
  }

  if (loading) {
    return <div>{t('common.loading')}</div>
  }

  if (!session) {
    navigate("/auth")
    return null
  }

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar className="h-screen" />

      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "ml-0" : "ml-[200px]"
      )}>
        <header className="h-12 flex items-center border-b border-border bg-background sticky top-0 z-10">
          {/* Only show menu button when sidebar is collapsed */}
          {sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => setSidebarCollapsed(false)}
              aria-label="Open sidebar"
            >
              <MenuIcon className="h-4 w-4" />
            </Button>
          )}
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
                  <p>{t('common.showDecimals')}: {showDecimals ? "On" : "Off"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-foreground">
                        <Languages className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('common.language')}: {currentLanguage === 'en' ? 'English' : 'Português'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={currentLanguage === lang.code ? "bg-accent" : ""}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

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
              {t('common.signOut')}
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
