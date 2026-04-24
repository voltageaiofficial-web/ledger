"use client";

import { useState } from "react";
import { Sidebar } from "@/components/nav/sidebar";
import { Header } from "@/components/nav/header";
import { MobileNav } from "@/components/nav/mobile-nav";
import { CommandPalette } from "@/components/nav/command-palette";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar onCommand={() => setCmdOpen(true)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onCommand={() => setCmdOpen(true)} />
        <main className="flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>
      <MobileNav />
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}
