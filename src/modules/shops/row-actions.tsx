import { useState } from "react";
import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/custom/resource-delete-button";
import { Shop } from "./types";
import { Trash2, Edit, Tags } from "lucide-react";
import { CanAccess } from "@refinedev/core";
import { ShopMetaDialog } from "./meta-dialog";

export const ShopRowActions = ({ row }: { row: Shop }) => {
    const { setOpen, setCurrentRow } = usePageAction<Shop>();
    const [showMeta, setShowMeta] = useState(false);

    return (
        <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowMeta(true)} title="View Metadata">
                <Tags className="w-4 h-4" />
            </Button>

            <CanAccess resource="shops" action="update">
                <Button size="sm" onClick={() => { setCurrentRow(row); setOpen("shop-edit"); }}>
                    <Edit className="w-4 h-4" />
                </Button>
            </CanAccess>

            <CanAccess resource="shops" action="delete">
                <DeleteButton size="sm" resource="shops" recordItemId={row.id} ><Trash2 className="w-4 h-4" /></DeleteButton>
            </CanAccess>

            <ShopMetaDialog
                open={showMeta}
                onOpenChange={setShowMeta}
                shop={row}
            />
        </div>
    );
};
