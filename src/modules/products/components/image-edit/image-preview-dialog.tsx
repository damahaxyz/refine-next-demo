import React, { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Languages, ZoomIn, ZoomOut, Crop, Wand2, Settings2, Loader2, Edit, Edit2 } from "lucide-react";
import { ImageObject } from "../../types";

export interface ImagePreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    effectiveImageUrl: string;
    isTranslating: boolean;
    isUpscaling: boolean;
    isCroppingLoading: boolean;
    handleTranslate: () => void;
    handleUpscale: (cachedUpscaylWidth: string, model: string) => void;
    handleConfirmCrop: (
        scale: number,
        position: { x: number, y: number },
        cropBox: { x: number, y: number, width: number, height: number },
        containerNode: HTMLDivElement | null,
        onSuccess: () => void
    ) => void;
    openImageEditor: () => void;
    hasProcessedUrl: boolean;
}

export function ImagePreviewDialog({
    open,
    onOpenChange,
    effectiveImageUrl,
    isTranslating,
    isUpscaling,
    isCroppingLoading,
    handleTranslate,
    handleUpscale,
    handleConfirmCrop,
    openImageEditor,
    hasProcessedUrl
}: ImagePreviewDialogProps) {
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

    const [cachedUpscaylWidth, setCachedUpscaylWidth] = useState<string>("1200");
    const [cachedUpscaylModel, setCachedUpscaylModel] = useState<string>("ultrasharp-4x");

    useEffect(() => {
        const savedWidth = localStorage.getItem("_refine_next_upscayl_width");
        if (savedWidth) {
            setCachedUpscaylWidth(savedWidth);
        }
        const savedModel = localStorage.getItem("_refine_next_upscayl_model");
        if (savedModel) {
            setCachedUpscaylModel(savedModel);
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

    const handleCrop = () => {
        setIsCropping(!isCropping);
    };

    const onConfirmCrop = () => {
        handleConfirmCrop(scale, position, cropBox, nodeRef.current, () => setIsCropping(false));
    }

    const handleWidthChange = (val: string) => {
        setCachedUpscaylWidth(val);
        if (val) {
            localStorage.setItem("_refine_next_upscayl_width", val);
        } else {
            localStorage.removeItem("_refine_next_upscayl_width");
        }
    };

    const handleModelChange = (val: string) => {
        setCachedUpscaylModel(val);
        localStorage.setItem("_refine_next_upscayl_model", val);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => {
            onOpenChange(v);
            if (!v) handleResetZoom(); // Reset zoom on close
        }}>
            <DialogContent className="max-w-[65vw] sm:max-w-[65vw] w-[95vw] h-[95vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 border-b bg-muted/10 shrink-0">
                    <DialogTitle className="flex items-center justify-between">
                        <span>图片编辑预览</span>
                        <div className="flex items-center gap-2 pr-6">
                            {!isCropping && (
                                <>
                                    <div className="flex bg-background border rounded-md overflow-hidden">
                                        <Button variant="outline" size="sm" onClick={handleTranslate} disabled={isTranslating} className="border-none rounded-none rounded-l-md pr-2">
                                            {isTranslating ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Languages className="w-4 h-4 mr-2" />
                                            )}
                                            翻译
                                        </Button>
                                        {hasProcessedUrl && (<div className="w-px bg-border my-1" />)}
                                        {hasProcessedUrl && (
                                            <Button variant="outline" size="sm" onClick={openImageEditor} className="border-none rounded-none rounded-r-md pr-2">
                                                <Edit2 className="w-4 h-4 mr-2" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex bg-background border rounded-md overflow-hidden">
                                        <Button variant="ghost" size="sm" onClick={() => handleUpscale(cachedUpscaylWidth, cachedUpscaylModel)} disabled={isUpscaling} className="border-none rounded-none rounded-l-md pr-2">
                                            {isUpscaling ? (
                                                <span className="w-4 h-4 mr-2 block rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                                            ) : (
                                                <Wand2 className="w-4 h-4 mr-2" />
                                            )}
                                            变高清 {cachedUpscaylWidth ? `(${cachedUpscaylWidth}px)` : "(默认 4x)"}
                                        </Button>
                                        <div className="w-px bg-border my-1" />
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 border-none rounded-none rounded-r-md"
                                                    title="变高清设置"
                                                    disabled={isUpscaling}
                                                >
                                                    <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64" align="end" onClick={(e) => e.stopPropagation()}>
                                                <div className="grid gap-4">
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium leading-none">变高清设置</h4>
                                                        <p className="text-sm text-muted-foreground">配置 Upscayl 算法模型和宽度</p>
                                                    </div>
                                                    <div className="grid gap-3">
                                                        <div className="grid grid-cols-3 items-center gap-4">
                                                            <Label htmlFor="width">目标宽度</Label>
                                                            <Input
                                                                id="width"
                                                                value={cachedUpscaylWidth}
                                                                onChange={(e) => handleWidthChange(e.target.value)}
                                                                className="col-span-2 h-8"
                                                                placeholder="如: 1200 (默认4x)"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-3 items-center gap-4">
                                                            <Label htmlFor="model">算法模型</Label>
                                                            <Select value={cachedUpscaylModel} onValueChange={handleModelChange}>
                                                                <SelectTrigger className="col-span-2 h-8">
                                                                    <SelectValue placeholder="选择模型" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="ultrasharp-4x">UltraSharp 4x</SelectItem>
                                                                    <SelectItem value="remacri-4x">Remacri 4x</SelectItem>
                                                                    <SelectItem value="high-fidelity-4x">High Fidelity 4x</SelectItem>
                                                                    <SelectItem value="digital-art-4x">Digital Art 4x</SelectItem>
                                                                    <SelectItem value="upscayl-standard-4x">Standard 4x</SelectItem>
                                                                    <SelectItem value="upscayl-lite-4x">Lite 4x</SelectItem>
                                                                    <SelectItem value="ultramix-balanced-4x">Ultramix Balanced 4x</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </>)}
                            <Button variant="outline" size="sm" onClick={handleCrop} className={isCropping ? "bg-muted" : ""}>
                                <Crop className="w-4 h-4 mr-2" />
                                {isCropping ? "取消裁剪" : "裁剪"}
                            </Button>
                            {isCropping && (
                                <Button variant="default" size="sm" onClick={onConfirmCrop} disabled={isCroppingLoading} className="bg-blue-600 hover:bg-blue-700 text-white border-transparent">
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
