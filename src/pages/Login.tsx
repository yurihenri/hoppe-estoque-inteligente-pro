
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Credentials } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { secureStorage } from '@/utils/secureStorage';

const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const Login = () => {
  const { login, isLoading, error, clearError, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<Credentials>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  // Redireciona se já logado
  useEffect(() => {
    if (user && !isLoading) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, isLoading, navigate, location]);

  // Limpa erros quando começa a digitar
  useEffect(() => {
    const subscription = watch(() => {
      if (error) {
        clearError();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, error, clearError]);

  // Carrega preferência "lembrar de mim" do secure storage
  useEffect(() => {
    const saved = secureStorage.getUserPreference('remember_me');
    if (saved === true) {
      setRememberMe(true);
    }
  }, []);

  const watchedValues = watch();
  const canSubmit = isValid && watchedValues.email && watchedValues.password && !isLoading;

  const onSubmit = async (data: Credentials) => {
    try {
      // Sanitizar email antes de enviar
      const sanitizedEmail = data.email.toLowerCase().trim();
      
      await login(sanitizedEmail, data.password);
      
      // Salva preferência no secure storage
      if (rememberMe) {
        secureStorage.setUserPreference('remember_me', true);
      } else {
        secureStorage.setUserPreference('remember_me', false);
      }
      
      toast({
        title: "Login realizado!",
        description: "Bem-vindo ao Hoppe.",
      });
      
    } catch (error: any) {
      // Error is already handled in AuthContext
    }
  };

  // Se já logado, mostra carregamento
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-blue-400 border-blue-200/30 mx-auto mb-4"></div>
          <p className="text-white">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Hoppe</h1>
          <p className="text-blue-200">Sistema de Gerenciamento de Estoque</p>
        </div>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-center text-white">Fazer Login</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Erro de autenticação */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10 bg-white/10 border-white/30 text-white placeholder-blue-200"
                    {...register('email')}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-300 text-sm">{errors.email.message}</p>
                )}
              </div>
              
              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-white/10 border-white/30 text-white placeholder-blue-200"
                    {...register('password')}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-blue-300 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-300 text-sm">{errors.password.message}</p>
                )}
              </div>

              {/* Lembrar de mim */}
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-transparent border-white/30 rounded"
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-blue-200 text-sm">
                  Lembrar de mim
                </Label>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!canSubmit}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
              
              <p className="text-blue-200 text-sm text-center">
                Não tem conta?{' '}
                <Link to="/register" className="text-blue-400 hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
