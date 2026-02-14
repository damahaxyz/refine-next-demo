import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { getUserPermissions } from "@/services/permission";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        const account = await prisma.account.findUnique({
            where: { username }
        });

        if (!account) {
            return NextResponse.json({
                code: 1,
                message: "Invalid username or password",
            });
        }

        const isMatch = await bcrypt.compare(password, account.password);

        if (!isMatch) {
            return NextResponse.json({
                code: 1,
                message: "Invalid username or password",
            });
        }

        const permissions = await getUserPermissions(account.id);
        const token = await signToken({
            userId: account.id,
            sub: account.username,
            permissions
        });

        // Parse roles JSON string back to array if needed, but the type is String in Prisma Schema
        // However, the frontend likely expects an array.
        // We stored it as stringified JSON in the schema migration plan.
        let roles = [];
        try {
            roles = JSON.parse(account.roleIds);
        } catch (e) {
            roles = []; // fallback
        }

        return NextResponse.json({
            code: 0,
            message: "Login successful",
            data: {
                token,
                username: account.username,
                name: account.name || account.username,
                roles: roles,
                avatar: account.avatar || "https://i.pravatar.cc/150?img=3",
                permissions: permissions,
            },
        });
    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json({
            code: 1,
            message: error.message || "Login failed",
        });
    }
}
