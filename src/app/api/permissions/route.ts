import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { PERMISSIONS } = await import("@/config/permissions");
    return NextResponse.json({
        code: 0,
        message: "Success",
        data: Object.values(PERMISSIONS).flat()
    });

}
