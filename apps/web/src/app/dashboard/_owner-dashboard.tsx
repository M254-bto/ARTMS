"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";
import {
  Building2, Users, Wrench, TrendingUp, TrendingDown,
  Wallet, BarChart3,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddTenantDialog } from "@/components/tenants/add-tenant-dialog";

export default function OwnerDashboard() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/dashboard/summary"), api.get("/dashboard/monthly-trend")])
      .then(([sumRes, trendRes]) => { setSummary(sumRes.data); setTrend(trendRes.data); })
      .catch((err) => console.error("Failed to fetch dashboard data", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-white/5 rounded-lg mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-xl border border-white/5" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 h-96 bg-white/5 rounded-xl border border-white/5" />
          <div className="h-96 bg-white/5 rounded-xl border border-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Overview</h1>
          <p className="text-white/50 mt-1">Welcome back, {user?.firstName}. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <AddTenantDialog />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Collections" value={`KES ${summary?.collectedThisMonth?.toLocaleString() || 0}`} subtitle={`Expected: KES ${summary?.expectedThisMonth?.toLocaleString() || 0}`} icon={Wallet} trend={summary?.collectionsTrend || 0} />
        <KPICard title="Occupancy Rate" value={`${summary?.occupancyRate || 0}%`} subtitle={`${summary?.occupiedUnits || 0} of ${summary?.totalUnits || 0} units occupied`} icon={Building2} trend={summary?.occupancyTrend || 0} />
        <KPICard title="Active Tenants" value={summary?.totalTenants || 0} subtitle="Across all properties" icon={Users} trend={summary?.tenantsTrend || 0} />
        <KPICard title="Open Maintenance" value={summary?.openMaintenance || 0} subtitle={summary?.openMaintenance > 0 ? "Requires attention" : "All clear"} icon={Wrench} trend={summary?.maintenanceTrend || 0} alert={summary?.openMaintenance > 5} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-black/40 border-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-heading text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80 w-full min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `K${v / 1000}`} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }} itemStyle={{ color: "#fff" }} />
                <Area type="monotone" dataKey="collected" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorCollected)" />
                <Area type="monotone" dataKey="expected" stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-lg font-heading text-white">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-80 relative">
            <div className="relative flex items-center justify-center w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                <circle cx="96" cy="96" r="80" stroke="hsl(var(--primary))" strokeWidth="12" fill="none"
                  strokeDasharray={`${2 * Math.PI * 80}`}
                  strokeDashoffset={`${2 * Math.PI * 80 * (1 - (summary?.collectionRate || 0) / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-heading font-bold text-white">{summary?.collectionRate || 0}%</span>
                <span className="text-xs text-white/50 uppercase tracking-widest mt-1">Collected</span>
              </div>
            </div>
            <div className="w-full mt-8 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Paid</span>
                <span className="text-white font-medium">KES {summary?.collectedThisMonth?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white/10" /> Outstanding</span>
                <span className="text-white font-medium">KES {summary?.outstandingThisMonth?.toLocaleString() || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ title, value, subtitle, icon: Icon, trend, alert }: any) {
  return (
    <Card className={`bg-black/40 border-white/5 backdrop-blur-xl relative overflow-hidden group ${alert ? "ring-1 ring-red-500/30" : ""}`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] transition-all duration-500 group-hover:bg-primary/10" />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${alert ? "bg-red-500/10 text-red-400" : "bg-white/5 text-primary"}`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <h3 className="text-white/50 text-sm font-medium">{title}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-heading font-bold text-white tracking-tight">{value}</span>
        </div>
        <p className="text-white/40 text-xs mt-2 truncate">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
