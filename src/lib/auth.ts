

import { jwtVerify, SignJWT } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

export async function verifyToken(token: string) {
    // 如果是模拟 Token（遗留支持/管理员绕过），返回模拟负载
    // 或者我们只在 api-handler 中处理模拟 Token。
    // 理想情况下，verifyToken 应该只做 JWT 验证。
    // 如果要严格的话，模拟支持会让这个底层函数变得复杂。
    // 我将保持严格的 jwtVerify，并在调用 verifyToken 之前或在 catch 块中处理模拟 Token。
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload as any;
    } catch (err) {
        throw new Error("Invalid Token");
    }
}

export async function signToken(payload: any) {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60 * 60 * 24; // 24 hours

    // 负载现在包含 { userId, sub, permissions: string[] }
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setExpirationTime(exp)
        .setIssuedAt(iat)
        .setNotBefore(iat)
        .sign(SECRET);
}

