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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { Button } from '@/components/ui/button';
import { usePageAction } from '@/components/page/page-action-provider';
import { Product } from "./types";
import { Checkbox } from '@/components/ui/checkbox';

const ProductEditSheetPropsSchema = z.object({
    open: z.boolean(),
    onOpenChange: z.custom<(open: boolean) => void>(),
});
type ProductEditSheetProps = z.infer<typeof ProductEditSheetPropsSchema>;

const productFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    price: z.coerce.number().min(0),
    sellingPrice: z.coerce.number().optional(),
    description: z.string().optional(),
    status: z.enum(["draft", "translated", "ready", "published", "archived"]),
    hasVariants: z.boolean(),
    // Simple JSON editing for complex fields for now
    variants: z.string().optional(),
    images: z.string().optional(), // Newline separated URLs
});

type ProductFormData = z.infer<typeof productFormSchema>;

export function ProductEditSheet({
    open,
    onOpenChange,
}: ProductEditSheetProps) {
    const { currentRow } = usePageAction<Product>();
    const isUpdate = !!currentRow;

    const {
        refineCore: { onFinish, formLoading },
        ...form
    } = useForm({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            title: currentRow?.title || "",
            price: currentRow?.price || 0,
            sellingPrice: currentRow?.sellingPrice || 0,
            description: currentRow?.description || "",
            status: (currentRow?.status as any) || "draft",
            hasVariants: currentRow?.hasVariants ?? false,
            variants: currentRow?.variants ? JSON.stringify(currentRow.variants, null, 2) : "",
            images: currentRow?.images ? (currentRow.images as any[]).map(img => img.sourceUrl || img).join("\n") : "",
        } as ProductFormData,
        refineCoreProps: {
            resource: "products",
            action: isUpdate ? "edit" : "create",
            id: isUpdate ? currentRow?.id : undefined,
            queryOptions: {
                enabled: false,
            },
        },
    });

    const onSubmit = async (values: ProductFormData) => {
        const submissionData: any = {
            ...values,
            variants: values.variants ? JSON.parse(values.variants) : null,
            images: values.images ? values.images.split("\n").filter(Boolean).map(url => ({ sourceUrl: url })) : [],
        };

        await onFinish(submissionData);
        onOpenChange(false);
    }

    return (
        <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); }} >
            <SheetContent className='w-full sm:max-w-[500px] overflow-auto' >
                <SheetHeader className='pb-0'>
                    <SheetTitle>{isUpdate ? "Edit Product" : "Create Product"}</SheetTitle>
                    <SheetClose />
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4" id={currentRow?.id || "product-form"}>
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Product Title" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Product Description" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Price (CNY)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sellingPrice"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Selling Price (USD)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="translated">Translated</SelectItem>
                                            <SelectItem value="ready">Ready</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="hasVariants"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Has Variants</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="images"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Images (One URL per line)</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} className="min-h-[100px] font-mono text-xs" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="variants"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variants JSON</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} className="min-h-[150px] font-mono text-xs" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </form>
                </Form>
                <SheetFooter className='gap-2 '>
                    <Button form={currentRow?.id || "product-form"} type='submit' disabled={formLoading} className='w-full'>
                        Save
                    </Button>
                    <SheetClose asChild className='w-full'>
                        <Button variant='outline'>Close</Button>
                    </SheetClose>
                </SheetFooter>

            </SheetContent>
        </Sheet>);
}
