import { ColumnDef } from "@tanstack/react-table";
import { TranslationConfig } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TranslationConfigRowActions } from "./row-actions";
import { useMemo } from "react";

export const useTranslationConfigColumns = (): ColumnDef<TranslationConfig>[] => {
    const columns = useMemo<ColumnDef<TranslationConfig>[]>(() => [
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
            id: "provider",
            accessorKey: "provider",
            header: "Provider",
            enableSorting: true,
            cell: ({ row }) => <Badge variant="secondary">{row.original.provider}</Badge>
        },
        {
            id: "defaultTargetLang",
            accessorKey: "defaultTargetLang",
            header: "Target Language",
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
            cell: ({ row }: any) => <TranslationConfigRowActions row={row.original} />,
            enableSorting: false,
        },
    ], []);

    return columns;
}
