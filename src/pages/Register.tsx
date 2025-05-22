
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterData } from '@/types/auth';
import { Mail, Lock, User, Building, Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  empresa: z.string().min(2, 'O nome da empresa deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

const Register = () => {
  const { register, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    await register(data.email, data.password, data.nome, data.empresa);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel - Branding */}
      <div className="bg-[#0f172a] text-white w-full md:w-1/2 p-8 flex flex-col justify-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Hoppe</h1>
          <h2 className="text-xl mb-4">Sistema de Gerenciamento de Estoque</h2>
          <p className="text-blue-200 mb-8 max-w-md">
            Gerencie estoques com precisão e evite perdas por vencimento.
          </p>
          
          <div className="hidden md:block">
            <h3 className="text-lg font-medium mb-4">Por que escolher o Hoppe?</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                Monitoramento inteligente de validades
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                Alertas automáticos de estoque baixo
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                Relatórios detalhados em tempo real
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                Integração com sistemas de gestão
              </li>
            </ul>
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute left-0 right-0 top-0 h-32 bg-gradient-to-b from-blue-900/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900/30 to-transparent"></div>
          <div className="absolute w-72 h-72 rounded-full bg-blue-700/20 -top-10 -right-10 blur-3xl"></div>
          <div className="absolute w-72 h-72 rounded-full bg-blue-700/10 bottom-10 -left-10 blur-3xl"></div>
        </div>
      </div>
      
      {/* Right Panel - Register Form */}
      <div className="w-full md:w-1/2 bg-background p-8 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight">Criar sua conta</h2>
            <p className="text-muted-foreground mt-2">
              Preencha seus dados para criar sua conta
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  className={`pl-10 ${errors.nome ? 'border-red-500' : ''}`}
                  {...registerField('nome')}
                />
              </div>
              {errors.nome && (
                <p className="text-sm text-red-500">{errors.nome.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="empresa">Nome da Empresa</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  id="empresa"
                  type="text"
                  placeholder="Nome da sua empresa"
                  className={`pl-10 ${errors.empresa ? 'border-red-500' : ''}`}
                  {...registerField('empresa')}
                />
              </div>
              {errors.empresa && (
                <p className="text-sm text-red-500">{errors.empresa.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  {...registerField('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                  {...registerField('password')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-[#3b82f6] hover:bg-blue-700 transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Cadastrando...' : 'Criar conta'}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                Faça login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
