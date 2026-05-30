"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Plus, Search, MapPin, DoorClosed, MoreVertical } from "lucide-react";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchProperties() {
      try {
        const { data } = await api.get("/properties");
        setProperties(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProperties();
  }, []);

  const filtered = properties.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Properties</h1>
          <p className="text-white/50 mt-1">Manage your apartment buildings and units.</p>
        </div>
        <Button className="bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          Add Property
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input 
            placeholder="Search properties..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-black/40 border-white/10 text-white"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-64 bg-white/5 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-white/5 rounded-2xl bg-white/[0.02] border-dashed">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-xl font-heading font-medium text-white mb-2">No properties found</h3>
          <p className="text-white/50 max-w-sm">You haven't added any properties yet, or none match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((property) => (
            <Card key={property.id} className="bg-black/40 border-white/5 backdrop-blur-xl group hover:border-primary/50 transition-colors overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-primary/20 to-black/0 relative">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <button className="h-8 w-8 inline-flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    } />
                    <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-white">
                      <DropdownMenuItem>Edit Property</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400">Archive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <CardContent className="p-6 pt-4 relative">
                <div className="absolute -top-10 left-6 w-16 h-16 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center shadow-xl">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                
                <div className="mt-8">
                  <Link href={`/dashboard/properties/${property.id}`} className="hover:underline decoration-primary">
                    <h3 className="text-xl font-heading font-semibold text-white tracking-tight">{property.name}</h3>
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-white/50 mt-2">
                    <MapPin className="w-4 h-4" />
                    {property.location}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/70">
                      <DoorClosed className="w-4 h-4 text-primary" />
                      <span className="font-medium">{property._count.units} Units</span>
                    </div>
                    
                    <Link href={`/dashboard/properties/${property.id}`} className="text-primary hover:underline underline-offset-4 text-sm font-medium inline-flex items-center justify-center">
                      View Details →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
