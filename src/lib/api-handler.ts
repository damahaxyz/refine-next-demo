
import { NextRequest, NextResponse } from "next/server";


export interface PermissionConfig {
    module: string;
    actions?: {
        GET?: string;
        POST?: string;
        PATCH?: string;
        DELETE?: string;
    };
}

export interface QueryOptions {
    where?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
    include?: any;
    select?: any;
}


interface CrudOptions {
    model: any; // Prisma delegate (e.g. prisma.account)
    auth?: PermissionConfig;
    onBeforeCreate?: (data: any) => Promise<any>; // Changed back to return data as good practice, or void if user insists on mutation
    onAfterCreate?: (data: any) => Promise<any>;
    onBeforeUpdate?: (query: any, updates: any) => Promise<any>;
    onAfterUpdate?: (data: any) => Promise<any>;
    searchFields?: string[];
    onBeforeQuery?: (query: QueryOptions, req: NextRequest) => Promise<QueryOptions>;
    onAfterQuery?: (data: any, total: number) => Promise<{ data: any, total: number }>;

    onBeforeDelete?: (query: any) => Promise<any>;
    onAfterDelete?: (data: any) => Promise<any>;

    onBeforeDeleteMany?: (query: any) => Promise<any>;
    onAfterDeleteMany?: (data: any) => Promise<any>;
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
                    let query: QueryOptions = {
                        where: { id: resolvedParams.id }
                    };
                    if (options.onBeforeQuery) {
                        query = await options.onBeforeQuery(query, req);
                    }
                    let item = await Model.findUnique(query);
                    if (options.onAfterQuery) {
                        let result = await options.onAfterQuery(item, 1);
                        item = result.data;
                    }
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
                        where[field] = { contains: value };
                    } else if (key.endsWith("_gte")) {
                        const field = key.replace("_gte", "");
                        where[field] = { ...where[field], gte: value };
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

                let query: QueryOptions = {
                    where,
                    orderBy,
                    skip,
                    take: limit
                };

                if (options.onBeforeQuery) {
                    query = await options.onBeforeQuery(query, req);
                }

                const [data, total] = await Promise.all([
                    Model.findMany(query),
                    Model.count({ where: query.where }),
                ]);
                let result = { data, total };
                if (options.onAfterQuery) {
                    result = await options.onAfterQuery(data, total);
                }

                return NextResponse.json({
                    code: 0,
                    message: "success",
                    data: result.data,
                    total: result.total
                });

            } catch (e: any) {
                console.error(e);
                return NextResponse.json({ code: 500, message: e.message }, { status: 500 });
            }
        },

        POST: async (req: NextRequest) => {
            try {
                let data = await req.json();
                const Model = getModel();

                if (options.onBeforeCreate) {
                    data = await options.onBeforeCreate(data) || data;
                }

                let newItem = await Model.create({ data });
                if (options.onAfterCreate) {
                    newItem = await options.onAfterCreate(newItem) || newItem;
                }
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

                    let where = { id };
                    // let updateOptions: UpdateOptions = { where, data }
                    if (options.onBeforeUpdate) {
                        let updateOptions = await options.onBeforeUpdate(where, data) || { where, data };
                        where = updateOptions.where;
                        data = updateOptions.data;
                    }
                    let updated = await Model.update(where, data);
                    if (options.onAfterUpdate) {
                        updated = await options.onAfterUpdate(updated) || updated;
                    }
                    return NextResponse.json({ code: 0, message: "success", data: updated });
                } else {
                    // Batch Update
                    // Prisma doesn't have a direct batch update with different values for different IDs easily 
                    // without raw queries or loop. Loop is fine for now as per previous implementation.
                    const { ids, data: updateData } = body;

                    if (!ids || !Array.isArray(ids) || ids.length === 0) {
                        return NextResponse.json({ code: 400, message: "Missing ids for batch update" }, { status: 400 });
                    }

                    // We run these in a transaction if possible, or parallel
                    // Using parallel promises for speed, but ideally strictly transactional

                    // Note: Prisma strict transaction for list of updates: 
                    // const updates = ids.map(id => Model.update(...)); await prisma.$transaction(updates);

                    const transaction = ids.map(async (itemId: string) => {
                        let itemData = { ...updateData };
                        let where = { id: itemId };

                        if (options.onBeforeUpdate) {
                            let updateOptions = await options.onBeforeUpdate(where, itemData);
                            where = updateOptions.where;
                            itemData = updateOptions.data;
                        }

                        let updated = await Model.update({ where, data: itemData });

                        if (options.onAfterUpdate) {
                            updated = await options.onAfterUpdate(updated) || updated;
                        }
                        return updated;
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
                    let where = { id };
                    if (options.onBeforeDelete) {
                        where = await options.onBeforeDelete({ where });
                    }
                    await Model.delete({ where });
                    if (options.onAfterDelete) {
                        await options.onAfterDelete({ where });
                    }
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

                    let where = { id: { in: ids } };
                    if (options.onBeforeDeleteMany) {
                        where = await options.onBeforeDeleteMany({ where });
                    }
                    await Model.deleteMany({
                        where
                    });
                    if (options.onAfterDeleteMany) {
                        await options.onAfterDeleteMany({ where });
                    }
                    return NextResponse.json({ code: 0, message: "success", success: true });
                }
            } catch (e: any) {
                console.error(e);
                return NextResponse.json({ code: 500, message: e.message }, { status: 500 });
            }
        }
    };
}
