import React from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Helper to safely get array
const ensureArray = (val: any): any[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    // Attempt parser if stringified
    try {
        if (typeof val === 'string') {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch { }
    // fallback
    return [val];
};

export interface CategoriesTagsSectionProps {
    control: any;
    shopCategories: any[];
    shopTags: any[];
    selectedShopId?: string;
}

export function CategoriesTagsSection({ control, shopCategories, shopTags, selectedShopId }: CategoriesTagsSectionProps) {
    return (
        <div className="grid grid-cols-1 gap-6">
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
        </div>
    );
}
