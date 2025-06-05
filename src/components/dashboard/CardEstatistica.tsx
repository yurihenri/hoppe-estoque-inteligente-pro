
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
  corIcone = "bg-blue-500/20",
  tendencia,
  porcentagemMudanca,
  className,
}) => {
  return (
    <Card className={cn("card-stats", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-200">{titulo}</CardTitle>
        <div className={cn("p-2 rounded-full", corIcone)}>{icone}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{valor}</div>
        {descricao && (
          <p className="text-xs text-slate-400 mt-1">{descricao}</p>
        )}
        {tendencia && porcentagemMudanca !== undefined && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                "text-xs font-medium",
                tendencia === "aumento"
                  ? "text-green-400"
                  : "text-red-400"
              )}
            >
              {tendencia === "aumento" ? "+" : "-"}
              {porcentagemMudanca}%
            </span>
            <span className="text-xs text-slate-400 ml-1">desde o último mês</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CardEstatistica;
