import { usePageAction } from "@/components/page/page-action-provider";
import { Account } from "../type";
import { AccountEditSheet } from "./edit-sheet";



export function ActionDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePageAction<Account>();
  return (<>
    {
      !currentRow && <AccountEditSheet // create new
        open={open == "account-edit"}
        onOpenChange={() => {
          setOpen("account-edit");
          setTimeout(() => {
            setCurrentRow(null);
          }, 500);
        }}
      />
    }
    {
      currentRow && (//edit
        <AccountEditSheet
          open={open == "account-edit"}
          onOpenChange={() => {
            setOpen("account-edit");
            setTimeout(() => {
              setCurrentRow(null);
            }, 500);
          }}
        />
      )
    }

  </>)
}