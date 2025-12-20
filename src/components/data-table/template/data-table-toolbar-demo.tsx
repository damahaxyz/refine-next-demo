import type { BaseRecord, HttpError } from "@refinedev/core";
import type { UseTableReturnType } from "@refinedev/react-table";
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "../data-table-view-options"

import { priorities, statuses } from "../data"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"


type DataTableToolbarProps<TData extends BaseRecord> = {
  table: UseTableReturnType<TData, HttpError>;
};

export function DataTableToolbarXXX<TData extends BaseRecord>({
  table,
}: DataTableToolbarProps<TData>) {
  const reactTable = table.reactTable;
  const isFiltered = reactTable.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter tasks..."
          value={(reactTable.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            reactTable.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {reactTable.getColumn("status") && (
          <DataTableFacetedFilter
            title="Status"
            options={statuses}
          />
        )}
        {reactTable.getColumn("category") && (
          <DataTableFacetedFilter
            title="category"
            options={priorities}
          />
        )}
        <Button variant={"default"} size={"sm"} onClick={() => { }}>Search</Button>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => reactTable.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}