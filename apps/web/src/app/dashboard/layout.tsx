"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Building2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Desktop Sidebar - fixed */}
      <div className="hidden lg:block w-64 h-full relative z-20">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 relative h-full flex flex-col overflow-hidden">
        {/* Subtle ambient light from top */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0" />
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-black/40 backdrop-blur-xl relative z-20">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary/20 rounded-md ring-1 ring-primary/30">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <span className="font-heading font-bold text-lg tracking-tight text-white">KeyNest.</span>
          </div>
          
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger render={<button className="p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                <Menu className="w-6 h-6" />
              </button>} />
            <SheetContent side="left" showCloseButton={false} className="p-0 w-64 border-none bg-transparent shadow-none">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10">
          <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
