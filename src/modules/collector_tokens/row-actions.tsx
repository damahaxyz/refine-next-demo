import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/custom/resource-delete-button";
import { CollectorToken } from "./types";
import { Trash2, Edit } from "lucide-react";
import { CanAccess } from "@refinedev/core";

export const CollectorTokenRowActions = ({ row }: { row: CollectorToken }) => {
    const { setOpen, setCurrentRow } = usePageAction<CollectorToken>();
    return (
        <div className="flex gap-2">
            <CanAccess resource="collector_tokens" action="update">
                <Button size="sm" onClick={() => { setCurrentRow(row); setOpen("collector-token-edit"); }}>
                    <Edit className="w-4 h-4" />
                </Button>
            </CanAccess>
            <CanAccess resource="collector_tokens" action="delete">
                <DeleteButton size="sm" resource="collector_tokens" recordItemId={row.id} ><Trash2 className="w-4 h-4" /></DeleteButton>
            </CanAccess>
        </div>
    );
};
