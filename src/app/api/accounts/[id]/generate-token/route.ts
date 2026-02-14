import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-db";
import { getCurrentLoginInfo } from "@/lib/auth";
import crypto from "crypto";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const loginInfo = await getCurrentLoginInfo();
        if (!loginInfo) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const token = crypto.randomBytes(32).toString("hex");

        const updatedAccount = await prisma.account.update({
            where: { id },
            data: { apiToken: token },
        });

        return NextResponse.json(updatedAccount);
    } catch (error) {
        console.error("Error generating token:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
