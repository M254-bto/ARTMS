"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddTenantDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [unitId, setUnitId] = useState("");
  const [leaseStartDate, setLeaseStartDate] = useState("");
  const [rentDay, setRentDay] = useState("1");

  // Fetch properties when dialog opens
  useEffect(() => {
    if (open && properties.length === 0) {
      api.get("/properties")
        .then((res) => setProperties(res.data))
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load properties");
        });
    }
  }, [open, properties.length]);

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const vacantUnits = selectedProperty?.units?.filter((u: any) => u.status === "VACANT") || [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!unitId) return toast.error("Please select a unit");
    if (!leaseStartDate) return toast.error("Please select a lease start date");

    try {
      setIsLoading(true);
      await api.post("/tenants/invite", {
        firstName,
        lastName,
        email,
        phone,
        unitId,
        leaseStartDate,
        rentDay: parseInt(rentDay, 10) || 1,
      });
      
      toast.success("Tenant invited successfully!");
      setOpen(false);
      // Optional: force a refresh of the page or list
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to invite tenant");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" className="gap-2 text-white hover:bg-white/5 border-white/10">
          <Plus className="w-4 h-4" /> Add Tenant
        </Button>
      } />
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-white/10 text-white p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">Invite New Tenant</DialogTitle>
          <DialogDescription className="text-white/50">
            They will receive an email and WhatsApp message with a secure link to set up their account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70">Property</Label>
              <select
                className="w-full bg-black/50 border border-white/10 text-white h-9 px-3 rounded-md text-sm outline-none focus:border-primary/50"
                value={selectedPropertyId}
                onChange={(e) => {
                  setSelectedPropertyId(e.target.value);
                  setUnitId("");
                }}
                required
              >
                <option value="">Select Property...</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Unit (Vacant Only)</Label>
              <select
                className="w-full bg-black/50 border border-white/10 text-white h-9 px-3 rounded-md text-sm outline-none focus:border-primary/50"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                required
                disabled={!selectedPropertyId}
              >
                <option value="">Select Unit...</option>
                {vacantUnits.map((u: any) => (
                  <option key={u.id} value={u.id}>Unit {u.unitNumber} (KES {Number(u.monthlyRent).toLocaleString()})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70">First Name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-black/50 border-white/10 text-white h-9"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Last Name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-black/50 border-white/10 text-white h-9"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70">Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-white/10 text-white h-9"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Phone Number</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-black/50 border-white/10 text-white h-9"
                placeholder="+254..."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70">Lease Start Date</Label>
              <Input
                type="date"
                value={leaseStartDate}
                onChange={(e) => setLeaseStartDate(e.target.value)}
                className="bg-black/50 border-white/10 text-white h-9"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Rent Due Day (1-28)</Label>
              <Input
                type="number"
                min="1"
                max="28"
                value={rentDay}
                onChange={(e) => setRentDay(e.target.value)}
                className="bg-black/50 border-white/10 text-white h-9"
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-6 pt-4 border-t border-white/10 gap-2 sm:gap-0">
            <DialogClose render={<Button variant="ghost" className="text-white/70 hover:text-white">Cancel</Button>} />
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading || !unitId}
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Send Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
