import { useTable } from "@refinedev/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Page } from "@/components/page/page";
import { PageHeader } from "@/components/page/page-header";
import { useTranslationConfigColumns } from "./column";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { ActionDialogs } from "./dialogs";
import { usePageAction } from "@/components/page/page-action-provider";
import { TranslationConfig } from "./types";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { TranslationConfigPrimaryActions } from "./primary-actions";


export const TranslationConfigList = () => {
    const columns = useTranslationConfigColumns();
    const { setOpen, setCurrentRow } = usePageAction<TranslationConfig>();
    const table = useTable<TranslationConfig>({
        columns,
        refineCoreProps: {
            resource: "translation_configs",
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
            <PageHeader title="Translation Configs" primaryButtons={<TranslationConfigPrimaryActions />}
            />
            <DataTableToolbar table={table} />
            <DataTable<TranslationConfig> table={table} />
            <DataTablePagination table={table} />
            <ActionDialogs />
        </Page>
    );
};
