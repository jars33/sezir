
import { Edit2Icon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useTranslation } from "react-i18next"
import { formatCurrency } from "@/lib/utils"

interface ProjectRevenue {
  id: string
  month: string
  amount: number
  project_id: string
  created_at: string
  updated_at: string
}

interface ProjectRevenueTableProps {
  revenues: ProjectRevenue[]
  onEdit: (revenue: ProjectRevenue) => void
  onDelete: (revenue: ProjectRevenue) => void
}

export function ProjectRevenueTable({ 
  revenues,
  onEdit,
  onDelete
}: ProjectRevenueTableProps) {
  const { t } = useTranslation();
  const [showDecimals] = useLocalStorage<boolean>("showDecimals", true)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('common.month')}</TableHead>
          <TableHead>{t('common.amount')}</TableHead>
          <TableHead className="w-[100px]">{t('project.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {revenues?.map((revenue) => (
          <TableRow key={revenue.id}>
            <TableCell>
              {new Date(revenue.month).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
              })}
            </TableCell>
            <TableCell>{formatCurrency(revenue.amount, showDecimals)}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(revenue)}
                  title={t('common.edit')}
                >
                  <Edit2Icon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(revenue)}
                  title={t('common.delete')}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
