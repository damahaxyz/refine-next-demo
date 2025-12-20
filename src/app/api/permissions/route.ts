import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Account from "@/models/account";
import { getUserPermissions } from "@/services/permission";

export async function GET(request: Request) {
    try {
        await dbConnect();

        // Simple token verification logic mimicking standard Authorization header usage
        const authHeader = request.headers.get("Auth") || request.headers.get("Authorization");

        if (!authHeader) {
            return NextResponse.json({
                code: 401,
                message: "Unauthorized",
            }, { status: 401 });
        }

        // In our simple mock implementation (from previous steps), we set token as "mock-token-" + accountId
        // In a real app, this would be a JWT verification
        // For now, we extract the ID from the mock token string

        let accountId = "";
        if (authHeader.startsWith("mock-token-")) {
            accountId = authHeader.replace("mock-token-", "");
        } else if (authHeader === "mock-token-123456") {
            // Admin mock
            // We need to find the admin account if it exists, or handle it specially
            // For simplicity, let's assume we find by username "admin" if ID is not ObjectId-like
            const account = await Account.findOne({ username: "admin" });
            if (account) accountId = account._id;
        }

        // If simple ID extraction fails or it's not a valid ID format, we might fail
        // But let's try to query by ID

        if (!accountId) {
            return NextResponse.json({
                code: 401,
                message: "Invalid token",
            }, { status: 401 });
        }


        const account = await Account.findById(accountId);
        if (!account) {
            return NextResponse.json({
                code: 401,
                message: "User not found",
            }, { status: 401 });
        }

        const permissions = await getUserPermissions(account._id.toString());

        return NextResponse.json({
            code: 0,
            message: "Success",
            data: permissions
        });

    } catch (error: any) {
        console.error("Permissions API error:", error);
        return NextResponse.json({
            code: 500,
            message: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
