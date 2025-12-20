import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/resource-delete-button";
import { SysConfig } from "@/components/pages/type";
import { Trash2 } from "lucide-react";
import { CanAccess } from "@refinedev/core";


export const SysConfigRowActions = ({ row }: { row: SysConfig }) => {
    const { open, setOpen, setCurrentRow } = usePageAction<SysConfig>();
    return (
        <div className="flex gap-2">
            <CanAccess resource="sys_configs" action="update">
                <Button size="sm" onClick={() => { setCurrentRow(row); setOpen("system-config-edit"); }}>编辑</Button>
            </CanAccess>
            <CanAccess resource="sys_configs" action="delete">
                <DeleteButton size="sm" resource="sys_configs" recordItemId={row.id} ><Trash2 /></DeleteButton>
            </CanAccess>
        </div>
    );
};
