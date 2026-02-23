import React from "react";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageEdit } from "../image-edit";
import { Plus } from "lucide-react";

export interface DescriptionImagesSectionProps {
    control: any;
    handleGlobalImageChange: (newImage: any) => void;
    productId?: string;
}

const ensureArray = (val: any): any[] => {
    if (Array.isArray(val)) return val;
    if (val === undefined || val === null) return [];
    return [val];
};

export function DescriptionImagesSection({ control, handleGlobalImageChange, productId }: DescriptionImagesSectionProps) {
    return (
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
                                        onChange={(newVal: any) => {
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
                                        productId={productId}
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
    );
}
