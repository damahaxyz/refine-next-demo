import { ColumnDef } from "@tanstack/react-table";
import { Account } from "./types";
import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { AccountRowActions } from "./row-actions";
import { useList, useNotification } from "@refinedev/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";



export const useAccountColumns = (): ColumnDef<Account>[] => {
  const { open: openNotification } = useNotification();

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
      id: "status",
      accessorKey: "status",
      header: "状态",
      enableSorting: true,
      cell: ({ row }: any) => {
        const status = row.getValue("status");
        return <Badge variant={status === "active" ? "default" : "secondary"}>{status}</Badge>
      },
      meta: {
        filterKey: "status",
        filterType: "select",
        filterOperator: "eq",
        filterComponentProps: {
          options: [
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" }
          ],
          placeholder: "状态"
        }
      }
    },
    {
      id: "apiToken",
      accessorKey: "apiToken",
      header: "API Token",
      enableSorting: false,
      cell: ({ row }: any) => {
        const token = row.getValue("apiToken");
        if (!token) return <span className="text-muted-foreground">-</span>;

        const handleCopy = () => {
          navigator.clipboard.writeText(token);
          openNotification?.({
            type: "success",
            message: "Copied to clipboard",
            description: "API Token copied to clipboard",
          });
        };

        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs">{token.substring(0, 8)}...</span>
            <Button variant="ghost" size="icon" className="h-4 w-4" onClick={handleCopy}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        );
      },
      meta: {
        filterKey: "apiToken",
        filterType: "text",
        filterOperator: "contains",
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