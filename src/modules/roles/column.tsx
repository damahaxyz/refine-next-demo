import { Role } from "./types";
import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RoleRowActions } from "./row-actions";
import { ColumnDef } from "@tanstack/react-table";


export const useRoleColumns = (): ColumnDef<Role>[] => {

  const columns = useMemo<ColumnDef<Role>[]>(() => [
    {
      id: "select",
      header: ({ table }: any) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }: any) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      id: "name",
      accessorKey: "name",
      header: "角色名称",
      enableSorting: true,
      meta: {
        filterType: "text",
        filterOperator: "contains",
        filterComponentProps: {
          className: "w-[120]",
          placeholder: "搜索名称..."
        }
      }
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }: any) => <RoleRowActions row={row.original} />,
      enableSorting: false,
    },
  ], []);
  return columns;
}