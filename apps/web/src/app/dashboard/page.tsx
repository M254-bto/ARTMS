"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";
import {
  Home, CreditCard, Wrench, Calendar, MapPin,
  TrendingUp, CheckCircle2, Clock, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Owner-facing dashboard is imported dynamically based on role
import OwnerDashboard from "./_owner-dashboard";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const OWNER_ROLES = ["PROPERTY_OWNER", "PROPERTY_MANAGER", "SUPER_ADMIN", "CARETAKER"];
  const isOwner = user?.role && OWNER_ROLES.includes(user.role);

  if (isOwner) return <OwnerDashboard />;
  return <TenantDashboard />;
}

// ─── Tenant Dashboard ─────────────────────────────────────────────────────────
function TenantDashboard() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/tenants/me")
      .then(({ data }) => setProfile(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 rounded-xl border border-white/5" />)}
        </div>
      </div>
    );
  }

  const activeLease = profile?.leases?.[0];
  const pendingCharges = activeLease?.rentCharges?.filter((c: any) =>
    c.status === "PENDING" || c.status === "OVERDUE"
  ) ?? [];
  const totalOwed = pendingCharges.reduce((s: number, c: any) => s + Number(c.amount), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-white tracking-tight">
          Welcome back, {user?.firstName}.
        </h1>
        <p className="text-white/50 mt-1">
          Here&apos;s a quick look at your tenancy.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/40 border-white/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] transition-all duration-500 group-hover:bg-primary/10" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-white/5 text-primary"><Home className="w-5 h-5" /></div>
            </div>
            <h3 className="text-white/50 text-sm font-medium">Your Unit</h3>
            <p className="text-3xl font-heading font-bold text-white mt-1">
              {profile?.unit?.unitNumber ?? "—"}
            </p>
            <p className="text-white/40 text-xs mt-2">{profile?.unit?.property?.name ?? "No property"}</p>
          </CardContent>
        </Card>

        <Card className={`bg-black/40 border-white/5 backdrop-blur-xl relative overflow-hidden group ${totalOwed > 0 ? "ring-1 ring-red-500/30" : ""}`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] transition-all duration-500 group-hover:bg-primary/10" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${totalOwed > 0 ? "bg-red-500/10 text-red-400" : "bg-white/5 text-primary"}`}>
                <CreditCard className="w-5 h-5" />
              </div>
              {totalOwed > 0 && (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
            <h3 className="text-white/50 text-sm font-medium">Outstanding Balance</h3>
            <p className="text-3xl font-heading font-bold text-white mt-1">
              KES {totalOwed.toLocaleString()}
            </p>
            <p className="text-white/40 text-xs mt-2">
              {pendingCharges.length} pending {pendingCharges.length === 1 ? "charge" : "charges"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] transition-all duration-500 group-hover:bg-primary/10" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-white/5 text-primary"><Wrench className="w-5 h-5" /></div>
            </div>
            <h3 className="text-white/50 text-sm font-medium">Maintenance</h3>
            <p className="text-3xl font-heading font-bold text-white mt-1">
              {profile?.maintenanceRequests?.length ?? 0}
            </p>
            <p className="text-white/40 text-xs mt-2">Total requests submitted</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/40 border-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-heading text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Rent &amp; Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingCharges.length === 0 ? (
              <div className="flex items-center gap-3 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">All charges are settled — great job!</span>
              </div>
            ) : (
              pendingCharges.slice(0, 3).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">
                      {new Date(c.dueDate).toLocaleString("default", { month: "long", year: "numeric" })}
                    </p>
                    <p className="text-white/40 text-xs">Due {new Date(c.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-heading font-bold">KES {Number(c.amount).toLocaleString()}</span>
                    <Badge className={c.status === "OVERDUE" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}>
                      {c.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
            <Link href="/dashboard/my-payments" className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 w-full mt-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-md">
              View All Payments
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-heading text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" /> Recent Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(profile?.maintenanceRequests ?? []).length === 0 ? (
              <p className="text-white/40 text-sm">No maintenance requests yet.</p>
            ) : (
              (profile?.maintenanceRequests ?? []).slice(0, 3).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium capitalize">{r.category.toLowerCase()}</p>
                    <p className="text-white/40 text-xs truncate max-w-[180px]">{r.description}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))
            )}
            <Link href="/dashboard/my-maintenance" className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 w-full mt-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-md">
              View All Requests
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    SUBMITTED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    ASSIGNED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    IN_PROGRESS: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    RESOLVED: "bg-green-500/10 text-green-400 border-green-500/20",
    CLOSED: "bg-white/5 text-white/40 border-white/10",
  };
  return (
    <Badge className={`text-[10px] uppercase font-bold ${map[status] || map.SUBMITTED}`}>
      {status.replace("_", " ")}
    </Badge>
  );
}
