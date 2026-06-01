"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Wrench, Calendar, Clock, CheckCircle2, AlertCircle, Plus, Send, ClipboardList, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function MyMaintenancePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submit request form states
  const [category, setCategory] = useState("PLUMBING");
  const [description, setDescription] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const fetchProfile = () => {
    setIsLoading(true);
    api.get("/tenants/me")
      .then(({ data }) => setProfile(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-white/5 rounded-lg" />
        <div className="h-96 bg-white/5 rounded-xl border border-white/5" />
      </div>
    );
  }

  const requests = profile?.maintenanceRequests ?? [];

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return toast.error("Please enter a description");
    if (!profile?.id || !profile?.unitId) return toast.error("Profile or Unit is not loaded correctly");

    try {
      setIsSubmitting(true);
      await api.post("/maintenance", {
        tenantId: profile.id,
        unitId: profile.unitId,
        category,
        description,
      });

      toast.success("Maintenance request submitted successfully! Staff will be assigned shortly.");
      setModalOpen(false);
      setDescription("");
      fetchProfile();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Maintenance Requests</h1>
          <p className="text-white/50 mt-1">Submit new maintenance repair logs and track status updates.</p>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger render={
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
              <Plus className="w-4 h-4" /> New Request
            </Button>
          } />
          <DialogContent className="sm:max-w-[450px] bg-zinc-950 border-white/10 text-white p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-heading flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" /> Log Repair Request
              </DialogTitle>
              <DialogDescription className="text-white/50">
                Describe the maintenance or repair issue needed in your unit.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitRequest} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-white/70">Category</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-white h-9 px-3 rounded-md text-sm outline-none focus:border-primary/50"
                  required
                >
                  <option value="PLUMBING">Plumbing</option>
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="SECURITY">Security</option>
                  <option value="CLEANING">Cleaning</option>
                  <option value="STRUCTURAL">Structural</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Issue Description</Label>
                <textarea
                  placeholder="Describe the issue in detail (e.g. leaking sink under kitchen cabinet)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-black/50 border border-white/10 text-white p-3 rounded-md text-sm outline-none focus:border-primary/50 resize-none"
                  required
                />
              </div>

              <DialogFooter className="mt-6 pt-4 border-t border-white/10 gap-2 sm:gap-0">
                <DialogClose render={
                  <Button type="button" variant="ghost" className="text-white/70 hover:text-white">Cancel</Button>
                } />
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Request Log */}
        <Card className="lg:col-span-2 bg-black/40 border-white/5 backdrop-blur-xl p-6">
          <h3 className="text-lg font-heading font-bold text-white mb-6 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" /> Repair Records
          </h3>

          {requests.length === 0 ? (
            <div className="py-24 text-center text-white/40 space-y-3">
              <Wrench className="w-12 h-12 text-white/10 mx-auto" />
              <p className="text-base font-medium">No maintenance requests submitted yet</p>
              <p className="text-sm text-white/30 max-w-xs mx-auto">Click &ldquo;New Request&rdquo; to log any repairs or maintenance problems in your unit.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((r: any) => (
                <div 
                  key={r.id}
                  className="p-5 bg-white/[0.02] border border-white/5 rounded-xl space-y-4 hover:bg-white/[0.03] transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-white/40 uppercase tracking-wider">{r.category}</span>
                      <h4 className="text-white font-medium text-base mt-0.5 capitalize">
                        {r.category.toLowerCase()} maintenance
                      </h4>
                    </div>
                    <Badge className={
                      r.status === "RESOLVED" || r.status === "CLOSED" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                      r.status === "IN_PROGRESS" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                      r.status === "ASSIGNED" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    }>
                      {r.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <p className="text-white/70 text-sm leading-relaxed">&ldquo;{r.description}&rdquo;</p>

                  <div className="pt-3 border-t border-white/5 flex flex-wrap justify-between items-center text-xs text-white/50 gap-2">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Submitted {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                    {r.assignedTo && (
                      <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/80">
                        Assigned: {r.assignedTo}
                      </span>
                    )}
                  </div>

                  {/* Updates Log */}
                  {r.updates && r.updates.length > 0 && (
                    <div className="mt-3 p-3 bg-black/30 border border-white/5 rounded-lg space-y-2">
                      <p className="text-xs text-primary font-bold flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" /> Latest Update
                      </p>
                      {r.updates.map((update: any) => (
                        <div key={update.id} className="text-xs">
                          <p className="text-white/80">{update.note}</p>
                          <span className="text-[10px] text-white/40">{new Date(update.createdAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Informative Sidebar */}
        <div className="space-y-6">
          <Card className="bg-black/40 border-white/5 backdrop-blur-xl p-6 space-y-4">
            <h3 className="text-lg font-heading font-bold text-white">Guidelines</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              For any urgent concerns, like electrical sparking or bursting water pipes, please log the request immediately and contact emergency support desk.
            </p>
            <div className="pt-2 border-t border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/40">Status: Submitted</span>
                <span className="text-yellow-400">Awaiting Assignment</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Status: Assigned</span>
                <span className="text-blue-400">Caretaker Scheduled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Status: Resolved</span>
                <span className="text-green-400">Repair Complete</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return <Clock className={`animate-spin ${className}`} />;
}
