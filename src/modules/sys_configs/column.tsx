import { ColumnDef } from "@tanstack/react-table";
import { SysConfig } from "../type";
import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { SysConfigRowActions } from "./row-actions";

export const useSysConfigColumns = (): ColumnDef<SysConfig>[] => {

    const columns = useMemo<ColumnDef<SysConfig>[]>(() => [
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
            id: "key",
            accessorKey: "key",
            header: "参数名",
            enableSorting: true,
            meta: {
                filterKey: "key",
                filterType: "text",
                filterOperator: "contains",
                filterComponentProps: {
                    placeholder: "搜索参数名..."
                }
            }
        },
        {
            id: "value",
            accessorKey: "value",
            header: "参数值",
            enableSorting: false,
            cell: ({ row }: any) => {
                const value = row.original.value;
                return (
                    <div className="max-w-[300px] truncate" title={value}>
                        {value}
                    </div>
                );
            }
        },
        {
            id: "desc",
            accessorKey: "desc",
            header: "配置描述",
            enableSorting: false,
            cell: ({ row }: any) => {
                const desc = row.original.desc;
                return (
                    <div className="max-w-[300px] truncate" title={desc}>
                        {desc}
                    </div>
                );
            }
        },
        {
            id: "actions",
            header: "操作",
            cell: ({ row }: any) => <SysConfigRowActions row={row.original} />,
            enableSorting: false,
        },
    ], []);
    return columns;
}
