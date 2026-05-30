"use client";

import { useEffect, useState } from "react";
import { Megaphone, Plus, Search, Mail, MessageSquare } from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const propRes = await api.get("/properties");
        setProperties(propRes.data);
        
        // Fetch announcements for the first property or all if supported
        if (propRes.data.length > 0) {
           const { data } = await api.get(`/announcements/property/${propRes.data[0].id}`);
           setAnnouncements(data);
        }
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
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Announcements</h1>
          <p className="text-white/50 mt-1">Communicate with tenants via email and WhatsApp.</p>
        </div>
        <Button className="bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> New Message
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full bg-white/5" />
              <Skeleton className="h-40 w-full bg-white/5" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-white/5 rounded-2xl bg-white/[0.02] border-dashed text-center">
               <Megaphone className="w-8 h-8 text-white/20 mb-4" />
               <h3 className="text-xl font-heading font-medium text-white mb-2">No announcements</h3>
               <p className="text-white/50">You haven't sent any messages to this property yet.</p>
            </div>
          ) : (
            announcements.map(ann => (
              <Card key={ann.id} className="bg-black/40 border-white/5 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-heading font-semibold text-white">{ann.title}</h3>
                    <span className="text-xs text-white/40">{format(new Date(ann.createdAt), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                  <p className="text-white/70 text-sm whitespace-pre-wrap leading-relaxed">
                    {ann.body}
                  </p>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/50">Sent by {ann.author?.firstName} {ann.author?.lastName}</span>
                    <div className="flex items-center gap-2">
                      {ann.sentViaEmail && <Badge variant="outline" className="border-white/10 text-white/60 gap-1"><Mail className="w-3 h-3" /> Email</Badge>}
                      {ann.sentViaWhatsapp && <Badge variant="outline" className="border-green-500/20 text-green-400 bg-green-500/10 gap-1"><MessageSquare className="w-3 h-3" /> WhatsApp</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div>
          <Card className="bg-black/40 border-white/5 backdrop-blur-xl sticky top-8">
             <CardHeader>
               <CardTitle className="text-white font-heading text-lg">Filters</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div>
                 <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Select Property</label>
                 <select className="w-full bg-black/50 border border-white/10 rounded-md h-10 px-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none">
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                 </select>
               </div>
               <div className="pt-4 border-t border-white/5">
                 <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Search</label>
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                   <Input className="pl-9 bg-black/50 border-white/10 text-white h-10 text-sm" placeholder="Search keywords..." />
                 </div>
               </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
