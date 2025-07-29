import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusCircle, UtensilsCrossed } from "lucide-react";

interface NewTableDialogProps {
  newTableNumber: string;
  onTableNumberChange: (value: string) => void;
  onCreateTable: () => void;
}

export function NewTableDialog({ newTableNumber, onTableNumberChange, onCreateTable }: NewTableDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex gap-2 bg-[#D35400] hover:bg-[#b43e00] text-white font-bold shadow-lg px-6 py-2 rounded-lg">
          <PlusCircle size={20} /> Nova Mesa
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm rounded-xl p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="text-lg font-semibold text-[#D35400]">
            Adicionar Mesa
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="relative">
            <UtensilsCrossed size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D35400]" />
            <Input
              placeholder="Número da mesa"
              type="number"
              value={newTableNumber}
              onChange={(e) => onTableNumberChange(e.target.value)}
              className="pl-10 text-center border border-[#f5d7b5] rounded-md shadow-sm focus:border-[#D35400] focus:ring-[#D35400] [appearance:textfield]"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-center mt-4">
          <Button
            onClick={onCreateTable}
            disabled={!newTableNumber}
            className="bg-[#D35400] hover:bg-[#b43e00] text-white font-bold w-full rounded-lg py-2 shadow-md transition"
          >
            Adicionar Mesa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
