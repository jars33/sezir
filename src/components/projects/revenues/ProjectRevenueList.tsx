
import { Edit2Icon, PlusCircle, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { ProjectRevenueDialog } from "./ProjectRevenueDialog"
import { DeleteProjectDialog } from "../DeleteProjectDialog"

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
  const queryClient = useQueryClient()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editRevenue, setEditRevenue] = useState<ProjectRevenue | null>(null)
  const [deleteRevenue, setDeleteRevenue] = useState<ProjectRevenue | null>(null)

  const { data: revenues, isLoading } = useQuery({
    queryKey: ["project-revenues", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_revenues")
        .select("*")
        .eq("project_id", projectId)
        .order("month", { ascending: false })

      if (error) {
        toast.error("Failed to load revenues")
        throw error
      }

      return data as ProjectRevenue[]
    },
  })

  const createRevenueMutation = useMutation({
    mutationFn: async (values: { month: string; amount: string }) => {
      const { error } = await supabase.from("project_revenues").insert([
        {
          project_id: projectId,
          month: values.month + "-01",
          amount: parseFloat(values.amount),
        },
      ])

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-revenues"] })
      setCreateDialogOpen(false)
      toast.success("Revenue added successfully")
    },
    onError: () => {
      toast.error("Failed to add revenue")
    },
  })

  const updateRevenueMutation = useMutation({
    mutationFn: async (values: { id: string; month: string; amount: string }) => {
      const { error } = await supabase
        .from("project_revenues")
        .update({
          month: values.month + "-01",
          amount: parseFloat(values.amount),
        })
        .eq("id", values.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-revenues"] })
      setEditRevenue(null)
      toast.success("Revenue updated successfully")
    },
    onError: () => {
      toast.error("Failed to update revenue")
    },
  })

  const deleteRevenueMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("project_revenues")
        .delete()
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-revenues"] })
      setDeleteRevenue(null)
      toast.success("Revenue deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete revenue")
    },
  })

  const handleCreateRevenue = (values: { month: string; amount: string }) => {
    createRevenueMutation.mutate(values)
  }

  const handleUpdateRevenue = (values: { month: string; amount: string }) => {
    if (!editRevenue) return
    updateRevenueMutation.mutate({ id: editRevenue.id, ...values })
  }

  const handleDeleteRevenue = () => {
    if (!deleteRevenue) return
    deleteRevenueMutation.mutate(deleteRevenue.id)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  const totalRevenue = revenues?.reduce((sum, revenue) => sum + revenue.amount, 0) || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Revenues</CardTitle>
            <CardDescription>
              Total Revenue: ${totalRevenue.toFixed(2)}
            </CardDescription>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Revenue
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
                <TableCell>${revenue.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditRevenue(revenue)}
                    >
                      <Edit2Icon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteRevenue(revenue)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

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
