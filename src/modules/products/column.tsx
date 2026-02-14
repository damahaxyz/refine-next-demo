import { ColumnDef } from "@tanstack/react-table";
import { Product } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ProductRowActions } from "./row-actions";
import { useMemo } from "react";

export const useProductColumns = (): ColumnDef<Product>[] => {
    const columns = useMemo<ColumnDef<Product>[]>(() => [
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
            id: "image",
            header: "图片",
            cell: ({ row }) => {
                const images = row.original.images as string[];
                const firstImage = images && images.length > 0 ? images[0] : null;
                return firstImage ? <img src={firstImage} alt="product" className="w-10 h-10 object-cover rounded" /> : <div className="w-10 h-10 bg-gray-200 rounded"></div>
            },
            enableSorting: false,
        },
        {
            id: "title",
            accessorKey: "title",
            header: "标题",
            enableSorting: true,
            cell: ({ row }) => {
                return <div className="max-w-[300px] truncate" title={row.original.title}>{row.original.title}</div>
            },
            meta: {
                filterKey: "title",
                filterType: "text",
                filterOperator: "contains",
            }
        },
        {
            id: "price",
            header: "价格",
            cell: ({ row }) => {
                return (
                    <div className="flex flex-col">
                        <span>¥{row.original.price}</span>
                        {row.original.sellingPrice && <span className="text-muted-foreground text-xs">${row.original.sellingPrice}</span>}
                    </div>
                )
            }
        },
        {
            id: "status",
            accessorKey: "status",
            header: "状态",
            cell: ({ row }) => {
                const status = row.original.status;
                let variant: "default" | "secondary" | "destructive" | "outline" = "default";
                if (status === "draft") variant = "secondary";
                if (status === "published") variant = "default";
                if (status === "archived") variant = "outline";

                return <Badge variant={variant}>{status}</Badge>
            },
            meta: {
                filterKey: "status",
                filterType: "select",
                filterOperator: "eq",
                filterComponentProps: {
                    options: [
                        { label: "Draft", value: "draft" },
                        { label: "Translated", value: "translated" },
                        { label: "Ready", value: "ready" },
                        { label: "Published", value: "published" },
                        { label: "Archived", value: "archived" },
                    ]
                }
            }
        },
        {
            id: "sourcePlatform",
            accessorKey: "sourcePlatform",
            header: "来源",
            enableSorting: true,
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
            cell: ({ row }: any) => <ProductRowActions row={row.original} />,
            enableSorting: false,
        },
    ], []);

    return columns;
}
