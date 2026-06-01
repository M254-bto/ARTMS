"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { CreditCard, Calendar, CheckCircle2, Clock, AlertCircle, Plus, Send, Landmark, BadgeDollarSign, Loader2 } from "lucide-react";
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

export default function MyPaymentsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submit payment form states
  const [selectedCharge, setSelectedCharge] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [method, setMethod] = useState("MPESA");
  const [paymentDate, setPaymentDate] = useState("");
  const [notes, setNotes] = useState("");
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white/5 rounded-xl border border-white/5" />
          <div className="h-64 bg-white/5 rounded-xl border border-white/5" />
        </div>
      </div>
    );
  }

  const activeLease = profile?.leases?.[0];
  const rentCharges = activeLease?.rentCharges ?? [];
  
  // Outstanding charges (PENDING or OVERDUE)
  const pendingCharges = rentCharges.filter((c: any) => c.status === "PENDING" || c.status === "OVERDUE");
  const totalOwed = pendingCharges.reduce((sum: number, c: any) => sum + Number(c.amount), 0);

  // All payments logged across charges
  const allPayments: any[] = [];
  rentCharges.forEach((charge: any) => {
    if (charge.payments && charge.payments.length > 0) {
      charge.payments.forEach((payment: any) => {
        allPayments.push({
          ...payment,
          chargeMonth: charge.month,
          chargeYear: charge.year,
        });
      });
    }
  });
  
  // Sort payments by payment date desc
  allPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  const handleOpenPaymentModal = (charge: any) => {
    setSelectedCharge(charge);
    setAmount(Number(charge.amount).toString());
    setReferenceNumber("");
    setMethod("MPESA");
    setPaymentDate(new Date().toISOString().substring(0, 10));
    setNotes("");
    setModalOpen(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return toast.error("Please enter a valid amount");
    if (!paymentDate) return toast.error("Please enter payment date");

    try {
      setIsSubmitting(true);
      await api.post("/payments", {
        rentChargeId: selectedCharge.id,
        amount: Number(amount),
        paymentDate: new Date(paymentDate).toISOString(),
        referenceNumber: referenceNumber || undefined,
        method,
        notes: notes || undefined,
      });

      toast.success("Payment proof submitted successfully! Awaiting owner confirmation.");
      setModalOpen(false);
      fetchProfile();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Payments &amp; Billings</h1>
        <p className="text-white/50 mt-1">Submit payment receipts and view rent statement history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Outstanding Statement & Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Balance Card */}
          <Card className={`bg-black/40 border-white/5 backdrop-blur-xl relative overflow-hidden group ${totalOwed > 0 ? "ring-1 ring-red-500/20" : "ring-1 ring-green-500/20"}`}>
            <CardContent className="p-6">
              <h3 className="text-white/50 text-sm font-medium">Total Outstanding Balance</h3>
              <p className="text-3xl font-heading font-bold text-white mt-1">
                KES {totalOwed.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 mt-4">
                {totalOwed > 0 ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400 font-medium">You have {pendingCharges.length} unpaid bill{pendingCharges.length > 1 ? "s" : ""} due</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-400 font-medium">Your rent account is fully paid up!</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pending Invoices Table */}
          <Card className="bg-black/40 border-white/5 backdrop-blur-xl p-6">
            <h3 className="text-lg font-heading font-bold text-white mb-4">Outstanding Bills</h3>
            {pendingCharges.length === 0 ? (
              <div className="py-12 text-center text-white/40 space-y-3">
                <CheckCircle2 className="w-8 h-8 text-green-400/30 mx-auto" />
                <p className="text-sm">No outstanding charges found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingCharges.map((charge: any) => (
                  <div key={charge.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:bg-white/[0.04]">
                    <div>
                      <p className="text-white font-medium text-base">
                        Rent Charge — {new Date(charge.dueDate).toLocaleString("default", { month: "long", year: "numeric" })}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Due {new Date(charge.dueDate).toLocaleDateString()}
                        </span>
                        <Badge className={charge.status === "OVERDUE" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}>
                          {charge.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <span className="text-xl font-heading font-bold text-white">KES {Number(charge.amount).toLocaleString()}</span>
                      <Button
                        onClick={() => handleOpenPaymentModal(charge)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9 px-4 gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Log Payment
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Payment History Sidebar */}
        <div className="space-y-6">
          <Card className="bg-black/40 border-white/5 backdrop-blur-xl p-6">
            <h3 className="text-lg font-heading font-bold text-white mb-4">Payment Log</h3>
            {allPayments.length === 0 ? (
              <div className="py-12 text-center text-white/40">
                <p className="text-sm">No payments logged yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {allPayments.map((p: any) => (
                  <div key={p.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-white font-medium">Statement period</p>
                        <p className="text-[10px] text-white/40 mt-0.5">
                          {new Date(0, p.chargeMonth - 1).toLocaleString("default", { month: "short" })} {p.chargeYear}
                        </p>
                      </div>
                      <Badge className={
                        p.status === "CONFIRMED" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        p.status === "REJECTED" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }>
                        {p.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-end pt-1 border-t border-white/5">
                      <div className="text-[10px] text-white/50">
                        Ref: <span className="font-mono text-white/80">{p.referenceNumber ?? "None"}</span>
                      </div>
                      <span className="text-xs font-bold text-white">KES {Number(p.amount).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* SUBMIT PAYMENT PROOF DIALOG */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[450px] bg-zinc-950 border-white/10 text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" /> Submit Rent Payment
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Provide payment confirmation details. The property administrator will verify and approve.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitPayment} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-white/70">Payment Amount (KES)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-black/50 border-white/10 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70">Payment Date</Label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="bg-black/50 border-white/10 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Payment Method</Label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-white h-9 px-3 rounded-md text-sm outline-none focus:border-primary/50"
                  required
                >
                  <option value="MPESA">M-Pesa</option>
                  <option value="BANK">Bank Wire</option>
                  <option value="CASH">Cash</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Transaction Reference Code</Label>
              <Input
                placeholder="e.g. QXF9283JD7"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="bg-black/50 border-white/10 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Notes (Optional)</Label>
              <Input
                placeholder="Additional payment details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-black/50 border-white/10 text-white"
              />
            </div>

            <DialogFooter className="mt-6 pt-4 border-t border-white/10 gap-2 sm:gap-0">
              <DialogClose render={<Button type="button" variant="ghost" className="text-white/70 hover:text-white">Cancel</Button>} />
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
