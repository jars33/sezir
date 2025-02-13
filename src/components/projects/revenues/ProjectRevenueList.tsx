
import { useState } from "react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { ProjectRevenueListHeader } from "./ProjectRevenueListHeader"
import { ProjectRevenueTable } from "./ProjectRevenueTable"
import { ProjectRevenueDialog } from "./ProjectRevenueDialog"
import { DeleteProjectDialog } from "../DeleteProjectDialog"
import { useProjectRevenues } from "./useProjectRevenues"

interface ProjectRevenue {
  id: string
  month: string
  amount: number
  project_id: string
  created_at: string
  updated_at: string
}

interface ProjectRevenueListProps {
  projectId: string
}

export function ProjectRevenueList({ projectId }: ProjectRevenueListProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editRevenue, setEditRevenue] = useState<ProjectRevenue | null>(null)
  const [deleteRevenue, setDeleteRevenue] = useState<ProjectRevenue | null>(null)

  const {
    revenues,
    isLoading,
    createRevenueMutation,
    updateRevenueMutation,
    deleteRevenueMutation,
  } = useProjectRevenues(projectId)

  const handleCreateRevenue = (values: { month: string; amount: string }) => {
    createRevenueMutation.mutate(values)
    setCreateDialogOpen(false)
  }

  const handleUpdateRevenue = (values: { month: string; amount: string }) => {
    if (!editRevenue) return
    updateRevenueMutation.mutate({ id: editRevenue.id, ...values })
    setEditRevenue(null)
  }

  const handleDeleteRevenue = () => {
    if (!deleteRevenue) return
    deleteRevenueMutation.mutate(deleteRevenue.id)
    setDeleteRevenue(null)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  const totalRevenue = revenues?.reduce((sum, revenue) => sum + revenue.amount, 0) || 0

  return (
    <Card>
      <ProjectRevenueListHeader
        totalRevenue={totalRevenue}
        onAddRevenue={() => setCreateDialogOpen(true)}
      />
      <CardContent>
        <ProjectRevenueTable
          revenues={revenues || []}
          onEdit={setEditRevenue}
          onDelete={setDeleteRevenue}
        />

        <ProjectRevenueDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleCreateRevenue}
        />

        <ProjectRevenueDialog
          open={Boolean(editRevenue)}
          onOpenChange={(open) => !open && setEditRevenue(null)}
          onSubmit={handleUpdateRevenue}
          defaultValues={
            editRevenue
              ? {
                  month: editRevenue.month.slice(0, 7),
                  amount: editRevenue.amount.toString(),
                }
              : undefined
          }
        />

        <DeleteProjectDialog
          open={Boolean(deleteRevenue)}
          onOpenChange={(open) => !open && setDeleteRevenue(null)}
          onConfirm={handleDeleteRevenue}
        />
      </CardContent>
    </Card>
  )
}
