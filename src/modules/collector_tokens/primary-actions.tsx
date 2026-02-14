import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CollectorToken } from "./types";
import { CanAccess } from "@refinedev/core";


export const CollectorTokenPrimaryActions = () => {
    const { setOpen, setCurrentRow } = usePageAction<CollectorToken>();
    return (
        <div className="flex gap-2">
            <CanAccess resource="collector_tokens" action="create">
                <Button size="sm" onClick={() => { setCurrentRow(null); setOpen("collector-token-edit"); }}>
                    <Plus className="mr-2 h-4 w-4" /> Create Token
                </Button>
            </CanAccess>
        </div>
    );
};
