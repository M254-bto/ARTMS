"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, User, Mail, Phone, Plus, MoreHorizontal } from "lucide-react";
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
        <div className="ml-auto">
          <Button className="bg-primary text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> Add Unit
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
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-white/40 mb-1">Description</p>
                <p className="text-white/80 leading-relaxed">{property.description || "No description provided."}</p>
              </div>
              <div className="pt-4 border-t border-white/5">
                <p className="text-white/40 mb-3">Management</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary font-bold">
                    {property.manager?.firstName?.[0]}{property.manager?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-white font-medium">{property.manager?.firstName} {property.manager?.lastName}</p>
                    <p className="text-white/40 text-xs">Property Manager</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Units Grid */}
        <div className="lg:col-span-2">
          <Card className="bg-black/40 border-white/5 backdrop-blur-xl min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-heading text-white">Units Grid</CardTitle>
              <Badge variant="outline" className="border-white/10 text-white">
                {property.units.length} Total
              </Badge>
            </CardHeader>
            <CardContent>
              {property.units.length === 0 ? (
                <div className="text-center py-12 text-white/40">No units added yet.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {property.units.map((unit: any) => (
                    <div 
                      key={unit.id} 
                      className="border border-white/5 bg-white/[0.02] rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/[0.04] transition-colors cursor-pointer group relative"
                    >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4 text-white/40" />
                      </div>
                      <span className="text-2xl font-heading font-bold text-white">{unit.unitNumber}</span>
                      <span className="text-xs text-white/40 font-medium">{unit.unitType || "Standard"}</span>
                      <UnitStatusBadge status={unit.status} />
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

function UnitStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OCCUPIED: "bg-green-500/10 text-green-400 border-green-500/20",
    VACANT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    UNDER_MAINTENANCE: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    RESERVED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider mt-1 ${styles[status] || styles.VACANT}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
