"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Home, Calendar, ShieldCheck, MapPin, Phone, Mail, Award, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyUnitPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white/5 rounded-xl border border-white/5" />
          <div className="h-64 bg-white/5 rounded-xl border border-white/5" />
        </div>
      </div>
    );
  }

  const unit = profile?.unit;
  const property = unit?.property;
  const lease = profile?.leases?.[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-white tracking-tight">My Unit</h1>
        <p className="text-white/50 mt-1">Detailed overview of your current tenancy and unit status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Unit Card */}
        <Card className="lg:col-span-2 bg-black/40 border-white/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[120px] transition-all duration-500 group-hover:bg-primary/10" />
          <CardHeader>
            <CardTitle className="text-xl font-heading text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" /> Unit Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-white/40 text-xs uppercase tracking-wider">Unit Number</span>
                <p className="text-2xl font-bold text-white">{unit?.unitNumber ?? "Not Assigned"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-white/40 text-xs uppercase tracking-wider">Unit Type</span>
                <p className="text-lg font-medium text-white capitalize">{unit?.unitType ?? "Standard"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-white/40 text-xs uppercase tracking-wider">Monthly Rent</span>
                <p className="text-xl font-bold text-primary">KES {Number(unit?.monthlyRent ?? 0).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <span className="text-white/40 text-xs uppercase tracking-wider">Security Deposit Paid</span>
                <p className="text-lg font-medium text-white">KES {Number(unit?.depositAmount ?? 0).toLocaleString()}</p>
              </div>
              {unit?.floor !== null && unit?.floor !== undefined && (
                <div className="space-y-1">
                  <span className="text-white/40 text-xs uppercase tracking-wider">Floor</span>
                  <p className="text-lg font-medium text-white">{unit?.floor === 0 ? "Ground Floor" : `${unit?.floor} Floor`}</p>
                </div>
              )}
              <div className="space-y-1">
                <span className="text-white/40 text-xs uppercase tracking-wider">Unit Status</span>
                <div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 font-normal">Active Tenancy</Badge>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-3">
              <h4 className="text-white text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Apartment / Property Location
              </h4>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
                <p className="text-white font-medium text-base">{property?.name ?? "No property linked"}</p>
                <p className="text-white/50 text-sm mt-1">{property?.location ?? "No location registered"}</p>
                {property?.description && (
                  <p className="text-white/40 text-xs mt-3 italic">&ldquo;{property.description}&rdquo;</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lease & Contacts Sidebar */}
        <div className="space-y-6">
          {/* Lease Details */}
          <Card className="bg-black/40 border-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-heading text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Lease Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lease ? (
                <>
                  <div className="flex justify-between items-center text-sm pb-2 border-b border-white/5">
                    <span className="text-white/40">Lease Start</span>
                    <span className="text-white font-medium">{new Date(lease.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pb-2 border-b border-white/5">
                    <span className="text-white/40">Lease End</span>
                    <span className="text-white font-medium">
                      {lease.endDate ? new Date(lease.endDate).toLocaleDateString() : "Ongoing"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/40">Rent Due Day</span>
                    <span className="text-primary font-bold">Every {lease.rentDay}th of the month</span>
                  </div>
                </>
              ) : (
                <p className="text-white/40 text-sm">No active lease record found.</p>
              )}
            </CardContent>
          </Card>

          {/* Property Manager/Owner Contact */}
          <Card className="bg-black/40 border-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-heading text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Support &amp; Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <span className="text-white/40 text-xs">Primary Property Help Desk</span>
                <p className="text-white font-medium">hello@afribs.co.ke</p>
              </div>
              <div className="pt-2 border-t border-white/5 flex gap-2">
                <Badge variant="outline" className="border-white/10 text-white/60 bg-white/5 font-normal text-[10px]">
                  Emergency WhatsApp Supported
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
