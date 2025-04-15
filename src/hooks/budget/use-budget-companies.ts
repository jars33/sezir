
import { useState } from "react";
import { Company } from "@/types/budget";

export function useBudgetCompanies(initialCompanies: Company[] = []) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  
  const addCompany = (name: string) => {
    const newCompany: Company = {
      id: crypto.randomUUID(),
      name
    };
    setCompanies(prevCompanies => [...prevCompanies, newCompany]);
  };
  
  const removeCompany = (companyId: string) => {
    setCompanies(prevCompanies => prevCompanies.filter(company => company.id !== companyId));
  };
  
  const updateCompanyName = (companyId: string, name: string) => {
    setCompanies(prevCompanies => {
      return prevCompanies.map(company => {
        if (company.id === companyId) {
          return { ...company, name };
        }
        return company;
      });
    });
  };
  
  return {
    companies,
    setCompanies,
    addCompany,
    removeCompany,
    updateCompanyName: updateCompanyName
  };
}
