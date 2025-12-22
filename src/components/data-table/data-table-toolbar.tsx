"use client";
import type { BaseRecord, CrudFilter, CrudOperators, HttpError } from "@refinedev/core";
import { getDefaultFilter } from "@refinedev/core";
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTableViewOptions } from "./data-table-view-options"
import { Input } from "../ui/input";
import { UseTableReturnType } from "@refinedev/react-table";
import { SelectDropdownCommandMutiple } from "../custom/select-dropdown-command-mutiple";
import { SelectDropdownCommand } from "../custom/select-dropdown-command";
import { useCallback } from "react";
import { Column } from "@tanstack/react-table";

type DataTableToolbarProps<TData extends BaseRecord> = {
  table: UseTableReturnType<TData, HttpError>;
  onSearchClick?: () => void;
  showSearchButton?: boolean;
};

export function DataTableToolbar<TData extends BaseRecord>({
  table,
  showSearchButton,
  onSearchClick,
}: DataTableToolbarProps<TData>) {
  const { refineCore: { filters, setFilters }, reactTable } = table;

  const isFiltered = filters.length > 0;

  const setCustomFilter = useCallback((
    column: Column<TData, unknown>,
    value: any,
    setFilters: (fn: (prev: CrudFilter[]) => CrudFilter[]) => void
  ) => {
    const meta = column.columnDef.meta;
    const filterKey = meta?.filterKey ?? column.id;

    setFilters((prev) => {
      const others = prev.filter(
        (f) => "field" in f ? f.field !== filterKey : true
      );

      if (!value) {
        return others;
      }

      return [
        ...others,
        {
          field: filterKey,
          operator: meta?.filterOperator ?? "eq",
          value,
        },
      ];
    });
  }, []);
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {
          reactTable.getAllColumns().map((column) => {
            const meta: any = (column.columnDef as any).meta || {};
            if (meta.filterType && meta.filterType === "text") {
              return <div key={column.id}>
                <Input
                  key={column.id}
                  {...meta.filterComponentProps}
                  value={getDefaultFilter(meta.filterKey || column.columnDef.id, filters, meta.filterOperator)}
                  onChange={(event) => setCustomFilter(column, event.target.value, setFilters)}
                />
              </div>
            } else if (meta.filterType && meta.filterType === "select") {
              return <div key={column.id}>
                <SelectDropdownCommand
                  key={column.id}
                  {...meta.filterComponentProps}
                  value={getDefaultFilter(meta.filterKey || column.columnDef.id, filters, meta.filterOperator)}
                  onValueChange={(values) => {
                    setCustomFilter(column, values, setFilters)
                  }}
                />
              </div>
            } else if (meta.filterType && meta.filterType == "select-mutiple") {
              return <div key={column.id}>
                <SelectDropdownCommandMutiple
                  key={column.id}
                  {...meta.filterComponentProps}
                  value={getDefaultFilter(meta.filterKey || column.columnDef.id, filters, meta.filterOperator)}
                  onValueChange={(values) => {
                    setCustomFilter(column, values && values?.length > 0 ? values : undefined, setFilters)

                  }}
                />
              </div>
            }
            return null;

          })}
        {
          showSearchButton && (
            <Button variant={"default"} size={"sm"} onClick={onSearchClick}>查询</Button>
          )
        }
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => setFilters([], "replace")}
            className="h-8 px-2 lg:px-3"
          >
            重置
            <X />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div >
  )
}