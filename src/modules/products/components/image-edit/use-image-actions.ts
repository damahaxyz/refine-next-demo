import { useState } from "react";
import { useCustomMutation } from "@refinedev/core";
import { toast } from "sonner";
import { ImageObject } from "../../types";

export interface UseImageActionsProps {
    value?: ImageObject | null;
    onChange?: (value?: ImageObject | null) => void;
    productId?: string;
    effectiveImageUrl?: string;
}

export function useImageActions({ value, onChange, productId, effectiveImageUrl }: UseImageActionsProps) {
    const { mutateAsync } = useCustomMutation();
    const [isTranslating, setIsTranslating] = useState(false);
    const [isUpscaling, setIsUpscaling] = useState(false);
    const [isCroppingLoading, setIsCroppingLoading] = useState(false);

    const handleTranslate = async () => {
        if (!effectiveImageUrl || !onChange) return;

        setIsTranslating(true);
        try {
            const response = await mutateAsync({
                url: "/api/ai/images/translate",
                method: "post",
                values: {
                    imageUrl: effectiveImageUrl,
                    targetLanguage: "en",
                    productId: productId || "new",
                }
            });
            const result = response.data as any;
            if (result.success && result.data?.url) {
                toast.success("图片翻译成功", { description: "已应用带翻译的新图片" });
                const newImg = { ...value, processedUrl: result.data.url, editorSchema: result.data.editorSchema } as ImageObject;
                onChange(newImg);
            } else {
                toast.error("图片翻译失败", { description: result.error || "未知错误" });
            }
        } catch (e: any) {
            toast.error("请求错误", { description: e.message });
        } finally {
            setIsTranslating(false);
        }
    };

    const handleUpscale = async (cachedUpscaylWidth: string, model: string = "ultrasharp-4x") => {
        if (!effectiveImageUrl || !onChange) return;

        const targetWidth = cachedUpscaylWidth ? parseInt(cachedUpscaylWidth, 10) : undefined;

        setIsUpscaling(true);
        try {
            const response = await mutateAsync({
                url: "/api/ai/images/upscayl",
                method: "post",
                values: {
                    imageUrl: effectiveImageUrl,
                    productId: productId || "new",
                    model,
                    ...(targetWidth && !isNaN(targetWidth) ? { width: targetWidth } : {}),
                },
            });
            const result = response.data as any;
            if (result.success && result.data?.url) {
                toast.success("变高清成功", { description: "已应用新图片" });
                const newImg = { ...value, processedUrl: result.data.url } as ImageObject;
                onChange(newImg);
            } else {
                toast.error("变高清失败", { description: result.error || "未知错误" });
            }
        } catch (e: any) {
            toast.error("请求错误", { description: e.message });
        } finally {
            setIsUpscaling(false);
        }
    };

    const handleConfirmCrop = async (
        scale: number,
        position: { x: number, y: number },
        cropBox: { x: number, y: number, width: number, height: number },
        containerNode: HTMLDivElement | null,
        onSuccess: () => void
    ) => {
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
                    width: containerNode?.clientWidth || 0,
                    height: containerNode?.clientHeight || 0,
                }
            };

            const response = await mutateAsync({
                url: "/api/ai/images/crop",
                method: "post",
                values: payload
            });

            const result = response.data as any;
            if (result.success) {
                const newImg = { ...value, processedUrl: result.data.url } as ImageObject;
                onChange(newImg);
                onSuccess();
            } else {
                alert("裁剪失败: " + result.error);
            }
        } catch (e: any) {
            alert("请求错误: " + e.message);
        } finally {
            setIsCroppingLoading(false);
        }
    };

    return {
        isTranslating,
        isUpscaling,
        isCroppingLoading,
        handleTranslate,
        handleUpscale,
        handleConfirmCrop
    };
}
