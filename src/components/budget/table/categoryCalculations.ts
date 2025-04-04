
export interface CategoryTotals {
  [categoryId: string]: {
    [companyId: string]: number;
    lowestPrice: number;
    averagePrice: number;
  }
}

export function calculateCategoryTotals(
  items: any[],
  categoryItems: any[]
): CategoryTotals {
  const categoryTotals: CategoryTotals = {};
  
  // Get all categories
  categoryItems.forEach(category => {
    const childPrefix = category.code + ".";
    
    // Find all direct children of this category that aren't categories themselves
    const directChildren = items.filter(item => 
      !item.isCategory && 
      item.code.startsWith(childPrefix) &&
      !item.code.substring(childPrefix.length).includes(".")
    );
    
    // Calculate totals per company for this category
    const totals: Record<string, number> = {};
    
    directChildren.forEach(child => {
      Object.entries(child.prices).forEach(([companyId, price]) => {
        totals[companyId] = (totals[companyId] || 0) + (price as number);
      });
    });
    
    // Calculate lowest and average prices
    const priceValues = Object.values(totals).filter(p => p > 0);
    let lowestPrice = 0;
    let averagePrice = 0;
    
    if (priceValues.length > 0) {
      lowestPrice = Math.min(...priceValues);
      averagePrice = priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length;
    }
    
    categoryTotals[category.id] = {
      ...totals,
      lowestPrice,
      averagePrice
    };
  });
  
  return categoryTotals;
}
