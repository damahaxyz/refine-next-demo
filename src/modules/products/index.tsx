import { useTable } from "@refinedev/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Page } from "@/components/page/page";
import { PageHeader } from "@/components/page/page-header";
import { useProductColumns } from "./column";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { ActionDialogs } from "./dialogs";
import { usePageAction } from "@/components/page/page-action-provider";
import { Product } from "./types";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
// import { DataTableBulkActions } from "@/components/data-table/data-table-bulk-actions";
// import { ProductBulkActions } from "./bulk-actions";
import { ProductPrimaryActions } from "./primary-actions";


export const ProductList = () => {
    const columns = useProductColumns();
    const { setOpen, setCurrentRow } = usePageAction<Product>();
    const table = useTable<Product>({
        columns,
        refineCoreProps: {
            resource: "products",
            pagination: {
                pageSize: 10,
                currentPage: 1
            },
            sorters: {
                initial: [
                    {
                        field: "createdAt",
                        order: "desc",
                    },
                ],
            },
        },

    });

    return (
        <Page>
            <PageHeader title="Products" primaryButtons={<ProductPrimaryActions />}
            />
            <DataTableToolbar table={table} />
            <DataTable<Product> table={table} />
            <DataTablePagination table={table} />
            {/* <DataTableBulkActions table={table}>
        <ProductBulkActions table={table} />
      </DataTableBulkActions> */}
            <ActionDialogs />
        </Page>
    );
};
