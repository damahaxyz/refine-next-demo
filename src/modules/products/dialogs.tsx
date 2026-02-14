import { usePageAction } from "@/components/page/page-action-provider";
import { Product } from "./types";
import { ProductEditSheet } from "./edit-sheet";


export function ActionDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = usePageAction<Product>();
    return (<>
        {
            !currentRow && <ProductEditSheet // create new
                open={open == "product-edit"}
                onOpenChange={() => {
                    setOpen("product-edit");
                    setTimeout(() => {
                        setCurrentRow(null);
                    }, 500);
                }}
            // defaultOpen={true}
            />
        }
        {
            currentRow && (//edit
                <ProductEditSheet
                    open={open == "product-edit"}
                    onOpenChange={() => {
                        setOpen("product-edit");
                        setTimeout(() => {
                            setCurrentRow(null);
                        }, 500);
                    }}
                />
            )
        }

    </>)
}
