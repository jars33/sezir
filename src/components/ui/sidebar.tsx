
"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNavigate, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, Folders, Network, MenuIcon, ChevronLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>("sidebar-collapsed", false)

  return (
    <div className="relative">
      {/* Sidebar with content */}
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out fixed left-0 top-0 bottom-0 z-10 bg-background border-r", 
          sidebarCollapsed ? "w-0 opacity-0 -translate-x-full" : "w-[200px] opacity-100 translate-x-0",
          className
        )}
      >
        <div className="space-y-4 py-4 h-full flex flex-col">
          <div className="px-3 py-2 flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">{t('common.appName')}</h2>
              
              {/* Collapse sidebar button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSidebarCollapsed(true)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-1">
              <Button
                variant={location.pathname === "/" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate("/")}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                {t('common.dashboard')}
              </Button>
              <Button
                variant={location.pathname === "/teams" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate("/teams")}
              >
                <Network className="mr-2 h-4 w-4" />
                {t('common.organization')}
              </Button>
              <Button
                variant={location.pathname === "/team" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate("/team")}
              >
                <Users className="mr-2 h-4 w-4" />
                {t('common.teamMembers')}
              </Button>
              <Button
                variant={location.pathname.startsWith("/projects") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate("/projects")}
              >
                <Folders className="mr-2 h-4 w-4" />
                {t('common.projects')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
