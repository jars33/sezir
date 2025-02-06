
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  RefreshCcw,
  Search,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface InboxToolbarProps {
  onRefresh: () => void
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function InboxToolbar({
  onRefresh,
  searchQuery,
  onSearchChange,
}: InboxToolbarProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={onRefresh}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1"
        />
      </div>
    </>
  )
}
