
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
      <Badge className="bg-erro-100 text-erro-700 border-erro-200 hover:bg-erro-200">
        Vencido
      </Badge>
    );
  }
  
  // Produto a vencer em 7 dias
  if (isBefore(validity, weekLater)) {
    return (
      <Badge className="bg-alerta-100 text-alerta-700 border-alerta-200 hover:bg-alerta-200">
        A vencer
      </Badge>
    );
  }
  
  // Produto normal
  return (
    <Badge className="bg-sucesso-100 text-sucesso-700 border-sucesso-200 hover:bg-sucesso-200">
      Normal
    </Badge>
  );
};
