import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Shop } from "./types";
import { CanAccess } from "@refinedev/core";


export const ShopPrimaryActions = () => {
    const { setOpen, setCurrentRow } = usePageAction<Shop>();
    return (
        <div className="flex gap-2">
            <CanAccess resource="shops" action="create">
                <Button size="sm" onClick={() => { setCurrentRow(null); setOpen("shop-edit"); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Shop
                </Button>
            </CanAccess>
        </div>
    );
};
