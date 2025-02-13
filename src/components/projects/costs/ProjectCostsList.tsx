
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
import { ProjectVariableCostDialog } from "./ProjectVariableCostDialog"
import { ProjectOverheadCostDialog } from "./ProjectOverheadCostDialog"
import { DeleteCostDialog } from "./DeleteCostDialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProjectCost {
  id: string
  month: string
  amount: number
  project_id: string
  created_at: string
  updated_at: string
  description?: string
}

interface ProjectCostsListProps {
  projectId: string
}

export function ProjectCostsList({ projectId }: ProjectCostsListProps) {
  const queryClient = useQueryClient()
  const [createVariableCostDialogOpen, setCreateVariableCostDialogOpen] = useState(false)
  const [createOverheadCostDialogOpen, setCreateOverheadCostDialogOpen] = useState(false)
  const [editVariableCost, setEditVariableCost] = useState<ProjectCost | null>(null)
  const [editOverheadCost, setEditOverheadCost] = useState<ProjectCost | null>(null)
  const [deleteVariableCost, setDeleteVariableCost] = useState<ProjectCost | null>(null)
  const [deleteOverheadCost, setDeleteOverheadCost] = useState<ProjectCost | null>(null)

  const { data: variableCosts, isLoading: isLoadingVariableCosts } = useQuery({
    queryKey: ["project-variable-costs", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_variable_costs")
        .select("*")
        .eq("project_id", projectId)
        .order("month", { ascending: false })

      if (error) {
        toast.error("Failed to load variable costs")
        throw error
      }

      return data as ProjectCost[]
    },
  })

  const { data: overheadCosts, isLoading: isLoadingOverheadCosts } = useQuery({
    queryKey: ["project-overhead-costs", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_overhead_costs")
        .select("*")
        .eq("project_id", projectId)
        .order("month", { ascending: false })

      if (error) {
        toast.error("Failed to load overhead costs")
        throw error
      }

      return data as ProjectCost[]
    },
  })

  const createVariableCostMutation = useMutation({
    mutationFn: async (values: { month: string; amount: string; description: string }) => {
      const { error } = await supabase.from("project_variable_costs").insert([
        {
          project_id: projectId,
          month: values.month + "-01",
          amount: parseFloat(values.amount),
          description: values.description,
        },
      ])

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-variable-costs"] })
      setCreateVariableCostDialogOpen(false)
      toast.success("Variable cost added successfully")
    },
    onError: () => {
      toast.error("Failed to add variable cost")
    },
  })

  const createOverheadCostMutation = useMutation({
    mutationFn: async (values: { month: string; amount: string }) => {
      const { error } = await supabase.from("project_overhead_costs").insert([
        {
          project_id: projectId,
          month: values.month + "-01",
          amount: parseFloat(values.amount),
        },
      ])

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-overhead-costs"] })
      setCreateOverheadCostDialogOpen(false)
      toast.success("Overhead cost added successfully")
    },
    onError: () => {
      toast.error("Failed to add overhead cost")
    },
  })

  const updateVariableCostMutation = useMutation({
    mutationFn: async (values: { id: string; month: string; amount: string; description: string }) => {
      const { error } = await supabase
        .from("project_variable_costs")
        .update({
          month: values.month + "-01",
          amount: parseFloat(values.amount),
          description: values.description,
        })
        .eq("id", values.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-variable-costs"] })
      setEditVariableCost(null)
      toast.success("Variable cost updated successfully")
    },
    onError: () => {
      toast.error("Failed to update variable cost")
    },
  })

  const updateOverheadCostMutation = useMutation({
    mutationFn: async (values: { id: string; month: string; amount: string }) => {
      const { error } = await supabase
        .from("project_overhead_costs")
        .update({
          month: values.month + "-01",
          amount: parseFloat(values.amount),
        })
        .eq("id", values.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-overhead-costs"] })
      setEditOverheadCost(null)
      toast.success("Overhead cost updated successfully")
    },
    onError: () => {
      toast.error("Failed to update overhead cost")
    },
  })

  const deleteVariableCostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("project_variable_costs")
        .delete()
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-variable-costs"] })
      setDeleteVariableCost(null)
      toast.success("Variable cost deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete variable cost")
    },
  })

  const deleteOverheadCostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("project_overhead_costs")
        .delete()
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-overhead-costs"] })
      setDeleteOverheadCost(null)
      toast.success("Overhead cost deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete overhead cost")
    },
  })

  const handleCreateVariableCost = (values: { month: string; amount: string; description: string }) => {
    createVariableCostMutation.mutate(values)
  }

  const handleCreateOverheadCost = (values: { month: string; amount: string }) => {
    createOverheadCostMutation.mutate(values)
  }

  const handleUpdateVariableCost = (values: { month: string; amount: string; description: string }) => {
    if (!editVariableCost) return
    updateVariableCostMutation.mutate({ id: editVariableCost.id, ...values })
  }

  const handleUpdateOverheadCost = (values: { month: string; amount: string }) => {
    if (!editOverheadCost) return
    updateOverheadCostMutation.mutate({ id: editOverheadCost.id, ...values })
  }

  const handleDeleteVariableCost = () => {
    if (!deleteVariableCost) return
    deleteVariableCostMutation.mutate(deleteVariableCost.id)
  }

  const handleDeleteOverheadCost = () => {
    if (!deleteOverheadCost) return
    deleteOverheadCostMutation.mutate(deleteOverheadCost.id)
  }

  if (isLoadingVariableCosts || isLoadingOverheadCosts) {
    return <div>Loading...</div>
  }

  const totalVariableCosts = variableCosts?.reduce((sum, cost) => sum + cost.amount, 0) || 0
  const totalOverheadCosts = overheadCosts?.reduce((sum, cost) => sum + cost.amount, 0) || 0
  const totalCosts = totalVariableCosts + totalOverheadCosts

  return (
    <Card>
      <CardHeader>
        <CardTitle>Costs</CardTitle>
        <CardDescription>
          Total Costs: ${totalCosts.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="variable" className="space-y-4">
          <TabsList>
            <TabsTrigger value="variable">
              Variable Costs (${totalVariableCosts.toFixed(2)})
            </TabsTrigger>
            <TabsTrigger value="overhead">
              Overhead Costs (${totalOverheadCosts.toFixed(2)})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="variable" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setCreateVariableCostDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Variable Cost
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variableCosts?.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>
                      {new Date(cost.month).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                      })}
                    </TableCell>
                    <TableCell>{cost.description}</TableCell>
                    <TableCell>${cost.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 hover:bg-slate-100"
                          onClick={() => setEditVariableCost(cost)}
                        >
                          <Edit2Icon className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 hover:bg-red-100"
                          onClick={() => setDeleteVariableCost(cost)}
                        >
                          <Trash2Icon className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="overhead" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setCreateOverheadCostDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Overhead Cost
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overheadCosts?.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>
                      {new Date(cost.month).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                      })}
                    </TableCell>
                    <TableCell>${cost.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 hover:bg-slate-100"
                          onClick={() => setEditOverheadCost(cost)}
                        >
                          <Edit2Icon className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 hover:bg-red-100"
                          onClick={() => setDeleteOverheadCost(cost)}
                        >
                          <Trash2Icon className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>

        <ProjectVariableCostDialog
          open={createVariableCostDialogOpen}
          onOpenChange={setCreateVariableCostDialogOpen}
          onSubmit={handleCreateVariableCost}
        />

        <ProjectVariableCostDialog
          open={Boolean(editVariableCost)}
          onOpenChange={(open) => !open && setEditVariableCost(null)}
          onSubmit={handleUpdateVariableCost}
          defaultValues={
            editVariableCost
              ? {
                  month: editVariableCost.month.slice(0, 7),
                  amount: editVariableCost.amount.toString(),
                  description: editVariableCost.description || "",
                }
              : undefined
          }
        />

        <ProjectOverheadCostDialog
          open={createOverheadCostDialogOpen}
          onOpenChange={setCreateOverheadCostDialogOpen}
          onSubmit={handleCreateOverheadCost}
        />

        <ProjectOverheadCostDialog
          open={Boolean(editOverheadCost)}
          onOpenChange={(open) => !open && setEditOverheadCost(null)}
          onSubmit={handleUpdateOverheadCost}
          defaultValues={
            editOverheadCost
              ? {
                  month: editOverheadCost.month.slice(0, 7),
                  amount: editOverheadCost.amount.toString(),
                }
              : undefined
          }
        />

        <DeleteCostDialog
          open={Boolean(deleteVariableCost)}
          onOpenChange={(open) => !open && setDeleteVariableCost(null)}
          onConfirm={handleDeleteVariableCost}
          type="variable"
        />

        <DeleteCostDialog
          open={Boolean(deleteOverheadCost)}
          onOpenChange={(open) => !open && setDeleteOverheadCost(null)}
          onConfirm={handleDeleteOverheadCost}
          type="overhead"
        />
      </CardContent>
    </Card>
  )
}
