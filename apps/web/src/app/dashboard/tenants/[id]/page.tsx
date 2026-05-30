"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar, User, FileText, CreditCard, AlertCircle } from "lucide-react";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

export default function TenantProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTenant() {
      try {
        const { data } = await api.get(`/tenants/${id}`);
        setTenant(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTenant();
  }, [id]);

  if (isLoading) {
    return <div className="h-96 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!tenant) return <div className="text-white">Tenant not found</div>;

  const activeLease = tenant.leases?.[0];
  const recentCharges = activeLease?.rentCharges?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white/50 hover:text-white hover:bg-white/5">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center font-heading font-bold text-xl border border-primary/30">
            {tenant.user?.firstName?.[0]}{tenant.user?.lastName?.[0]}
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-white tracking-tight">
              {tenant.user?.firstName} {tenant.user?.lastName}
            </h1>
            <div className="flex items-center gap-2 text-white/50 mt-1 text-sm">
              <Badge variant="outline" className="border-white/10 text-white/70">
                Tenant
              </Badge>
              <span>Added {format(new Date(tenant.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info & Contact */}
        <div className="space-y-6">
          <Card className="bg-black/40 border-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-heading text-white flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Mail className="w-4 h-4 text-white/50" /></div>
                <div className="flex flex-col">
                  <span className="text-white/40 text-xs">Email Address</span>
                  <span className="text-white">{tenant.user?.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Phone className="w-4 h-4 text-white/50" /></div>
                <div className="flex flex-col">
                  <span className="text-white/40 text-xs">Phone Number</span>
                  <span className="text-white">{tenant.user?.phone || 'Not provided'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><FileText className="w-4 h-4 text-white/50" /></div>
                <div className="flex flex-col">
                  <span className="text-white/40 text-xs">National ID</span>
                  <span className="text-white">{tenant.nationalId || 'Not provided'}</span>
                </div>
              </div>
              
              <Separator className="bg-white/5 my-4" />
              
              <h4 className="text-sm font-medium text-white/70 mb-3">Emergency Contact</h4>
              <div className="space-y-2">
                <p className="text-sm text-white"><span className="text-white/40 mr-2">Name:</span> {tenant.emergencyContact || 'Not provided'}</p>
                <p className="text-sm text-white"><span className="text-white/40 mr-2">Phone:</span> {tenant.emergencyPhone || 'Not provided'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Lease & Financials */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-black/40 border-white/5 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-heading text-white">Current Lease</CardTitle>
                <CardDescription className="text-white/40">Active rental agreement details</CardDescription>
              </div>
              {activeLease ? (
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20">Active</Badge>
              ) : (
                <Badge variant="outline" className="border-white/10 text-white/40">No Active Lease</Badge>
              )}
            </CardHeader>
            <CardContent>
              {activeLease ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-white/40 text-xs mb-1">Property</p>
                    <p className="text-white font-medium">{tenant.unit?.property?.name}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Unit</p>
                    <p className="text-white font-medium text-lg">{tenant.unit?.unitNumber}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Monthly Rent</p>
                    <p className="text-white font-medium">KES {Number(tenant.unit?.monthlyRent).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Start Date</p>
                    <p className="text-white font-medium">{format(new Date(activeLease.startDate), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              ) : (
                <p className="text-white/50 text-sm">This tenant is not currently assigned to any unit.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-heading text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" /> Recent Rent Charges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentCharges.length === 0 ? (
                <p className="text-white/40 text-sm py-4">No rent charges generated yet.</p>
              ) : (
                <div className="space-y-4">
                  {recentCharges.map((charge: any) => (
                    <div key={charge.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex flex-col items-center justify-center">
                          <span className="text-xs text-white/50 uppercase font-bold">{format(new Date(charge.year, charge.month - 1), 'MMM')}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Rent for {format(new Date(charge.year, charge.month - 1), 'MMMM yyyy')}</p>
                          <p className="text-white/40 text-xs">Due: {format(new Date(charge.dueDate), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-white font-medium">KES {Number(charge.amount).toLocaleString()}</p>
                          <ChargeStatusBadge status={charge.status} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ChargeStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "text-green-400",
    PARTIALLY_PAID: "text-yellow-400",
    PENDING: "text-blue-400",
    OVERDUE: "text-red-400",
  };

  return (
    <p className={`text-xs font-semibold uppercase tracking-wider mt-1 ${styles[status] || 'text-white/50'}`}>
      {status.replace('_', ' ')}
    </p>
  );
}
