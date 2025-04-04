
import { useState } from "react";
import { Company } from "@/types/budget";
import { v4 as uuidv4 } from "uuid";

export function useBudgetCompanies(initialCompanies: Company[] = []) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  
  const addCompany = (name: string) => {
    const newCompany: Company = {
      id: uuidv4(),
      name
    };
    
    setCompanies([...companies, newCompany]);
    return newCompany;
  };
  
  const removeCompany = (companyId: string) => {
    setCompanies(companies.filter(c => c.id !== companyId));
    return companyId;
  };
  
  return {
    companies,
    setCompanies,
    addCompany,
    removeCompany
  };
}
