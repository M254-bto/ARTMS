"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Search, Filter, Mail, Phone } from "lucide-react";
import api from "@/lib/api";
import { AddTenantDialog } from "@/components/tenants/add-tenant-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchTenants() {
      try {
        const { data } = await api.get("/tenants");
        setTenants(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTenants();
  }, []);

  const filtered = tenants.filter(t => 
    t.user?.firstName.toLowerCase().includes(search.toLowerCase()) || 
    t.user?.lastName.toLowerCase().includes(search.toLowerCase()) ||
    t.unit?.unitNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Tenants</h1>
          <p className="text-white/50 mt-1">Manage tenant records and leases.</p>
        </div>
        <AddTenantDialog />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input 
            placeholder="Search by name or unit..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-black/40 border-white/10 text-white"
          />
        </div>
        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {/* Table Area */}
      <Card className="bg-black/40 border-white/5 backdrop-blur-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full bg-white/5" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-heading font-medium text-white mb-2">No tenants found</h3>
            <p className="text-white/50 max-w-sm">No tenant records match your current search criteria.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-white/[0.02] border-b border-white/5">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-white/40 font-medium">Tenant Name</TableHead>
                <TableHead className="text-white/40 font-medium">Contact</TableHead>
                <TableHead className="text-white/40 font-medium">Property</TableHead>
                <TableHead className="text-white/40 font-medium">Unit</TableHead>
                <TableHead className="text-white/40 font-medium">Lease Status</TableHead>
                <TableHead className="text-right text-white/40 font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tenant) => (
                <TableRow key={tenant.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                        {tenant.user?.firstName?.[0]}{tenant.user?.lastName?.[0]}
                      </div>
                      <span className="font-medium text-white">
                        {tenant.user?.firstName} {tenant.user?.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-white/70">
                        <Mail className="w-3 h-3 text-white/40" /> {tenant.user?.email}
                      </div>
                      {tenant.user?.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-white/70">
                          <Phone className="w-3 h-3 text-white/40" /> {tenant.user?.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-white/70">{tenant.unit?.property?.name || 'Unassigned'}</TableCell>
                  <TableCell>
                    {tenant.unit ? (
                       <Badge variant="outline" className="border-white/10 text-white bg-white/5">
                         Unit {tenant.unit.unitNumber}
                       </Badge>
                    ) : (
                      <span className="text-white/30 text-xs">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {tenant.leases && tenant.leases.length > 0 ? (
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 font-normal">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="border-white/10 text-white/40 font-normal">No Active Lease</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/tenants/${tenant.id}`} className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium h-7 px-3 rounded-md text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors">
                      View Profile
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
