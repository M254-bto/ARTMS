"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Settings, Phone } from "lucide-react";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProperty() {
      try {
        const { data } = await api.get(`/properties/${id}`);
        setProperty(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProperty();
  }, [id]);

  if (isLoading) {
    return <div className="h-96 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!property) return <div className="text-white">Property not found</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white/50 hover:text-white hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-white tracking-tight">{property.name}</h1>
            <div className="flex items-center gap-2 text-white/50 mt-1">
              <MapPin className="w-4 h-4" />
              {property.location}
            </div>
          </div>
        </div>
        <div className="mt-2 md:mt-0 md:ml-auto w-full md:w-auto">
          <Button 
            variant="outline" 
            className="w-full md:w-auto border-white/10 text-white gap-2 hover:bg-white/5"
            onClick={() => alert("Edit units functionality coming soon.")}
          >
            <Settings className="w-4 h-4" /> Edit Units
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info */}
        <div className="space-y-6">
          <Card className="bg-black/40 border-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-heading text-white">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div>
                <p className="text-white/40 mb-1 uppercase tracking-wider text-xs">Description</p>
                <p className="text-white/80 leading-relaxed">{property.description || "No description provided."}</p>
              </div>
              <div className="pt-4 border-t border-white/5 space-y-6">
                <div>
                  <p className="text-white/40 mb-3 text-xs uppercase tracking-wider">Property Owner</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {property.owner?.firstName?.[0]}{property.owner?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-white font-medium">{property.owner?.firstName} {property.owner?.lastName}</p>
                        <p className="text-white/40 text-xs">{property.owner?.email}</p>
                      </div>
                    </div>
                    {property.owner?.phone && (
                      <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/5 shrink-0" onClick={() => window.location.href=`tel:${property.owner.phone}`}>
                        <Phone className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {property.manager && property.manager.id !== property.owner?.id && (
                  <div>
                    <p className="text-white/40 mb-3 text-xs uppercase tracking-wider">Property Manager</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 font-bold">
                          {property.manager?.firstName?.[0]}{property.manager?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-white font-medium">{property.manager?.firstName} {property.manager?.lastName}</p>
                          <p className="text-white/40 text-xs">{property.manager?.email}</p>
                        </div>
                      </div>
                      {property.manager?.phone && (
                        <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/5 shrink-0" onClick={() => window.location.href=`tel:${property.manager.phone}`}>
                          <Phone className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Units List */}
        <div className="lg:col-span-2">
          <Card className="bg-black/40 border-white/5 backdrop-blur-xl min-h-[500px]">
            <CardHeader>
              <CardTitle className="text-lg font-heading text-white">Units Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Unit Summary stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                  <p className="text-3xl font-heading font-bold text-white">{property.units.length}</p>
                  <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Total Units</p>
                </div>
                <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-xl text-center">
                  <p className="text-3xl font-heading font-bold text-green-400">{property.units.filter((u:any) => u.status === 'OCCUPIED').length}</p>
                  <p className="text-xs text-green-500/50 uppercase tracking-wider mt-1">Occupied</p>
                </div>
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl text-center">
                  <p className="text-3xl font-heading font-bold text-blue-400">{property.units.filter((u:any) => u.status === 'VACANT').length}</p>
                  <p className="text-xs text-blue-500/50 uppercase tracking-wider mt-1">Vacant</p>
                </div>
                <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl text-center">
                  <p className="text-3xl font-heading font-bold text-orange-400">{property.units.filter((u:any) => u.status === 'UNDER_MAINTENANCE' || u.status === 'RESERVED').length}</p>
                  <p className="text-xs text-orange-500/50 uppercase tracking-wider mt-1">Other</p>
                </div>
              </div>

              {property.units.length === 0 ? (
                <div className="text-center py-12 text-white/40 border border-white/5 rounded-xl bg-white/[0.01] border-dashed">
                  No units have been added to this property yet.
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="grid grid-cols-4 px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider border-b border-white/5">
                    <div>Unit</div>
                    <div>Type</div>
                    <div>Rent</div>
                    <div className="text-right">Status</div>
                  </div>
                  <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto pr-2">
                    {property.units.map((unit: any) => (
                      <div key={unit.id} className="grid grid-cols-4 items-center px-4 py-3 hover:bg-white/[0.02] transition-colors rounded-lg group">
                        <div className="font-medium text-white">Unit {unit.unitNumber}</div>
                        <div className="text-white/60 text-sm">{unit.unitType || "Standard"}</div>
                        <div className="text-white/60 text-sm">KES {Number(unit.monthlyRent).toLocaleString()}</div>
                        <div className="text-right">
                          <UnitStatusBadge status={unit.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function UnitStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OCCUPIED: "bg-green-500/10 text-green-400 border-green-500/20",
    VACANT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    UNDER_MAINTENANCE: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    RESERVED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${styles[status] || styles.VACANT}`}>
      {status.replace('_', ' ')}
    </Badge>
  );
}
