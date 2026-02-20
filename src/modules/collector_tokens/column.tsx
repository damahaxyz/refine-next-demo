import { ColumnDef } from "@tanstack/react-table";
import { CollectorToken } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CollectorTokenRowActions } from "./row-actions";
import { useMemo } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@refinedev/core";

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
            cell: ({ row }) => {
                const { open } = useNotification();
                return (
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground truncate max-w-[150px]" title={row.original.token}>
                            {row.original.token}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                                navigator.clipboard.writeText(row.original.token);
                                open?.({
                                    type: "success",
                                    message: "复制成功",
                                    description: "Token 已复制到剪贴板",
                                });
                            }}
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                );
            },
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
