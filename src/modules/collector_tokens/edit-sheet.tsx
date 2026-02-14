import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import z from "zod";
import { Checkbox } from "@/components/ui/checkbox";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { Button } from '@/components/ui/button';
import { usePageAction } from '@/components/page/page-action-provider';
import { CollectorToken } from "./types";

function generateToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const CollectorTokenEditSheetPropsSchema = z.object({
    open: z.boolean(),
    onOpenChange: z.custom<(open: boolean) => void>(),
});
type CollectorTokenEditSheetProps = z.infer<typeof CollectorTokenEditSheetPropsSchema>;

const collectorTokenFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    token: z.string().optional(), // Generated on frontend or backend
    isActive: z.boolean(),
});

type CollectorTokenFormData = z.infer<typeof collectorTokenFormSchema>;

export function CollectorTokenEditSheet({
    open,
    onOpenChange,
}: CollectorTokenEditSheetProps) {
    const { currentRow } = usePageAction<CollectorToken>();
    const isUpdate = !!currentRow;

    const {
        refineCore: { onFinish, formLoading },
        ...form
    } = useForm({
        resolver: zodResolver(collectorTokenFormSchema),
        defaultValues: {
            name: currentRow?.name || "",
            token: currentRow?.token || generateToken(32), // Pre-fill with random token if new
            isActive: currentRow?.isActive ?? true,
        },
        refineCoreProps: {
            resource: "collector_tokens",
            action: isUpdate ? "edit" : "create",
            id: isUpdate ? currentRow?.id : undefined,
            queryOptions: {
                enabled: false,
            },
        },
    });

    const onSubmit = async (values: CollectorTokenFormData) => {
        await onFinish(values);
        onOpenChange(false);
    }

    return (
        <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); }} >
            <SheetContent className='w-full sm:max-w-[500px] overflow-auto' >
                <SheetHeader className='pb-0'>
                    <SheetTitle>{isUpdate ? "Edit Token" : "Create Token"}</SheetTitle>
                    <SheetClose />
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4" id={currentRow?.id || "token-form"}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="My Work Laptop" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="token"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Token (Auto-generated)</FormLabel>
                                    <FormControl>
                                        <Input {...field} readOnly={true} className="font-mono bg-muted" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Active</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                    </form>
                </Form>
                <SheetFooter className='gap-2 '>
                    <Button form={currentRow?.id || "token-form"} type='submit' disabled={formLoading} className='w-full'>
                        Save
                    </Button>
                    <SheetClose asChild className='w-full'>
                        <Button variant='outline'>Close</Button>
                    </SheetClose>
                </SheetFooter>

            </SheetContent>
        </Sheet>);
}
