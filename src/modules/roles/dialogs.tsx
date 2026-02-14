import { usePageAction } from "@/components/page/page-action-provider";
import { Role } from "./types";
import { RoleEditSheet } from "./edit-sheet";
import { RoleDialog } from "./dialog";


export function ActionDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePageAction<Role>();
  return (<>
    {
      !currentRow && <RoleEditSheet // create new
        open={open == "role-edit"}
        onOpenChange={() => {
          setOpen("role-edit");
          setTimeout(() => {
            setCurrentRow(null);
          }, 500);
        }}
      />
    }
    {
      currentRow && (//edit
        <>
          <RoleEditSheet
            open={open == "role-edit"}
            onOpenChange={() => {
              setOpen("role-edit");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
          />
          <RoleDialog
            open={open == "role-show"}
            onOpenChange={() => {
              setOpen("role-show");
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
          />
        </>
      )
    }

  </>)
}