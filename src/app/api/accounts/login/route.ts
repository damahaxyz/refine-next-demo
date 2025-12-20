import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Account from "@/models/account";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { getUserPermissions } from "@/services/permission";

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { username, password } = body;

        const account = await Account.findOne({ username }).select('+password');

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

        const permissions = await getUserPermissions(account._id);
        const token = await signToken({
            userId: account._id,
            sub: account.username,
            permissions
        });

        return NextResponse.json({
            code: 0,
            message: "Login successful",
            data: {
                token,
                username: account.username,
                name: account.name || account.username,
                roles: account.roles,
                avatar: account.avatar || "https://i.pravatar.cc/150?img=3",
                permissions: await getUserPermissions(account._id),
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
