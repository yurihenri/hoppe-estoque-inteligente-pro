
export interface PlanFeatures {
  reports: boolean;
  exports: boolean;
  integrations: boolean;
  email_alerts: boolean;
  app_notifications: boolean;
  advanced_dashboard: boolean;
  remove_branding: boolean;
}

export interface Plan {
  id: string;
  name: string;
  type: 'free' | 'pro';
  price_brl: number;
  max_products: number;
  max_users: number;
  features: PlanFeatures;
  created_at: string;
}

export interface Subscription {
  id: string;
  empresa_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
  plan?: Plan;
}

export interface PlanLimits {
  allowed: boolean;
  reason?: string;
  current?: number;
  max?: number;
}
