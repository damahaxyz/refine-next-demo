import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { getUserPermissions } from "@/services/permission";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, email, password } = body;

        if (!username || !email || !password) {
            return NextResponse.json({
                code: 1,
                message: "Username, email and password are required",
            });
        }

        const existingAccount = await prisma.account.findFirst({
            where: {
                OR: [
                    { username },
                    { email: email || "" } // Prisma doesn't like undefined in OR sometimes depending on version, safely handling
                ]
            }
        });

        if (existingAccount) {
            return NextResponse.json({
                code: 1,
                message: "Username or email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAccount = await prisma.account.create({
            data: {
                username,
                email,
                password: hashedPassword,
                name: username,
                roleIds: ["user"], // Default role
            }
        });

        const permissions = await getUserPermissions(newAccount.id);
        const token = await signToken({
            userId: newAccount.id,
            sub: newAccount.username,
            permissions
        });

        return NextResponse.json({
            code: 0,
            message: "Registration successful",
            data: {
                username: newAccount.username,
                id: newAccount.id,
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
