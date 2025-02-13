
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

interface ProjectRevenueListHeaderProps {
  totalRevenue: number
  onAddRevenue: () => void
}

export function ProjectRevenueListHeader({ 
  totalRevenue, 
  onAddRevenue 
}: ProjectRevenueListHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Revenues</CardTitle>
          <CardDescription>
            Total Revenue: €{totalRevenue.toFixed(2)}
          </CardDescription>
        </div>
        <Button onClick={onAddRevenue}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Revenue
        </Button>
      </div>
    </CardHeader>
  )
}
