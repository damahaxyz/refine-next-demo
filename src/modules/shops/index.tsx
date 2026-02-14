import { useTable } from "@refinedev/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Page } from "@/components/page/page";
import { PageHeader } from "@/components/page/page-header";
import { useShopColumns } from "./column";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { ActionDialogs } from "./dialogs";
import { usePageAction } from "@/components/page/page-action-provider";
import { Shop } from "./types";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { ShopPrimaryActions } from "./primary-actions";


export const ShopList = () => {
    const columns = useShopColumns();
    const { setOpen, setCurrentRow } = usePageAction<Shop>();
    const table = useTable<Shop>({
        columns,
        refineCoreProps: {
            resource: "shops",
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
            <PageHeader title="Shops" primaryButtons={<ShopPrimaryActions />}
            />
            <DataTableToolbar table={table} />
            <DataTable<Shop> table={table} />
            <DataTablePagination table={table} />
            <ActionDialogs />
        </Page>
    );
};
