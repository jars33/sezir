
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EditIcon, Loader2, Trash2Icon } from "lucide-react"
import { ProjectCostDialog } from "@/components/projects/costs/ProjectCostDialog"
import { ProjectVariableCostDialog } from "@/components/projects/costs/ProjectVariableCostDialog"
import { DeleteCostDialog } from "@/components/projects/costs/DeleteCostDialog"
import { useProjectSettings } from "@/hooks/use-project-settings"

interface ProjectCostsListProps {
  projectId: string
}

type CostItem = {
  id: string
  month: string
  amount: number
  description?: string
  isCalculated?: boolean
}

export function ProjectCostsList({ projectId }: ProjectCostsListProps) {
  const queryClient = useQueryClient()
  const { getOverheadPercentage } = useProjectSettings()
  const [addVariableCostOpen, setAddVariableCostOpen] = useState(false)
  const [editCost, setEditCost] = useState<CostItem | null>(null)
  const [deleteCost, setDeleteCost] = useState<CostItem | null>(null)
  const [costType, setCostType] = useState<"variable">()
  const [activeTab, setActiveTab] = useState("variable")

  // Load variable costs
  const {
    data: variableCosts = [],
    isLoading: isLoadingVariableCosts,
    refetch: refetchVariableCosts,
  } = useQuery({
    queryKey: ["project-variable-costs", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_variable_costs")
        .select("*")
        .eq("project_id", projectId)
        .order("month", { ascending: true })

      if (error) {
        toast.error("Failed to load variable costs")
        throw error
      }

      return data as CostItem[]
    },
  })

  // Calculate overhead costs based on variable costs and settings
  const calculateOverheadCosts = () => {
    if (!variableCosts.length) return []
    
    // Group variable costs by month
    const costsByMonth = variableCosts.reduce<Record<string, number>>((acc, cost) => {
      const yearMonth = cost.month.substring(0, 7) // Format: YYYY-MM
      acc[yearMonth] = (acc[yearMonth] || 0) + Number(cost.amount)
      return acc
    }, {})
    
    // Create overhead costs for each month with variable costs
    return Object.entries(costsByMonth).map(([month, totalAmount]) => {
      const year = parseInt(month.split('-')[0])
      const percentage = getOverheadPercentage(year)
      const overheadAmount = (totalAmount * percentage) / 100
      
      return {
        id: `overhead-${month}`,
        month: `${month}-01`, // Set to first day of month for date formatting
        amount: overheadAmount,
        description: `${percentage}% overhead`,
        isCalculated: true // Mark as calculated so we know it's not from DB
      }
    })
  }

  const overheadCosts = calculateOverheadCosts()

  const handleSuccessAdd = async () => {
    await refetchVariableCosts()
    queryClient.invalidateQueries({ queryKey: ["project-costs", projectId] })
    toast.success("Cost added successfully")
  }

  const handleSuccessEdit = async () => {
    await refetchVariableCosts()
    queryClient.invalidateQueries({ queryKey: ["project-costs", projectId] })
    toast.success("Cost updated successfully")
  }

  const handleSuccessDelete = async () => {
    await refetchVariableCosts()
    queryClient.invalidateQueries({ queryKey: ["project-costs", projectId] })
    toast.success("Cost deleted successfully")
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Costs</h2>
        <div className="space-x-2">
          <Button onClick={() => {
            setCostType("variable")
            setAddVariableCostOpen(true)
          }}>
            Add Variable Cost
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="variable">Variable</TabsTrigger>
          <TabsTrigger value="overhead">Overhead (Calculated)</TabsTrigger>
        </TabsList>

        <TabsContent value="variable">
          <Card>
            <CardHeader>
              <CardTitle>Variable Costs</CardTitle>
              <CardDescription>
                Direct costs associated with the project that vary with the scale of work.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingVariableCosts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : variableCosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No variable costs defined for this project
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variableCosts.map((cost) => (
                      <TableRow key={cost.id}>
                        <TableCell>{format(new Date(cost.month), "MMMM yyyy")}</TableCell>
                        <TableCell>${cost.amount.toLocaleString()}</TableCell>
                        <TableCell>{cost.description || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditCost(cost)
                              setCostType("variable")
                            }}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeleteCost(cost)
                              setCostType("variable")
                            }}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overhead">
          <Card>
            <CardHeader>
              <CardTitle>Overhead Costs</CardTitle>
              <CardDescription>
                Calculated as a percentage of variable costs based on your overhead settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingVariableCosts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : overheadCosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No overhead costs calculated for this project
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overheadCosts.map((cost) => (
                      <TableRow key={cost.id}>
                        <TableCell>{format(new Date(cost.month), "MMMM yyyy")}</TableCell>
                        <TableCell>${cost.amount.toLocaleString()}</TableCell>
                        <TableCell>{cost.description || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Variable Cost Dialogs */}
      <ProjectVariableCostDialog
        open={addVariableCostOpen}
        onOpenChange={setAddVariableCostOpen}
        projectId={projectId}
        onSuccess={handleSuccessAdd}
      />

      {editCost && costType === "variable" && (
        <ProjectVariableCostDialog
          open={!!editCost}
          onOpenChange={() => setEditCost(null)}
          projectId={projectId}
          existingCost={editCost}
          onSuccess={handleSuccessEdit}
        />
      )}

      {deleteCost && costType === "variable" && (
        <DeleteCostDialog
          open={!!deleteCost}
          onOpenChange={() => setDeleteCost(null)}
          cost={deleteCost}
          costType="variable"
          projectId={projectId}
          onSuccess={handleSuccessDelete}
        />
      )}
    </div>
  )
}
