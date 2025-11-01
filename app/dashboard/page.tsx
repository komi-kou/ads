"use client";

import { Dashboard } from "@/components/Dashboard";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">読み込み中...</div>}>
      <Dashboard />
    </Suspense>
  );
}