import { usePageAction } from "@/components/page/page-action-provider";
import { SysConfig } from "../type";
import { SysConfigEditSheet } from "./edit-sheet";



export function ActionDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = usePageAction<SysConfig>();
    return (<>
        {
            !currentRow && <SysConfigEditSheet // create new
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
                <SysConfigEditSheet
                    open={open == "system-config-edit"}
                    onOpenChange={() => {
                        setOpen("system-config-edit");
                        console.log("onOpenChange");
                        setTimeout(() => {
                            setCurrentRow(null);
                            console.log("setCurrentRow(null)");
                        }, 500);
                    }}
                />
            )
        }

    </>)
}
