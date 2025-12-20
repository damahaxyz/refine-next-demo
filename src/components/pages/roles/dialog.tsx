import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import z from "zod";
import { usePageAction } from "@/components/page/page-action-provider";
import { Role } from "@/components/pages/type";

const RoleDialogPropsSchema = z.object({
    open: z.boolean(),
    onOpenChange: z.custom<(open: boolean) => void>(),
});
type RoleDialogProps = z.infer<typeof RoleDialogPropsSchema>;

export const RoleDialog = ({
  open,
  onOpenChange
}: RoleDialogProps) => {

  const { currentRow } = usePageAction<Role>();

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Role</DialogTitle>
          <DialogDescription>
            Detailed information about the Role.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          弹窗内容
        </div>
      </DialogContent>
    </Dialog>
  );
};
