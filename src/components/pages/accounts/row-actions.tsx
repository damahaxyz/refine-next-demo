import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/resource-delete-button";
import { Role } from "@/components/pages/type";
import { Trash2 } from "lucide-react";
import { CanAccess } from "@refinedev/core";


export const AccountRowActions = ({ row }: { row: Role }) => {
  const { setOpen, setCurrentRow } = usePageAction<Role>();
  return (
    <div className="flex gap-2">
      <CanAccess resource="accounts" action="update">
        <Button size="sm" onClick={() => { setCurrentRow(row); setOpen("account-edit"); }}>编辑</Button>
      </CanAccess>
      <CanAccess resource="accounts" action="delete">
        <DeleteButton size="sm" resource="accounts" recordItemId={row.id} ><Trash2 /></DeleteButton>
      </CanAccess>
    </div>
  );
};
