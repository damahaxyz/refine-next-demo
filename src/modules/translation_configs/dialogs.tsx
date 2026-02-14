import { usePageAction } from "@/components/page/page-action-provider";
import { TranslationConfig } from "./types";
import { TranslationConfigEditSheet } from "./edit-sheet";


export function ActionDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = usePageAction<TranslationConfig>();
    return (<>
        {
            !currentRow && <TranslationConfigEditSheet // create new
                open={open == "translation-config-edit"}
                onOpenChange={() => {
                    setOpen("translation-config-edit");
                    setTimeout(() => {
                        setCurrentRow(null);
                    }, 500);
                }}
            />
        }
        {
            currentRow && (//edit
                <TranslationConfigEditSheet
                    open={open == "translation-config-edit"}
                    onOpenChange={() => {
                        setOpen("translation-config-edit");
                        setTimeout(() => {
                            setCurrentRow(null);
                        }, 500);
                    }}
                />
            )
        }

    </>)
}
