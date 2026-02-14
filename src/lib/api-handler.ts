
import { NextRequest, NextResponse } from "next/server";

interface PermissionConfig {
    module: string;
    actions?: {
        GET?: string;
        POST?: string;
        PATCH?: string;
        DELETE?: string;
    };
}

interface CrudOptions {
    model: any; // Prisma delegate (e.g. prisma.account)
    auth?: PermissionConfig;
    onBeforeCreate?: (data: any) => Promise<any>;
    onBeforeUpdate?: (id: string, data: any) => Promise<any>;
    searchFields?: string[]; // Fields allowed for search/filtering logic if needed specific handling
}

export function createCrudHandlers(options: CrudOptions) {

    const getModel = () => {
        return options.model;
    };

    return {
        GET: async (req: NextRequest, { params }: { params: Promise<{ id?: string }> }) => {
            try {
                const resolvedParams = await params;
                const Model = getModel();

                // Get One
                if (resolvedParams?.id) {
                    const item = await Model.findUnique({
                        where: { id: resolvedParams.id }
                    });
                    if (!item) return NextResponse.json({ code: 404, message: "Not Found" }, { status: 404 });
                    return NextResponse.json({ code: 0, message: "success", data: item });
                }

                // Get List / Search
                const searchParams = req.nextUrl.searchParams;
                const page = parseInt(searchParams.get("_page") || "1");
                const limit = parseInt(searchParams.get("_limit") || "10");
                const skip = (page - 1) * limit;

                // Sorting
                const sortField = searchParams.get("_sort") || "createdAt";
                const sortOrder = searchParams.get("_order") === "asc" ? "asc" : "desc";
                const orderBy = { [sortField]: sortOrder };

                // Filtering - Map query params to Prisma where clause
                const where: any = {};
                searchParams.forEach((value, key) => {
                    if (["_page", "_limit", "_sort", "_order"].includes(key)) return;

                    if (key.endsWith("_like")) {
                        const field = key.replace("_like", "");
                        where[field] = { contains: value }; // SQLite is case-insensitive by default for LIKE, usually
                    } else if (key.endsWith("_gte")) {
                        const field = key.replace("_gte", "");
                        where[field] = { ...where[field], gte: value }; // Prisma handles string/date comparison
                    } else if (key.endsWith("_lte")) {
                        const field = key.replace("_lte", "");
                        where[field] = { ...where[field], lte: value };
                    } else if (key.endsWith("_ne")) {
                        const field = key.replace("_ne", "");
                        where[field] = { not: value };
                    } else if (key.endsWith("_in")) {
                        const field = key.replace("_in", "");
                        where[field] = { in: value.split(",") };
                    } else {
                        // Exact match
                        where[key] = value;
                    }
                });

                const [data, total] = await Promise.all([
                    Model.findMany({
                        where,
                        skip,
                        take: limit,
                        orderBy,
                    }),
                    Model.count({ where }),
                ]);

                return NextResponse.json({
                    code: 0,
                    message: "success",
                    data: data,
                    total: total
                });

            } catch (e: any) {
                console.error(e);
                return NextResponse.json({ code: 500, message: e.message }, { status: 500 });
            }
        },

        POST: async (req: NextRequest) => {
            try {
                const body = await req.json();
                const Model = getModel();

                let data = body;
                if (options.onBeforeCreate) {
                    data = await options.onBeforeCreate(data);
                }

                const newItem = await Model.create({ data });
                return NextResponse.json({ code: 0, message: "success", data: newItem }, { status: 201 });
            } catch (e: any) {
                console.error(e);
                return NextResponse.json({ code: 500, message: e.message }, { status: 500 });
            }
        },

        PATCH: async (req: NextRequest, { params }: { params?: Promise<{ id?: string }> } = {}) => {
            try {
                const resolvedParams = await params;
                const id = resolvedParams?.id;
                const body = await req.json();
                const Model = getModel();

                if (id) {
                    // Update One
                    let data = body;
                    // Remove id from update data if present to avoid Prisma error
                    delete data.id;

                    if (options.onBeforeUpdate) {
                        data = await options.onBeforeUpdate(id, data);
                    }
                    const updated = await Model.update({
                        where: { id },
                        data
                    });
                    return NextResponse.json({ code: 0, message: "success", data: updated });
                } else {
                    // Batch Update
                    // Prisma doesn't have a direct batch update with different values for different IDs easily 
                    // without raw queries or loop. Loop is fine for now as per previous implementation.
                    const { ids, data: updateData } = body;

                    if (!ids || !Array.isArray(ids) || ids.length === 0) {
                        return NextResponse.json({ code: 400, message: "Missing ids for batch update" }, { status: 400 });
                    }

                    const results = [];
                    // We run these in a transaction if possible, or parallel
                    // Using parallel promises for speed, but ideally strictly transactional

                    // Note: Prisma strict transaction for list of updates: 
                    // const updates = ids.map(id => Model.update(...)); await prisma.$transaction(updates);

                    const transaction = ids.map(async (itemId: string) => {
                        let itemData = { ...updateData };
                        if (options.onBeforeUpdate) {
                            itemData = await options.onBeforeUpdate(itemId, itemData);
                        }
                        return Model.update({
                            where: { id: itemId },
                            data: itemData
                        });
                    });

                    const updatedItems = await Promise.all(transaction); // Or prisma.$transaction(transaction) if we built promises array properly

                    return NextResponse.json({ code: 0, message: "success", data: updatedItems });
                }
            } catch (e: any) {
                console.error(e);
                return NextResponse.json({ code: 500, message: e.message }, { status: 500 });
            }
        },

        DELETE: async (req: NextRequest, { params }: { params?: Promise<{ id?: string }> } = {}) => {
            try {
                const resolvedParams = await params;
                const id = resolvedParams?.id;
                const Model = getModel();

                if (id) {
                    // Delete One
                    await Model.delete({ where: { id } });
                    return NextResponse.json({ code: 0, message: "success", success: true });
                } else {
                    // Batch Delete
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
                        // Fallback query param check again if body failed or was empty
                        const searchParams = req.nextUrl.searchParams;
                        const idsParam = searchParams.get("ids");
                        if (idsParam) {
                            ids = idsParam.split(",");
                        }
                    }

                    if (ids.length === 0) {
                        return NextResponse.json({ code: 400, message: "Missing ids for batch delete" }, { status: 400 });
                    }

                    await Model.deleteMany({
                        where: {
                            id: { in: ids }
                        }
                    });
                    return NextResponse.json({ code: 0, message: "success", success: true });
                }
            } catch (e: any) {
                console.error(e);
                return NextResponse.json({ code: 500, message: e.message }, { status: 500 });
            }
        }
    };
}
