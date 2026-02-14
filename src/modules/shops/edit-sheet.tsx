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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { Button } from '@/components/ui/button';
import { usePageAction } from '@/components/page/page-action-provider';
import { Shop } from "./types";
import { Checkbox } from '@/components/ui/checkbox';

const ShopEditSheetPropsSchema = z.object({
    open: z.boolean(),
    onOpenChange: z.custom<(open: boolean) => void>(),
});
type ShopEditSheetProps = z.infer<typeof ShopEditSheetPropsSchema>;

const shopFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.string().min(1, "Type is required"),
    url: z.string().url("Invalid URL"),
    apiKey: z.string().min(1, "API Key is required"),
    apiSecret: z.string().min(1, "API Secret is required"),
    version: z.string().optional(),
    defaultLanguage: z.string().min(1, "Language is required"),
    defaultCurrency: z.string().min(1, "Currency is required"),
    isActive: z.boolean(),
});

type ShopFormData = z.infer<typeof shopFormSchema>;

export function ShopEditSheet({
    open,
    onOpenChange,
}: ShopEditSheetProps) {
    const { currentRow } = usePageAction<Shop>();
    const isUpdate = !!currentRow;

    const {
        refineCore: { onFinish, formLoading },
        ...form
    } = useForm({
        resolver: zodResolver(shopFormSchema),
        defaultValues: {
            name: currentRow?.name || "",
            type: currentRow?.type || "WooCommerce",
            url: currentRow?.url || "",
            apiKey: currentRow?.apiKey || "",
            apiSecret: currentRow?.apiSecret || "",
            version: currentRow?.version || "10.5.1",
            defaultLanguage: currentRow?.defaultLanguage || "en",
            defaultCurrency: currentRow?.defaultCurrency || "USD",
            isActive: currentRow?.isActive ?? true,
        } as ShopFormData,
        refineCoreProps: {
            resource: "shops",
            action: isUpdate ? "edit" : "create",
            id: isUpdate ? currentRow?.id : undefined,
            queryOptions: {
                enabled: false,
            },
        },
    });

    const onSubmit = async (values: ShopFormData) => {
        await onFinish(values);
        onOpenChange(false);
    }

    return (
        <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); }} >
            <SheetContent className='w-full sm:max-w-[500px] overflow-auto' >
                <SheetHeader className='pb-0'>
                    <SheetTitle>{isUpdate ? "Edit Shop" : "Add Shop"}</SheetTitle>
                    <SheetClose />
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4" id={currentRow?.id || "shop-form"}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Shop Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="My Online Store" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="WooCommerce">WooCommerce</SelectItem>
                                            <SelectItem value="Shopify">Shopify</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Shop URL</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="https://example.com" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="apiKey"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Consumer Key</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="ck_..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="apiSecret"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Consumer Secret</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password" placeholder="cs_..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="defaultLanguage"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Language</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="en" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="defaultCurrency"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Currency</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="USD" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                    <Button form={currentRow?.id || "shop-form"} type='submit' disabled={formLoading} className='w-full'>
                        Save
                    </Button>
                    <SheetClose asChild className='w-full'>
                        <Button variant='outline'>Close</Button>
                    </SheetClose>
                </SheetFooter>

            </SheetContent>
        </Sheet>);
}
