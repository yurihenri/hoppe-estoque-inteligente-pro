
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plan } from '@/types/plans';
import { Package, Users } from 'lucide-react';

interface PlanLimitsProps {
  plan: Plan;
  currentProducts: number;
  currentUsers: number;
}

export const PlanLimits = ({ plan, currentProducts, currentUsers }: PlanLimitsProps) => {
  const productUsage = (currentProducts / plan.max_products) * 100;
  const userUsage = (currentUsers / plan.max_users) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Uso do Plano</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Package size={14} />
              <span>Produtos</span>
            </div>
            <span className="font-medium">
              {currentProducts} / {plan.max_products}
            </span>
          </div>
          <Progress value={productUsage} className="h-2" />
          {productUsage > 80 && (
            <p className="text-xs text-amber-600">
              Você está próximo do limite de produtos
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users size={14} />
              <span>Usuários</span>
            </div>
            <span className="font-medium">
              {currentUsers} / {plan.max_users}
            </span>
          </div>
          <Progress value={userUsage} className="h-2" />
          {userUsage > 80 && (
            <p className="text-xs text-amber-600">
              Você está próximo do limite de usuários
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
