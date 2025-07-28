import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface Addition {
    id: string;
    name: string;
    price: number;
}

interface AdditionCardProps {
    addition: Addition;
}

import { formatPrice } from "@/lib/utils";

export function AdditionCard({ addition }: AdditionCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-3">
                <Plus className="text-orange-500" />
                <CardTitle>{addition.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <span className="font-semibold">R$ {formatPrice(addition.price)}</span>
            </CardContent>
        </Card>
    );
}
