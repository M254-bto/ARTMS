"use client";

import { useEffect, useState } from "react";
import { Wrench, CheckCircle2, Clock, AlertCircle, PlayCircle, Plus } from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MaintenancePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const { data } = await api.get("/maintenance");
        setRequests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const statuses = [
    { id: "SUBMITTED", label: "Submitted", icon: AlertCircle, color: "text-red-400" },
    { id: "ASSIGNED", label: "Assigned", icon: Clock, color: "text-yellow-400" },
    { id: "IN_PROGRESS", label: "In Progress", icon: PlayCircle, color: "text-blue-400" },
    { id: "RESOLVED", label: "Resolved", icon: CheckCircle2, color: "text-green-400" },
  ];

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Maintenance</h1>
          <p className="text-white/50 mt-1">Track and manage tenant maintenance requests.</p>
        </div>
        <Button className="bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> New Request
        </Button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-1 items-start">
          {statuses.map(status => (
            <div key={status.id} className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className={`font-heading font-semibold flex items-center gap-2 ${status.color}`}>
                  <status.icon className="w-4 h-4" /> {status.label}
                </h3>
                <Badge variant="outline" className="border-white/10 text-white/50">
                  {requests.filter(r => r.status === status.id).length}
                </Badge>
              </div>
              
              <div className="space-y-4 flex-1">
                {requests.filter(r => r.status === status.id).length === 0 ? (
                  <div className="p-8 border border-white/5 border-dashed rounded-xl bg-white/[0.01] flex items-center justify-center text-white/30 text-sm">
                    No requests
                  </div>
                ) : (
                  requests.filter(r => r.status === status.id).map(request => (
                    <Card key={request.id} className="bg-black/40 border-white/5 backdrop-blur-xl hover:border-white/20 transition-colors cursor-pointer group">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-sm bg-primary/10">
                            {request.category}
                          </span>
                          <span className="text-xs text-white/40 whitespace-nowrap">
                            {format(new Date(request.createdAt), 'MMM d')}
                          </span>
                        </div>
                        <p className="text-sm text-white/90 line-clamp-3">
                          {request.description}
                        </p>
                        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
                          <span>Unit {request.unit?.unitNumber}</span>
                          <span className="truncate max-w-[100px]">{request.tenant?.user?.firstName}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
