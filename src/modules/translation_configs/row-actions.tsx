import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/custom/resource-delete-button";
import { TranslationConfig } from "./types";
import { Trash2, Edit } from "lucide-react";
import { CanAccess } from "@refinedev/core";

export const TranslationConfigRowActions = ({ row }: { row: TranslationConfig }) => {
    const { setOpen, setCurrentRow } = usePageAction<TranslationConfig>();
    return (
        <div className="flex gap-2">
            <CanAccess resource="translation_configs" action="update">
                <Button size="sm" onClick={() => { setCurrentRow(row); setOpen("translation-config-edit"); }}>
                    <Edit className="w-4 h-4" />
                </Button>
            </CanAccess>
            <CanAccess resource="translation_configs" action="delete">
                <DeleteButton size="sm" resource="translation_configs" recordItemId={row.id} ><Trash2 className="w-4 h-4" /></DeleteButton>
            </CanAccess>
        </div>
    );
};
