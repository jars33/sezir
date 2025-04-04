
import { supabase } from "@/integrations/supabase/client";

export interface BudgetCompany {
  id: string;
  name: string;
}

export const budgetCompaniesService = {
  async createCompanies(budgetComparisonId: string, companies: { name: string }[]): Promise<BudgetCompany[] | null> {
    try {
      const companiesToInsert = companies.map(company => ({
        name: company.name,
        budget_comparison_id: budgetComparisonId
      }));
      
      const { data, error } = await supabase
        .from('budget_companies')
        .insert(companiesToInsert)
        .select('id, name');
        
      if (error || !data) {
        console.error("Error creating companies:", error);
        return null;
      }
      
      return data as any[];
    } catch (error) {
      console.error("Error in createCompanies:", error);
      return null;
    }
  },
  
  async getCompaniesByBudgetId(budgetComparisonId: string): Promise<BudgetCompany[] | null> {
    try {
      const { data, error } = await supabase
        .from('budget_companies')
        .select('id, name')
        .eq('budget_comparison_id', budgetComparisonId);
        
      if (error) {
        console.error("Error fetching companies:", error);
        return null;
      }
      
      return data as any[];
    } catch (error) {
      console.error("Error in getCompaniesByBudgetId:", error);
      return null;
    }
  },

  async updateCompanyName(companyId: string, name: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('budget_companies')
        .update({ name })
        .eq('id', companyId);
        
      if (error) {
        console.error("Error updating company name:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in updateCompanyName:", error);
      return false;
    }
  },

  async deleteCompaniesByBudgetId(budgetComparisonId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('budget_companies')
        .delete()
        .eq('budget_comparison_id', budgetComparisonId);
        
      if (error) {
        console.error("Error deleting companies:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in deleteCompaniesByBudgetId:", error);
      return false;
    }
  }
};
