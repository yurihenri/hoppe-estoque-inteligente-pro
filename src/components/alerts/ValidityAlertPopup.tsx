
import React, { useState } from "react";
import { AlertTriangle, X, Calendar, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useValidityAlerts } from "@/hooks/useValidityAlerts";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export const ValidityAlertPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { hasAlerts, totalAlerts, expiredProducts, soonToExpireProducts, isLoading } = useValidityAlerts();

  // Não renderizar se não há alertas, está carregando, ou foi fechado pelo usuário
  if (!hasAlerts || isLoading || !isVisible) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            <div>
              <p className="font-semibold text-sm">
                {totalAlerts === 1 
                  ? "1 produto com validade crítica" 
                  : `${totalAlerts} produtos com validade crítica`
                }
              </p>
              <p className="text-xs opacity-90">
                {expiredProducts.length > 0 && (
                  <>
                    {expiredProducts.length} vencido{expiredProducts.length > 1 ? 's' : ''}
                    {soonToExpireProducts.length > 0 && ', '}
                  </>
                )}
                {soonToExpireProducts.length > 0 && (
                  <>
                    {soonToExpireProducts.length} vencendo em breve
                  </>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 text-xs"
              onClick={() => window.location.href = '/dashboard'}
            >
              Ver Detalhes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-1"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lista condensada dos produtos mais críticos */}
        {totalAlerts <= 3 && (
          <div className="mt-2 space-y-1">
            {[...expiredProducts, ...soonToExpireProducts].slice(0, 3).map((alert) => (
              <div key={alert.id} className="text-xs flex items-center justify-between bg-black/20 rounded px-2 py-1">
                <div className="flex items-center space-x-2">
                  <Package className="h-3 w-3" />
                  <span className="font-medium">{alert.nome}</span>
                </div>
                <div className="flex items-center space-x-1 text-white/80">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {alert.daysUntilExpiry < 0 
                      ? `Vencido há ${Math.abs(alert.daysUntilExpiry)} dia${Math.abs(alert.daysUntilExpiry) > 1 ? 's' : ''}`
                      : alert.daysUntilExpiry === 0 
                        ? 'Vence hoje'
                        : `${alert.daysUntilExpiry} dia${alert.daysUntilExpiry > 1 ? 's' : ''}`
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
