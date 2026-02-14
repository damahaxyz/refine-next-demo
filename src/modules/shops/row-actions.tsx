import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/custom/resource-delete-button";
import { Shop } from "./types";
import { Trash2, Edit } from "lucide-react";
import { CanAccess } from "@refinedev/core";

export const ShopRowActions = ({ row }: { row: Shop }) => {
    const { setOpen, setCurrentRow } = usePageAction<Shop>();
    return (
        <div className="flex gap-2">
            <CanAccess resource="shops" action="update">
                <Button size="sm" onClick={() => { setCurrentRow(row); setOpen("shop-edit"); }}>
                    <Edit className="w-4 h-4" />
                </Button>
            </CanAccess>
            <CanAccess resource="shops" action="delete">
                <DeleteButton size="sm" resource="shops" recordItemId={row.id} ><Trash2 className="w-4 h-4" /></DeleteButton>
            </CanAccess>
        </div>
    );
};
