import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/custom/resource-delete-button";
import { Product } from "./types";
import { Trash2, Edit } from "lucide-react";
import { CanAccess } from "@refinedev/core";

export const ProductRowActions = ({ row }: { row: Product }) => {
    const { setOpen, setCurrentRow } = usePageAction<Product>();
    return (
        <div className="flex gap-2">
            <CanAccess resource="products" action="update">
                <Button size="sm" onClick={() => { setCurrentRow(row); setOpen("product-edit"); }}>
                    <Edit className="w-4 h-4" />
                </Button>
            </CanAccess>
            <CanAccess resource="products" action="delete">
                <DeleteButton size="sm" resource="products" recordItemId={row.id} ><Trash2 className="w-4 h-4" /></DeleteButton>
            </CanAccess>
        </div>
    );
};
