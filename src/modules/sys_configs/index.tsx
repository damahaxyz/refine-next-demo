import { useTable } from "@refinedev/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Page } from "@/components/page/page";
import { PageHeader } from "@/components/page/page-header";
import { useSysConfigColumns } from "./column";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { ActionDialogs } from "./dialogs";
import { usePageAction } from "@/components/page/page-action-provider";
import { SysConfig } from "../type";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableBulkActions } from "@/components/data-table/data-table-bulk-actions";
import { SysConfigBulkActions } from "./bulk-actions";
import { SysConfigPrimaryActions } from "./primary-actions";


export const SysConfigList = () => {
    const columns = useSysConfigColumns();
    const { setOpen, setCurrentRow } = usePageAction<SysConfig>();
    const table = useTable<SysConfig>({
        columns,
        refineCoreProps: {
            resource: "sys_configs",
            pagination: {
                pageSize: 10,
                currentPage: 1
            }
        },

    });

    return (
        <Page>
            <PageHeader title="系统配置" description="Here's a list of your system configurations!" primaryButtons={<SysConfigPrimaryActions />}
            />
            <DataTableToolbar table={table} />
            <DataTable<SysConfig> table={table} />
            <DataTablePagination table={table} />
            <DataTableBulkActions table={table}>
                <SysConfigBulkActions table={table} />
            </DataTableBulkActions>
            <ActionDialogs />
        </Page>
    );
};

