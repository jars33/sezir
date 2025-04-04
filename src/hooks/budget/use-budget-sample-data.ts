
import { BudgetComparisonItem, Company } from "@/types/budget";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

// Sample initial data to populate the table with common budget item categories
const initialCategories: Partial<BudgetComparisonItem>[] = [
  { 
    code: "1", 
    description: "NOTAS INTRODUTÓRIAS",
    isCategory: true 
  },
  {
    code: "1.1",
    description: "Descrição do terreno para construir pilares",
    isCategory: false
  },
  {
    code: "1.2",
    description: "Higiene/Segurança, Salubridade e Saúde incluindo todas as medidas previstas",
    isCategory: false
  },
  {
    code: "1.3",
    description: "INSTALAÇÕES DO DONO DE OBRA E DA FISCALIZAÇÃO",
    isCategory: true
  },
  {
    code: "1.3.1",
    description: "Montagens e desmontagem provisórias",
    isCategory: false
  },
  {
    code: "1.3.2",
    description: "Sanitários separados por género",
    isCategory: false
  },
  {
    code: "1.4",
    description: "PROJECTOS DE INFRAESTRUTURAS GERAIS DE ESTALEIRO",
    isCategory: true
  },
  {
    code: "1.5",
    description: "OUTROS ARTIGOS OU RISCOS",
    isCategory: true
  }
];

export function useBudgetSampleData() {
  // Generate sample companies
  const createSampleCompanies = (): Company[] => {
    return [
      { id: uuidv4(), name: "BRITOLI" },
      { id: uuidv4(), name: "NORTON" },
      { id: uuidv4(), name: "AOC" }
    ];
  };
  
  // Generate sample budget items
  const createSampleItems = (): BudgetComparisonItem[] => {
    return initialCategories.map(cat => ({
      id: uuidv4(),
      code: cat.code || '',
      description: cat.description || '',
      isCategory: cat.isCategory || false,
      prices: {},
      lowestPrice: 0,
      middlePrice: 0,
      averagePrice: 0,
      standardDeviation: 0
    }));
  };
  
  return {
    createSampleCompanies,
    createSampleItems
  };
}
