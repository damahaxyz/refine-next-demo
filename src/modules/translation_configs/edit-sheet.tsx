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
import { TranslationConfig } from "./types";

const TranslationConfigEditSheetPropsSchema = z.object({
    open: z.boolean(),
    onOpenChange: z.custom<(open: boolean) => void>(),
});
type TranslationConfigEditSheetProps = z.infer<typeof TranslationConfigEditSheetPropsSchema>;

const translationConfigFormSchema = z.object({
    provider: z.string().min(1, "Provider is required"),
    appId: z.string().optional(),
    apiKey: z.string().min(1, "API Key is required"),
    defaultTargetLang: z.string().min(1, "Default Target Language is required"),
});

type TranslationConfigFormData = z.infer<typeof translationConfigFormSchema>;

export function TranslationConfigEditSheet({
    open,
    onOpenChange,
}: TranslationConfigEditSheetProps) {
    const { currentRow } = usePageAction<TranslationConfig>();
    const isUpdate = !!currentRow;

    const {
        refineCore: { onFinish, formLoading },
        ...form
    } = useForm({
        resolver: zodResolver(translationConfigFormSchema),
        defaultValues: {
            provider: currentRow?.provider || "aidge",
            appId: currentRow?.appId || "",
            apiKey: currentRow?.apiKey || "",
            defaultTargetLang: currentRow?.defaultTargetLang || "en",
        } as TranslationConfigFormData,
        refineCoreProps: {
            resource: "translation_configs",
            action: isUpdate ? "edit" : "create",
            id: isUpdate ? currentRow?.id : undefined,
            queryOptions: {
                enabled: false,
            },
        },
    });

    const onSubmit = async (values: TranslationConfigFormData) => {
        await onFinish(values);
        onOpenChange(false);
    }

    return (
        <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); }} >
            <SheetContent className='w-full sm:max-w-[500px] overflow-auto' >
                <SheetHeader className='pb-0'>
                    <SheetTitle>{isUpdate ? "Edit Config" : "Add Config"}</SheetTitle>
                    <SheetClose />
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4" id={currentRow?.id || "config-form"}>
                        <FormField
                            control={form.control}
                            name="provider"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Provider</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select provider" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="aidge">Aidge AI</SelectItem>
                                            <SelectItem value="google">Google Translate</SelectItem>
                                            <SelectItem value="deepl">DeepL</SelectItem>
                                            <SelectItem value="openai">OpenAI</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="appId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>App ID (Optional)</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="App ID" />
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
                                    <FormLabel>API Key</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password" placeholder="API Key" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="defaultTargetLang"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Default Target Language</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="en" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </form>
                </Form>
                <SheetFooter className='gap-2 '>
                    <Button form={currentRow?.id || "config-form"} type='submit' disabled={formLoading} className='w-full'>
                        Save
                    </Button>
                    <SheetClose asChild className='w-full'>
                        <Button variant='outline'>Close</Button>
                    </SheetClose>
                </SheetFooter>

            </SheetContent>
        </Sheet>);
}
