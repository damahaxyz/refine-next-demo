import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/custom/resource-delete-button";
import { Product } from "./types";
import { Trash2, Edit } from "lucide-react";
import { CanAccess } from "@refinedev/core";
import Link from "next/link";

export const ProductRowActions = ({ row }: { row: Product }) => {
    return (
        <div className="flex gap-2">
            <CanAccess resource="products" action="update">
                <Button size="sm" asChild>
                    <Link href={`/admin/products/${row.id}/edit`}>
                        <Edit className="w-4 h-4" />
                    </Link>
                </Button>
            </CanAccess>
            <CanAccess resource="products" action="delete">
                <DeleteButton size="sm" resource="products" recordItemId={row.id} ><Trash2 className="w-4 h-4" /></DeleteButton>
            </CanAccess>
        </div>
    );
};
