"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Megaphone, Mail, MessageSquare, Building2, Type, AlignLeft } from "lucide-react";
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

interface AddAnnouncementDialogProps {
  propertiesList?: any[];
  onSuccess?: (propertyId: string) => void;
  defaultPropertyId?: string;
}

export function AddAnnouncementDialog({ propertiesList, onSuccess, defaultPropertyId }: AddAnnouncementDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>(propertiesList || []);
  const [propertyId, setPropertyId] = useState(defaultPropertyId || "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sendViaEmail, setSendViaEmail] = useState(false);
  const [sendViaWhatsapp, setSendViaWhatsapp] = useState(false);

  // Fetch properties if not provided and dialog opens
  useEffect(() => {
    if (open && (!propertiesList || propertiesList.length === 0)) {
      api.get("/properties")
        .then((res) => {
          setProperties(res.data);
          if (res.data.length > 0 && !propertyId) {
            setPropertyId(res.data[0].id);
          }
        })
        .catch((err) => {
          console.error("Failed to load properties", err);
          toast.error("Failed to load properties for announcement");
        });
    }
  }, [open, propertiesList, propertyId]);

  // Handle default property ID change when list loads
  useEffect(() => {
    if (defaultPropertyId) {
      setPropertyId(defaultPropertyId);
    } else if (properties.length > 0 && !propertyId) {
      setPropertyId(properties[0].id);
    }
  }, [defaultPropertyId, properties]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!propertyId) return toast.error("Please select a property");
    if (!title.trim()) return toast.error("Announcement title is required");
    if (!body.trim()) return toast.error("Announcement body is required");

    try {
      setIsLoading(true);
      await api.post("/announcements", {
        propertyId,
        title: title.trim(),
        body: body.trim(),
        sendViaEmail,
        sendViaWhatsapp,
      });

      toast.success("Announcement published successfully!");
      setOpen(false);
      
      // Reset form
      setTitle("");
      setBody("");
      setSendViaEmail(false);
      setSendViaWhatsapp(false);

      if (onSuccess) {
        onSuccess(propertyId);
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to publish announcement");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> New Message
        </Button>
      } />
      <DialogContent className="sm:max-w-[550px] bg-zinc-950 border-white/10 text-white p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary animate-pulse" />
            New Announcement
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Publish an announcement to all tenants residing in the selected property.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-white/70 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary/70" />
              Target Property
            </Label>
            <select
              className="w-full bg-black/50 border border-white/10 text-white h-9 px-3 rounded-md text-sm outline-none focus:border-primary/50"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              required
            >
              <option value="">Select a property...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.location})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-white/70 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-primary/70" />
              Title / Subject
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scheduled Water Interruption"
              className="bg-black/50 border-white/10 text-white h-9 focus:border-primary/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/70 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-primary/70" />
              Message Body
            </Label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the details of your announcement here..."
              className="w-full min-h-[120px] bg-black/50 border border-white/10 text-white p-3 rounded-md text-sm outline-none focus:border-primary/50 resize-none font-sans"
              required
            />
          </div>

          <div className="pt-2">
            <Label className="text-white/50 text-xs uppercase tracking-wider block mb-3">
              Delivery Channels
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] transition-colors">
                <input
                  type="checkbox"
                  checked={sendViaEmail}
                  onChange={(e) => setSendViaEmail(e.target.checked)}
                  className="rounded border-white/10 bg-black text-primary focus:ring-primary w-4 h-4"
                />
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span>Send via Email</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] transition-colors">
                <input
                  type="checkbox"
                  checked={sendViaWhatsapp}
                  onChange={(e) => setSendViaWhatsapp(e.target.checked)}
                  className="rounded border-white/10 bg-black text-primary focus:ring-primary w-4 h-4"
                />
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Send via WhatsApp</span>
                </div>
              </label>
            </div>
          </div>

          <DialogFooter className="mt-6 pt-4 border-t border-white/10 gap-2 sm:gap-0">
            <DialogClose render={<Button variant="ghost" className="text-white/70 hover:text-white">Cancel</Button>} />
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Publish Announcement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
