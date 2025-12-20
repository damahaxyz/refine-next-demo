import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Role } from "./types";

export function RolePrimaryActions() {
  const { setOpen, setCurrentRow } = usePageAction<Role>();
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => { setCurrentRow(null); setOpen("role-edit"); }} >
        <span>创建</span> <Plus size={18} />
      </Button>
    </div>
  )
}