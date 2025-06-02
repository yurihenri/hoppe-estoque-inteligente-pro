
import { useState, useEffect } from 'react';
import { ProdutoForm } from './ProdutoForm';
import { usePlans } from '@/hooks/usePlans';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProdutoFormWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  produto?: any;
  onSubmitSuccess: () => void;
}

export const ProdutoFormWrapper = ({ 
  isOpen, 
  onClose, 
  produto, 
  onSubmitSuccess 
}: ProdutoFormWrapperProps) => {
  const { checkPlanLimits, currentPlan } = usePlans();
  const [canAddProduct, setCanAddProduct] = useState(true);
  const [limitMessage, setLimitMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkLimits = async () => {
      if (!isOpen || produto) return; // Se está editando, não precisa verificar

      setLoading(true);
      try {
        const limits = await checkPlanLimits('products');
        setCanAddProduct(limits.allowed);
        if (!limits.allowed) {
          setLimitMessage(limits.reason || 'Limite atingido');
        }
      } catch (error) {
        console.error('Erro ao verificar limites:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLimits();
  }, [isOpen, produto, checkPlanLimits]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">Verificando limites do plano...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canAddProduct && !produto) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle size={20} />
              Limite Atingido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{limitMessage}</p>
            <p className="text-sm text-gray-600">
              Você atingiu o limite do seu plano atual. Para cadastrar mais produtos, 
              faça upgrade para o plano Pro.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Fechar
              </Button>
              <Button asChild className="flex-1">
                <Link to="/planos" onClick={onClose}>
                  <Crown size={16} className="mr-2" />
                  Ver Planos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProdutoForm
      isOpen={isOpen}
      onClose={onClose}
      produto={produto}
      onSubmitSuccess={onSubmitSuccess}
    />
  );
};
