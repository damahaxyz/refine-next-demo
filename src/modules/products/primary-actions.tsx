import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Product } from "./types";
import { CanAccess } from "@refinedev/core";


export const ProductPrimaryActions = () => {
    const { setOpen, setCurrentRow } = usePageAction<Product>();
    return (
        <div className="flex gap-2">
            <CanAccess resource="products" action="create">
                <Button size="sm" onClick={() => { setCurrentRow(null); setOpen("product-edit"); }}>
                    <Plus className="mr-2 h-4 w-4" /> Import Product
                </Button>
            </CanAccess>
        </div>
    );
};
