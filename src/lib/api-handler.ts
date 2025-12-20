
import { NextRequest, NextResponse } from "next/server";
import { Model } from "mongoose";
import dbConnect from "./db";


interface PermissionConfig {
    module: string;
    actions?: {
        GET?: string;
        POST?: string;
        PATCH?: string;
        DELETE?: string;
    };
}

interface CrudOptions<T> {
    model: Model<T>;
    auth?: PermissionConfig; // 目前可选，如果需要支持公共 API
    onBeforeCreate?: (data: any) => Promise<any>;
    onBeforeUpdate?: (id: string, data: any) => Promise<any>;
}

export function createCrudHandlers<T>(options: CrudOptions<T>) {


    const getCollection = async () => {
        await dbConnect();
        return options.model;
    };

    return {
        GET: async (req: NextRequest, { params }: { params: Promise<{ id?: string }> }) => {
            try {

                const resolvedParams = await params;
                const Model = await getCollection();

                // 获取单个详情
                if (resolvedParams?.id) {
                    const item = await Model.findById(resolvedParams.id);
                    if (!item) return NextResponse.json({ error: "Not Found" }, { status: 404 });
                    return NextResponse.json(item);
                }

                // 列表 / 搜索
                const searchParams = req.nextUrl.searchParams;
                const page = parseInt(searchParams.get("_page") || "1");
                const limit = parseInt(searchParams.get("_limit") || "10");
                const skip = (page - 1) * limit;

                // 基本过滤支持
                const query: any = {};
                // TODO: 遍历 searchParams 构建查询

                const [data, total] = await Promise.all([
                    Model.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
                    Model.countDocuments(query),
                ]);

                // Refine 需要 `x-total-count` 头来进行分页
                return NextResponse.json(data, {
                    headers: {
                        "X-Total-Count": total.toString()
                    }
                });

            } catch (e: any) {
                return NextResponse.json({ error: e.message }, { status: 500 });
            }
        },

        POST: async (req: NextRequest) => {
            try {

                const body = await req.json();
                const Model = await getCollection();

                let data = body;
                if (options.onBeforeCreate) {
                    data = await options.onBeforeCreate(data);
                }

                const newItem = await Model.create(data);
                return NextResponse.json(newItem, { status: 201 });
            } catch (e: any) {
                return NextResponse.json({ error: e.message }, { status: 500 });
            }
        },

        PATCH: async (req: NextRequest, { params }: { params?: Promise<{ id?: string }> } = {}) => {
            try {

                const resolvedParams = await params;
                const id = resolvedParams?.id;
                const body = await req.json();
                const Model = await getCollection();

                if (id) {
                    // 单个更新
                    let data = body;
                    if (options.onBeforeUpdate) {
                        data = await options.onBeforeUpdate(id, data);
                    }
                    const updated = await Model.findByIdAndUpdate(id, data, { new: true });
                    return NextResponse.json(updated);
                } else {
                    // 批量更新
                    // 期望 body: { ids: string[], data: any }
                    const { ids, data: updateData } = body;

                    if (!ids || !Array.isArray(ids) || ids.length === 0) {
                        return NextResponse.json({ error: "Missing ids for batch update" }, { status: 400 });
                    }

                    // 我们必须按顺序或并行处理更新以遵守 onBeforeUpdate
                    // 如果存在 onBeforeUpdate，我们不能简单地高效使用 Model.updateMany 而跳过钩子
                    // 但通常需要钩子（例如哈希密码）。
                    // 所以我们进行迭代。

                    const results = [];
                    for (const itemId of ids) {
                        let itemData = { ...updateData };
                        if (options.onBeforeUpdate) {
                            itemData = await options.onBeforeUpdate(itemId, itemData);
                        }
                        const updated = await Model.findByIdAndUpdate(itemId, itemData, { new: true });
                        results.push(updated);
                    }

                    return NextResponse.json(results);
                }
            } catch (e: any) {
                return NextResponse.json({ error: e.message }, { status: 500 });
            }
        },

        DELETE: async (req: NextRequest, { params }: { params?: Promise<{ id?: string }> } = {}) => {
            try {

                const resolvedParams = await params;
                const id = resolvedParams?.id;
                const Model = await getCollection();

                if (id) {
                    // 单个删除
                    await Model.findByIdAndDelete(id);
                    return NextResponse.json({ success: true });
                } else {
                    // 批量删除
                    // 尝试从 body（如果支持）或查询字符串获取 ids
                    // 如果使用自定义提供程序，标准 Refine 通常发送 body 进行 deleteMany
                    // 或者查询字符串 ?ids=1,2

                    let ids: string[] = [];
                    try {
                        const body = await req.json();
                        if (body.ids && Array.isArray(body.ids)) {
                            ids = body.ids;
                        }
                    } catch (e) {
                        // Body might be empty or invalid json, check query param
                        const searchParams = req.nextUrl.searchParams;
                        const idsParam = searchParams.get("ids");
                        if (idsParam) {
                            ids = idsParam.split(",");
                        }
                    }

                    if (ids.length === 0) {
                        // 如果 json 解析失败/跳过了上述逻辑复杂度，再次检查查询参数
                        const searchParams = req.nextUrl.searchParams;
                        const idsParam = searchParams.get("ids");
                        if (idsParam) {
                            ids = idsParam.split(",");
                        }
                    }

                    if (ids.length === 0) {
                        return NextResponse.json({ error: "Missing ids for batch delete" }, { status: 400 });
                    }

                    await Model.deleteMany({ _id: { $in: ids } });
                    return NextResponse.json({ success: true });
                }
            } catch (e: any) {
                return NextResponse.json({ error: e.message }, { status: 500 });
            }
        }
    };
}
