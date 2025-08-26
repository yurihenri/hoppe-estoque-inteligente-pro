
import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CardEstatisticaProps {
  titulo: string;
  valor: number;
  descricao?: string;
  icone: React.ReactNode;
  corIcone?: string;
  tendencia?: "aumento" | "diminuicao";
  porcentagemMudanca?: number;
  className?: string;
}

const CardEstatistica: React.FC<CardEstatisticaProps> = ({
  titulo,
  valor,
  descricao,
  icone,
  corIcone = "bg-muted",
  tendencia,
  porcentagemMudanca,
  className,
}) => {
  return (
    <Card className={cn(
      "bg-card border shadow-sm",
      "hover:shadow-md transition-all duration-200",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
        <div className={cn("p-2 rounded-full", corIcone)}>{icone}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-card-foreground">{valor}</div>
        {descricao && (
          <p className="text-xs text-muted-foreground mt-1">{descricao}</p>
        )}
        {tendencia && porcentagemMudanca !== undefined && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                "text-xs font-medium",
                tendencia === "aumento"
                  ? "text-success"
                  : "text-destructive"
              )}
            >
              {tendencia === "aumento" ? "+" : "-"}
              {porcentagemMudanca}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">desde o último mês</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CardEstatistica;
