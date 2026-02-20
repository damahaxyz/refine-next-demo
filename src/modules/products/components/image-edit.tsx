import React, { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Languages, ZoomIn, ZoomOut, Crop, Image as ImageIcon } from "lucide-react";
import { ImageObject } from "../types";

export interface ImageEditProps {
    value?: ImageObject | null;
    onChange?: (value?: ImageObject | null) => void;
    // For variants/attributes, it's nice to allow removing the image
    onRemove?: () => void;
    label?: string; // Optional label for UI
}

export function ImageEdit({ value, onChange, onRemove, label }: ImageEditProps) {
    const [open, setOpen] = useState(false);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    // Determines what image to show (processed preferably, then source)
    const effectiveImageUrl = value?.processedUrl || value?.sourceUrl;

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

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
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
        alert("截图/裁剪功能接入中...");
    };

    return (
        <Dialog open={open} onOpenChange={(v) => {
            setOpen(v);
            if (!v) handleResetZoom(); // Reset zoom on close
        }}>
            {effectiveImageUrl ? (
                <DialogTrigger asChild>
                    <div className="relative group cursor-pointer border bg-muted/20 flex flex-col items-center justify-center hover:bg-muted/50 transition-colors">
                        <div className="w-full flex items-center justify-center bg-black/5 overflow-hidden">
                            <img
                                src={effectiveImageUrl}
                                alt="Product Preview"
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                        <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onRemove && (
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-4 w-4"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove();
                                    }}
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            )}
                        </div>
                        {label && (
                            <div className="text-[10px] mt-2 font-medium text-muted-foreground truncate w-full text-center">
                                {label}
                            </div>
                        )}
                    </div>
                </DialogTrigger>
            ) : (
                <div
                    className="relative group cursor-pointer border overflow-hidden bg-muted/20 flex flex-col items-center justify-center hover:bg-muted/50 transition-colors h-full w-full"
                    onClick={(e) => {
                        e.preventDefault();
                        const url = prompt("Enter Image URL");
                        if (url && onChange) {
                            onChange({ ...value, sourceUrl: url } as ImageObject);
                        }
                    }}
                >
                    <div className=" flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <ImageIcon className="w-6 h-6 opacity-50" />
                    </div>
                </div>
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
                            <Button variant="outline" size="sm" onClick={handleCrop}>
                                <Crop className="w-4 h-4 mr-2" />
                                截图/裁剪
                            </Button>
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

