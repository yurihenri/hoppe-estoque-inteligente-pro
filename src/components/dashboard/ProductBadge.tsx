
import React from "react";
import { Badge } from "@/components/ui/badge";
import { isAfter, addDays, isBefore } from "date-fns";

interface ProductBadgeProps {
  validityDate?: string | null;
}

export const ProductBadge: React.FC<ProductBadgeProps> = ({ validityDate }) => {
  if (!validityDate) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-600">
        Sem data
      </Badge>
    );
  }

  const today = new Date();
  const validity = new Date(validityDate);
  const weekLater = addDays(today, 7);

  // Produto vencido
  if (isBefore(validity, today)) {
    return (
      <Badge variant="destructive">
        Vencido
      </Badge>
    );
  }
  
  // Produto a vencer em 7 dias
  if (isBefore(validity, weekLater)) {
    return (
      <Badge className="bg-warning text-warning-foreground hover:bg-warning/90">
        A vencer
      </Badge>
    );
  }
  
  // Produto normal
  return (
    <Badge className="bg-success text-success-foreground hover:bg-success/90">
      Normal
    </Badge>
  );
};

// Adicionando componente de badge para nível de estoque
interface StockBadgeProps {
  quantity: number;
  lowThreshold?: number;
  mediumThreshold?: number;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ 
  quantity, 
  lowThreshold = 5, 
  mediumThreshold = 20 
}) => {
  if (quantity <= lowThreshold) {
    return (
      <Badge variant="destructive">
        Estoque Baixo
      </Badge>
    );
  } else if (quantity <= mediumThreshold) {
    return (
      <Badge className="bg-warning text-warning-foreground hover:bg-warning/90">
        Estoque Médio
      </Badge>
    );
  } else {
    return (
      <Badge className="bg-success text-success-foreground hover:bg-success/90">
        Estoque Alto
      </Badge>
    );
  }
};
