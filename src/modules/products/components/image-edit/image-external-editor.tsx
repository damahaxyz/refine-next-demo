import React, { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCustomMutation } from "@refinedev/core";
import { toast } from "sonner";
import { ImageObject } from "../../types";

export interface ImageExternalEditorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    value?: ImageObject | null;
    onChange?: (value?: ImageObject | null) => void;
    productId?: string;
}

export function ImageExternalEditor({ open, onOpenChange, value, onChange, productId }: ImageExternalEditorProps) {
    const { mutateAsync } = useCustomMutation();
    const onChangeRef = useRef(onChange);
    const valueRef = useRef(value);
    const productIdRef = useRef(productId);

    useEffect(() => {
        onChangeRef.current = onChange;
        valueRef.current = value;
        productIdRef.current = productId;
    });

    useEffect(() => {
        if (!open) return;

        const handleMessage = async function (event: MessageEvent) {
            if (!event.data) return;

            let postData: any;
            try {
                if (typeof event.data === 'string') {
                    postData = JSON.parse(event.data);
                } else {
                    postData = event.data;
                }
            } catch (e) {
                return; // Ignore invalid JSON messages
            }

            const { type, data } = postData || {};

            if (type === 'submit') {
                if (data && data.length) {
                    try {
                        const response = await mutateAsync({
                            url: "/api/images/save-external",
                            method: "post",
                            values: { base64: data[0].base64, productId: productIdRef.current || "new" }
                        });
                        const resData = response.data as any;
                        if (resData.url && onChangeRef.current) {
                            const newImg = {
                                ...valueRef.current,
                                processedUrl: resData.url,
                                editorSchema: JSON.stringify(data[0].psd),
                            } as ImageObject;
                            onChangeRef.current(newImg);
                            toast.success("二次编辑保存成功");
                        } else {
                            throw new Error(resData.error || "Save failed");
                        }
                    } catch (e: any) {
                        toast.error("保存编辑结果失败", { description: e.message });
                    } finally {
                        onOpenChange(false);
                    }
                }
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [open, mutateAsync, onOpenChange]);

    if (!open || !value?.sourceUrl) return null;

    const editorUrl = "https://www.alifanyi.com/erp/imageTrans.html";

    return (
        <Dialog open={true} onOpenChange={(v) => !v && onOpenChange(false)}>
            <DialogContent className="max-w-[90vw] sm:max-w-[90vw] w-[90vw] h-[90vh] max-h-[90vh] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>AI 图片编辑</DialogTitle>
                </DialogHeader>
                <div className="flex-1 w-full bg-muted">
                    <iframe
                        id="editor-Iframe"
                        src={editorUrl}
                        className="w-full h-full border-0"
                        allow="clipboard-read; clipboard-write; display-capture"
                        onLoad={() => {
                            const iframe = document.getElementById('editor-Iframe') as HTMLIFrameElement;
                            if (iframe && iframe.contentWindow) {
                                let schemaParsed = undefined;
                                if (value?.editorSchema) {
                                    try {
                                        schemaParsed = typeof value.editorSchema === "string" ? JSON.parse(value.editorSchema) : value.editorSchema;
                                    } catch (e) {
                                        console.error("Failed to parse templateJson schema", e);
                                    }
                                }

                                const postData = {
                                    sourceLang: 'zh',
                                    targetLang: 'en',
                                    templateJson: [schemaParsed],
                                    locale: 'zh-cn'
                                };
                                iframe.contentWindow.postMessage(JSON.stringify(postData), '*');
                            }
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
