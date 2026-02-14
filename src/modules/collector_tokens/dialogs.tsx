import { usePageAction } from "@/components/page/page-action-provider";
import { CollectorToken } from "./types";
import { CollectorTokenEditSheet } from "./edit-sheet";


export function ActionDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = usePageAction<CollectorToken>();
    return (<>
        {
            !currentRow && <CollectorTokenEditSheet // create new
                open={open == "collector-token-edit"}
                onOpenChange={() => {
                    setOpen("collector-token-edit");
                    setTimeout(() => {
                        setCurrentRow(null);
                    }, 500);
                }}
            />
        }
        {
            currentRow && (//edit
                <CollectorTokenEditSheet
                    open={open == "collector-token-edit"}
                    onOpenChange={() => {
                        setOpen("collector-token-edit");
                        setTimeout(() => {
                            setCurrentRow(null);
                        }, 500);
                    }}
                />
            )
        }

    </>)
}
