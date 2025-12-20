import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { BaseRecord, HttpError, useDeleteMany } from "@refinedev/core";
import { UseTableReturnType } from "@refinedev/react-table";
import { Trash2 } from "lucide-react";
import { Role } from "@/components/pages/type";
import { GlobalDialog } from "@/lib/dialog";

type RoleBulkActionsProps<TData extends BaseRecord> = {
  table: UseTableReturnType<TData, HttpError>;
}

export function RoleBulkActions<TData extends BaseRecord>({
  table
}: RoleBulkActionsProps<TData>) {
  const { setOpen, setCurrentRow } = usePageAction<Role>();
  const selectedRows = table.reactTable.getFilteredSelectedRowModel().rows;
  const { mutate, mutation } = useDeleteMany();
  return (
    <div className='flex gap-2'>
      <Button variant="destructive" size="icon-sm" onClick={async ()=>{
        let res = await GlobalDialog.confirm("全部删除", `是否确认批量删除${selectedRows.length}条记录，该操作无法恢复!`, {
          showOk: true,
          okText: "删除",
          showCancel: true,
          cancelText: "取消",
        });
        if(res){
          const ids = selectedRows.map(item => item.original.id || "");
          if(ids.length > 0){
            mutate({
              resource: "roles",
              ids: ids
            });
          }
          
        }
      }}><Trash2/></Button>
    </div>
  )
}