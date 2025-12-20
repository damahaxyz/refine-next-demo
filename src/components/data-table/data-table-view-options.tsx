"use client";
import type { BaseRecord, HttpError, useTableReturnType } from "@refinedev/core";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { RefreshCw, Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { UseTableReturnType } from "@refinedev/react-table";

type DataTableViewOptionsProps<TData extends BaseRecord> = {
  table: UseTableReturnType<TData, HttpError>;
};


export function DataTableViewOptions<TData extends BaseRecord>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const columns = table.reactTable.getAllColumns();
  const { refineCore: { tableQuery: { refetch } } } = table;
  return (
    <div className="flex items-center space-x-2">
      <Button onClick={() => refetch()} size="icon-sm" variant="outline" className="ml-auto hidden h-8 lg:flex">
        <RefreshCw />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex"
          >
            <Settings2 />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuLabel>隐藏列</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {columns.filter(
            (column) => typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {(() => {
                    const header = column?.columnDef?.header;
                    if (header == null) return null;
                    if (typeof header === "function") {
                      // header can be a function or a React node/string; call only when it's a function
                      return (header as any)();
                    }
                    return header;
                  })()}
                </DropdownMenuCheckboxItem>
              )
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}