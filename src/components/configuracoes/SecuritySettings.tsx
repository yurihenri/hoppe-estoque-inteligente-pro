
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { User } from "@supabase/supabase-js";
import { Shield, LogOut, KeyRound } from "lucide-react";

interface SecuritySettingsProps {
  user: User | null;
}

interface Session {
  id: string;
  created_at: string;
  last_used?: string;
  ip_address?: string;
  user_agent?: string;
  current: boolean;
}

const SecuritySettings = ({ user }: SecuritySettingsProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  
  // Simulated sessions since Supabase doesn't expose active sessions via client API
  useEffect(() => {
    const fetchSessions = async () => {
      // In a real app, you would fetch real sessions from your backend
      // This is a simulation
      setLoading(true);
      
      // Create a simulated current session
      const currentSession = {
        id: "current-session",
        created_at: new Date().toISOString(),
        last_used: new Date().toISOString(),
        ip_address: "127.0.0.1",
        user_agent: navigator.userAgent,
        current: true
      };
      
      // Create simulated previous sessions
      const previousSessions = [
        {
          id: "session-1",
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_used: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          ip_address: "192.168.1.1",
          user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          current: false
        },
        {
          id: "session-2",
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          last_used: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          ip_address: "192.168.1.2",
          user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
          current: false
        }
      ];
      
      setSessions([currentSession, ...previousSessions]);
      setLoading(false);
    };
    
    if (user) {
      fetchSessions();
    }
  }, [user]);
  
  const toggleTwoFactor = async () => {
    // In a real app, you would enable/disable 2FA through your backend
    const newState = !twoFactorEnabled;
    setTwoFactorEnabled(newState);
    
    if (newState) {
      toast.success("Autenticação em dois fatores habilitada!");
    } else {
      toast.success("Autenticação em dois fatores desabilitada!");
    }
  };
  
  const revokeSession = async (sessionId: string) => {
    // In a real app, you would revoke the session through your backend
    setSessions(sessions.filter(session => session.id !== sessionId));
    toast.success("Sessão revogada com sucesso!");
  };
  
  const revokeAllOtherSessions = async () => {
    // In a real app, you would revoke all other sessions through your backend
    setSessions(sessions.filter(session => session.current));
    toast.success("Todas as outras sessões foram revogadas!");
  };
  
  const generateRecoveryCodes = () => {
    setIsGeneratingCodes(true);
    
    // Generate 8 random recovery codes
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 7) + "-" + 
      Math.random().toString(36).substring(2, 7)
    );
    
    setRecoveryCodes(codes);
    setIsGeneratingCodes(false);
    toast.success("Códigos de recuperação gerados com sucesso!");
  };
  
  const formatUserAgent = (userAgent: string | undefined) => {
    if (!userAgent) return "Desconhecido";
    
    if (userAgent.includes("Windows")) {
      return "Windows";
    } else if (userAgent.includes("Mac OS")) {
      return "macOS";
    } else if (userAgent.includes("iPhone")) {
      return "iPhone";
    } else if (userAgent.includes("Android")) {
      return "Android";
    } else {
      return "Outro dispositivo";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Autenticação em Dois Fatores</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Autenticação em dois fatores (2FA)</Label>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança exigindo um código além da senha
                </p>
              </div>
              <Switch 
                id="two-factor"
                checked={twoFactorEnabled}
                onCheckedChange={toggleTwoFactor}
              />
            </div>
            
            {twoFactorEnabled && (
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  onClick={generateRecoveryCodes}
                  disabled={isGeneratingCodes}
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  {isGeneratingCodes ? "Gerando..." : "Gerar códigos de recuperação"}
                </Button>
                
                {recoveryCodes.length > 0 && (
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <p className="text-sm font-medium mb-2">
                      Guarde estes códigos em um local seguro. Eles permitem recuperar sua conta caso você perca acesso.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {recoveryCodes.map((code, index) => (
                        <code key={index} className="text-xs bg-background p-1 rounded">
                          {code}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <LogOut className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Sessões Ativas</h3>
          </div>
          
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando sessões...</p>
          ) : (
            <>
              <div className="rounded-md border mb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dispositivo</TableHead>
                      <TableHead>Endereço IP</TableHead>
                      <TableHead>Última atividade</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">
                          {formatUserAgent(session.user_agent)}
                          {session.current && (
                            <span className="ml-2 text-xs text-primary">(atual)</span>
                          )}
                        </TableCell>
                        <TableCell>{session.ip_address || "Desconhecido"}</TableCell>
                        <TableCell>
                          {session.last_used ? 
                            format(new Date(session.last_used), "dd/MM/yyyy HH:mm") : 
                            format(new Date(session.created_at), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="text-right">
                          {!session.current && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => revokeSession(session.id)}
                            >
                              Revogar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {sessions.some(session => !session.current) && (
                <Button 
                  variant="outline" 
                  onClick={revokeAllOtherSessions}
                >
                  Encerrar outras sessões
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
