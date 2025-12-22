import { useTable } from "@refinedev/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Page } from "@/components/page/page";
import { PageHeader } from "@/components/page/page-header";
import { useSystemConfigColumns } from "./column";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { ActionDialogs } from "./dialogs";
import { usePageAction } from "@/components/page/page-action-provider";
import { SystemConfig } from "./types";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableBulkActions } from "@/components/data-table/data-table-bulk-actions";
import { SystemConfigBulkActions } from "./bulk-actions";
import { SystemConfigPrimaryActions } from "./primary-actions";


export const SystemConfigList = () => {
    const columns = useSystemConfigColumns();
    const { setOpen, setCurrentRow } = usePageAction<SystemConfig>();
    const table = useTable<SystemConfig>({
        columns,
        refineCoreProps: {
            resource: "system_configs",
            pagination: {
                pageSize: 10,
                currentPage: 1
            }
        },

    });

    return (
        <Page>
            <PageHeader title="系统配置" primaryButtons={<SystemConfigPrimaryActions />}
            />
            <DataTableToolbar table={table} />
            <DataTable<SystemConfig> table={table} />
            <DataTablePagination table={table} />
            <DataTableBulkActions table={table}>
                <SystemConfigBulkActions table={table} />
            </DataTableBulkActions>
            <ActionDialogs />
        </Page>
    );
};

