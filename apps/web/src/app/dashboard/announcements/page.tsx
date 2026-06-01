"use client";

import { useEffect, useState } from "react";
import { Megaphone, Search, Mail, MessageSquare } from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AddAnnouncementDialog } from "@/components/announcements/add-announcement-dialog";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function fetchAnnouncements(propId: string) {
    if (!propId) return;
    try {
      setIsAnnouncementsLoading(true);
      const { data } = await api.get(`/announcements/property/${propId}`);
      setAnnouncements(data);
    } catch (err) {
      console.error("Failed to load announcements for property", err);
    } finally {
      setIsAnnouncementsLoading(false);
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const propRes = await api.get("/properties");
        setProperties(propRes.data);
        
        if (propRes.data.length > 0) {
           const firstPropId = propRes.data[0].id;
           setSelectedPropertyId(firstPropId);
           await fetchAnnouncements(firstPropId);
        }
      } catch (err) {
        console.error("Failed to fetch initial properties", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePropertyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propId = e.target.value;
    setSelectedPropertyId(propId);
    await fetchAnnouncements(propId);
  };

  const filteredAnnouncements = announcements.filter(ann => 
    ann.title.toLowerCase().includes(search.toLowerCase()) || 
    ann.body.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Announcements</h1>
          <p className="text-white/50 mt-1">Communicate with tenants via email and WhatsApp.</p>
        </div>
        <AddAnnouncementDialog 
          propertiesList={properties} 
          defaultPropertyId={selectedPropertyId} 
          onSuccess={async (propId) => {
            setSelectedPropertyId(propId);
            await fetchAnnouncements(propId);
          }} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {isLoading || isAnnouncementsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full bg-white/5" />
              <Skeleton className="h-40 w-full bg-white/5" />
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-white/5 rounded-2xl bg-white/[0.02] border-dashed text-center">
               <Megaphone className="w-8 h-8 text-white/20 mb-4" />
               <h3 className="text-xl font-heading font-medium text-white mb-2">No announcements</h3>
               <p className="text-white/50">You haven't sent any messages matching your criteria yet.</p>
            </div>
          ) : (
            filteredAnnouncements.map(ann => (
              <Card key={ann.id} className="bg-black/40 border-white/5 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-heading font-semibold text-white">{ann.title}</h3>
                    <span className="text-xs text-white/40">
                      {ann.createdAt ? format(new Date(ann.createdAt), 'MMM d, yyyy HH:mm') : ""}
                    </span>
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
                 <select 
                   className="w-full bg-black/50 border border-white/10 rounded-md h-10 px-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                   value={selectedPropertyId}
                   onChange={handlePropertyChange}
                 >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                 </select>
               </div>
               <div className="pt-4 border-t border-white/5">
                 <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Search</label>
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                   <Input 
                     className="pl-9 bg-black/50 border-white/10 text-white h-10 text-sm" 
                     placeholder="Search keywords..." 
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                   />
                 </div>
               </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
