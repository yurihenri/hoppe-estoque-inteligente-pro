
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { alertas, getProdutoById } from "@/mockData";
import { Bell, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const ListaAlertas: React.FC = () => {
  const alertasOrdenados = [...alertas].sort((a, b) => {
    // Prioridade para não lidos
    if (a.lido !== b.lido) return a.lido ? 1 : -1;
    // Em seguida, ordenar por data (mais recentes primeiro)
    return new Date(b.data).getTime() - new Date(a.data).getTime();
  });

  const formatarDataAlerta = (data: Date): string => {
    // Formatação simples para o exemplo
    return new Date(data).toLocaleDateString("pt-BR");
  };

  return (
    <Card className="col-span-2 card-stats">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Alertas Recentes
        </CardTitle>
        <Button variant="outline" size="sm">
          Ver Todos
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        {alertasOrdenados.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">
            Nenhum alerta recente
          </p>
        ) : (
          <div className="space-y-0">
            {alertasOrdenados.slice(0, 4).map((alerta, index) => {
              const produto = getProdutoById(alerta.produtoId);
              return (
                <React.Fragment key={alerta.id}>
                  {index > 0 && <Separator />}
                  <div
                    className={cn(
                      "p-4 flex items-start justify-between",
                      !alerta.lido && "bg-hoppe-50"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h4 className="font-medium text-sm">
                          {produto?.nome}
                          {!alerta.lido && (
                            <Badge variant="secondary" className="ml-2 bg-hoppe-100">
                              Novo
                            </Badge>
                          )}
                        </h4>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {formatarDataAlerta(alerta.data)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{alerta.mensagem}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge
                          variant={alerta.tipo === "vencimento" ? "destructive" : "secondary"}
                          className={cn(
                            alerta.tipo === "vencimento"
                              ? "bg-erro-500"
                              : "bg-alerta-500"
                          )}
                        >
                          {alerta.tipo === "vencimento" ? "Vencimento" : "Estoque Baixo"}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <X size={16} />
                    </Button>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ListaAlertas;
