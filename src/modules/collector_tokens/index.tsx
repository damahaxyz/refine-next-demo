import { useTable } from "@refinedev/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Page } from "@/components/page/page";
import { PageHeader } from "@/components/page/page-header";
import { useCollectorTokenColumns } from "./column";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { ActionDialogs } from "./dialogs";
import { usePageAction } from "@/components/page/page-action-provider";
import { CollectorToken } from "./types";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { CollectorTokenPrimaryActions } from "./primary-actions";


export const CollectorTokenList = () => {
    const columns = useCollectorTokenColumns();
    const { setOpen, setCurrentRow } = usePageAction<CollectorToken>();
    const table = useTable<CollectorToken>({
        columns,
        refineCoreProps: {
            resource: "collector_tokens",
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
            <PageHeader title="Collector Tokens" primaryButtons={<CollectorTokenPrimaryActions />}
            />
            <DataTableToolbar table={table} />
            <DataTable<CollectorToken> table={table} />
            <DataTablePagination table={table} />
            <ActionDialogs />
        </Page>
    );
};
