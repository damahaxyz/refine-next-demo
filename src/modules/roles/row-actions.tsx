import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/custom/resource-delete-button";
import { Role } from "./types";
import { Trash2 } from "lucide-react";


export const RoleRowActions = ({ row }: { row: Role }) => {
  const { open, setOpen, setCurrentRow } = usePageAction<Role>();
  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => { setCurrentRow(row); setOpen("role-edit"); }}>编辑</Button>
      <DeleteButton size="sm" resource="roles" recordItemId={row.id} ><Trash2 /></DeleteButton>
    </div>
  );
};
