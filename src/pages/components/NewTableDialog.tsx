import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";

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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar nova mesa</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <Input
                        placeholder="Número da mesa"
                        type="number"
                        value={newTableNumber}
                        onChange={(e) => onTableNumberChange(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button
                        onClick={onCreateTable}
                        disabled={!newTableNumber}
                        className="hover:cursor-pointer bg-[#D35400] text-white font-bold"
                    >
                        Adicionar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
