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
        const { username, email, password } = body;

        if (!username || !email || !password) {
            return NextResponse.json({
                code: 1,
                message: "Username, email and password are required",
            });
        }

        const existingAccount = await Account.findOne({ $or: [{ username }, { email }] });
        if (existingAccount) {
            return NextResponse.json({
                code: 1,
                message: "Username or email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAccount = await Account.create({
            username,
            email,
            password: hashedPassword,
            name: username, // 默认为用户名
            roles: ["user"], // 默认角色
        });

        const permissions = await getUserPermissions(newAccount._id);
        const token = await signToken({
            userId: newAccount._id,
            sub: newAccount.username,
            permissions
        });

        return NextResponse.json({
            code: 0,
            message: "Registration successful",
            data: {
                username: newAccount.username,
                id: newAccount._id,
                token,
                permissions,
            }
        });
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json({
            code: 1,
            message: error.message || "Registration failed",
        });
    }
}
