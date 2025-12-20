import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Role } from "@/components/pages/type";
import { CanAccess } from "@refinedev/core";

export function AccountPrimaryActions() {
  const { setOpen, setCurrentRow } = usePageAction<Role>();
  return (
    <div className='flex gap-2'>
      <CanAccess resource="accounts" action="create">
        <Button className='space-x-1' onClick={() => { setCurrentRow(null); setOpen("account-edit"); }} >
          <span>创建账户</span> <Plus size={18} />
        </Button>
      </CanAccess>
    </div>
  )
}