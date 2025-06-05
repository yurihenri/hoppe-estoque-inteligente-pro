
import { Plan, PlanFeatures } from '@/types/plans';
import { Json } from '@/integrations/supabase/types';

export const convertJsonToFeatures = (features: Json): PlanFeatures => {
  if (typeof features === 'object' && features !== null && !Array.isArray(features)) {
    const obj = features as { [key: string]: any };
    return {
      reports: obj.reports || false,
      exports: obj.exports || false,
      integrations: obj.integrations || false,
      email_alerts: obj.email_alerts || true,
      app_notifications: obj.app_notifications || false,
      advanced_dashboard: obj.advanced_dashboard || false,
      remove_branding: obj.remove_branding || false
    };
  }
  return {
    reports: false,
    exports: false,
    integrations: false,
    email_alerts: true,
    app_notifications: false,
    advanced_dashboard: false,
    remove_branding: false
  };
};
