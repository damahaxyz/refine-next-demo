import { ColumnDef } from "@tanstack/react-table";
import { CollectorToken } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CollectorTokenRowActions } from "./row-actions";
import { useMemo } from "react";

export const useCollectorTokenColumns = (): ColumnDef<CollectorToken>[] => {
    const columns = useMemo<ColumnDef<CollectorToken>[]>(() => [
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
            header: "Name",
            enableSorting: true,
            meta: {
                filterKey: "name",
                filterType: "text",
                filterOperator: "contains",
            }
        },
        {
            id: "token",
            accessorKey: "token",
            header: "Token",
            cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.token}</span>,
        },
        {
            id: "isActive",
            header: "Status",
            accessorKey: "isActive",
            cell: ({ row }) => {
                return row.original.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>
            }
        },
        {
            id: "lastActiveAt",
            accessorKey: "lastActiveAt",
            header: "Last Active",
            cell: ({ row }) => {
                return row.original.lastActiveAt ? new Date(row.original.lastActiveAt).toLocaleString() : "-";
            }
        },
        {
            id: "createdAt",
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) => {
                return new Date(row.original.createdAt).toLocaleDateString();
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }: any) => <CollectorTokenRowActions row={row.original} />,
            enableSorting: false,
        },
    ], []);

    return columns;
}
