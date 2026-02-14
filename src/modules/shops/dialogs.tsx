import { usePageAction } from "@/components/page/page-action-provider";
import { Shop } from "./types";
import { ShopEditSheet } from "./edit-sheet";


export function ActionDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = usePageAction<Shop>();
    return (<>
        {
            !currentRow && <ShopEditSheet // create new
                open={open == "shop-edit"}
                onOpenChange={() => {
                    setOpen("shop-edit");
                    setTimeout(() => {
                        setCurrentRow(null);
                    }, 500);
                }}
            />
        }
        {
            currentRow && (//edit
                <ShopEditSheet
                    open={open == "shop-edit"}
                    onOpenChange={() => {
                        setOpen("shop-edit");
                        setTimeout(() => {
                            setCurrentRow(null);
                        }, 500);
                    }}
                />
            )
        }

    </>)
}
