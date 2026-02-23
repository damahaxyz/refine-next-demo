import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

export interface TitleGenerationSectionProps {
    control: any;
    isGeneratingTitle: boolean;
    handleGenerateTitle: () => void;
}

export function TitleGenerationSection({ control, isGeneratingTitle, handleGenerateTitle }: TitleGenerationSectionProps) {
    return (
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
    );
}
