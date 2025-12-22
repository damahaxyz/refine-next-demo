import { useTable } from "@refinedev/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Page } from "@/components/page/page";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { useAccountColumns } from "./column";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { ActionDialogs } from "./dialogs";
import { usePageAction } from "@/components/page/page-action-provider";
import { Plus, Trash2 } from "lucide-react";
import { Account } from "./types";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableBulkActions } from "@/components/data-table/data-table-bulk-actions";
import { AccountBulkActions } from "./bulk-actions";
import { AccountPrimaryActions } from "./primary-actions";


export const AccountList = () => {
  const columns = useAccountColumns();
  const { setOpen, setCurrentRow } = usePageAction<Account>();
  const table = useTable<Account>({
    columns,
    refineCoreProps: {
      resource: "accounts",
      pagination: {
        pageSize: 10,
        currentPage: 1
      }
    },

  });

  return (
    <Page>
      <PageHeader title="账户" primaryButtons={<AccountPrimaryActions />}
      />
      <DataTableToolbar table={table} />
      <DataTable<Account> table={table} />
      <DataTablePagination table={table} />
      <DataTableBulkActions table={table}>
        <AccountBulkActions table={table} />
      </DataTableBulkActions>
      <ActionDialogs />
    </Page>
  );
};

