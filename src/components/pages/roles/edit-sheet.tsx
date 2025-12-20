import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { Button } from '@/components/ui/button';
import { usePageAction } from '@/components/page/page-action-provider';
import { Role } from '@/components/pages/type';

import { useList, useSelect } from '@refinedev/core';
import { PermissionTree } from './premission-tree';


const RoleSheetSchema = z.object({
    open: z.boolean(),
    onOpenChange: z.custom<(open: boolean) => void>(),
});
type RoleSheetProps = z.infer<typeof RoleSheetSchema>;

const roleSchema = z.object({
    name: z.string().min(1, "Title is required"),
    permissions: z.array(z.string())
});

type RoleFormData = z.infer<typeof roleSchema>;

export function RoleEditSheet({
    open,
    onOpenChange,
}: RoleSheetProps) {
    const { currentRow, setOpen } = usePageAction<Role>();
    const isUpdate = !!currentRow;
    const {
        refineCore: { onFinish, formLoading },
        ...form
    } = useForm({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: currentRow?.name || "",
            permissions: currentRow?.permissions || []
        },
        refineCoreProps: {
            resource: "roles",
            action: isUpdate ? "edit" : "create",
            id: isUpdate ? currentRow?.id : undefined,
            queryOptions: {
                enabled: false,
            },
        },
    });

    const onSubmit = async (values: RoleFormData) => {
        console.log("values", values);
        await onFinish(values);
        onOpenChange(false)
    }


    return (
        <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); }} >
            <SheetContent className='w-full sm:max-w-[400px] overflow-auto'>
                <SheetHeader className='pb-0'>
                    <SheetTitle>{isUpdate ? "编辑角色" : "创建角色"}</SheetTitle>
                    <SheetClose />

                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4" id='blog-post-form'>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>角色名称</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Title" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="permissions"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>选择权限</FormLabel>
                                    <FormControl>
                                        <PermissionTree value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </form>
                </Form>

                <SheetFooter className='gap-2'>
                    <Button form='blog-post-form' type='submit' disabled={formLoading} className='w-full'>
                        保存
                    </Button>
                    <SheetClose asChild className='w-full'>
                        <Button variant='outline'>关闭</Button>
                    </SheetClose>
                </SheetFooter>

            </SheetContent>
        </Sheet>);
}