import { Metadata } from "next";
import React, { Suspense } from "react";
import { RefineContext } from "@/components/refine-context";
import "@/styles/global.css";
import "@/styles/style.scss";

export const metadata: Metadata = {
  title: "量化管理系统",
  description: "Refine Next.js App",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense>
          <RefineContext>
            {children}
          </RefineContext>
        </Suspense>
      </body>
    </html>
  );
}
