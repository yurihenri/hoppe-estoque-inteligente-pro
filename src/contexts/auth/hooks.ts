
import { supabase } from '@/integrations/supabase/client';
import { sanitizeEmail } from '@/utils/emailUtils';

export const useAuthLogin = () => {
  const login = async (email: string, password: string) => {
    const sanitizedEmail = sanitizeEmail(email);
    console.log('Tentativa de login com email sanitizado:', sanitizedEmail);

    // Primeiro, tentar fazer login diretamente
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });
    
    if (error) {
      console.error('Erro de autenticação:', error);
      
      // Se falhar por credenciais inválidas, verificar se o perfil existe
      if (error.message.includes('Invalid login credentials')) {
        console.log('Verificando se o perfil existe...');
        
        // Buscar perfil com diferentes variações do email
        const { data: profileCheck, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .or(`email.eq.${sanitizedEmail},email.ilike.${sanitizedEmail}`)
          .maybeSingle();

        if (profileError) {
          console.error('Erro ao verificar perfil:', profileError);
        }

        if (profileCheck) {
          console.log('Perfil encontrado:', profileCheck.email);
          throw new Error('Email ou senha incorretos. Verifique seus dados e tente novamente.');
        } else {
          console.log('Perfil não encontrado. Listando alguns perfis para debug...');
          
          // Para debug: listar alguns perfis para verificar o formato dos emails
          const { data: allProfiles, error: debugError } = await supabase
            .from('profiles')
            .select('email')
            .limit(5);
            
          if (!debugError && allProfiles) {
            console.log('Emails encontrados na base:', allProfiles.map(p => p.email));
          }
          
          throw new Error('Email não encontrado. Verifique seus dados ou cadastre-se.');
        }
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Email não confirmado. Verifique sua caixa de entrada.');
      } else if (error.message.includes('Too many requests')) {
        throw new Error('Muitas tentativas de login. Aguarde alguns minutos e tente novamente.');
      } else {
        throw new Error('Erro ao fazer login. Tente novamente.');
      }
    }

    if (!data.user) {
      throw new Error('Falha na autenticação. Tente novamente.');
    }

    console.log('Login realizado com sucesso!');
    return data;
  };

  return { login };
};

export const useAuthRegister = () => {
  const register = async (userData: any) => {
    const sanitizedEmail = sanitizeEmail(userData.email);
    console.log('Tentativa de registro com email sanitizado:', sanitizedEmail);

    // Verificar se o email já está cadastrado
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', sanitizedEmail)
      .maybeSingle();

    if (checkError) {
      console.error('Erro ao verificar email existente:', checkError);
      throw new Error('Erro interno. Tente novamente.');
    }

    if (existingProfile) {
      console.log('Email já existe na base de dados:', sanitizedEmail);
      throw new Error('Este email já está cadastrado. Faça login ou use outro email.');
    }

    const { error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password: userData.password,
      options: {
        data: {
          nome: userData.nome,
          empresa: userData.empresa
        }
      }
    });
    
    if (error) {
      console.error('Erro no registro:', error);
      
      // Mensagens de erro mais amigáveis para registro
      if (error.message.includes('User already registered')) {
        throw new Error('Este email já está cadastrado. Faça login ou use outro email.');
      } else if (error.message.includes('Password should be at least')) {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      } else if (error.message.includes('Invalid email')) {
        throw new Error('Email inválido. Verifique o formato do email.');
      } else {
        throw new Error('Erro ao criar conta. Tente novamente.');
      }
    }
    
    console.log('Registro realizado com sucesso!');
  };

  return { register };
};

export const useAuthLogout = () => {
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { logout };
};
