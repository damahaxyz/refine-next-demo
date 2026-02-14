"use client";

import React from "react";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { DevtoolsProvider, DevtoolsPanel } from "@refinedev/devtools";
import routerProvider from "@refinedev/nextjs-router";

import { dataProvider } from "@/providers/dataProvider";
import { authProvider } from "@/providers/authProvider";
import { accessControlProvider } from "@/providers/accessControlProvider";

import { resources } from "@/config/resources";
import { useNotificationProvider } from "@/components/notification/use-notification-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { GlobalDialogProvider } from "@/components/custom/global-dialog";
import { DialogProviderBridge } from "@/lib/dialog";
import { Toaster } from "@/components/notification/toaster";

import { Logo } from "@/assets/logo";

import "@/styles/global.css";
// import "./styles/style.scss"; // Already imported in global.css or we should import it here? 
// Next.js imports global styles in layout, but here we can import scss if configured.
// We copied style.scss to src/styles/style.scss. Next.js supports Sass if sass is installed.
// We haven't installed 'sass'. We should.

export const RefineContext = ({ children }: { children: React.ReactNode }) => {
    return (
        <ThemeProvider>
            <DevtoolsProvider>
                <GlobalDialogProvider>
                    <RefineKbarProvider>
                        <Refine
                            dataProvider={dataProvider}
                            notificationProvider={useNotificationProvider()}
                            routerProvider={routerProvider}
                            authProvider={authProvider}
                            accessControlProvider={accessControlProvider}
                            resources={resources}
                            options={{
                                syncWithLocation: true,
                                warnWhenUnsavedChanges: true,
                                projectId: "ei08rB-8mMj2G-OLjuU7",
                                liveMode: "auto",
                                title: {
                                    text: "量化管理系统",
                                    icon: <Logo width={32} height={32} />,
                                }
                            }}
                        >

                            {children}
                            <RefineKbar />
                            <Toaster position="top-center" />
                        </Refine>
                        <DialogProviderBridge />
                    </RefineKbarProvider>
                </GlobalDialogProvider>
                <DevtoolsPanel />
            </DevtoolsProvider>
        </ThemeProvider>
    );
};
