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
import { Account } from '../type';
import { SelectDropdownCommandMutiple } from '@/components/select-dropdown-command-mutiple';
import { PermissionTree } from '../roles/premission-tree';

const AccountEditSheetPropsSchema = z.object({
    open: z.boolean(),
    onOpenChange: z.custom<(open: boolean) => void>(),
});
type AccountEditSheetProps = z.infer<typeof AccountEditSheetPropsSchema>;

const accountSchema = z.object({
    name: z.string().min(1, "显示名称最少6位"),
    username: z.string().min(4, "登录账号最少4位"),
    password: z.string().min(6, "登录密码最少6位").optional().or(z.literal("")),
    roleIds: z.array(z.string()),
    extraPermissions: z.array(z.string())
});

type AccountFormData = z.infer<typeof accountSchema>;

export function AccountEditSheet({
    open,
    onOpenChange,
}: AccountEditSheetProps) {
    const { currentRow, setOpen } = usePageAction<Account>();
    const isUpdate = !!currentRow;

    const {
        refineCore: { onFinish, formLoading },
        ...form
    } = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: currentRow?.name || "",
            username: currentRow?.username || "",
            extraPermissions: currentRow?.extraPermissions || [],
            roleIds: currentRow?.roleIds || [],
            password: ""
        },
        refineCoreProps: {
            resource: "accounts",
            action: isUpdate ? "edit" : "create",
            id: isUpdate ? currentRow?.id : undefined,
            queryOptions: {
                enabled: false,
            },
        },
    });

    const onSubmit = async (values: AccountFormData) => {
        console.log("values", values);
        await onFinish(values);
        onOpenChange(false);
    }

    return (
        <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); }} >
            <SheetContent className='w-full sm:max-w-[400px] overflow-auto' > {/** onPointerDownOutside={(e) => e.preventDefault()} 点击其他地方不关闭 */}
                <SheetHeader className='pb-0'>
                    <SheetTitle>{isUpdate ? "编辑账户" : "创建账户"}</SheetTitle>
                    <SheetClose />
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4" id={currentRow?.id || "account-form"}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>名称</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="显示名称" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="username"
                            rules={{ required: "Content is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>用户名</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="登录账号，最少6位" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>密码</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="登录密码，最少6位" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* <FormField
                            control={form.control}
                            name="root"
                            render={({ field }) => (
                                <FormItem className='flex'>
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked)}/>
                                    </FormControl>
                                    <FormLabel>root 用户</FormLabel>
                                </FormItem>
                            )}
                        /> */}
                        <FormField
                            control={form.control}
                            name="roleIds"
                            rules={{ required: "Role is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>选择角色</FormLabel>
                                    <FormControl>
                                        <SelectDropdownCommandMutiple
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            placeholder='选择权限'
                                            classNameTrigger='w-full'
                                            classNameContent='w-[200px] p-0'
                                            maxDisplayNumber={3}
                                            useSelectOptions={{
                                                resource: "roles",
                                                optionLabel: item => item.name,
                                            }} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="extraPermissions"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>额外权限 <span className="text-xs opacity-40">总权限=角色权限+附加权限</span></FormLabel>
                                    <FormControl>
                                        <PermissionTree value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </form>
                </Form>
                <SheetFooter className='gap-2 '>
                    <Button form={currentRow?.id || "account-form"} type='submit' disabled={formLoading} className='w-full'>
                        保存
                    </Button>
                    <SheetClose asChild className='w-full'>
                        <Button variant='outline'>关闭</Button>
                    </SheetClose>
                </SheetFooter>

            </SheetContent>
        </Sheet>);
}