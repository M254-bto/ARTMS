"use client";

import { useEffect, useState } from "react";
import { Wrench, CheckCircle2, Clock, AlertCircle, PlayCircle, Plus, User, FileText, Settings, ArrowRight, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function MaintenancePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog & Progression Form state
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [status, setStatus] = useState("SUBMITTED");
  const [note, setNote] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/maintenance");
      setRequests(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load maintenance requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenDetailModal = (request: any) => {
    setSelectedRequest(request);
    setStatus(request.status);
    setAssignedTo(request.assignedTo || "");
    setNote("");
    setModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    try {
      setIsUpdating(true);
      await api.patch(`/maintenance/${selectedRequest.id}/status`, {
        status,
        note: note || `Status transitioned to ${status.replace("_", " ")}`,
        assignedTo: assignedTo || undefined,
      });

      toast.success("Maintenance progression saved successfully!");
      setModalOpen(false);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update maintenance request");
    } finally {
      setIsUpdating(false);
    }
  };

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
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-1 items-start">
          {statuses.map(statusCol => (
            <div key={statusCol.id} className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className={`font-heading font-semibold flex items-center gap-2 ${statusCol.color}`}>
                  <statusCol.icon className="w-4 h-4" /> {statusCol.label}
                </h3>
                <Badge variant="outline" className="border-white/10 text-white/50">
                  {requests.filter(r => r.status === statusCol.id).length}
                </Badge>
              </div>
              
              <div className="space-y-4 flex-1">
                {requests.filter(r => r.status === statusCol.id).length === 0 ? (
                  <div className="p-8 border border-white/5 border-dashed rounded-xl bg-white/[0.01] flex items-center justify-center text-white/30 text-sm">
                    No requests
                  </div>
                ) : (
                  requests.filter(r => r.status === statusCol.id).map(request => (
                    <Card 
                      key={request.id} 
                      onClick={() => handleOpenDetailModal(request)}
                      className="bg-black/40 border-white/5 backdrop-blur-xl hover:border-white/20 transition-colors cursor-pointer group"
                    >
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

      {/* REQUEST DETAIL & PROGRESSION DIALOG */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-white/10 text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" /> Request Progression
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Manage status milestones and assign caretakers for maintenance reports.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <form onSubmit={handleUpdateStatus} className="space-y-4 mt-4">
              {/* Request Info Card */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/40">Tenant</span>
                  <span className="font-medium text-white">
                    {selectedRequest.tenant?.user?.firstName} {selectedRequest.tenant?.user?.lastName} (Unit {selectedRequest.unit?.unitNumber})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Category</span>
                  <Badge variant="outline" className="border-white/10 text-white capitalize text-[10px]">
                    {selectedRequest.category.toLowerCase()}
                  </Badge>
                </div>
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <span className="text-white/40 text-xs">Description of Issue</span>
                  <p className="text-white/80 leading-relaxed bg-black/40 p-2.5 rounded border border-white/5 text-xs">
                    {selectedRequest.description}
                  </p>
                </div>
              </div>

              {/* Progress Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Update Status</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 text-white h-9 px-3 rounded-md text-sm outline-none focus:border-primary/50"
                    required
                  >
                    <option value="SUBMITTED">Submitted</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Assign Caretaker / Staff</Label>
                  <Input
                    placeholder="e.g. John (Plumber)"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="bg-black/50 border-white/10 text-white h-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Status Update Note</Label>
                <textarea
                  placeholder="Explain the latest action (e.g. booked appointment, replacement parts ordered)..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full bg-black/50 border border-white/10 text-white p-3 rounded-md text-sm outline-none focus:border-primary/50 resize-none text-xs"
                />
              </div>

              <DialogFooter className="mt-6 pt-4 border-t border-white/10 gap-2 sm:gap-0">
                <DialogClose render={
                  <Button type="button" variant="ghost" className="text-white/70 hover:text-white">Cancel</Button>
                } />
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                  disabled={isUpdating}
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Save Progression
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
