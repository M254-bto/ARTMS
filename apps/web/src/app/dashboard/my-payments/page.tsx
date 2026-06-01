"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import {
  CreditCard, CheckCircle2, Clock, AlertCircle, Plus, Send,
  Landmark, Loader2, ChevronLeft, ChevronRight, Calendar, Hash
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

interface Payment {
  id: string;
  amount: string | number;
  paymentDate: string;
  referenceNumber: string | null;
  method: string;
  notes: string | null;
  status: "PENDING_CONFIRMATION" | "CONFIRMED" | "REJECTED";
  confirmedAt: string | null;
  createdAt: string;
  rentCharge: {
    month: number;
    year: number;
    notes: string | null;
    dueDate: string;
  };
  receipt: { receiptNumber: string } | null;
}

interface PaymentLog {
  payments: Payment[];
  total: number;
  page: number;
  totalPages: number;
}

export default function MyPaymentsPage() {
  const [log, setLog] = useState<PaymentLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [amount, setAmount] = useState("");
  const [paymentFor, setPaymentFor] = useState<"RENT" | "OTHER">("RENT");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [method, setMethod] = useState("MPESA");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().substring(0, 10));
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const fetchLog = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/payments/my?page=${p}&limit=10`);
      setLog(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchLog(page); }, [page, fetchLog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return toast.error("Enter a valid amount");
    if (!paymentDate) return toast.error("Select a payment date");
    if (paymentFor === "RENT" && (!month || !year)) return toast.error("Select month and year for rent payment");

    try {
      setIsSubmitting(true);
      await api.post("/payments/record", {
        amount: Number(amount),
        paymentFor,
        ...(paymentFor === "RENT" ? { month, year } : {}),
        method,
        paymentDate: new Date(paymentDate).toISOString(),
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
      });
      toast.success("Payment recorded! Awaiting owner confirmation.");
      setModalOpen(false);
      setAmount(""); setReferenceNumber(""); setNotes("");
      fetchLog(1);
      setPage(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pending = log?.payments.filter(p => p.status === "PENDING_CONFIRMATION") ?? [];
  const confirmed = log?.payments.filter(p => p.status === "CONFIRMED") ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">My Payments</h1>
          <p className="text-white/50 mt-1">Record payments and track confirmation status.</p>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger render={
            <Button className="bg-primary text-primary-foreground gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" /> Record Payment
            </Button>
          } />
          <DialogContent className="sm:max-w-[480px] bg-zinc-950 border-white/10 text-white p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-heading flex items-center gap-2">
                <Landmark className="w-5 h-5 text-primary" /> Record a Payment
              </DialogTitle>
              <DialogDescription className="text-white/50">
                Enter your payment details. The property owner will verify and confirm.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              {/* Amount */}
              <div className="space-y-2">
                <Label className="text-white/70">Amount Paid (KES)</Label>
                <Input
                  type="number" min="1" value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 15000"
                  className="bg-black/50 border-white/10 text-white"
                  required
                />
              </div>

              {/* Payment For */}
              <div className="space-y-2">
                <Label className="text-white/70">Payment For</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(["RENT", "OTHER"] as const).map(opt => (
                    <button
                      type="button" key={opt}
                      onClick={() => setPaymentFor(opt)}
                      className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                        paymentFor === opt
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {opt === "RENT" ? "🏠 Rent" : "💼 Other"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month/Year picker — only when RENT */}
              {paymentFor === "RENT" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Month</Label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 text-white h-9 px-3 rounded-md text-sm outline-none focus:border-primary/50"
                    >
                      {MONTHS.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Year</Label>
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 text-white h-9 px-3 rounded-md text-sm outline-none focus:border-primary/50"
                    >
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Date + Method */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Payment Date</Label>
                  <Input type="date" value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="bg-black/50 border-white/10 text-white" required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Method</Label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 text-white h-9 px-3 rounded-md text-sm outline-none focus:border-primary/50"
                  >
                    <option value="MPESA">M-Pesa</option>
                    <option value="BANK">Bank Wire</option>
                    <option value="CASH">Cash</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Reference */}
              <div className="space-y-2">
                <Label className="text-white/70">Transaction Reference <span className="text-white/30">(optional)</span></Label>
                <Input
                  placeholder="e.g. QXF9283JD7"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="bg-black/50 border-white/10 text-white"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-white/70">Notes <span className="text-white/30">(optional)</span></Label>
                <Input
                  placeholder="Extra details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-black/50 border-white/10 text-white"
                />
              </div>

              <DialogFooter className="mt-6 pt-4 border-t border-white/10 gap-2 sm:gap-0">
                <DialogClose render={
                  <Button type="button" variant="ghost" className="text-white/70 hover:text-white">Cancel</Button>
                } />
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Payment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="bg-black/40 border-white/5 backdrop-blur-xl">
          <CardContent className="p-5">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Total Logged</p>
            <p className="text-3xl font-heading font-bold text-white">{log?.total ?? "—"}</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-yellow-500/10 border backdrop-blur-xl">
          <CardContent className="p-5">
            <p className="text-yellow-400/60 text-xs uppercase tracking-wider mb-1">Awaiting Confirm</p>
            <p className="text-3xl font-heading font-bold text-yellow-400">{pending.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-green-500/10 border backdrop-blur-xl col-span-2 sm:col-span-1">
          <CardContent className="p-5">
            <p className="text-green-400/60 text-xs uppercase tracking-wider mb-1">Confirmed</p>
            <p className="text-3xl font-heading font-bold text-green-400">{confirmed.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Log */}
      <Card className="bg-black/40 border-white/5 backdrop-blur-xl overflow-hidden">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-lg font-heading text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> Payment Log
            {log && <span className="text-white/30 text-sm font-normal">({log.total} total)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-xl" />)}
            </div>
          ) : !log?.payments.length ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-lg font-heading font-medium text-white mb-2">No payments yet</h3>
              <p className="text-white/40 max-w-xs">Use the "Record Payment" button above to log your first payment.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {log.payments.map((p) => {
                const isRent = !!p.rentCharge;
                const label = isRent
                  ? `Rent — ${MONTHS[(p.rentCharge.month ?? 1) - 1]} ${p.rentCharge.year}`
                  : `Other Payment`;
                return (
                  <div key={p.id} className="p-4 md:p-5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          p.status === "CONFIRMED" ? "bg-green-500/10" :
                          p.status === "REJECTED" ? "bg-red-500/10" : "bg-yellow-500/10"
                        }`}>
                          {p.status === "CONFIRMED" ? <CheckCircle2 className="w-5 h-5 text-green-400" /> :
                           p.status === "REJECTED" ? <AlertCircle className="w-5 h-5 text-red-400" /> :
                           <Clock className="w-5 h-5 text-yellow-400" />}
                        </div>
                        <div>
                          <p className="text-white font-medium">{label}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span className="text-xs text-white/40 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Paid {format(new Date(p.paymentDate), "MMM d, yyyy")}
                            </span>
                            {p.referenceNumber && (
                              <span className="text-xs text-white/40 flex items-center gap-1 font-mono">
                                <Hash className="w-3 h-3" /> {p.referenceNumber}
                              </span>
                            )}
                            <span className="text-xs text-white/40">{p.method}</span>
                          </div>
                          {p.status === "CONFIRMED" && p.confirmedAt && (
                            <p className="text-[10px] text-green-400/60 mt-1">
                              Confirmed {format(new Date(p.confirmedAt), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          )}
                          {p.receipt && (
                            <p className="text-[10px] text-white/30 mt-0.5 font-mono">Receipt #{p.receipt.receiptNumber}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <span className="text-lg font-heading font-bold text-white">
                          KES {Number(p.amount).toLocaleString()}
                        </span>
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {log && log.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
              <p className="text-xs text-white/40">
                Page {log.page} of {log.totalPages} · {log.total} payments
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm"
                  className="border-white/10 text-white hover:bg-white/5 h-8 gap-1"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Button>
                <Button
                  variant="outline" size="sm"
                  className="border-white/10 text-white hover:bg-white/5 h-8 gap-1"
                  onClick={() => setPage(p => Math.min(log.totalPages, p + 1))}
                  disabled={page === log.totalPages}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "CONFIRMED") return <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">Confirmed</Badge>;
  if (status === "REJECTED") return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">Rejected</Badge>;
  return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px]">Pending</Badge>;
}
