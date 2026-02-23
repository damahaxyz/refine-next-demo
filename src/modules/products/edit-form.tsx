"use client";

import { useForm } from "@refinedev/react-hook-form";
import { useTranslate, useGo, useList, useCustomMutation } from "@refinedev/core";
import { Product } from "./types";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { Page } from "@components/page/page";
import { BasicInfoSection } from "./components/edit-form-sections/BasicInfoSection";
import { CategoriesTagsSection } from "./components/edit-form-sections/CategoriesTagsSection";
import { TitleGenerationSection } from "./components/edit-form-sections/TitleGenerationSection";
import { AttributesSection } from "./components/edit-form-sections/AttributesSection";
import { VariantsSection } from "./components/edit-form-sections/VariantsSection";
import { ProductImagesSection } from "./components/edit-form-sections/ProductImagesSection";
import { DescriptionImagesSection } from "./components/edit-form-sections/DescriptionImagesSection";

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



    const product = queryResult?.data?.data;

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
        setTimeout(() => {
            form.handleSubmit(onFinish)();
        }, 0);
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
                                {/* Basic Info & Keywords */}
                                <BasicInfoSection control={control} shops={shops} />

                                {/* Categories & Tags */}
                                <CategoriesTagsSection
                                    control={control}
                                    shopCategories={shopCategories}
                                    shopTags={shopTags}
                                    selectedShopId={selectedShopId}
                                />
                            </CardContent>                        </Card>

                        {/* 2. Title Comparison */}
                        <TitleGenerationSection
                            control={control}
                            isGeneratingTitle={isGeneratingTitle}
                            handleGenerateTitle={handleGenerateTitle}
                        />

                        {/* 3. Attributes Comparison */}
                        <AttributesSection
                            form={form}
                            translateText={translateText}
                            handleGlobalImageChange={handleGlobalImageChange}
                            productId={product?.id}
                        />

                        {/* 4. Variants Comparison */}
                        <VariantsSection
                            form={form}
                            handleGlobalImageChange={handleGlobalImageChange}
                            productId={product?.id}
                        />

                        {/* 5. Images Comparison */}
                        <ProductImagesSection
                            control={control}
                            handleGlobalImageChange={handleGlobalImageChange}
                            productId={product?.id}
                        />

                        {/* 6. Description Images Comparison */}
                        <DescriptionImagesSection
                            control={control}
                            handleGlobalImageChange={handleGlobalImageChange}
                            productId={product?.id}
                        />


                    </form >
                </Form >
            </div >
        </Page>
    );
};
