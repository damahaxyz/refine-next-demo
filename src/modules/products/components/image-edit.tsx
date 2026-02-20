import React, { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { X, Languages, ZoomIn, ZoomOut, Crop, Image as ImageIcon, Copy, ClipboardCopy, ClipboardPaste, Wand2, Settings2 } from "lucide-react";
import { ImageObject } from "../types";
import { useCustomMutation } from "@refinedev/core";
import { toast } from "sonner";

export interface ImageEditProps {
    value?: ImageObject | null;
    onChange?: (value?: ImageObject | null) => void;
    // For variants/attributes, it's nice to allow removing the image
    onRemove?: () => void;
    label?: string; // Optional label for UI
    productId?: string;
}

export function ImageEdit({ value, onChange, onRemove, label, productId }: ImageEditProps) {
    const [open, setOpen] = useState(false);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const [isCropping, setIsCropping] = useState(false);
    const [cropBox, setCropBox] = useState({ x: 50, y: 50, width: 200, height: 200 });
    const [isDraggingCrop, setIsDraggingCrop] = useState(false);
    const [isResizingCrop, setIsResizingCrop] = useState(false);
    const cropDragStart = useRef({ x: 0, y: 0 });
    const cropStartBox = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const [isCroppingLoading, setIsCroppingLoading] = useState(false);
    const [isUpscaling, setIsUpscaling] = useState(false);
    const [cachedUpscaylWidth, setCachedUpscaylWidth] = useState<string>("1200");
    const { mutateAsync: performCrop } = useCustomMutation();

    // Determines what image to show (processed preferably, then source)
    const effectiveImageUrl = value?.processedUrl || value?.sourceUrl;

    useEffect(() => {
        const savedWidth = localStorage.getItem("_refine_next_upscayl_width");
        if (savedWidth) {
            setCachedUpscaylWidth(savedWidth);
        }
    }, []);

    const handleZoomIn = () => setScale(s => Math.min(s + 0.05, 3));
    const handleZoomOut = () => setScale(s => Math.max(s - 0.05, 0.1));
    const handleResetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingCrop(true);
        cropDragStart.current = { x: e.clientX, y: e.clientY };
        cropStartBox.current = { ...cropBox };
    };

    const handleCropResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizingCrop(true);
        cropDragStart.current = { x: e.clientX, y: e.clientY };
        cropStartBox.current = { ...cropBox };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDraggingCrop) {
            setCropBox(prev => ({
                ...cropStartBox.current,
                x: cropStartBox.current.x + (e.clientX - cropDragStart.current.x),
                y: cropStartBox.current.y + (e.clientY - cropDragStart.current.y)
            }));
        } else if (isResizingCrop) {
            setCropBox(prev => ({
                ...cropStartBox.current,
                width: Math.max(50, cropStartBox.current.width + (e.clientX - cropDragStart.current.x)),
                height: Math.max(50, cropStartBox.current.height + (e.clientY - cropDragStart.current.y))
            }));
        } else if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsDraggingCrop(false);
        setIsResizingCrop(false);
    };

    const handleWheelNative = useCallback((e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.deltaY < 0) {
            setScale(s => Math.min(s + 0.05, 3));
        } else if (e.deltaY > 0) {
            setScale(s => Math.max(s - 0.05, 0.1));
        }
    }, []);

    const nodeRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useCallback((node: HTMLDivElement | null) => {
        if (nodeRef.current) {
            nodeRef.current.removeEventListener("wheel", handleWheelNative);
        }
        if (node) {
            node.addEventListener("wheel", handleWheelNative, { passive: false });
        }
        nodeRef.current = node;
    }, [handleWheelNative]);

    const handleTranslate = () => {
        if (!value?.sourceUrl || !onChange) return;
        // Mock translation process
        alert("翻译功能接入中...");
        // Mocking setting the processed URL
        // onChange({ ...value, processedUrl: value.sourceUrl + "?translated=true" });
    };

    const handleCrop = () => {
        setIsCropping(!isCropping);
    };

    const handleConfirmCrop = async () => {
        if (!effectiveImageUrl || !onChange) return;
        setIsCroppingLoading(true);
        try {
            const payload = {
                imageUrl: effectiveImageUrl,
                productId: productId || "new",
                scale,
                position,
                cropBox,
                container: {
                    width: nodeRef.current?.clientWidth || 0,
                    height: nodeRef.current?.clientHeight || 0,
                }
            };

            const response = await performCrop({
                url: "/api/ai/images/crop",
                method: "post",
                values: payload
            });

            const result = response.data as any;
            if (result.success) {
                onChange({ ...value, processedUrl: result.data.url } as ImageObject);
                setIsCropping(false);
            } else {
                alert("裁剪失败: " + result.error);
            }
        } catch (e: any) {
            alert("请求错误: " + e.message);
        } finally {
            setIsCroppingLoading(false);
        }
    };

    const handleUpscaylWidthConfig = () => {
        const targetWidthInput = prompt(`请输入期望的最终图片宽度(像素)，留空则默认按 4x 比例放大：\n当前预设：${cachedUpscaylWidth}`, cachedUpscaylWidth);
        if (targetWidthInput === null) return; // User cancelled
        const parsedWidth = targetWidthInput.trim() ? parseInt(targetWidthInput.trim(), 10) : undefined;

        if (parsedWidth && !isNaN(parsedWidth)) {
            localStorage.setItem("_refine_next_upscayl_width", parsedWidth.toString());
            setCachedUpscaylWidth(parsedWidth.toString());
        } else if (!targetWidthInput.trim()) {
            localStorage.removeItem("_refine_next_upscayl_width");
            setCachedUpscaylWidth("");
        }
    };

    const handleUpscale = async () => {
        if (!effectiveImageUrl || !onChange) return;

        const targetWidth = cachedUpscaylWidth ? parseInt(cachedUpscaylWidth, 10) : undefined;

        setIsUpscaling(true);
        try {
            const res = await fetch("/api/ai/images/upscayl", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imageUrl: effectiveImageUrl,
                    productId: productId || "new",
                    model: "ultrasharp-4x",
                    ...(targetWidth && !isNaN(targetWidth) ? { width: targetWidth } : {}),
                }),
            });
            const result = await res.json();
            if (result.success && result.data?.url) {
                toast.success("变高清成功", { description: "已应用新图片" });
                onChange({ ...value, processedUrl: result.data.url } as ImageObject);
            } else {
                toast.error("变高清失败", { description: result.error || "未知错误" });
            }
        } catch (e: any) {
            toast.error("请求错误", { description: e.message });
        } finally {
            setIsUpscaling(false);
        }
    };

    const handleCopy = (isStrong: boolean) => {
        if (!value) return;
        try {
            const clipboardData: ImageObject = { ...value };
            if (isStrong) {
                // Strong copy: regenerate a new unique ID, so crops won't synchronize with the source
                clipboardData.id = crypto.randomUUID();
            } else {
                // Weak (soft) copy: preserve the ID, so crops will sync across all weak copies
            }
            localStorage.setItem("_refine_next_img_clipboard", JSON.stringify(clipboardData));
            toast.success(isStrong ? "强复制成功" : "软复制成功", {
                description: "图片已保存至剪贴板",
            });
        } catch (e) {
            console.error("Copy failed", e);
            toast.error("复制失败", {
                description: "保存图片数据到剪贴板时出错",
            });
        }
    };

    const handlePaste = () => {
        try {
            const dataStr = localStorage.getItem("_refine_next_img_clipboard");
            if (dataStr && onChange) {
                const imgData = JSON.parse(dataStr) as ImageObject;
                onChange(imgData);
                toast.success("粘贴成功");
            } else {
                toast.error("粘贴失败", {
                    description: "剪贴板中没有可用的图片数据",
                });
            }
        } catch (e) {
            console.error("Paste failed", e);
            toast.error("粘贴失败", {
                description: "读取剪贴板数据时发生错误",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => {
            setOpen(v);
            if (!v) handleResetZoom(); // Reset zoom on close
        }}>
            {effectiveImageUrl ? (
                <HoverCard openDelay={200} closeDelay={100}>
                    <HoverCardTrigger asChild>
                        <DialogTrigger asChild>
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
                        </DialogTrigger>
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
                            <div className="w-px h-6 bg-border mx-1" />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCopy(true);
                                }}
                                title="强复制 (独立副本)"
                            >
                                <Copy className="w-4 h-4" />
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
                                <Copy className="w-4 h-4" />
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
                                <ClipboardPaste className="w-4 h-4" />
                            </Button>
                        </div>
                    </HoverCardContent>
                </HoverCard>
            ) : (
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
            )}

            {/* Modal Content */}
            <DialogContent className="max-w-[65vw] sm:max-w-[65vw] w-[95vw] h-[95vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 border-b bg-muted/10 shrink-0">
                    <DialogTitle className="flex items-center justify-between">
                        <span>图片编辑预览</span>
                        <div className="flex items-center gap-2 pr-6"> {/* pr-6 to avoid overlap with DialogClose Dialog primitive */}
                            <Button variant="outline" size="sm" onClick={handleTranslate}>
                                <Languages className="w-4 h-4 mr-2" />
                                翻译
                            </Button>
                            <div className="flex bg-background border rounded-md overflow-hidden">
                                <Button variant="ghost" size="sm" onClick={handleUpscale} disabled={isUpscaling} className="border-none rounded-none rounded-l-md pr-2">
                                    {isUpscaling ? (
                                        <span className="w-4 h-4 mr-2 block rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                                    ) : (
                                        <Wand2 className="w-4 h-4 mr-2" />
                                    )}
                                    变高清 {cachedUpscaylWidth ? `(${cachedUpscaylWidth}px)` : "(默认 4x)"}
                                </Button>
                                <div className="w-px bg-border my-1" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-8 border-none rounded-none rounded-r-md"
                                    onClick={handleUpscaylWidthConfig}
                                    title="设置放大目标宽度"
                                    disabled={isUpscaling}
                                >
                                    <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
                                </Button>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleCrop} className={isCropping ? "bg-muted" : ""}>
                                <Crop className="w-4 h-4 mr-2" />
                                {isCropping ? "取消裁剪" : "裁剪"}
                            </Button>
                            {isCropping && (
                                <Button variant="default" size="sm" onClick={handleConfirmCrop} disabled={isCroppingLoading} className="bg-blue-600 hover:bg-blue-700 text-white border-transparent">
                                    确定裁剪
                                </Button>
                            )}
                            <div className="h-4 w-px bg-border mx-2" />
                            <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                                <ZoomOut className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="w-12" onClick={handleResetZoom}>
                                {Math.round(scale * 100)}%
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                                <ZoomIn className="w-4 h-4" />
                            </Button>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div
                    ref={containerRef}
                    className={`flex-1 overflow-hidden bg-black/5 flex items-center justify-center p-4 relative ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {isCropping && (
                        <div
                            style={{
                                position: 'absolute',
                                left: cropBox.x,
                                top: cropBox.y,
                                width: cropBox.width,
                                height: cropBox.height,
                                border: '2px dashed #3b82f6',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                cursor: 'move',
                                zIndex: 10,
                            }}
                            onMouseDown={handleCropMouseDown}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: -5,
                                    right: -5,
                                    width: 15,
                                    height: 15,
                                    backgroundColor: '#3b82f6',
                                    borderRadius: '50%',
                                    cursor: 'se-resize'
                                }}
                                onMouseDown={handleCropResizeMouseDown}
                            />
                        </div>
                    )}
                    {effectiveImageUrl ? (
                        <div
                            className="origin-center select-none"
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                transition: isDragging ? "none" : "transform 0.2s ease-out"
                            }}
                        >
                            <img
                                src={effectiveImageUrl}
                                alt="Full Preview"
                                className="max-w-none shadow-lg border bg-white pointer-events-none"
                                draggable={false}
                                style={{
                                    // Optional realistic constraints if max size is known
                                    // maxWidth: '2000px'
                                }}
                            />
                        </div>
                    ) : (
                        <div className="text-muted-foreground">暂无图片</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

