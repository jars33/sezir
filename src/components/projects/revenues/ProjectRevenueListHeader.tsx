
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { useTranslation } from "react-i18next"

interface ProjectRevenueListHeaderProps {
  totalRevenue: number
  onAddRevenue: () => void
}

export function ProjectRevenueListHeader({ 
  totalRevenue, 
  onAddRevenue 
}: ProjectRevenueListHeaderProps) {
  const { t } = useTranslation();
  
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>{t('costs.revenues')}</CardTitle>
          <CardDescription>
            {t('costs.totalRevenue')}: €{totalRevenue.toFixed(2)}
          </CardDescription>
        </div>
        <Button onClick={onAddRevenue}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('costs.addRevenue')}
        </Button>
      </div>
    </CardHeader>
  )
}
