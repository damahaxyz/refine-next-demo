import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/custom/resource-delete-button";
import { SystemConfig } from "./types";
import { Trash2 } from "lucide-react";
import { CanAccess } from "@refinedev/core";


export const SystemConfigRowActions = ({ row }: { row: SystemConfig }) => {
    const { open, setOpen, setCurrentRow } = usePageAction<SystemConfig>();
    return (
        <div className="flex gap-2">
            <CanAccess resource="system_configs" action="update">
                <Button size="sm" onClick={() => { setCurrentRow(row); setOpen("system-config-edit"); }}>编辑</Button>
            </CanAccess>
            <CanAccess resource="system_configs" action="delete">
                <DeleteButton size="sm" resource="system_configs" recordItemId={row.id} ><Trash2 /></DeleteButton>
            </CanAccess>
        </div>
    );
};
