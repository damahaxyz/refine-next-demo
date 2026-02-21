"use client";

import { useForm } from "@refinedev/react-hook-form";
import { useTranslate, useGo, useList, useCustomMutation } from "@refinedev/core";
import { Product } from "./types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, ArrowLeft, Save, Plus, X, Check, Languages, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useFieldArray } from "react-hook-form";
import { cn } from "@/lib/utils";
import { ImageEdit } from "./components/image-edit";
import { Page } from "@components/page/page";

// Helper to safely get array
const ensureArray = (val: any): any[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed;
        } catch { }
    }
    return [];
};

export const ProductEditForm = () => {
    const translate = useTranslate();
    const go = useGo();
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const { mutateAsync: generateTitleMutation } = useCustomMutation();

    const { result: { data: shops } } = useList({
        resource: "shops",
        pagination: { mode: "off" },
    });

    const form = useForm<Product>({
        refineCoreProps: {
            resource: "products",
            action: "edit",
            redirect: false,
            onMutationSuccess: () => {
                // Optional: Stay on page or redirect
            }
        },
    });

    const {
        saveButtonProps,
        refineCore: { query: queryResult, onFinish },
        register,
        control,
        formState: { errors },
        setValue,
        watch,
    } = form as any;

    const selectedShopId = watch("shopId");
    const selectedShop = shops?.find((s: any) => s.id === selectedShopId);

    // Ensure shop categories/tags are arrays
    const shopCategories = ensureArray(selectedShop?.categories);
    const shopTags = ensureArray(selectedShop?.tags);

    const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } = useFieldArray({
        control,
        name: "attributes" as any,
    });

    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
        control,
        name: "variants" as any,
    });

    const product = queryResult?.data?.data;
    const images = ensureArray(watch("images"));
    const descriptionImages = ensureArray(watch("descriptionImages"));

    const handleBack = () => {
        go({
            to: { resource: "products", action: "list" },
        });
    };

    const translateText = async (text: string) => {
        try {
            const response = await generateTitleMutation({
                url: "/api/ai/text/translate",
                method: "post",
                values: {
                    text,
                    targetLanguage: "en"
                }
            });
            const result = response.data as any;
            if (result.success) {
                return result.data;
            } else {
                console.error("Translation returned an error payload:", result);
                return null;
            }
        } catch (e: any) {
            console.error("Translation request failed:", e);
            return null;
        }
    }

    const handleTranslateAttributeValue = async (attrIndex: number, valIndex: number) => {
        const currentAttributes = form.getValues("attributes");
        const sourceValue = currentAttributes[attrIndex].values[valIndex].value;

        if (sourceValue) {
            const translated = await translateText(sourceValue);
            if (translated !== null) {
                currentAttributes[attrIndex].values[valIndex].valueProcessed = translated;
                form.setValue("attributes", [...currentAttributes]);
            } else {
                alert(`属性值 "${sourceValue}" 翻译失败，请重试。`);
            }
        }
    };

    const handleTranslateAttributeName = async (attrIndex: number) => {
        const currentAttributes = form.getValues("attributes");
        const sourceName = currentAttributes[attrIndex].name;

        if (sourceName) {
            const translated = await translateText(sourceName);
            if (translated !== null) {
                currentAttributes[attrIndex].nameProcessed = translated;
                form.setValue("attributes", [...currentAttributes]);
            } else {
                alert(`属性名 "${sourceName}" 翻译失败，请重试。`);
            }
        }
    };

    const handleGenerateTitle = async () => {
        const title = watch("title");
        const keywords = watch("keywords");
        const categories = watch("categories");

        if (!title) {
            alert("请先提供原文标题 (Source Title)");
            return;
        }
        if (categories.length <= 0) {
            alert("请先选择商品类目 (Product Category)");
            return;
        }

        setIsGeneratingTitle(true);
        try {
            const response = await generateTitleMutation({
                url: "/api/ai/product/title/generation",
                method: "post",
                values: {
                    title,
                    keywords,
                    category: categories && categories.length > 0 ? categories : ["General"], // Pass string array
                    targetLanguage: "en"
                }
            });
            const result = response.data as any;

            if (result.success) {
                const apiData = result.data;
                // Try to heuristically find the string array from Aidge
                const titleStr = apiData?.data?.[0] || apiData?.result || (apiData?.data?.titles ? apiData.data.titles[0] : JSON.stringify(apiData?.data || apiData));
                setValue("titleTranslated", typeof titleStr === 'string' ? titleStr : JSON.stringify(titleStr));
            } else {
                alert("生成失败: " + JSON.stringify(result.error || result.details || "Unknown error"));
            }
        } catch (e: any) {
            alert("请求出错: " + e.message);
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    // A helper to replace all matching ImageObjects across the entire form state
    // when an image is cropped or its `processedUrl` gets updated.
    const handleGlobalImageChange = (newImage: any) => {
        if (!newImage) return;

        // Ensure newImage has an ID (if not, use sourceUrl as fallback initial id)
        const activeId = newImage.id || newImage.sourceUrl;
        const activeSource = newImage.sourceUrl;
        if (!activeSource) return;

        const currentValues = form.getValues();
        let isModified = false;

        const maybeUpdateImage = (img: any) => {
            if (!img) return;
            const targetId = img.id || img.sourceUrl;

            // Match rule: 
            // 1. If explicit IDs match (strong copy) -> Update
            // 2. Or, if both have no strict IDs but identical sourceUrls -> Update
            const isMatch = (targetId === activeId) || (!img.id && !newImage.id && img.sourceUrl === activeSource);

            if (isMatch) {
                // Check if it's already exactly the same to avoid unnecessary rerenders
                if (img.processedUrl !== newImage.processedUrl || img.id !== activeId) {
                    img.processedUrl = newImage.processedUrl;
                    img.id = activeId; // Propagate the explicit ID backward
                    isModified = true;
                }
            }
        };

        // 1. Root images
        if (currentValues.images) {
            currentValues.images.forEach(maybeUpdateImage);
        }

        // 2. Description images
        if (currentValues.descriptionImages) {
            currentValues.descriptionImages.forEach(maybeUpdateImage);
        }

        // 3. Attributes
        if (currentValues.attributes) {
            currentValues.attributes.forEach((attr: any) => {
                if (attr.values) {
                    attr.values.forEach((v: any) => {
                        maybeUpdateImage(v.image);
                    });
                }
            });
        }

        // 4. Variants
        if (currentValues.variants) {
            currentValues.variants.forEach((v: any) => {
                maybeUpdateImage(v.image);
            });
        }

        // If at least one instance got updated, trigger a form rerender by pushing back
        if (isModified) {
            form.reset(currentValues, { keepDefaultValues: true, keepDirty: true });
        }
    };

    if (queryResult?.isLoading) {
        return <Page><div>Loading...</div></Page>;
    }

    return (
        <Page>
            <div className="container mx-auto py-6 max-w-[1600px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-background/0 backdrop-blur z-50 py-2">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h5 className="text-lg font-bold tracking-tight">商品编辑</h5>
                            <p className="text-muted-foreground text-sm">
                                ID: {product?.id} | Platform: {product?.sourcePlatform} | SourceId: {product?.sourceId}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button {...saveButtonProps} disabled={queryResult?.isFetching}>
                            <Save className="mr-2 h-4 w-4" />
                            保存全部修改
                        </Button>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onFinish)} className="space-y-8 pb-20">

                        {/* 1. Status & Basic Info (Global) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>全局设置 & 基础信息</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Row 1: Shop & Status */}
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
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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


                                {/* Row 3: Categories (Shop Based) */}
                                <FormField
                                    control={control}
                                    name="categories"
                                    render={({ field }) => {
                                        const currentValues = ensureArray(field.value);

                                        const handleSelect = (catId: string, catName: string) => {
                                            const exists = currentValues.some((v: any) => v.id.toString() === catId);
                                            let newValue;
                                            if (exists) {
                                                newValue = currentValues.filter((v: any) => v.id.toString() !== catId);
                                            } else {
                                                newValue = [...currentValues, { id: catId, name: catName }];
                                            }
                                            field.onChange(newValue);
                                        };

                                        return (
                                            <FormItem>
                                                <FormLabel>商品分类 (Categories)</FormLabel>
                                                <div className="bg-muted/10 p-3 rounded-md border min-h-[40px]">
                                                    {shopCategories.length === 0 ? (
                                                        <div className="text-sm text-muted-foreground italic p-2">
                                                            {selectedShopId ? "该店铺暂无分类数据" : "请先选择店铺"}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {shopCategories.map((cat: any) => {
                                                                const isSelected = currentValues.some((v: any) => v.id == cat.id);
                                                                return (
                                                                    <Badge
                                                                        key={cat.id}
                                                                        variant={isSelected ? "default" : "outline"}
                                                                        className={cn(
                                                                            "cursor-pointer hover:bg-primary/80 transition-colors",
                                                                            !isSelected && "bg-background hover:bg-muted"
                                                                        )}
                                                                        onClick={() => handleSelect(cat.id.toString(), cat.name)}
                                                                    >
                                                                        {cat.name}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />

                                {/* Row 4: Tags (Shop Based) */}
                                <FormField
                                    control={control}
                                    name="tags"
                                    render={({ field }) => {
                                        const currentValues = ensureArray(field.value);

                                        const handleSelect = (tagId: string, tagName: string) => {
                                            const exists = currentValues.some((v: any) => v.id.toString() === tagId);
                                            let newValue;
                                            if (exists) {
                                                newValue = currentValues.filter((v: any) => v.id.toString() !== tagId);
                                            } else {
                                                newValue = [...currentValues, { id: tagId, name: tagName }];
                                            }
                                            field.onChange(newValue);
                                        };

                                        return (
                                            <FormItem>
                                                <FormLabel>店铺标签 (Shop Tags)</FormLabel>
                                                <div className="bg-muted/10 p-3 rounded-md border min-h-[60px]">
                                                    {shopTags.length === 0 ? (
                                                        <div className="text-sm text-muted-foreground italic p-2">
                                                            {selectedShopId ? "该店铺暂无标签数据" : "请先选择店铺"}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {shopTags.map((tag: any) => {
                                                                const isSelected = currentValues.some((v: any) => v.id == tag.id);
                                                                return (
                                                                    <Badge
                                                                        key={tag.id}
                                                                        variant={isSelected ? "secondary" : "outline"} // Use secondary for tags to differentiate
                                                                        className={cn(
                                                                            "cursor-pointer transition-colors",
                                                                            isSelected ? "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200" : "bg-background hover:bg-muted"
                                                                        )}
                                                                        onClick={() => handleSelect(tag.id.toString(), tag.name)}
                                                                    >
                                                                        {tag.name}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />

                                {/* Row 5: Keywords */}
                                <FormField
                                    control={control}
                                    name="keywords"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>搜索关键词 (Keywords)</FormLabel>
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
                            </CardContent>
                        </Card>

                        {/* 2. Title Comparison */}
                        <div className="grid grid-cols-2 gap-6">
                            <Card className="border-blue-200 bg-blue-50/10 gap-2">
                                <CardHeader className="flex flex-row items-center justify-between h-8">
                                    <CardTitle className="text-blue-700">原文标题 (Source Title)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea {...field} className="min-h-[80px]" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                            <Card className="border-green-200 bg-green-50/10 gap-2">
                                <CardHeader className="flex flex-row items-center justify-between h-8">
                                    <CardTitle className="text-green-700">翻译标题 (Translated Title)</CardTitle>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                                        onClick={handleGenerateTitle}
                                        disabled={isGeneratingTitle}
                                    >
                                        {isGeneratingTitle ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                        AI 智能翻译/生成
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={control}
                                        name="titleTranslated"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea {...field} value={field.value || ""} className="min-h-[80px]" placeholder="Translation..." />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* 3. Attributes Comparison (Formerly Specs) */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>规格/属性 (Attributes)</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendAttribute({ id: crypto.randomUUID(), name: "", values: [] })}>
                                    <Plus className="w-4 h-4 mr-1" /> Add Attribute
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {attributeFields.map((field: any, index) => (
                                    <div key={field.id} className="border p-4 rounded-lg relative bg-muted/10">
                                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeAttribute(index)}>
                                            <X className="w-4 h-4" />
                                        </Button>

                                        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-4 items-end">
                                            <FormField
                                                control={control}
                                                name={`attributes.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] text-muted-foreground uppercase">属性名 (Source)</FormLabel>
                                                        <FormControl><Input className="h-8 text-xs" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name={`attributes.${index}.nameProcessed`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] text-muted-foreground uppercase">译文 (Translated)</FormLabel>
                                                        <FormControl><Input className="h-8 text-xs" {...field} value={field.value || ""} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="pb-0.5">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border shrink-0"
                                                    onClick={() => handleTranslateAttributeName(index)}
                                                    title="Translate Name"
                                                >
                                                    <Languages className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Values Editor */}
                                        <div className="space-y-2">
                                            <div className="text-xs font-semibold">Values</div>
                                            <div className="space-y-2">
                                                {(field.values || []).map((val: any, vIndex: number) => {
                                                    const fieldVal = form.watch(`attributes.${index}.values.${vIndex}`);
                                                    return (
                                                        <div key={val.id || vIndex} className="flex gap-2 items-center bg-muted/10 p-1.5 rounded border border-dashed">
                                                            <div className="w-8 h-8 shrink-0">
                                                                <ImageEdit
                                                                    value={fieldVal?.image}
                                                                    onChange={(newVal) => {
                                                                        form.setValue(`attributes.${index}.values.${vIndex}.image`, newVal);
                                                                        handleGlobalImageChange(newVal);
                                                                    }}
                                                                    onRemove={() => form.setValue(`attributes.${index}.values.${vIndex}.image`, undefined)}
                                                                    productId={product?.id}
                                                                />
                                                            </div>
                                                            <Input
                                                                className="h-8 text-xs flex-1 min-w-[100px]"
                                                                {...register(`attributes.${index}.values.${vIndex}.value`)}
                                                                placeholder="Source Value"
                                                            />
                                                            <Input
                                                                className="h-8 text-xs flex-1 min-w-[100px]"
                                                                {...register(`attributes.${index}.values.${vIndex}.valueProcessed`)}
                                                                placeholder="Trans Value"
                                                            />
                                                            <div className="flex gap-1 shrink-0">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border"
                                                                    onClick={() => handleTranslateAttributeValue(index, vIndex)}
                                                                    title="Translate Value"
                                                                >
                                                                    <Languages className="w-3 h-3" />
                                                                </Button>
                                                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20" onClick={() => {
                                                                    const currentAttributes = form.getValues("attributes");
                                                                    currentAttributes[index].values.splice(vIndex, 1);
                                                                    form.setValue("attributes", [...currentAttributes]);
                                                                }}>
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <Button type="button" variant="outline" size="sm" className="text-xs h-8 dashed border-muted-foreground/30" onClick={() => {
                                                    const currentAttributes = form.getValues("attributes");
                                                    if (!currentAttributes[index].values) currentAttributes[index].values = [];
                                                    currentAttributes[index].values.push({ id: crypto.randomUUID(), value: "" });
                                                    form.setValue("attributes", [...currentAttributes]);
                                                }}>
                                                    <Plus className="w-3 h-3 mr-1" /> 添加属性值
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* 4. Variants Comparison */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>SKU 变体 (Variants)</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendVariant({ id: Date.now().toString(), price: 0, attributeIdMap: {} })}>
                                    <Plus className="w-4 h-4 mr-1" /> Add SKU
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4 flex flex-wrap gap-4">
                                {variantFields.map((fieldItem: any, index: number) => {
                                    const field = fieldItem;
                                    // Resolve Attributes for Display
                                    const resolvedAttributes = Object.entries(field.attributeIdMap || {}).map(([attrId, valIds]: [string, any]) => {
                                        // Look up in the form's attributes
                                        const allAttributes = form.watch("attributes") || [];
                                        const attr = allAttributes.find((a: any) => a.id === attrId);

                                        // Handle if valIds is string (legacy) or array (new)
                                        const ids = Array.isArray(valIds) ? valIds : [valIds];

                                        const values = ids.map((id: string) => attr?.values?.find((v: any) => v.id === id)).filter(Boolean);

                                        return {
                                            key: attr?.name || attrId,
                                            value: values.map((v: any) => v.value).join(", ") || ids.join(", "),
                                            keyProcessed: attr?.nameProcessed,
                                            valueProcessed: values.map((v: any) => v.valueProcessed).join(", ")
                                        };
                                    });

                                    return (
                                        <div key={field.id} className="border rounded-lg p-4 space-y-4 relative bg-muted/20">
                                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeVariant(index)}>
                                                <X className="w-4 h-4" />
                                            </Button>

                                            {/* Common SKU Info */}
                                            <div className="flex flex-col gap-4">
                                                <FormField
                                                    control={control}
                                                    name={`variants.${index}.image`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormLabel className="text-xs">SKU 图片 (Image)</FormLabel>
                                                            <div className="w-32 h-32">
                                                                <ImageEdit
                                                                    value={field.value}
                                                                    onChange={(newVal) => {
                                                                        field.onChange(newVal);
                                                                        handleGlobalImageChange(newVal);
                                                                    }}
                                                                    onRemove={() => form.setValue(`variants.${index}.image`, undefined)}
                                                                    productId={product?.id}
                                                                />
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="flex gap-2">
                                                    <FormField
                                                        control={control}
                                                        name={`variants.${index}.price`}
                                                        render={({ field }) => (
                                                            <FormItem className="w-24">
                                                                <FormLabel className="text-xs">原价(RMB)</FormLabel>
                                                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={control}
                                                        name={`variants.${index}.sellingPrice`}
                                                        render={({ field }) => (
                                                            <FormItem className="w-24">
                                                                <FormLabel className="text-xs">售价(USD)</FormLabel>
                                                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                {/* <FormField
                                                control={control}
                                                name={`variants.${index}.stock`}
                                                render={({ field }) => (
                                                    <FormItem className="w-24">
                                                        <FormLabel className="text-xs">Stock</FormLabel>
                                                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                                    </FormItem>
                                                )}
                                            /> */}


                                            </div>

                                            <Separator />

                                            {/* Editable Attributes */}
                                            <div className="space-y-2">
                                                <div className="text-xs font-semibold text-blue-700">属性 (Attributes)</div>
                                                <div className="flex flex-col gap-4">
                                                    {(form.watch("attributes") || []).map((attr: any) => (
                                                        <FormField
                                                            key={attr.id}
                                                            control={control}
                                                            name={`variants.${index}.attributeIdMap.${attr.id}`}
                                                            render={({ field }) => {
                                                                // Value is string[]
                                                                const currentVal = Array.isArray(field.value) && field.value.length > 0 ? field.value[0] : "";
                                                                return (
                                                                    <FormItem className="space-y-1">
                                                                        <FormLabel className="text-[10px] text-muted-foreground uppercase">{attr.name} {attr.nameProcessed ? `(${attr.nameProcessed})` : ''}</FormLabel>
                                                                        <Select
                                                                            value={currentVal}
                                                                            onValueChange={(val) => field.onChange([val])}
                                                                        >
                                                                            <FormControl>
                                                                                <SelectTrigger className="h-8 text-xs max-w-[200px]">
                                                                                    <SelectValue placeholder="Select..." />
                                                                                </SelectTrigger>
                                                                            </FormControl>
                                                                            <SelectContent>
                                                                                {attr.values?.map((v: any) => (
                                                                                    <SelectItem key={v.id} value={v.id} className="text-xs">
                                                                                        {v.value} {v.valueProcessed ? `(${v.valueProcessed})` : ''}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                );
                                                            }}
                                                        />
                                                    ))}
                                                    {(form.watch("attributes") || []).length === 0 && (
                                                        <div className="text-xs text-muted-foreground italic col-span-2">No attributes defined. Add attributes above first.</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card >

                        {/* 5. Images Comparison */}
                        <div className="grid grid-cols-1 gap-6">
                            <Card>
                                <CardHeader><CardTitle>商品图片 (Product Images)</CardTitle></CardHeader>
                                <CardContent>
                                    <FormField
                                        control={control}
                                        name="images"
                                        render={({ field }) => (
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 w-full">
                                                {(ensureArray(field.value)).map((imgObj: any, idx: number) => (
                                                    <ImageEdit
                                                        key={idx}
                                                        value={imgObj}
                                                        onChange={(newVal) => {
                                                            const arr = [...ensureArray(field.value)];
                                                            if (newVal) arr[idx] = newVal;
                                                            field.onChange(arr);
                                                            handleGlobalImageChange(newVal);
                                                        }}
                                                        onRemove={() => {
                                                            const arr = [...ensureArray(field.value)];
                                                            arr.splice(idx, 1);
                                                            field.onChange(arr);
                                                        }}
                                                        label={imgObj.processedUrl ? "Processed" : "Source"}
                                                        productId={product?.id}
                                                    />
                                                ))}
                                                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded aspect-square cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
                                                    const url = prompt("Enter Image URL");
                                                    if (url) field.onChange([...ensureArray(field.value), { sourceUrl: url }]);
                                                }}>
                                                    <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                                                    <span className="font-semibold text-muted-foreground text-xs">Add New Image</span>
                                                </div>
                                            </div>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* 6. Description Images Comparison */}
                        <div className="grid grid-cols-1 gap-6">
                            <Card>
                                <CardHeader><CardTitle>描述图片 (Description Images)</CardTitle></CardHeader>
                                <CardContent>
                                    <FormField
                                        control={control}
                                        name="descriptionImages"
                                        render={({ field }) => (
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                                {(ensureArray(field.value)).map((imgObj: any, idx: number) => (
                                                    <ImageEdit
                                                        key={idx}
                                                        value={imgObj}
                                                        onChange={(newVal) => {
                                                            const arr = [...ensureArray(field.value)];
                                                            if (newVal) arr[idx] = newVal;
                                                            field.onChange(arr);
                                                            handleGlobalImageChange(newVal);
                                                        }}
                                                        onRemove={() => {
                                                            const arr = [...ensureArray(field.value)];
                                                            arr.splice(idx, 1);
                                                            field.onChange(arr);
                                                        }}
                                                        label={imgObj.processedUrl ? "Processed" : "Source"}
                                                        productId={product?.id}
                                                    />
                                                ))}
                                                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded aspect-[1/2] cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
                                                    const url = prompt("Enter Image URL");
                                                    if (url) field.onChange([...ensureArray(field.value), { sourceUrl: url }]);
                                                }}>
                                                    <Plus className="w-6 h-6 text-muted-foreground mb-1" />
                                                    <span className="font-semibold text-xs text-muted-foreground text-center">Add Image</span>
                                                </div>
                                            </div>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>


                    </form >
                </Form >
            </div >
        </Page>
    );
};
