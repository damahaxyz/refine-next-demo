import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageEdit } from "../image-edit"; // Relative path is one folder up
import { Plus, X, Languages, Trash2, Loader2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { useState } from "react";

export interface AttributesSectionProps {
    form: any;
    translateText: (text: string) => Promise<string | null>;
    handleGlobalImageChange: (newImage: any) => void;
    productId?: string;
}

export function AttributesSection({ form, translateText, handleGlobalImageChange, productId }: AttributesSectionProps) {
    const { control, register } = form;

    const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } = useFieldArray({
        control,
        name: "attributes",
    });

    const [translatingNames, setTranslatingNames] = useState<Record<number, boolean>>({});
    const [translatingValues, setTranslatingValues] = useState<Record<string, boolean>>({});

    const handleTranslateAttributeValue = async (attrIndex: number, valIndex: number) => {
        const key = `${attrIndex}-${valIndex}`;
        if (translatingValues[key]) return;

        setTranslatingValues(prev => ({ ...prev, [key]: true }));
        try {
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
        } finally {
            setTranslatingValues(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleTranslateAttributeName = async (attrIndex: number) => {
        if (translatingNames[attrIndex]) return;

        setTranslatingNames(prev => ({ ...prev, [attrIndex]: true }));
        try {
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
        } finally {
            setTranslatingNames(prev => ({ ...prev, [attrIndex]: false }));
        }
    };

    return (
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
                                    disabled={translatingNames[index]}
                                >
                                    {translatingNames[index] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
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
                                                    onChange={(newVal: any) => {
                                                        form.setValue(`attributes.${index}.values.${vIndex}.image`, newVal);
                                                        handleGlobalImageChange(newVal);
                                                    }}
                                                    onRemove={() => form.setValue(`attributes.${index}.values.${vIndex}.image`, undefined)}
                                                    productId={productId}
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
                                                    disabled={translatingValues[`${index}-${vIndex}`]}
                                                >
                                                    {translatingValues[`${index}-${vIndex}`] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
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
    );
}
