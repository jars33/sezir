
import React from "react";
import { formatCurrency } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

interface PriceCellProps {
  price: number;
  average: number;
  stdDev: number;
  onChange: (value: number) => void;
  isCategory?: boolean;
  readOnly?: boolean;
}

export const PriceCell: React.FC<PriceCellProps> = ({ 
  price, 
  average, 
  stdDev, 
  onChange, 
  isCategory = false,
  readOnly = false
}) => {
  // Calculate percentage variance
  const variance = average > 0 ? ((price - average) / average) * 100 : 0;
  
  // Determine color based on deviation (normalize by standard deviation)
  const getColorClass = () => {
    if (price === 0 || average === 0) return "";
    
    const zScore = stdDev > 0 ? Math.abs(price - average) / stdDev : 0;
    
    if (variance < 0) {
      // Below average (good) - green shades
      if (zScore > 2) return "bg-green-200 text-green-900";
      if (zScore > 1) return "bg-green-100 text-green-800";
      return "bg-green-50 text-green-700";
    } else {
      // Above average (bad) - red shades
      if (zScore > 2) return "bg-red-200 text-red-900";
      if (zScore > 1) return "bg-red-100 text-red-800";
      return "bg-red-50 text-red-700";
    }
  };

  const formattedValue = formatCurrency(price);
  const colorClass = getColorClass();
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger className="w-full" asChild>
          <div className={`${price > 0 && !isCategory ? colorClass : ""} p-1 rounded h-full w-full`}>
            {isCategory || readOnly ? (
              <div className="text-right p-1">
                {price > 0 ? formattedValue : ""}
              </div>
            ) : (
              <Input
                type="number"
                value={price || ""}
                onChange={(e) => onChange(Number(e.target.value))}
                className="text-right border-0 bg-transparent p-0 focus:ring-0"
                placeholder="0.00"
              />
            )}
          </div>
        </TooltipTrigger>
        {price > 0 && (
          <TooltipContent side="top">
            <div className="text-sm">
              <p><strong>Value:</strong> {formattedValue}</p>
              <p><strong>Average:</strong> {formatCurrency(average)}</p>
              <p className={variance < 0 ? "text-green-600" : variance > 0 ? "text-red-600" : ""}>
                <strong>Variance:</strong> {variance.toFixed(2)}%
              </p>
              {stdDev > 0 && (
                <p><strong>Std Dev:</strong> {formatCurrency(stdDev)}</p>
              )}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
