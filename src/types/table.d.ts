import '@tanstack/react-table'; // 必须引入，确保是扩展而非覆盖

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    filterKey?: string;
    filterType?: "text" | "select" | "select-mutiple";
    filterOperator?: CrudOperators;
    filterComponentProps?: Record<string, any>;
  }
}

