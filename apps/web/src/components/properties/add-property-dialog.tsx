"use client";

import { useState } from "react";
import {
  Plus, Minus, Loader2, Building2, MapPin, AlignLeft,
  Check, ChevronLeft, ChevronRight, Layers, DoorOpen,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Unit type definitions ─────────────────────────────────────────────────

const UNIT_TYPES = [
  { key: "BEDSITTER", label: "Bedsitter / Studio", short: "BS", desc: "Open plan, no separate bedroom" },
  { key: "1BED", label: "1 Bedroom", short: "1B", desc: "Living room + 1 bedroom" },
  { key: "2BED", label: "2 Bedrooms", short: "2B", desc: "Living room + 2 bedrooms" },
  { key: "3BED", label: "3 Bedrooms", short: "3B", desc: "Living room + 3 bedrooms" },
  { key: "4BED", label: "4 Bedrooms", short: "4B", desc: "Living room + 4 bedrooms" },
  { key: "PENTHOUSE", label: "Penthouse", short: "PH", desc: "Top-floor luxury unit" },
  { key: "SHOP", label: "Shop / Commercial", short: "SH", desc: "Ground-floor commercial space" },
] as const;

type UnitTypeKey = typeof UNIT_TYPES[number]["key"];

interface UnitConfig {
  count: number;
  monthlyRent: number;
  depositAmount: number;
}

type UnitConfigs = Partial<Record<UnitTypeKey, UnitConfig>>;

interface AddPropertyDialogProps {
  onSuccess?: () => void;
}

// ─── Step indicator ────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 }) {
  const steps = [
    { n: 1, label: "Property Details" },
    { n: 2, label: "Configure Units" },
  ];
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
              step === s.n
                ? "bg-primary border-primary text-primary-foreground shadow-[0_0_12px_rgba(var(--primary),0.5)]"
                : step > s.n
                ? "bg-primary/20 border-primary text-primary"
                : "bg-white/5 border-white/10 text-white/30"
            }`}>
              {step > s.n ? <Check className="w-4 h-4" /> : s.n}
            </div>
            <span className={`text-xs font-medium whitespace-nowrap ${step >= s.n ? "text-white/80" : "text-white/30"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px flex-1 mx-3 mb-5 transition-all duration-500 ${step > 1 ? "bg-primary/40" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main dialog component ─────────────────────────────────────────────────

export function AddPropertyDialog({ onSuccess }: AddPropertyDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 state
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<UnitTypeKey>>(new Set());

  // Step 2 state
  const [unitConfigs, setUnitConfigs] = useState<UnitConfigs>({});

  function resetAll() {
    setStep(1);
    setName("");
    setLocation("");
    setDescription("");
    setSelectedTypes(new Set());
    setUnitConfigs({});
  }

  function handleOpenChange(o: boolean) {
    setOpen(o);
    if (!o) resetAll();
  }

  function toggleType(key: UnitTypeKey) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        setUnitConfigs((c) => { const copy = { ...c }; delete copy[key]; return copy; });
      } else {
        next.add(key);
        setUnitConfigs((c) => ({
          ...c,
          [key]: c[key] ?? { count: 1, monthlyRent: 0, depositAmount: 0 },
        }));
      }
      return next;
    });
  }

  function updateConfig(key: UnitTypeKey, field: keyof UnitConfig, value: number) {
    setUnitConfigs((c) => ({
      ...c,
      [key]: { ...(c[key] ?? { count: 1, monthlyRent: 0, depositAmount: 0 }), [field]: value },
    }));
  }

  function canProceed() {
    return name.trim().length > 0 && location.trim().length > 0 && selectedTypes.size > 0;
  }

  async function handleFinish() {
    // Validate configs
    for (const key of Array.from(selectedTypes)) {
      const cfg = unitConfigs[key];
      if (!cfg || cfg.count < 1) return toast.error(`Please enter a valid count for ${UNIT_TYPES.find(t => t.key === key)?.label}`);
      if (cfg.monthlyRent <= 0) return toast.error(`Please enter monthly rent for ${UNIT_TYPES.find(t => t.key === key)?.label}`);
    }

    try {
      setIsLoading(true);

      // 1. Create the property
      const { data: property } = await api.post("/properties", {
        name: name.trim(),
        location: location.trim(),
        description: description.trim() || undefined,
      });

      // 2. Build all units from configs
      const units: object[] = [];
      let unitCounter = 1;

      for (const key of Array.from(selectedTypes)) {
        const cfg = unitConfigs[key]!;
        const typeDef = UNIT_TYPES.find((t) => t.key === key)!;
        for (let i = 0; i < cfg.count; i++) {
          units.push({
            unitNumber: `${typeDef.short}-${String(unitCounter).padStart(2, "0")}`,
            unitType: typeDef.label,
            monthlyRent: cfg.monthlyRent,
            depositAmount: cfg.depositAmount,
          });
          unitCounter++;
        }
      }

      // 3. Bulk create units
      if (units.length > 0) {
        await api.post("/units/bulk", { propertyId: property.id, units });
      }

      toast.success(`Property "${property.name}" created with ${units.length} unit${units.length !== 1 ? "s" : ""}!`);
      setOpen(false);
      resetAll();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create property");
    } finally {
      setIsLoading(false);
    }
  }

  const selectedTypesList = UNIT_TYPES.filter((t) => selectedTypes.has(t.key));
  const totalUnits = selectedTypesList.reduce((s, t) => s + (unitConfigs[t.key]?.count ?? 0), 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={
        <Button className="bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> Add Property
        </Button>
      } />

      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[600px] bg-zinc-950 border-white/10 text-white p-6 overflow-y-auto max-h-[90vh]"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-heading flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-primary" />
            {step === 1 ? "Add New Property" : "Configure Units"}
          </DialogTitle>
          <p className="text-white/40 text-sm">
            {step === 1
              ? "Enter the property details and select the types of units available."
              : "Specify how many of each unit type exist and set pricing."}
          </p>
        </DialogHeader>

        <StepIndicator step={step} />

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label className="text-white/70 flex items-center gap-1.5 text-sm">
                <Building2 className="w-3.5 h-3.5 text-primary/70" /> Property Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Oakwood Heights"
                className="bg-black/50 border-white/10 text-white h-9 focus:border-primary/50"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="text-white/70 flex items-center gap-1.5 text-sm">
                <MapPin className="w-3.5 h-3.5 text-primary/70" /> Location
              </Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kilimani, Nairobi"
                className="bg-black/50 border-white/10 text-white h-9 focus:border-primary/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-white/70 flex items-center gap-1.5 text-sm">
                <AlignLeft className="w-3.5 h-3.5 text-primary/70" /> Description
                <span className="text-white/30 font-normal">(optional)</span>
              </Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the property..."
                rows={2}
                className="w-full bg-black/50 border border-white/10 text-white p-3 rounded-md text-sm outline-none focus:border-primary/50 resize-none"
              />
            </div>

            {/* Room type selection */}
            <div className="space-y-3">
              <Label className="text-white/70 flex items-center gap-1.5 text-sm">
                <Layers className="w-3.5 h-3.5 text-primary/70" /> Unit Types Available
                <span className="text-white/30 font-normal">(select all that apply)</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {UNIT_TYPES.map((type) => {
                  const selected = selectedTypes.has(type.key);
                  return (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => toggleType(type.key)}
                      className={`relative text-left p-3 rounded-xl border transition-all duration-200 group ${
                        selected
                          ? "bg-primary/10 border-primary/60 shadow-[0_0_12px_rgba(var(--primary),0.15)]"
                          : "bg-white/[0.02] border-white/8 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className={`absolute top-2.5 right-2.5 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        selected ? "border-primary bg-primary" : "border-white/20"
                      }`}>
                        {selected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded mb-1.5 inline-block ${
                        selected ? "bg-primary/20 text-primary" : "bg-white/5 text-white/40"
                      }`}>
                        {type.short}
                      </span>
                      <p className={`text-sm font-semibold ${selected ? "text-white" : "text-white/60"}`}>
                        {type.label}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5">{type.desc}</p>
                    </button>
                  );
                })}
              </div>
              {selectedTypes.size === 0 && (
                <p className="text-xs text-amber-400/70 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-amber-400/70 rounded-full" /> Select at least one unit type to continue
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Summary of step 1 — editable chip */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-white/80 text-sm font-medium">{name}</span>
              <span className="text-white/30">·</span>
              <span className="text-white/50 text-sm">{location}</span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="ml-auto text-xs text-primary/70 hover:text-primary transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3 h-3" /> Edit
              </button>
            </div>

            <p className="text-xs text-white/40 flex items-center gap-1.5">
              <DoorOpen className="w-3.5 h-3.5" />
              Set the quantity and pricing for each unit type. Unit numbers will be auto-generated.
            </p>

            {/* Per-type config rows */}
            <div className="space-y-3">
              {selectedTypesList.map((type) => {
                const cfg = unitConfigs[type.key] ?? { count: 1, monthlyRent: 0, depositAmount: 0 };
                return (
                  <div key={type.key} className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 bg-primary/5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/20 text-primary">
                        {type.short}
                      </span>
                      <span className="text-sm font-semibold text-white">{type.label}</span>
                      <span className="ml-auto text-xs text-white/30">{cfg.count} unit{cfg.count !== 1 ? "s" : ""}</span>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4">
                      {/* Count */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/40 uppercase tracking-wider">Number of Units</label>
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-lg"
                            className="bg-black/50 border-white/10 hover:bg-white/10 text-white shrink-0"
                            onClick={() => updateConfig(type.key, "count", Math.max(1, cfg.count - 1))}
                            disabled={cfg.count <= 1}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </Button>
                          <Input
                            type="number"
                            min={1}
                            max={999}
                            value={cfg.count || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                updateConfig(type.key, "count", 0);
                              } else {
                                const parsed = parseInt(val);
                                updateConfig(type.key, "count", isNaN(parsed) ? 0 : Math.min(999, Math.max(0, parsed)));
                              }
                            }}
                            className="bg-black/50 border-white/10 text-white h-9 text-sm focus:border-primary/50 text-center flex-1 min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-lg"
                            className="bg-black/50 border-white/10 hover:bg-white/10 text-white shrink-0"
                            onClick={() => updateConfig(type.key, "count", Math.min(999, cfg.count + 1))}
                            disabled={cfg.count >= 999}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Monthly Rent */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/40 uppercase tracking-wider">Monthly Rent (KES)</label>
                        <Input
                          type="number"
                          min={0}
                          value={cfg.monthlyRent || ""}
                          onChange={(e) => updateConfig(type.key, "monthlyRent", parseFloat(e.target.value) || 0)}
                          placeholder="e.g. 25000"
                          className="bg-black/50 border-white/10 text-white h-9 text-sm focus:border-primary/50"
                        />
                      </div>

                      {/* Deposit */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/40 uppercase tracking-wider">Deposit (KES)</label>
                        <Input
                          type="number"
                          min={0}
                          value={cfg.depositAmount || ""}
                          onChange={(e) => updateConfig(type.key, "depositAmount", parseFloat(e.target.value) || 0)}
                          placeholder="e.g. 50000"
                          className="bg-black/50 border-white/10 text-white h-9 text-sm focus:border-primary/50"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total summary */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary/5 border border-primary/20">
              <span className="text-sm text-white/60">Total Units to Create</span>
              <span className="text-2xl font-heading font-bold text-primary">{totalUnits}</span>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
          {step === 1 ? (
            <DialogClose render={<Button variant="ghost" className="text-white/50 hover:text-white">Cancel</Button>} />
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="text-white/60 hover:text-white gap-1.5"
              onClick={() => setStep(1)}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          )}

          {step === 1 ? (
            <Button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canProceed()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 disabled:opacity-40"
            >
              Next: Configure Units <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFinish}
              disabled={isLoading || totalUnits === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
              ) : (
                <><Check className="w-4 h-4" /> Create Property</>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
