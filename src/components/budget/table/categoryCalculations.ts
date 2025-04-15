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
        // Fix the typing issue by explicitly casting price to number and checking it's a valid number
        const numericPrice = Number(price);
        if (!isNaN(numericPrice) && numericPrice > 0) {
          totals[companyId] = (totals[companyId] || 0) + numericPrice;
        }
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

/**
 * Recalculate item codes when items are deleted or reordered
 */
export function recalculateItemCodes(items: any[]): any[] {
  // First, identify all top-level items
  const topLevelItems = items.filter(item => !item.code.includes('.'));
  
  // Sort top-level items by their index in the array
  // This preserves the order after dragging
  const sortedTopLevelItems = [...topLevelItems].sort((a, b) => {
    const aIndex = items.findIndex(item => item.id === a.id);
    const bIndex = items.findIndex(item => item.id === b.id);
    return aIndex - bIndex;
  });
  
  // Assign sequential codes to top-level items
  let currentTopCode = 1;
  const updatedItems = [...items]; // Clone to avoid mutating the original
  const codeMap = new Map(); // Map to track old code -> new code
  
  // First pass: update top-level codes and build the mapping
  sortedTopLevelItems.forEach(item => {
    const oldCode = item.code;
    const newCode = String(currentTopCode);
    
    // Update the item's code
    const itemIndex = updatedItems.findIndex(i => i.id === item.id);
    if (itemIndex !== -1) {
      updatedItems[itemIndex] = { 
        ...updatedItems[itemIndex], 
        code: newCode 
      };
    }
    
    // Store mapping for children updates
    codeMap.set(oldCode, newCode);
    currentTopCode++;
  });
  
  // Second pass: update all child items using the code map
  updatedItems.forEach((item, index) => {
    if (item.code.includes('.')) {
      const [parentCode, ...rest] = item.code.split('.');
      const newParentCode = codeMap.get(parentCode);
      
      if (newParentCode) {
        updatedItems[index] = {
          ...item,
          code: `${newParentCode}.${rest.join('.')}`
        };
      }
    }
  });
  
  // Third pass: ensure sub-items are properly numbered within each category
  const categories = updatedItems.filter(item => item.isCategory);
  categories.forEach(category => {
    // Find all direct children of this category
    const children = updatedItems.filter(item => {
      if (item.isCategory) return false;
      const [parent, subCode] = item.code.split('.');
      return parent === category.code && subCode && !subCode.includes('.');
    });
    
    // Sort children by their current order in the array
    // This preserves the drag order within a category
    children.sort((a, b) => {
      const aIndex = updatedItems.findIndex(item => item.id === a.id);
      const bIndex = updatedItems.findIndex(item => item.id === b.id);
      return aIndex - bIndex;
    });
    
    // Renumber the children sequentially
    children.forEach((child, childIndex) => {
      const itemIndex = updatedItems.findIndex(i => i.id === child.id);
      if (itemIndex !== -1) {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          code: `${category.code}.${childIndex + 1}`
        };
      }
    });
  });
  
  return updatedItems;
}

/**
 * Get text color class based on price comparison
 */
export function getTextColorClass(price: number, lowestPrice: number, averagePrice: number): string {
  if (price <= 0) return "";
  
  // If this is the lowest price, make it green
  if (price === lowestPrice) return "text-green-600 font-bold";
  
  // If the price is higher than average, make it red
  if (price > averagePrice) return "text-red-600";
  
  // Otherwise, make it a neutral color
  return "text-amber-600";
}
