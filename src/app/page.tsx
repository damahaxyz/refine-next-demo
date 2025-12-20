"use client";

import { Authenticated } from "@refinedev/core";
import { NavigateToResource } from "@refinedev/nextjs-router";

export default function Home() {
  return (
    <Authenticated key="home-auth" fallback={<NavigateToResource resource="dashboard" />}>
      <NavigateToResource resource="dashboard" />
    </Authenticated>
  );
}
