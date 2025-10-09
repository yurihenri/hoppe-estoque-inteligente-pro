import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertRule, AlertNotification } from '@/types/alertas';
import { normalizeProduto } from '@/utils/normalizeData';
import { addDays, isBefore, differenceInDays } from 'date-fns';

export const useAlertNotifications = () => {
  const [notifications, setNotifications] = useState<AlertNotification[]>(() => {
    const saved = localStorage.getItem('alertNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Buscar regras de alerta ativas
  const getActiveRules = (): AlertRule[] => {
    const savedRules = localStorage.getItem('alertRules');
    if (!savedRules) return [];
    const rules: AlertRule[] = JSON.parse(savedRules);
    return rules.filter(rule => rule.active);
  };

  // Buscar produtos
  const { data: produtos } = useQuery({
    queryKey: ['produtos-for-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          *,
          categorias:categoria_id (
            id,
            nome,
            cor
          )
        `);
      
      if (error) throw error;
      return data.map(produto => normalizeProduto(produto));
    },
    refetchInterval: 60000, // Refetch a cada 1 minuto
  });

  // Gerar notificações baseadas nas regras
  useEffect(() => {
    if (!produtos) return;

    const activeRules = getActiveRules();
    const newNotifications: AlertNotification[] = [];
    const today = new Date();

    produtos.forEach(produto => {
      activeRules.forEach(rule => {
        // Verificar se a regra se aplica à categoria do produto
        if (rule.category && produto.categoria?.nome !== rule.category) {
          return;
        }

        let shouldAlert = false;
        let message = '';

        if (rule.type === 'quantidade') {
          if (produto.estoqueAtual <= rule.threshold) {
            shouldAlert = true;
            message = `Estoque baixo: ${produto.nome} tem apenas ${produto.estoqueAtual} unidades`;
          }
        } else if (rule.type === 'validade' && produto.validade) {
          const validadeDate = new Date(produto.validade);
          const daysUntilExpiry = differenceInDays(validadeDate, today);
          
          if (daysUntilExpiry <= rule.threshold && daysUntilExpiry >= 0) {
            shouldAlert = true;
            message = `Produto próximo do vencimento: ${produto.nome} vence em ${daysUntilExpiry} dias`;
          } else if (daysUntilExpiry < 0) {
            shouldAlert = true;
            message = `Produto vencido: ${produto.nome} venceu há ${Math.abs(daysUntilExpiry)} dias`;
          }
        }

        if (shouldAlert) {
          // Verificar se já existe notificação para este produto e regra
          const notificationId = `${produto.id}-${rule.id}`;
          const existingNotification = notifications.find(n => n.id === notificationId);

          if (!existingNotification) {
            newNotifications.push({
              id: notificationId,
              createdAt: new Date().toISOString(),
              productId: produto.id,
              productName: produto.nome,
              ruleId: rule.id,
              ruleType: rule.type,
              message,
              read: false,
            });
          }
        }
      });
    });

    if (newNotifications.length > 0) {
      const updatedNotifications = [...notifications, ...newNotifications];
      setNotifications(updatedNotifications);
      localStorage.setItem('alertNotifications', JSON.stringify(updatedNotifications));
    }
  }, [produtos]);

  const markAsRead = (notificationId: string) => {
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('alertNotifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('alertNotifications', JSON.stringify(updated));
  };

  const deleteNotification = (notificationId: string) => {
    const updated = notifications.filter(n => n.id !== notificationId);
    setNotifications(updated);
    localStorage.setItem('alertNotifications', JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem('alertNotifications', JSON.stringify([]));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
};
