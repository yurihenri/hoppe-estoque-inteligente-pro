
import { Badge } from '@/components/ui/badge';
import { Plan } from '@/types/plans';
import { Crown, Zap } from 'lucide-react';

interface PlanBadgeProps {
  plan: Plan;
  className?: string;
}

export const PlanBadge = ({ plan, className }: PlanBadgeProps) => {
  const isPro = plan.type === 'pro';
  
  return (
    <Badge 
      variant={isPro ? "default" : "secondary"} 
      className={`flex items-center gap-1 ${className}`}
    >
      {isPro ? <Crown size={12} /> : <Zap size={12} />}
      {plan.name}
    </Badge>
  );
};
