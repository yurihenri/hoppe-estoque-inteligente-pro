
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Credentials } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Por favor, insira um email válido'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
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
    formState: { errors, isValid, isDirty },
    watch,
  } = useForm<Credentials>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  // Redireciona se já estiver logado
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Limpa erros quando o componente monta
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Limpa erros quando o usuário começa a digitar
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [watch('email'), watch('password'), error, clearError]);

  // Carrega preferência de "lembrar de mim"
  useEffect(() => {
    const savedRememberMe = localStorage.getItem('hoppe_remember_me');
    if (savedRememberMe === 'true') {
      setRememberMe(true);
    }
  }, []);

  // Observa valores do formulário para habilitar/desabilitar botão
  const watchedFields = watch();
  const isFormValid = isValid && isDirty && watchedFields.email && watchedFields.password;

  const onSubmit = async (data: Credentials) => {
    try {
      await login(data.email, data.password);
      
      // Salva preferência de "lembrar de mim"
      if (rememberMe) {
        localStorage.setItem('hoppe_remember_me', 'true');
      } else {
        localStorage.removeItem('hoppe_remember_me');
      }
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Hoppe - Sistema de Gerenciamento de Estoque.",
        variant: "default",
      });
      
      // Navegação será tratada pelo useEffect acima
      
    } catch (error: any) {
      // O erro já foi tratado no AuthContext
      console.error('Login error:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo e Marca */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Hoppe</h1>
          <p className="text-blue-200 text-lg font-medium">Sistema de Gerenciamento de Estoque</p>
          <p className="text-blue-300 text-sm mt-1">Gerencie estoques com precisão e evite perdas por vencimento.</p>
        </div>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-white text-xl">Fazer Login</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Exibe erro de autenticação */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10 bg-white/10 border-white/30 text-white placeholder-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    {...register('email')}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-300 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email.message}
                  </p>
                )}
              </div>
              
              {/* Campo Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-white/10 border-white/30 text-white placeholder-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    {...register('password')}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-blue-300 hover:text-white hover:bg-transparent"
                    onClick={togglePasswordVisibility}
                    tabIndex={-1}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-300 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Checkbox Lembrar de mim */}
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-transparent border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-blue-200 text-sm cursor-pointer">
                  Lembrar de mim
                </Label>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!isFormValid || isLoading}
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
              
              <div className="text-center">
                <p className="text-blue-200 text-sm">
                  Não tem uma conta?{' '}
                  <Link 
                    to="/register" 
                    className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors"
                  >
                    Cadastre-se
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        {/* Rodapé */}
        <div className="text-center mt-6">
          <p className="text-blue-300 text-xs">
            © 2024 Hoppe. Sistema seguro e confiável para gestão de estoque.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
