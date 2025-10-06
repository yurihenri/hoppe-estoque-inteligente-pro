import { lazy } from 'react';

// Lazy load main pages for better performance
export const Dashboard = lazy(() => import('@/pages/Dashboard'));
export const Produtos = lazy(() => import('@/pages/Produtos'));
export const Categorias = lazy(() => import('@/pages/Categorias'));
export const Relatorios = lazy(() => import('@/pages/Relatorios'));
export const Alertas = lazy(() => import('@/pages/Alertas'));
export const IntegracaoDados = lazy(() => import('@/pages/IntegracaoDados'));
export const Configuracoes = lazy(() => import('@/pages/Configuracoes'));
export const Planos = lazy(() => import('@/pages/Planos'));
export const Onboarding = lazy(() => import('@/pages/Onboarding'));