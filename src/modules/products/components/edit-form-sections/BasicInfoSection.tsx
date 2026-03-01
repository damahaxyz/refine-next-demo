import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";
import { useCustomMutation, useNotification } from "@refinedev/core";
import { useFormContext } from "react-hook-form";

export interface BasicInfoSectionProps {
    control: any;
    shops: any[];
}

export function BasicInfoSection({ control, shops }: BasicInfoSectionProps) {
    const { getValues, setValue } = useFormContext();
    const { mutateAsync: generateKeywordMutation, mutation: { isPending: isGenerating } } = useCustomMutation();
    const { open } = useNotification();

    const handleGenerateKeywords = async () => {
        const title = getValues("titleTranslated") || getValues("title");
        const categories = getValues("categories")?.map((a: any) => a.name);
        const properties = getValues("attributes")?.map((a: any) => `${a.nameProcessed || a.name}: ${a.values?.map((v: any) => v.valueProcessed || v.value).join("#")}`) || [];

        if (!title) {
            open?.({
                type: "error",
                message: "错误",
                description: "请先提供原文标题或翻译后标题 (Title)",
            });
            return;
        }
        if (!categories || categories.length === 0) {
            open?.({
                type: "error",
                message: "错误",
                description: "请先选择商品类目 (Product Category)",
            });
            return;
        }

        try {
            const response = await generateKeywordMutation({
                url: "/api/ai/text/keyword",
                method: "post",
                values: {
                    title,
                    pcate_leaf_name: categories,
                    properties,
                    targetLanguage: "en"
                }
            });
            const result = response.data as any;
            if (result.success && Array.isArray(result.data)) {
                const currentKeywords = getValues("keywords");
                const newKeywords = result.data.join(", ");
                setValue("keywords", currentKeywords ? `${currentKeywords}, ${newKeywords}` : newKeywords, { shouldDirty: true });
            } else {
                open?.({
                    type: "error",
                    message: "生成失败",
                    description: JSON.stringify(result.error || result.details || "Unknown error"),
                });
            }
        } catch (error: any) {
            open?.({
                type: "error",
                message: "请求出错",
                description: error.message,
            });
        }
    };

    return (
        <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField
                    control={control}
                    name="shopId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>店铺 (Shop)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a shop" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {shops.map((shop: any) => (
                                        <SelectItem key={shop.id} value={shop.id}>
                                            {shop.name} ({shop.type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>商品状态 (Status)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "draft"}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="draft">Draft (草稿)</SelectItem>
                                    <SelectItem value="translated">Translated (已翻译)</SelectItem>
                                    <SelectItem value="ready">Ready (就绪)</SelectItem>
                                    <SelectItem value="published">Published (已发布)</SelectItem>
                                    <SelectItem value="archived">Archived (归档)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>原价 (RMB)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="sellingPrice"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>售价 (USD)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            {/* Keywords */}
            <FormField
                control={control}
                name="keywords"
                render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center justify-between">
                            <FormLabel>搜索关键词 (Keywords)</FormLabel>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleGenerateKeywords}
                                disabled={isGenerating}
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                                AI一键生成关键词
                            </Button>
                        </div>
                        <FormControl>
                            <Input
                                {...field}
                                value={field.value || ""}
                                placeholder="使用逗号分隔关键词，如: 手机, 智能, 5G"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
