import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SystemConfig } from "./types";
import { CanAccess } from "@refinedev/core";

export function SystemConfigPrimaryActions() {
    const { setOpen, setCurrentRow } = usePageAction<SystemConfig>();
    return (
        <div className='flex gap-2'>
            <CanAccess resource="system_configs" action="create">
                <Button className='space-x-1' onClick={() => { setCurrentRow(null); setOpen("system-config-edit"); }} >
                    <span>新增配置</span> <Plus size={18} />
                </Button>
            </CanAccess>
        </div>
    )
}
