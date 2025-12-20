"use client";
import React from "react";
import { Authenticated } from "@refinedev/core";
// import { CatchAllNavigate } from "@refinedev/nextjs-router";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <Authenticated
            key="authenticated-inner"
            fallback={<div>Not Authenticated</div>}
        >
            <AuthenticatedLayout>
                {children}
            </AuthenticatedLayout>
        </Authenticated>
    );
}
