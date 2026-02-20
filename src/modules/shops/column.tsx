import { ColumnDef } from "@tanstack/react-table";
import { Shop } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ShopRowActions } from "./row-actions";
import { useMemo } from "react";

export const useShopColumns = (): ColumnDef<Shop>[] => {
    const columns = useMemo<ColumnDef<Shop>[]>(() => [
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
            header: "店铺名称",
            enableSorting: true,
            meta: {
                filterKey: "name",
                filterType: "text",
                filterOperator: "contains",
            }
        },
        {
            id: "type",
            accessorKey: "type",
            header: "类型",
            enableSorting: true,
            cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>
        },
        {
            id: "url",
            accessorKey: "url",
            header: "URL",
            enableSorting: true,
            cell: ({ row }) => <a href={row.original.url} target="_blank" rel="noreferrer" className="underline text-blue-500">{row.original.url}</a>
        },
        {
            id: "isActive",
            header: "状态",
            accessorKey: "isActive",
            cell: ({ row }) => {
                return row.original.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>
            }
        },
        {
            id: "createdAt",
            accessorKey: "createdAt",
            header: "创建时间",
            cell: ({ row }) => {
                return new Date(row.original.createdAt).toLocaleDateString();
            }
        },
        {
            id: "actions",
            header: "操作",
            cell: ({ row }: any) => <ShopRowActions row={row.original} />,
            enableSorting: false,
        },
    ], []);

    return columns;
}
