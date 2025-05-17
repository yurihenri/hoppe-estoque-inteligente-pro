
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CategoriaSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const CategoriaSearch = ({ searchTerm, onSearchChange }: CategoriaSearchProps) => {
  return (
    <div className="mb-6 relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <Input
        placeholder="Buscar categorias..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};
