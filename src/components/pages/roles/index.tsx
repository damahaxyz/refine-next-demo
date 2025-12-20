import { useTable } from "@refinedev/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Page } from "@/components/page/page";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { usePageAction } from "@/components/page/page-action-provider";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableBulkActions } from "@/components/data-table/data-table-bulk-actions";
import { Role } from "@/components/pages/type";
import { useRoleColumns } from "./column";
import { ActionDialogs } from "./dialogs";
import { RolePrimaryActions } from "./primary-actions";
import { RoleBulkActions } from "./bulk-actions";

export const RoleList = () => {
  const columns = useRoleColumns();
  const { setOpen, setCurrentRow } = usePageAction<Role>();
  const table = useTable<Role>({
    columns,
    refineCoreProps: {
      syncWithLocation: true,
      resource: "roles",
      pagination: {
        pageSize: 10,
        currentPage: 1
      }
    },

  });

  return (
    <Page>
      <PageHeader title="角色" primaryButtons={<RolePrimaryActions />} />
      <DataTableToolbar table={table} />
      <DataTable<Role> table={table} />
      <DataTablePagination table={table} />
      <DataTableBulkActions table={table}>
        <RoleBulkActions table={table} />
      </DataTableBulkActions>
      <ActionDialogs />
    </Page>
  );
};


