
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
    
    setCompanies(prev => [...prev, newCompany]);
  };
  
  const removeCompany = (id: string) => {
    setCompanies(prev => prev.filter(company => company.id !== id));
  };

  const updateCompanyName = (id: string, name: string) => {
    setCompanies(prev => 
      prev.map(company => 
        company.id === id 
          ? { ...company, name } 
          : company
      )
    );
  };
  
  return {
    companies,
    setCompanies,
    addCompany,
    removeCompany,
    updateCompanyName
  };
}
