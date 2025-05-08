
import { Empresa, Usuario } from ".";

export interface AuthState {
  user: Usuario | null;
  isLoading: boolean;
  error: string | null;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterData extends Credentials {
  nome: string;
  empresa: string;
}
