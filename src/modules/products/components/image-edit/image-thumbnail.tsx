import React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { X, Languages, Image as ImageIcon, ClipboardPaste, Wand2, Undo2, ClipboardCheck, ClipboardPlus, ClipboardList, Loader2 } from "lucide-react";
import { ImageObject } from "../../types";

export interface ImageThumbnailProps {
    value?: ImageObject | null;
    effectiveImageUrl?: string;
    label?: string;
    onRemove?: () => void;
    onChange?: (value?: ImageObject | null) => void;
    isTranslating: boolean;
    handleTranslate: () => void;
    handleCopy: (isStrong: boolean) => void;
    handlePaste: () => void;
    openImageEditor: () => void;
}

export function ImageThumbnail({
    value,
    effectiveImageUrl,
    label,
    onRemove,
    onChange,
    isTranslating,
    handleTranslate,
    handleCopy,
    handlePaste,
    openImageEditor
}: ImageThumbnailProps) {
    if (!effectiveImageUrl) {
        return (
            <HoverCard openDelay={200} closeDelay={100}>
                <HoverCardTrigger asChild>
                    <div
                        className="relative group cursor-pointer border overflow-hidden bg-muted/20 flex flex-col items-center justify-center hover:bg-muted/50 transition-colors h-full w-full"
                        onClick={(e) => {
                            e.preventDefault();
                            const url = prompt("Enter Image URL");
                            if (url && onChange) {
                                onChange({ sourceUrl: url } as ImageObject);
                            }
                        }}
                    >
                        <div className="flex items-center justify-center text-muted-foreground hover:text-foreground">
                            <ImageIcon className="w-6 h-6 opacity-50" />
                        </div>
                    </div>
                </HoverCardTrigger>
                <HoverCardContent side="top" align="center" className="w-auto p-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePaste();
                        }}
                        title="粘贴图片"
                    >
                        <ClipboardPaste className="w-4 h-4" />
                    </Button>
                </HoverCardContent>
            </HoverCard>
        );
    }

    return (
        <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
                <div className="relative group cursor-pointer border bg-muted/20 flex flex-col items-center justify-center hover:bg-muted/50 transition-colors h-full w-full">
                    <div className="w-full h-full flex items-center justify-center bg-black/5 overflow-hidden">
                        <img
                            src={effectiveImageUrl}
                            alt="Product Preview"
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                    {label && (
                        <div className="text-[10px] mt-2 font-medium text-muted-foreground truncate w-full text-center">
                            {label}
                        </div>
                    )}
                </div>
            </HoverCardTrigger>
            <HoverCardContent side="top" align="center" className="w-auto p-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                    {onRemove && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRemove();
                            }}
                            title="移除图片"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                    {value?.processedUrl && onChange && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const { processedUrl, ...rest } = value;
                                onChange(rest as ImageObject);
                            }}
                            title="还原原图"
                        >
                            <Undo2 className="w-4 h-4" />
                        </Button>
                    )}
                    <div className="w-px h-6 bg-border mx-1" />
                    {onChange && (
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="h-6 w-6"
                            disabled={isTranslating}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleTranslate();
                            }}
                            title="一键翻译"
                        >
                            {isTranslating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Languages className="w-4 h-4" />
                            )}
                        </Button>
                    )}
                    {onChange && value?.processedUrl && (
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openImageEditor();
                            }}
                            title="二次编辑"
                        >
                            <Wand2 className="w-4 h-4" />
                        </Button>
                    )}
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCopy(true);
                        }}
                        title="强复制 (独立副本)"
                    >
                        <ClipboardList className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCopy(false);
                        }}
                        title="软复制 (同步更新关联)"
                    >
                        <ClipboardPlus className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePaste();
                        }}
                        title="粘贴"
                    >
                        <ClipboardCheck className="w-4 h-4" />
                    </Button>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
