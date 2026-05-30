"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";
import api from "@/lib/api";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
  const [trend, setTrend] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get("/dashboard/monthly-trend?months=12");
        setTrend(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-white/50 mt-1">Deep dive into your property performance metrics.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-[400px] w-full bg-white/5 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[300px] bg-white/5 rounded-xl" />
            <Skeleton className="h-[300px] bg-white/5 rounded-xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 12 Month Revenue Trend */}
          <Card className="bg-black/40 border-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-heading text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                12-Month Revenue Forecast & Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] w-full min-h-[400px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={350}>
                <AreaChart data={trend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgba(255,255,255,0.2)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="rgba(255,255,255,0.2)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} tickFormatter={(val) => `K${val/1000}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" name="Collected Revenue" dataKey="collected" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorCollected)" />
                  <Area type="monotone" name="Expected Revenue" dataKey="expected" stroke="rgba(255,255,255,0.3)" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorExpected)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Collection Efficiency */}
            <Card className="bg-black/40 border-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg font-heading text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Collection Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                  <BarChart data={trend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} tickFormatter={(val) => `K${val/1000}`} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.02)'}}
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                    <Legend iconType="circle" />
                    <Bar name="Paid" dataKey="collected" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 4, 4]} />
                    <Bar name="Outstanding" dataKey={(d) => d.expected - d.collected} stackId="a" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Vacancy & Maintenance Trends Placeholder */}
            <Card className="bg-black/40 border-white/5 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-primary/50" />
              </div>
              <h3 className="text-xl font-heading text-white mb-2">More Analytics Coming Soon</h3>
              <p className="text-white/40 max-w-sm text-sm">Vacancy tracking and maintenance resolution metrics will be available in the next platform update.</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
