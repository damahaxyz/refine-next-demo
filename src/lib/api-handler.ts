
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
                    if (!item) return NextResponse.json({ code: 404, message: "Not Found" }, { status: 404 });
                    return NextResponse.json({ code: 0, message: "success", data: item });
                }

                // 列表 / 搜索
                const searchParams = req.nextUrl.searchParams;
                const page = parseInt(searchParams.get("_page") || "1");
                const limit = parseInt(searchParams.get("_limit") || "10");
                const skip = (page - 1) * limit;

                // 排序处理
                const sortField = searchParams.get("_sort") || "createdAt";
                const sortOrder = searchParams.get("_order") === "asc" ? 1 : -1;
                const sortOption: any = { [sortField]: sortOrder };

                // 统一过滤支持 (Refine Operator Mapping)
                const query: any = {};
                searchParams.forEach((value, key) => {
                    if (["_page", "_limit", "_sort", "_order"].includes(key)) return;

                    if (key.endsWith("_like")) {
                        const field = key.replace("_like", "");
                        query[field] = { $regex: value, $options: "i" };
                    } else if (key.endsWith("_gte")) {
                        const field = key.replace("_gte", "");
                        query[field] = { ...query[field], $gte: value };
                    } else if (key.endsWith("_lte")) {
                        const field = key.replace("_lte", "");
                        query[field] = { ...query[field], $lte: value };
                    } else if (key.endsWith("_ne")) {
                        const field = key.replace("_ne", "");
                        query[field] = { $ne: value };
                    } else if (key.endsWith("_in")) {
                        const field = key.replace("_in", "");
                        query[field] = { $in: value.split(",") };
                    } else {
                        // 精确匹配
                        query[key] = value;
                    }
                });

                const [data, total] = await Promise.all([
                    Model.find(query).skip(skip).limit(limit).sort(sortOption),
                    Model.countDocuments(query),
                ]);

                // 统一返回格式
                return NextResponse.json({
                    code: 0,
                    message: "success",
                    data: data,
                    total: total
                });

            } catch (e: any) {
                return NextResponse.json({ code: 500, message: e.message }, { status: 500 });
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
                return NextResponse.json({ code: 0, message: "success", data: newItem }, { status: 201 });
            } catch (e: any) {
                return NextResponse.json({ code: 500, message: e.message }, { status: 500 });
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
                    return NextResponse.json({ code: 0, message: "success", data: updated });
                } else {
                    // 批量更新
                    const { ids, data: updateData } = body;

                    if (!ids || !Array.isArray(ids) || ids.length === 0) {
                        return NextResponse.json({ code: 400, message: "Missing ids for batch update" }, { status: 400 });
                    }

                    const results = [];
                    for (const itemId of ids) {
                        let itemData = { ...updateData };
                        if (options.onBeforeUpdate) {
                            itemData = await options.onBeforeUpdate(itemId, itemData);
                        }
                        const updated = await Model.findByIdAndUpdate(itemId, itemData, { new: true });
                        results.push(updated);
                    }

                    return NextResponse.json({ code: 0, message: "success", data: results });
                }
            } catch (e: any) {
                return NextResponse.json({ code: 500, message: e.message }, { status: 500 });
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
                    return NextResponse.json({ code: 0, message: "success", success: true });
                } else {
                    // 批量删除
                    let ids: string[] = [];
                    try {
                        const body = await req.json();
                        if (body.ids && Array.isArray(body.ids)) {
                            ids = body.ids;
                        }
                    } catch (e) {
                        const searchParams = req.nextUrl.searchParams;
                        const idsParam = searchParams.get("ids");
                        if (idsParam) {
                            ids = idsParam.split(",");
                        }
                    }

                    if (ids.length === 0) {
                        const searchParams = req.nextUrl.searchParams;
                        const idsParam = searchParams.get("ids");
                        if (idsParam) {
                            ids = idsParam.split(",");
                        }
                    }

                    if (ids.length === 0) {
                        return NextResponse.json({ code: 400, message: "Missing ids for batch delete" }, { status: 400 });
                    }

                    await Model.deleteMany({ _id: { $in: ids } });
                    return NextResponse.json({ code: 0, message: "success", success: true });
                }
            } catch (e: any) {
                return NextResponse.json({ code: 500, message: e.message }, { status: 500 });
            }
        }
    };
}
