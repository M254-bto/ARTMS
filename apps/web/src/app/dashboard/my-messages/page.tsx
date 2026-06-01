"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { MessageSquare, Calendar, Megaphone, Bell, User, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyMessagesPage() {
  const [profile, setProfile] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const { data: profileData } = await api.get("/tenants/me");
        setProfile(profileData);
        
        const propertyId = profileData?.unit?.propertyId;
        if (propertyId) {
          setIsLoadingAnnouncements(true);
          const { data: announcementData } = await api.get(`/announcements/property/${propertyId}`);
          setAnnouncements(announcementData);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setIsLoading(false);
        setIsLoadingAnnouncements(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-white/5 rounded-lg" />
        <div className="h-96 bg-white/5 rounded-xl border border-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Announcements</h1>
        <p className="text-white/50 mt-1">Official broadcast updates from your property owner or manager.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Announcements Feed */}
        <div className="lg:col-span-2 space-y-6">
          {isLoadingAnnouncements ? (
            <div className="space-y-4">
              {[1, 2].map(i => <Skeleton key={i} className="h-44 w-full bg-white/5 rounded-xl" />)}
            </div>
          ) : announcements.length === 0 ? (
            <Card className="bg-black/40 border-white/5 backdrop-blur-xl py-24 text-center text-white/40 space-y-3">
              <Megaphone className="w-12 h-12 text-white/10 mx-auto" />
              <p className="text-base font-medium">No announcements yet</p>
              <p className="text-sm text-white/30 max-w-xs mx-auto">There are no property-wide announcements posted by the administration yet.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {announcements.map((a) => (
                <Card key={a.id} className="bg-black/40 border-white/5 backdrop-blur-xl hover:border-white/10 transition-all overflow-hidden relative group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-lg font-heading font-bold text-white">{a.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-white/40">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> 
                            {new Date(a.createdAt).toLocaleDateString(undefined, {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> 
                            {a.author ? `${a.author.firstName} ${a.author.lastName}` : "Property Manager"}
                          </span>
                        </div>
                      </div>
                      <span className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Bell className="w-4 h-4" />
                      </span>
                    </div>

                    <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                      {a.body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Info Card */}
        <div>
          <Card className="bg-black/40 border-white/5 backdrop-blur-xl p-6 space-y-4">
            <h3 className="text-lg font-heading font-bold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" /> Info Desk
            </h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Official messages published here reflect general house notices, security updates, utility schedules, or urgent maintenance closures for the apartment building.
            </p>
            <p className="text-xs text-white/40 leading-relaxed italic">
              Please contact management directly if you have specific individual concerns.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
