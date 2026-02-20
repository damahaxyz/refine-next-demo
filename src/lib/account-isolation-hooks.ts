import { NextRequest } from "next/server";
import { QueryOptions } from "./api-handler";
import { getCurrentLoginInfo } from "./auth";


export const accountIsolationHooks = {
    onBeforeCreate: async (data: any) => {
        const loginInfo = await getCurrentLoginInfo();
        if (!loginInfo) throw new Error("Unauthorized");
        data.accountId = loginInfo.accountId;

        return data;
    },
    onBeforeQuery: async (query: QueryOptions, req: NextRequest) => {
        const loginInfo = await getCurrentLoginInfo();
        if (!loginInfo) throw new Error("Unauthorized");
        if (!loginInfo.isAdmin()) { //admin 可以看到所有
            query.where.accountId = loginInfo.accountId;
        }
        return query;
    },

    onBeforeDeleteMany: async (query: QueryOptions) => {
        const loginInfo = await getCurrentLoginInfo();
        if (!loginInfo) throw new Error("Unauthorized");
        if (!loginInfo.isAdmin()) { //admin 可以删除所有
            query.where.accountId = loginInfo.accountId;
        }
        return query;
    },
    onBeforeDelete: async (query: QueryOptions) => {
        const loginInfo = await getCurrentLoginInfo();
        if (!loginInfo) throw new Error("Unauthorized");
        if (!loginInfo.isAdmin()) {
            query.where.accountId = loginInfo.accountId;
        }
        return query;
    },
}