import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function ProjectList({ onViewProject }: { onViewProject: (id: string) => void }) {
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          project_revenues (
            amount,
            month
          ),
          project_variable_costs (
            amount,
            month
          ),
          project_overhead_costs (
            amount,
            month
          ),
          project_assignments (
            id
          )
        `)
        .order("number")

      if (error) throw error
      return data
    },
  })

  // Group projects by status
  const groupedProjects = (projects || []).reduce(
    (acc, project) => {
      const status = project.status || "planned"
      if (!acc[status]) {
        acc[status] = []
      }
      acc[status].push(project)
      return acc
    },
    {} as Record<string, typeof projects>
  )

  const statuses = ["active", "planned", "completed", "cancelled"]

  return (
    <div className="space-y-8">
      {statuses.map((status) => {
        const statusProjects = groupedProjects[status] || []
        if (statusProjects.length === 0) return null

        return (
          <div key={status} className="rounded-lg border bg-card">
            <div className="border-b p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold capitalize">
                  {status} Projects
                </h2>
                <p className="text-sm text-muted-foreground">
                  {statusProjects.length} project{statusProjects.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div className="divide-y">
              {statusProjects.map((project) => {
                const totalRevenue = (project.project_revenues || []).reduce(
                  (sum: number, revenue: any) => sum + (revenue.amount || 0),
                  0
                )

                const totalCosts = [
                  ...(project.project_variable_costs || []),
                  ...(project.project_overhead_costs || []),
                ].reduce((sum: number, cost: any) => sum + (cost.amount || 0), 0)

                const teamSize = (project.project_assignments || []).length

                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 hover:bg-accent/50 cursor-pointer"
                    onClick={() => onViewProject(project.id)}
                  >
                    <div>
                      <div className="font-medium">
                        {project.number ? `${project.number} - ` : ''}{project.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Team size: {teamSize}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {totalRevenue.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Costs:{" "}
                        {totalCosts.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
