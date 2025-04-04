
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { generateChartData } from "@/hooks/dashboard/chart-data";

export interface FinancialCalculationResult {
  monthlyData: {
    month: string;
    revenue: number;
    cost: number;
    profit: number;
  }[];
  totals: {
    revenue: number;
    variableCosts: number;
    overheadCosts: number;
    salaryCosts: number;
    totalCosts: number;
    profit: number;
  };
}

export const calculationsService = {
  /**
   * Fetches all financial data and calculates metrics for dashboard
   */
  async calculateFinancialMetrics(
    year: number,
    teamId: string | null = null
  ): Promise<FinancialCalculationResult> {
    // 1. Fetch all the raw financial data
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    
    // 1.1 Get revenues
    const { data: projectRevenues, error: revenuesError } = await supabase
      .from("project_revenues")
      .select(`
        id,
        month,
        amount,
        project_id,
        projects!inner (
          id,
          team_id
        )
      `)
      .gte("month", yearStart)
      .lte("month", yearEnd)
      .order("month");
      
    if (revenuesError) throw revenuesError;
    
    // Filter by team if needed
    const filteredRevenues = teamId 
      ? projectRevenues.filter(r => r.projects.team_id === teamId)
      : projectRevenues;
    
    // 1.2 Get variable costs
    const { data: variableCosts, error: costsError } = await supabase
      .from("project_variable_costs")
      .select(`
        id, 
        month,
        amount,
        description,
        project_id,
        projects!inner (
          id,
          team_id
        )
      `)
      .gte("month", yearStart)
      .lte("month", yearEnd)
      .order("month");
      
    if (costsError) throw costsError;
    
    // Filter by team if needed
    const filteredVariableCosts = teamId 
      ? variableCosts.filter(c => c.projects.team_id === teamId)
      : variableCosts;

    // 1.3 Get overhead costs
    const { data: overheadSettings, error: overheadError } = await supabase
      .from("project_overhead_settings")
      .select("*")
      .eq("year", year)
      .maybeSingle();
      
    if (overheadError) throw overheadError;
    
    // Default to 15% if no settings found
    const overheadPercentage = overheadSettings?.percentage || 15;
    
    // 1.4 Get team member allocations with salary costs
    const { data: allocations, error: allocationsError } = await supabase
      .from("project_member_allocations")
      .select(`
        id,
        month,
        allocation_percentage,
        project_assignment_id,
        project_assignments!inner (
          id,
          team_member_id,
          project_id,
          projects!inner (
            id,
            team_id
          )
        )
      `)
      .gte("month", yearStart)
      .lte("month", yearEnd);
      
    if (allocationsError) throw allocationsError;
    
    // Filter by team if needed
    const filteredAllocations = teamId 
      ? allocations.filter(a => a.project_assignments.projects.team_id === teamId)
      : allocations;
    
    // Add salary costs to allocations by fetching salary information
    const allocationsWithSalaries = await Promise.all(
      filteredAllocations.map(async (allocation) => {
        const { data: salaryData } = await supabase
          .from("salary_history")
          .select("amount")
          .eq("team_member_id", allocation.project_assignments.team_member_id)
          .lte("start_date", allocation.month)
          .or(`end_date.is.null,end_date.gte.${allocation.month}`)
          .order("start_date", { ascending: false })
          .maybeSingle();
        
        const monthlySalary = salaryData?.amount || 0;
        const salary_cost = (monthlySalary * allocation.allocation_percentage) / 100;
        
        return {
          ...allocation,
          salary_cost
        };
      })
    );

    // 2. Generate chart data with all components
    const chartData = generateChartData(
      year,
      filteredRevenues,
      filteredVariableCosts,
      [], // Overhead costs are calculated based on variable costs
      allocationsWithSalaries
    );
    
    // 3. Calculate totals
    const totalRevenue = filteredRevenues.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalVariableCosts = filteredVariableCosts.reduce((sum, c) => sum + Number(c.amount), 0);
    const totalOverheadCosts = (totalVariableCosts * overheadPercentage) / 100;
    const totalSalaryCosts = allocationsWithSalaries.reduce((sum, a) => sum + Number(a.salary_cost), 0);
    const totalCosts = totalVariableCosts + totalOverheadCosts + totalSalaryCosts;
    const totalProfit = totalRevenue - totalCosts;
    
    return {
      monthlyData: chartData.map(entry => ({
        month: entry.month,
        revenue: entry.revenue,
        cost: entry.cost,
        profit: entry.revenue - entry.cost
      })),
      totals: {
        revenue: totalRevenue,
        variableCosts: totalVariableCosts,
        overheadCosts: totalOverheadCosts,
        salaryCosts: totalSalaryCosts,
        totalCosts,
        profit: totalProfit
      }
    };
  }
};

// Export the service
export * from './calculations-service';
