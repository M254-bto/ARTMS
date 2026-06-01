"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Users,
  CreditCard,
  ReceiptText,
  Wrench,
  Megaphone,
  BarChart3,
  LogOut,
  Home,
  MessageSquare,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

// ─── Route definitions per role ───────────────────────────────────────────────
const ownerRoutes = [
  { label: "Overview",      icon: LayoutDashboard, href: "/dashboard" },
  { label: "Properties",    icon: Building2,        href: "/dashboard/properties" },
  { label: "Tenants",       icon: Users,            href: "/dashboard/tenants" },
  { label: "Payments",      icon: CreditCard,       href: "/dashboard/payments" },
  { label: "Receipts",      icon: ReceiptText,      href: "/dashboard/receipts" },
  { label: "Maintenance",   icon: Wrench,           href: "/dashboard/maintenance" },
  { label: "Announcements", icon: Megaphone,        href: "/dashboard/announcements" },
  { label: "Analytics",     icon: BarChart3,        href: "/dashboard/analytics" },
];

const tenantRoutes = [
  { label: "Dashboard",    icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Unit",      icon: Home,            href: "/dashboard/my-unit" },
  { label: "Payments",     icon: CreditCard,      href: "/dashboard/my-payments" },
  { label: "Receipts",     icon: ReceiptText,     href: "/dashboard/my-receipts" },
  { label: "Maintenance",  icon: Wrench,          href: "/dashboard/my-maintenance" },
  { label: "Messages",     icon: MessageSquare,   href: "/dashboard/my-messages" },
];

// Roles that see the owner navigation
const OWNER_ROLES = ["PROPERTY_OWNER", "PROPERTY_MANAGER", "SUPER_ADMIN", "CARETAKER"];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isOwnerRole = user?.role && OWNER_ROLES.includes(user.role);
  const routes = isOwnerRole ? ownerRoutes : tenantRoutes;

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl border-r border-white/5 w-64 pt-6">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg ring-1 ring-primary/30">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-white">KeyNest.</span>
        </div>
        {onNavigate && (
          <button 
            onClick={onNavigate}
            className="p-1.5 rounded-md hover:bg-white/5 text-white/50 hover:text-white transition-colors lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Role badge */}
      <div className="px-6 mb-4">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
          isOwnerRole
            ? "bg-primary/10 text-primary border-primary/20"
            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
        }`}>
          {user?.role?.replace(/_/g, " ").toLowerCase()}
        </span>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-4 flex-1">
        <p className="px-2 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Menu</p>
        <nav className="space-y-1">
          {routes.map((route) => {
            const active = pathname === route.href || (route.href !== "/dashboard" && pathname.startsWith(`${route.href}/`));
            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <route.icon className={`w-5 h-5 transition-colors ${active ? "text-primary" : "text-white/40 group-hover:text-white/80"}`} />
                {route.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User card + logout */}
      <div className="px-4 pb-6">
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-primary/10 flex items-center justify-center font-heading font-semibold text-white border border-white/10 shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-xs text-white/50 truncate">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              logout();
              window.location.href = "/login";
            }}
            className="flex items-center justify-center gap-2 w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors border border-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
