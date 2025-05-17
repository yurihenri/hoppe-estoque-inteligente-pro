
import { Categoria } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteCategoriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria: Categoria | null;
  inUseCount: number;
  onConfirm: () => void;
}

export const DeleteCategoriaDialog = ({
  open,
  onOpenChange,
  categoria,
  inUseCount,
  onConfirm,
}: DeleteCategoriaDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            {inUseCount > 0 ? (
              <>
                A categoria <strong>{categoria?.nome}</strong> está sendo usada por {inUseCount} produto(s).
                <br /><br />
                Ao excluir esta categoria, os produtos serão atualizados para "Sem categoria".
              </>
            ) : (
              <>
                Tem certeza que deseja excluir a categoria <strong>{categoria?.nome}</strong>?
              </>
            )}
            <br /><br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
