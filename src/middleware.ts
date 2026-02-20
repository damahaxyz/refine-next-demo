import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'
import pluralize from 'pluralize'

// 1. 定义不需要登录访问的api
const publicPaths = [
    '/api/accounts/login',
    '/api/accounts/register',
    '/api/collector/products',
];
// 2. 定义不需要权限的路径（但仍需认证，即 "NoAuth" for RBAC）
const noPermissionRequiredPaths = [
    { path: '/api/permissions', method: 'GET' },
    { path: '/api/ai/product/title/generation', method: 'POST' },
    { path: '/api/ai/images/crop', method: 'POST' },
];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname



    // 检查当前路径是否以任何公共路径开头
    if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
        return NextResponse.next()
    }

    // 2. 从 Authorization 头中提取 Token
    const authHeader = request.headers.get('authorization')
    let token = ''

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
    }

    // 3. 验证 Token
    if (!token) {
        return NextResponse.json(
            { code: 401, message: 'Authentication required' },
            { status: 401 }
        )
    }

    try {
        const payload = await verifyToken(token) as any;

        // 4. 检查权限
        // 将请求方法映射到动作
        const methodToAction: Record<string, string> = {
            GET: 'view',
            POST: 'create',
            PATCH: 'edit',
            PUT: 'edit',
            DELETE: 'delete',
        };

        const action = methodToAction[request.method];

        // 从路径中提取资源，例如 /api/roles -> role
        // 假设路径格式为 /api/<resource> or /api/<resource>/...
        const pathParts = path.split('/');
        // pathParts = ['', 'api', 'roles', ...]
        let resource = pathParts[2]; // 'roles'

        // Singularize resource if possible (simple heuristic or hardcode common ones)
        // Better approach: use a mapping or simple rule. 
        // Our config uses singular: role, account, customer
        if (resource) {
            // 使用 pluralize 将资源名称转为单数
            resource = pluralize.singular(resource);

            const requiredPermission = `${resource}:${action}`;
            const userPermissions = payload.permissions || [];

            // 跳过公共资源或系统管理员的权限检查
            // 还需要处理动作未定义的情况（例如 OPTIONS）
            if (action && !userPermissions.includes(requiredPermission) && payload.username !== "root") {

                const isExempt = noPermissionRequiredPaths.some(p => p.path === path && p.method === request.method);

                if (isExempt) {
                    return NextResponse.next();
                }

                return NextResponse.json(
                    { code: 403, message: `Forbidden: Missing permission ${requiredPermission}` },
                    { status: 403 }
                )
            }
        }

        return NextResponse.next()
    } catch (error) {
        return NextResponse.json(
            { code: 401, message: 'Invalid or expired token' },
            { status: 401 }
        )
    }
}

// 配置此中间件应用的路径
export const config = {
    // 匹配所有 API 路由
    matcher: '/api/:path*',
}
