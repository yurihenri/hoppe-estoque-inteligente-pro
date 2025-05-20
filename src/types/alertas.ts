
export interface AlertRule {
  id: string;
  createdAt: string;
  name: string; // nome da regra
  type: "quantidade" | "validade";
  threshold: number; // quantidade mínima ou dias para vencimento
  category: string; // categoria específica (opcional)
  channel: "email" | "push" | "in-app";
  frequency: "imediato" | "diario" | "semanal";
  active: boolean;
}

export interface AlertNotification {
  id: string;
  createdAt: string;
  productId: string;
  productName: string;
  ruleId: string;
  ruleType: "quantidade" | "validade";
  message: string;
  read: boolean;
}
