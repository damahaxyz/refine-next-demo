import { usePageAction } from "@/components/page/page-action-provider";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/custom/resource-delete-button";
import { Account } from "./types";
import { Key, Trash2 } from "lucide-react";
import { CanAccess, useCustomMutation, useInvalidate } from "@refinedev/core";
import { toast } from "sonner";

export const AccountRowActions = ({ row }: { row: Account }) => {
  const { setOpen, setCurrentRow } = usePageAction<Account>();
  const { mutate } = useCustomMutation<Account>();
  const invalidate = useInvalidate();

  const handleGenerateToken = () => {
    mutate({
      url: `/api/accounts/${row.id}/generate-token`,
      method: "post",
      values: {},
      successNotification: (data, values, resource) => {
        return false;
      },
      errorNotification: (data, values, resource) => {
        return false;
      },
    }, {
      onSuccess: () => {
        toast.success("API Token Generated", {
          description: "Successfully generated a new API token."
        });
        invalidate({
          resource: "accounts",
          invalidates: ["list", "many", "detail"],
        });
      },
      onError: () => {
        toast.error("Error", {
          description: "Failed to generate API token."
        });
      }
    });
  };

  return (
    <div className="flex gap-2">
      <CanAccess resource="accounts" action="update">
        <Button size="sm" onClick={() => { setCurrentRow(row); setOpen("account-edit"); }}>编辑</Button>
      </CanAccess>
      <CanAccess resource="accounts" action="update">
        <Button size="sm" variant="outline" onClick={handleGenerateToken} title="生成 API Token">
          <Key className="w-4 h-4" />
        </Button>
      </CanAccess>
      <CanAccess resource="accounts" action="delete">
        <DeleteButton size="sm" resource="accounts" recordItemId={row.id} ><Trash2 /></DeleteButton>
      </CanAccess>
    </div>
  );
};
