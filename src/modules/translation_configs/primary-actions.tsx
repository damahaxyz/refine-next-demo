import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TranslationConfig } from "./types";
import { CanAccess } from "@refinedev/core";


export const TranslationConfigPrimaryActions = () => {
    const { setOpen, setCurrentRow } = usePageAction<TranslationConfig>();
    return (
        <div className="flex gap-2">
            <CanAccess resource="translation_configs" action="create">
                <Button size="sm" onClick={() => { setCurrentRow(null); setOpen("translation-config-edit"); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Config
                </Button>
            </CanAccess>
        </div>
    );
};
