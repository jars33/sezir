
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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Month</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
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
            <TableCell>€{revenue.amount.toFixed(2)}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(revenue)}
                >
                  <Edit2Icon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(revenue)}
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
