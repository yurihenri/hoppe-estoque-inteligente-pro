
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { RegisterData } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, Building, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const registerSchema = z.object({
  nome: z.string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  empresa: z.string()
    .min(2, 'O nome da empresa deve ter pelo menos 2 caracteres')
    .max(100, 'O nome da empresa deve ter no máximo 100 caracteres'),
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Por favor, insira um email válido'),
  password: z.string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .max(100, 'A senha deve ter no máximo 100 caracteres'),
});

const Register = () => {
  const { register, isLoading, error, clearError, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  // Redireciona se já estiver logado
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Limpa erros quando o componente monta
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Limpa erros quando o usuário começa a digitar
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [watch('email'), watch('password'), watch('nome'), watch('empresa'), error, clearError]);

  // Observa valores do formulário para habilitar/desabilitar botão
  const watchedFields = watch();
  const isFormValid = isValid && isDirty && 
    watchedFields.email && watchedFields.password && 
    watchedFields.nome && watchedFields.empresa;

  const onSubmit = async (data: RegisterData) => {
    try {
      await register(data);
      
      setIsSuccess(true);
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta e fazer login.",
        variant: "default",
      });
      
      // Redireciona para login após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error: any) {
      // O erro já foi tratado no AuthContext
      console.error('Register error:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
        <div className="w-full max-w-md">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Conta Criada!</h2>
                <p className="text-blue-200">Verifique seu email para confirmar a conta.</p>
                <p className="text-blue-300 text-sm">Redirecionando para login...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <CardTitle className="text-center text-white text-xl">Criar Conta</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-5">
              {/* Exibe erro de autenticação */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Campo Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-white font-medium">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    className="pl-10 bg-white/10 border-white/30 text-white placeholder-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    {...registerField('nome')}
                    disabled={isLoading}
                  />
                </div>
                {errors.nome && (
                  <p className="text-red-300 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.nome.message}
                  </p>
                )}
              </div>
              
              {/* Campo Empresa */}
              <div className="space-y-2">
                <Label htmlFor="empresa" className="text-white font-medium">Nome da Empresa</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                  <Input
                    id="empresa"
                    type="text"
                    placeholder="Nome da sua empresa"
                    className="pl-10 bg-white/10 border-white/30 text-white placeholder-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    {...registerField('empresa')}
                    disabled={isLoading}
                  />
                </div>
                {errors.empresa && (
                  <p className="text-red-300 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.empresa.message}
                  </p>
                )}
              </div>
              
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
                    {...registerField('email')}
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
                    {...registerField('password')}
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
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>
              
              <div className="text-center">
                <p className="text-blue-200 text-sm">
                  Já tem uma conta?{' '}
                  <Link 
                    to="/login" 
                    className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors"
                  >
                    Faça login
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

export default Register;
