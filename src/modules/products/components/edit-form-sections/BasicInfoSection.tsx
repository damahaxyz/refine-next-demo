import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export interface BasicInfoSectionProps {
    control: any;
    shops: any[];
}

export function BasicInfoSection({ control, shops }: BasicInfoSectionProps) {
    return (
        <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField
                    control={control}
                    name="shopId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>店铺 (Shop)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a shop" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {shops.map((shop: any) => (
                                        <SelectItem key={shop.id} value={shop.id}>
                                            {shop.name} ({shop.type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>商品状态 (Status)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "draft"}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="draft">Draft (草稿)</SelectItem>
                                    <SelectItem value="translated">Translated (已翻译)</SelectItem>
                                    <SelectItem value="ready">Ready (就绪)</SelectItem>
                                    <SelectItem value="published">Published (已发布)</SelectItem>
                                    <SelectItem value="archived">Archived (归档)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>原价 (RMB)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="sellingPrice"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>售价 (USD)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            {/* Keywords */}
            <FormField
                control={control}
                name="keywords"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>搜索关键词 (Keywords)</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                value={field.value || ""}
                                placeholder="使用逗号分隔关键词，如: 手机, 智能, 5G"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
