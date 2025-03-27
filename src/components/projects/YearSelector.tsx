
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface YearSelectorProps {
  year: number
  onChange: (year: number) => void
}

export function YearSelector({ year, onChange }: YearSelectorProps) {
  const handlePreviousYear = () => onChange(year - 1)
  const handleNextYear = () => onChange(year + 1)

  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousYear}
        className="rounded-full h-10 w-10"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="mx-4 text-xl font-bold">
        {year}
      </div>
      
      <Button
        variant="outline" 
        size="icon"
        onClick={handleNextYear}
        className="rounded-full h-10 w-10"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
