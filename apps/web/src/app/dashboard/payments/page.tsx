"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CreditCard, CheckCircle, XCircle, Clock, Search,
  ChevronLeft, ChevronRight, Calendar, SlidersHorizontal
} from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
    lease: {
      tenant: { user: { firstName: string; lastName: string; phone: string } };
      unit: { unitNumber: string; property: { name: string } };
    };
  };
}

interface PaymentLog {
  payments: Payment[];
  total: number;
  page: number;
  totalPages: number;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function PaymentsPage() {
  const [log, setLog] = useState<PaymentLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  const fetchPayments = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "10" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const { data } = await api.get(`/payments?${params}`);
      setLog(data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchPayments(page); }, [page, fetchPayments]);

  const handleStatusFilter = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  async function confirmPayment(id: string) {
    setConfirming(id);
    try {
      await api.patch(`/payments/${id}/confirm`);
      toast.success("Payment confirmed ✓");
      fetchPayments(page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to confirm");
    } finally { setConfirming(null); }
  }

  async function rejectPayment(id: string) {
    setRejecting(id);
    try {
      await api.patch(`/payments/${id}/reject`);
      toast.success("Payment rejected");
      fetchPayments(page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject");
    } finally { setRejecting(null); }
  }

  // Client-side search filter (on top of server pagination)
  const filtered = (log?.payments ?? []).filter(p => {
    const name = `${p.rentCharge?.lease?.tenant?.user?.firstName} ${p.rentCharge?.lease?.tenant?.user?.lastName}`.toLowerCase();
    const ref = (p.referenceNumber ?? "").toLowerCase();
    const q = search.toLowerCase();
    return !q || name.includes(q) || ref.includes(q);
  });

  const pending = log?.payments.filter(p => p.status === "PENDING_CONFIRMATION").length ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Payments Log</h1>
          <p className="text-white/50 mt-1">Review, confirm, and track all incoming payments from tenants.</p>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-400 font-medium">{pending} payment{pending > 1 ? "s" : ""} awaiting confirmation</span>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Search tenant or reference..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-black/40 border-white/10 text-white"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-white/40 shrink-0" />
          {["all", "PENDING_CONFIRMATION", "CONFIRMED", "REJECTED"].map(s => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === s
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
              }`}
            >
              {s === "all" ? "All" : s === "PENDING_CONFIRMATION" ? "Pending" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="bg-black/40 border-white/5 backdrop-blur-xl overflow-hidden">
        <CardHeader className="border-b border-white/5 py-4">
          <CardTitle className="text-base font-heading text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            {log ? `${log.total} Total Payments` : "Loading..."}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 w-full bg-white/5 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-xl font-heading font-medium text-white mb-2">No payments found</h3>
              <p className="text-white/50 max-w-sm">No records match your current search or filter.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-white/[0.02] border-b border-white/5">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-white/40 font-medium">Date Recorded</TableHead>
                      <TableHead className="text-white/40 font-medium">Tenant & Unit</TableHead>
                      <TableHead className="text-white/40 font-medium">Period</TableHead>
                      <TableHead className="text-white/40 font-medium">Reference</TableHead>
                      <TableHead className="text-white/40 font-medium">Amount</TableHead>
                      <TableHead className="text-white/40 font-medium">Status</TableHead>
                      <TableHead className="text-right text-white/40 font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((payment) => {
                      const tenant = payment.rentCharge?.lease?.tenant;
                      const unit = payment.rentCharge?.lease?.unit;
                      const isProcessing = confirming === payment.id || rejecting === payment.id;
                      return (
                        <TableRow key={payment.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <TableCell className="text-white/70 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span>{format(new Date(payment.paymentDate), "MMM d, yyyy")}</span>
                              <span className="text-xs text-white/30">{payment.method}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-white">
                                {tenant?.user?.firstName} {tenant?.user?.lastName}
                              </span>
                              <span className="text-xs text-white/40">
                                {unit?.property?.name} · Unit {unit?.unitNumber}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-white/60 text-sm">
                            {MONTHS[(payment.rentCharge?.month ?? 1) - 1]} {payment.rentCharge?.year}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm text-white/70">{payment.referenceNumber || "—"}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-white">KES {Number(payment.amount).toLocaleString()}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <PaymentStatusBadge status={payment.status} />
                              {payment.confirmedAt && (
                                <span className="text-[10px] text-white/30">
                                  {format(new Date(payment.confirmedAt), "MMM d, h:mma")}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {payment.status === "PENDING_CONFIRMATION" && (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost" size="sm"
                                  className="h-8 px-3 text-green-400 hover:text-green-300 hover:bg-green-400/10 gap-1 text-xs"
                                  onClick={() => confirmPayment(payment.id)}
                                  disabled={isProcessing}
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Confirm
                                </Button>
                                <Button
                                  variant="ghost" size="sm"
                                  className="h-8 px-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 gap-1 text-xs"
                                  onClick={() => rejectPayment(payment.id)}
                                  disabled={isProcessing}
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-white/5">
                {filtered.map((payment) => {
                  const tenant = payment.rentCharge?.lease?.tenant;
                  const unit = payment.rentCharge?.lease?.unit;
                  const isProcessing = confirming === payment.id || rejecting === payment.id;
                  return (
                    <div key={payment.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-white">{tenant?.user?.firstName} {tenant?.user?.lastName}</p>
                          <p className="text-xs text-white/40">{unit?.property?.name} · Unit {unit?.unitNumber}</p>
                        </div>
                        <PaymentStatusBadge status={payment.status} />
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/40">Period</span>
                          <span className="text-white">{MONTHS[(payment.rentCharge?.month ?? 1) - 1]} {payment.rentCharge?.year}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40">Amount</span>
                          <span className="font-semibold text-white">KES {Number(payment.amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40">Paid On</span>
                          <span className="text-white">{format(new Date(payment.paymentDate), "MMM d, yyyy")}</span>
                        </div>
                        {payment.referenceNumber && (
                          <div className="flex justify-between">
                            <span className="text-white/40">Reference</span>
                            <span className="font-mono text-white/70">{payment.referenceNumber}</span>
                          </div>
                        )}
                        {payment.confirmedAt && (
                          <div className="flex justify-between pt-2 border-t border-white/5">
                            <span className="text-white/40">Confirmed</span>
                            <span className="text-green-400 text-xs">{format(new Date(payment.confirmedAt), "MMM d, h:mma")}</span>
                          </div>
                        )}
                      </div>
                      {payment.status === "PENDING_CONFIRMATION" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm" className="flex-1 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 gap-1.5"
                            onClick={() => confirmPayment(payment.id)} disabled={isProcessing}
                          >
                            <CheckCircle className="w-4 h-4" /> Confirm
                          </Button>
                          <Button
                            size="sm" className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 gap-1.5"
                            onClick={() => rejectPayment(payment.id)} disabled={isProcessing}
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          {log && log.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
              <p className="text-xs text-white/40">
                Page {log.page} of {log.totalPages} · {log.total} total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm"
                  className="border-white/10 text-white hover:bg-white/5 h-8 gap-1"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Button>
                <Button
                  variant="outline" size="sm"
                  className="border-white/10 text-white hover:bg-white/5 h-8 gap-1"
                  onClick={() => setPage(p => Math.min(log.totalPages, p + 1))}
                  disabled={page === log.totalPages || isLoading}
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

function PaymentStatusBadge({ status }: { status: string }) {
  if (status === "CONFIRMED")
    return <Badge className="bg-green-500/10 text-green-400 border-green-500/20 font-normal gap-1"><CheckCircle className="w-3 h-3" /> Confirmed</Badge>;
  if (status === "REJECTED")
    return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 font-normal gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
  return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 font-normal gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
}
