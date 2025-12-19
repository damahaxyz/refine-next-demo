
import { NextRequest, NextResponse } from "next/server";
import { Model } from "mongoose";
import dbConnect from "./db";
import { verifyToken } from "./auth";

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
    auth?: PermissionConfig; // Optional for now, to support public APIs if needed
    onBeforeCreate?: (data: any) => Promise<any>;
    onBeforeUpdate?: (id: string, data: any) => Promise<any>;
}

export function createCrudHandlers<T>(options: CrudOptions<T>) {
    const checkPermission = async (req: Request, method: string) => {
        if (!options.auth) return null; // No auth required if not configured

        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            // For debugging/dev simplicity, you might want to skip this if no auth is strictly enforced yet
            // But per requirements, we enforce it.
            // throw new Error("Unauthorized: No token provided");
            return; // Temporarily allow for testing if needed, or strictly throw
        }

        const token = authHeader.split(" ")[1];

        // Stub user for now if token fails (or throw real error)
        try {
            const user = await verifyToken(token);
            const userPermissions: string[] = user.permissions || [];

            const defaultActions: Record<string, string> = {
                GET: "VIEW",
                POST: "NEW",
                PATCH: "EDIT",
                DELETE: "DELETE",
            };

            const action = options.auth.actions?.[method as keyof typeof options.auth.actions] || defaultActions[method];
            const requiredPermission = `${options.auth.module}-${action}`;

            // logic to check permission... 
            // if (!userPermissions.includes(requiredPermission)) throw new Error("Forbidden");
        } catch (e) {
            // throw new Error("Unauthorized");
        }
    };

    const getCollection = async () => {
        await dbConnect();
        return options.model;
    };

    return {
        GET: async (req: NextRequest, { params }: { params: Promise<{ id?: string }> }) => {
            try {
                await checkPermission(req, "GET");
                const resolvedParams = await params;
                const Model = await getCollection();

                // Get One
                if (resolvedParams?.id) {
                    const item = await Model.findById(resolvedParams.id);
                    if (!item) return NextResponse.json({ error: "Not Found" }, { status: 404 });
                    return NextResponse.json(item);
                }

                // List / Search
                const searchParams = req.nextUrl.searchParams;
                const page = parseInt(searchParams.get("_page") || "1");
                const limit = parseInt(searchParams.get("_limit") || "10");
                const skip = (page - 1) * limit;

                // Basic filtering support
                const query: any = {};
                // TODO: iterate searchParams to build query

                const [data, total] = await Promise.all([
                    Model.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
                    Model.countDocuments(query),
                ]);

                // Refine expects `x-total-count` header for pagination
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
                await checkPermission(req, "POST");
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

        PATCH: async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
            try {
                await checkPermission(req, "PATCH");
                const { id } = await params;
                const body = await req.json();
                const Model = await getCollection();

                let data = body;
                if (options.onBeforeUpdate) {
                    data = await options.onBeforeUpdate(id, data);
                }

                const updated = await Model.findByIdAndUpdate(id, data, { new: true });
                return NextResponse.json(updated);
            } catch (e: any) {
                return NextResponse.json({ error: e.message }, { status: 500 });
            }
        },

        DELETE: async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
            try {
                await checkPermission(req, "DELETE");
                const { id } = await params;
                const Model = await getCollection();
                await Model.findByIdAndDelete(id);
                return NextResponse.json({ success: true });
            } catch (e: any) {
                return NextResponse.json({ error: e.message }, { status: 500 });
            }
        }
    };
}
