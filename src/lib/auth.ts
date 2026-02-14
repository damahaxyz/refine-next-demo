import { jwtVerify, SignJWT } from "jose";
import { headers } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

export interface LoginInfoPayload {
    accountId: string;
    username: string;
    roleIds?: string[];
    permissions?: string[];
}

export class LoginInfo {
    public accountId: string;
    public username: string;
    public roleIds: string[];
    public permissions: string[];
    constructor(payload: LoginInfoPayload) {
        this.accountId = payload.accountId;
        this.username = payload.username;
        this.roleIds = payload.roleIds || [];
        this.permissions = payload.permissions || [];
    }

    static from(payload: LoginInfoPayload): LoginInfo {
        return new LoginInfo(payload);
    }

    isAdmin(): boolean {
        return this.roleIds.some(role => role.toLowerCase() === 'admin');
    }

    hasPermission(permission: string): boolean {
        if (this.isAdmin()) return true;
        return this.permissions.includes(permission);
    }
}

export async function verifyToken(token: string): Promise<LoginInfo> {
    // 如果是模拟 Token（遗留支持/管理员绕过），返回模拟负载
    // 或者我们只在 api-handler 中处理模拟 Token。
    // 理想情况下，verifyToken 应该只做 JWT 验证。
    // 如果要严格的话，模拟支持会让这个底层函数变得复杂。
    // 我将保持严格的 jwtVerify，并在调用 verifyToken 之前或在 catch 块中处理模拟 Token。
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return new LoginInfo(payload as unknown as LoginInfoPayload);
    } catch (err) {
        throw new Error("Invalid Token");
    }
}

export async function signToken(payload: LoginInfoPayload) {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60 * 60 * 24; // 24 hours

    // 负载现在包含 { accountId, username, permissions: string[] }
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setExpirationTime(exp)
        .setIssuedAt(iat)
        .setNotBefore(iat)
        .sign(SECRET);
}


export async function getCurrentLoginInfo(): Promise<LoginInfo | null> {
    const headersList = await headers();
    const token = headersList.get("authorization")?.replace("Bearer ", "");
    if (!token) return null;
    try {
        const info = await verifyToken(token);
        return info;
    } catch {
        // Token invalid or expired
        return null;
    }
}



