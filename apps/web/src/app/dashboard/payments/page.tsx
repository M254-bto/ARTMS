"use client";

import { useEffect, useState } from "react";
import { CreditCard, CheckCircle, XCircle, Clock, Filter, Search } from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      const { data } = await api.get("/payments");
      setPayments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function confirmPayment(id: string) {
    try {
      await api.patch(`/payments/${id}/confirm`);
      toast.success("Payment confirmed successfully");
      fetchPayments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to confirm payment");
    }
  }

  async function rejectPayment(id: string) {
    try {
      await api.patch(`/payments/${id}/reject`);
      toast.success("Payment rejected");
      fetchPayments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject payment");
    }
  }

  const filtered = payments.filter(p => 
    p.referenceNumber?.toLowerCase().includes(search.toLowerCase()) || 
    p.rentCharge?.lease?.tenant?.user?.firstName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Payments Log</h1>
          <p className="text-white/50 mt-1">Review, confirm, and track all incoming rent payments.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input 
            placeholder="Search by reference or tenant name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-black/40 border-white/10 text-white"
          />
        </div>
        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white gap-2">
          <Filter className="w-4 h-4" /> Filter Status
        </Button>
      </div>

      {/* Table Area */}
      <Card className="bg-black/40 border-white/5 backdrop-blur-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full bg-white/5" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-heading font-medium text-white mb-2">No payments found</h3>
            <p className="text-white/50 max-w-sm">No payment records match your current criteria.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-white/[0.02] border-b border-white/5">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-white/40 font-medium">Date</TableHead>
                <TableHead className="text-white/40 font-medium">Tenant & Unit</TableHead>
                <TableHead className="text-white/40 font-medium">Reference / Method</TableHead>
                <TableHead className="text-white/40 font-medium">Amount</TableHead>
                <TableHead className="text-white/40 font-medium">Status</TableHead>
                <TableHead className="text-right text-white/40 font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((payment) => {
                const tenant = payment.rentCharge?.lease?.tenant;
                const unit = payment.rentCharge?.lease?.unit;
                
                return (
                  <TableRow key={payment.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell className="text-white/80 whitespace-nowrap">
                      {format(new Date(payment.paymentDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">
                          {tenant?.user?.firstName} {tenant?.user?.lastName}
                        </span>
                        <span className="text-xs text-white/40">
                          {unit?.property?.name} • Unit {unit?.unitNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm text-white/80">{payment.referenceNumber || 'N/A'}</span>
                        <span className="text-xs text-white/40">{payment.method}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-white">KES {Number(payment.amount).toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === 'PENDING_CONFIRMATION' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                            onClick={() => confirmPayment(payment.id)}
                            title="Confirm Payment"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            onClick={() => rejectPayment(payment.id)}
                            title="Reject Payment"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  if (status === 'CONFIRMED') {
    return <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 font-normal"><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</Badge>;
  }
  if (status === 'REJECTED') {
    return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 font-normal"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
  }
  return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 font-normal"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
}
