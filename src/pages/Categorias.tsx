
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Tag } from 'lucide-react';
import { mapDbToCategoria } from '@/types/categorias';
import { useAuth } from '@/contexts/AuthContext';

const Categorias = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.empresaId) {
      fetchCategorias();
    }
  }, [user]);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categorias')
        .select('*');

      if (error) {
        throw error;
      }

      setCategorias(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast('Não foi possível carregar as categorias.', {
        description: 'Tente novamente mais tarde.',
      });
      setLoading(false);
    }
  };

  const filteredCategorias = categorias.filter(
    (categoria: any) =>
      categoria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (categoria.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Categorias">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Categorias</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>
        
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Lista de Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-hoppe-600 rounded-full border-t-transparent"></div>
              </div>
            ) : filteredCategorias.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cor</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategorias.map((categoria: any) => (
                      <TableRow key={categoria.id}>
                        <TableCell>
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: categoria.cor || '#3B82F6' }}
                          ></div>
                        </TableCell>
                        <TableCell className="font-medium">{categoria.nome}</TableCell>
                        <TableCell>
                          {categoria.descricao || (
                            <span className="text-muted-foreground">Sem descrição</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit size={18} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhuma categoria encontrada</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchTerm
                    ? "Nenhuma categoria corresponde à sua busca."
                    : "Comece adicionando sua primeira categoria."}
                </p>
                {!searchTerm && (
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Categorias;
