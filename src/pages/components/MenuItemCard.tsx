

interface MenuItem {
    id: string;
    name: string;
    price: number;
}

interface MenuItemCardProps {
    item: MenuItem;
}

import { formatPrice } from "@/lib/utils";

export function MenuItemCard({ item }: MenuItemCardProps) {
    return (
        <div className="flex justify-between">
            <span>{item.name}</span>
            <span className="font-semibold">R$ {formatPrice(item.price)}</span>
        </div>
    );
}
