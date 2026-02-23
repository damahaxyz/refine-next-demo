import { usePageAction } from "@/components/page/page-action-provider";
import { SystemConfig } from "./types";
import { SystemConfigEditSheet } from "./edit-sheet";



export function ActionDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = usePageAction<SystemConfig>();
    return (<>
        {
            !currentRow && <SystemConfigEditSheet // create new
                open={open == "system-config-edit"}
                onOpenChange={() => {
                    setOpen("system-config-edit");
                    setTimeout(() => {
                        setCurrentRow(null);
                    }, 500);
                }}
            />
        }
        {
            currentRow && (//edit
                <SystemConfigEditSheet
                    open={open == "system-config-edit"}
                    onOpenChange={() => {
                        setOpen("system-config-edit");
                        setTimeout(() => {
                            setCurrentRow(null);
                        }, 500);
                    }}
                />
            )
        }

    </>)
}
