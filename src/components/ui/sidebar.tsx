
"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNavigate, useLocation } from "react-router-dom"
import { CalendarDays, LayoutDashboard, Users, Folders, Mail } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Label } from "@/components/ui/label"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [showDecimals, setShowDecimals] = useLocalStorage<boolean>("showDecimals", true)

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              variant={location.pathname === "/" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate("/")}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={location.pathname === "/calendar" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate("/calendar")}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendar
            </Button>
            <Button
              variant={location.pathname === "/team" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate("/team")}
            >
              <Users className="mr-2 h-4 w-4" />
              Team
            </Button>
            <Button
              variant={location.pathname.startsWith("/projects") ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate("/projects")}
            >
              <Folders className="mr-2 h-4 w-4" />
              Projects
            </Button>
            <Button
              variant={location.pathname === "/inbox" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate("/inbox")}
            >
              <Mail className="mr-2 h-4 w-4" />
              Inbox
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-decimals"
                checked={showDecimals}
                onCheckedChange={setShowDecimals}
              />
              <Label htmlFor="show-decimals">Show decimals</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
