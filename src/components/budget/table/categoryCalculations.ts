
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
        if (typeof price === 'number' && price > 0) {
          totals[companyId] = (totals[companyId] || 0) + (price as number);
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

// Recalculate item codes after deletion or reordering
export function recalculateItemCodes(items: any[]): any[] {
  // Group items by their parent code or null for top-level items
  const itemsByParent: Record<string, any[]> = {};
  
  // First pass: group items by parent
  items.forEach(item => {
    const parentCode = item.code.includes('.') 
      ? item.code.substring(0, item.code.lastIndexOf('.'))
      : null;
      
    if (!itemsByParent[parentCode || '']) {
      itemsByParent[parentCode || ''] = [];
    }
    
    itemsByParent[parentCode || ''].push(item);
  });
  
  // Second pass: recalculate codes
  const recalculate = (parentCode: string | null): any[] => {
    const children = itemsByParent[parentCode || ''] || [];
    
    // Sort children by their current code to maintain relative order
    children.sort((a, b) => {
      const aLastPart = a.code.includes('.')
        ? parseInt(a.code.substring(a.code.lastIndexOf('.') + 1))
        : parseInt(a.code);
        
      const bLastPart = b.code.includes('.')
        ? parseInt(b.code.substring(b.code.lastIndexOf('.') + 1))
        : parseInt(b.code);
        
      return aLastPart - bLastPart;
    });
    
    // Recalculate codes
    return children.map((item, index) => {
      const newCode = parentCode ? `${parentCode}.${index + 1}` : `${index + 1}`;
      
      // Update item code
      const updatedItem = { ...item, code: newCode };
      
      // If this item has children, recalculate their codes too
      const childParentCode = item.code;
      if (itemsByParent[childParentCode]) {
        itemsByParent[newCode] = itemsByParent[childParentCode];
        delete itemsByParent[childParentCode];
      }
      
      return updatedItem;
    });
  };
  
  // Start with top-level items
  const result = recalculate(null);
  
  // Process all levels
  const processChildren = (items: any[]): any[] => {
    return items.flatMap(item => {
      const children = itemsByParent[item.code] || [];
      
      if (children.length > 0) {
        const recalculatedChildren = recalculate(item.code);
        return [item, ...processChildren(recalculatedChildren)];
      }
      
      return [item];
    });
  };
  
  return processChildren(result);
}
