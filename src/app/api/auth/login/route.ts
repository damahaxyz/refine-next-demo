import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Account from "@/models/account";
import bcrypt from "bcryptjs";

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

        // In a real production app, generate a JWT here.
        // For this demo, we'll return a mock token but real user data.
        const token = "mock-token-" + account._id;

        return NextResponse.json({
            code: 0,
            message: "Login successful",
            data: {
                token,
                username: account.username,
                name: account.name || account.username,
                roles: account.roles,
                avatar: account.avatar || "https://i.pravatar.cc/150?img=3"
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
