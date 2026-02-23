import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ImageEdit } from "../image-edit";
import { Plus, X } from "lucide-react";
import { useFieldArray } from "react-hook-form";

export interface VariantsSectionProps {
    form: any;
    handleGlobalImageChange: (newImage: any) => void;
    productId?: string;
}

export function VariantsSection({ form, handleGlobalImageChange, productId }: VariantsSectionProps) {
    const { control } = form;

    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
        control,
        name: "variants",
    });

    return (
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
                    // Resolve Attributes for Display (Legacy / Current compatibility)
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
                                                    productId={productId}
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
    );
}
