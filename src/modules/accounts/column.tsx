import { ColumnDef } from "@tanstack/react-table";
import { Account } from "./types";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/custom/resource-delete-button";
import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { AccountRowActions } from "./row-actions";
import { useList } from "@refinedev/core";
import { Badge } from "@/components/ui/badge";


export const useAccountColumns = (): ColumnDef<Account>[] => {

  const {
    result: { data: roles },
    query: { isLoading: isLoadingRoles },
  } = useList({
    resource: "roles",
    pagination: { mode: "off" },
  });

  const columns = useMemo<ColumnDef<Account>[]>(() => [
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
      header: "显示名称",
      enableSorting: true,
      meta: {
        filterKey: "name",
        filterType: "text",
        filterOperator: "contains",
        filterComponentProps: {
          placeholder: "搜索名称...",
          className: "w-[200px]"
        }
      }
    },
    {
      id: "username",
      accessorKey: "username",
      header: "登录账号",
      enableSorting: true,
      meta: {
        filterKey: "username",
        filterType: "text",
        filterOperator: "contains",
        filterComponentProps: {
          placeholder: "搜索账号..."
        }
      }
    },
    {
      id: "roleIds",
      accessorKey: "roleIds",
      header: "角色",
      enableSorting: false,
      cell: ({ row }: any) => {
        if (isLoadingRoles) {
          return "Loading....";
        }
        const roleIds = row.original.roleIds;
        const matchRoles = roles?.filter(item => roleIds.indexOf(item.id) > -1);
        const elements = matchRoles.map(item => <Badge variant="secondary" key={item.id}>{item.name}</Badge>)

        return elements;
      },
      meta: {
        filterKey: "roleId",
        filterType: "select",
        filterOperator: "in",
        filterComponentProps: {
          useSelectOptions: {
            resource: "roles",
            optionLabel: "name",
            optionsValue: "id"
          },
          placeholder: "角色",
          classNameTrigger: "w-40",
          classNameContent: "w-40 p-0"
        }
      }
    },

    {
      id: "actions",
      header: "操作",
      cell: ({ row }: any) => <AccountRowActions row={row.original} />,
      enableSorting: false,
    },
  ], [isLoadingRoles]);
  return columns;
}