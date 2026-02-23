import React, { useState } from "react";
import { ImageObject } from "../../types";
import { useImageActions } from "./use-image-actions";
import { useImageClipboard } from "./use-image-clipboard";
import { ImageThumbnail } from "./image-thumbnail";
import { ImagePreviewDialog } from "./image-preview-dialog";
import { ImageExternalEditor } from "./image-external-editor";

export interface ImageEditProps {
    value?: ImageObject | null;
    onChange?: (value?: ImageObject | null) => void;
    onRemove?: () => void;
    label?: string; // Optional label for UI
    productId?: string;
}

export function ImageEdit({ value, onChange, onRemove, label, productId }: ImageEditProps) {
    const [open, setOpen] = useState(false);
    const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);

    const effectiveImageUrl = value?.processedUrl || value?.sourceUrl || "";

    const {
        isTranslating,
        isUpscaling,
        isCroppingLoading,
        handleTranslate,
        handleUpscale,
        handleConfirmCrop
    } = useImageActions({ value, onChange, productId, effectiveImageUrl });

    const { handleCopy, handlePaste } = useImageClipboard();

    return (
        <>
            <div onClick={() => { if (effectiveImageUrl) setOpen(true) }} className="h-full w-full">
                <ImageThumbnail
                    value={value}
                    effectiveImageUrl={effectiveImageUrl}
                    label={label}
                    onRemove={onRemove}
                    onChange={onChange}
                    isTranslating={isTranslating}
                    handleTranslate={handleTranslate}
                    handleCopy={(isStrong) => handleCopy(value, isStrong)}
                    handlePaste={() => handlePaste(onChange)}
                    openImageEditor={() => setIsImageEditorOpen(true)}
                />
            </div>

            <ImagePreviewDialog
                open={open}
                onOpenChange={setOpen}
                effectiveImageUrl={effectiveImageUrl}
                isTranslating={isTranslating}
                isUpscaling={isUpscaling}
                isCroppingLoading={isCroppingLoading}
                handleTranslate={handleTranslate}
                handleUpscale={handleUpscale}
                handleConfirmCrop={handleConfirmCrop}
                openImageEditor={() => {
                    setOpen(false); // Close preview dialog first
                    setIsImageEditorOpen(true);
                }}
                hasProcessedUrl={!!value?.processedUrl}
            />

            <ImageExternalEditor
                open={isImageEditorOpen}
                onOpenChange={setIsImageEditorOpen}
                value={value}
                onChange={onChange}
                productId={productId}
            />
        </>
    );
}
