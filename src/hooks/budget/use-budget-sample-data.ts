
import { useState } from "react";
import { BudgetComparisonItem, Company } from "@/types/budget";

export function useBudgetSampleData() {
  // Sample data creators for testing
  const createSampleCompanies = (count: number = 3): Company[] => {
    const companies: Company[] = [];
    for (let i = 1; i <= count; i++) {
      companies.push({
        id: `company-${i}`,
        name: `Company ${i}`
      });
    }
    return companies;
  };

  const createSampleItems = (companies: Company[]): BudgetComparisonItem[] => {
    const items: BudgetComparisonItem[] = [];
    
    // Create categories
    const cat1: BudgetComparisonItem = {
      id: "cat-1",
      code: "1",
      description: "Category 1",
      isCategory: true,
      prices: {},
      lowestPrice: 0,
      middlePrice: 0,
      averagePrice: 0
    };
    
    const cat2: BudgetComparisonItem = {
      id: "cat-2",
      code: "2",
      description: "Category 2",
      isCategory: true,
      prices: {},
      lowestPrice: 0,
      middlePrice: 0,
      averagePrice: 0
    };
    
    // Create items for Category 1
    const item1: BudgetComparisonItem = {
      id: "item-1",
      code: "1.1",
      description: "Item 1.1",
      isCategory: false,
      parentId: "cat-1",
      prices: {},
      lowestPrice: 0,
      middlePrice: 0,
      averagePrice: 0
    };
    
    const item2: BudgetComparisonItem = {
      id: "item-2",
      code: "1.2",
      description: "Item 1.2",
      isCategory: false,
      parentId: "cat-1",
      prices: {},
      lowestPrice: 0,
      middlePrice: 0,
      averagePrice: 0
    };
    
    // Create items for Category 2
    const item3: BudgetComparisonItem = {
      id: "item-3",
      code: "2.1",
      description: "Item 2.1",
      isCategory: false,
      parentId: "cat-2",
      prices: {},
      lowestPrice: 0,
      middlePrice: 0,
      averagePrice: 0
    };
    
    items.push(cat1, cat2, item1, item2, item3);
    
    // Add sample prices
    if (companies.length > 0) {
      for (const item of [item1, item2, item3]) {
        for (const company of companies) {
          const price = Math.floor(Math.random() * 10000) / 100;
          item.prices[company.id] = price;
        }
      }
    }
    
    return items;
  };

  return {
    createSampleCompanies,
    createSampleItems
  };
}
