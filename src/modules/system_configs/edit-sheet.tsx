import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { Button } from '@/components/ui/button';
import { usePageAction } from '@/components/page/page-action-provider';
import { SystemConfig } from './types';

const SystemConfigEditSheetPropsSchema = z.object({
    open: z.boolean(),
    onOpenChange: z.custom<(open: boolean) => void>(),
});
type SystemConfigEditSheetProps = z.infer<typeof SystemConfigEditSheetPropsSchema>;

const SystemConfigSchema = z.object({
    name: z.string().min(1, "显示名称不能为空"),
    key: z.string().min(1, "参数名不能为空"),
    value: z.string().min(1, "参数值不能为空"),
    desc: z.string().optional().or(z.literal("")),
});

type SystemConfigFormData = z.infer<typeof SystemConfigSchema>;

export function SystemConfigEditSheet({
    open,
    onOpenChange,
}: SystemConfigEditSheetProps) {
    const { currentRow, setOpen } = usePageAction<SystemConfig>();
    const isUpdate = !!currentRow;

    const {
        refineCore: { onFinish, formLoading },
        ...form
    } = useForm({
        resolver: zodResolver(SystemConfigSchema),
        defaultValues: {
            name: currentRow?.name || "",
            key: currentRow?.key || "",
            value: currentRow?.value || "",
            desc: currentRow?.desc || "",
        },
        refineCoreProps: {
            resource: "system_configs",
            action: isUpdate ? "edit" : "create",
            id: isUpdate ? currentRow?.id : undefined,
            queryOptions: {
                enabled: false,
            },
        },
    });

    const onSubmit = async (values: SystemConfigFormData) => {
        console.log("values", values);
        await onFinish(values);
        onOpenChange(false);
    }

    return (
        <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); }} >
            <SheetContent className='w-full sm:max-w-[500px] overflow-auto' >
                <SheetHeader className='pb-0'>
                    <SheetTitle>{isUpdate ? "编辑配置" : "新增配置"}</SheetTitle>
                    <SheetClose />
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4" id={currentRow?.id || "system-config-form"}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>显示名称</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="请输入显示名称" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="key"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>参数名</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="请输入参数名" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>参数值</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="请输入参数值" rows={4} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="desc"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>配置描述</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="请输入配置描述" rows={4} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </form>
                </Form>
                <SheetFooter className='gap-2 '>
                    <Button form={currentRow?.id || "system-config-form"} type='submit' disabled={formLoading} className='w-full'>
                        保存
                    </Button>
                    <SheetClose asChild className='w-full'>
                        <Button variant='outline'>关闭</Button>
                    </SheetClose>
                </SheetFooter>

            </SheetContent>
        </Sheet>);
}
