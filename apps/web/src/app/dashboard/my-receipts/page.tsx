"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ReceiptText, Calendar, Download, Printer, Search, Building, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

export default function MyReceiptsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.get("/tenants/me")
      .then(({ data }) => setProfile(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-white/5 rounded-lg" />
        <div className="h-96 bg-white/5 rounded-xl border border-white/5" />
      </div>
    );
  }

  const activeLease = profile?.leases?.[0];
  const rentCharges = activeLease?.rentCharges ?? [];

  // Filter out payments that are CONFIRMED
  const confirmedPayments: any[] = [];
  rentCharges.forEach((charge: any) => {
    if (charge.payments && charge.payments.length > 0) {
      charge.payments.forEach((payment: any) => {
        if (payment.status === "CONFIRMED") {
          confirmedPayments.push({
            ...payment,
            chargeMonth: charge.month,
            chargeYear: charge.year,
            dueDate: charge.dueDate,
          });
        }
      });
    }
  });

  // Sort by date desc
  confirmedPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  const filtered = confirmedPayments.filter(p => 
    (p.referenceNumber ?? "").toLowerCase().includes(search.toLowerCase()) ||
    new Date(p.paymentDate).toLocaleDateString().includes(search)
  );

  const handleOpenReceipt = (payment: any) => {
    setSelectedReceipt(payment);
    setModalOpen(true);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printable-receipt");
    if (!printContent) return;
    const windowUrl = "about:blank";
    const uniqueName = new Date().getTime().toString();
    const printWindow = window.open(windowUrl, uniqueName, "left=50,top=50,width=800,height=900");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${selectedReceipt?.referenceNumber}</title>
          <style>
            body { font-family: sans-serif; color: #18181b; padding: 40px; }
            .header { border-bottom: 2px solid #e4e4e7; padding-bottom: 20px; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
            .title { font-size: 24px; font-weight: bold; color: #7c3aed; }
            .badge { background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
            .total-row { border-top: 2px solid #e4e4e7; border-bottom: 2px solid #e4e4e7; padding: 16px 0; margin-top: 20px; font-size: 18px; font-weight: bold; }
            .footer { margin-top: 40px; font-size: 11px; color: #71717a; text-align: center; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <div class="header">
            <div class="row">
              <span class="title">KEYNEST RECEIPT</span>
              <span class="badge">PAID</span>
            </div>
            <div style="font-size:12px;color:#71717a;margin-top:6px">Generated on ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div style="margin-bottom:30px">
            <div class="row"><strong>Property:</strong> <span>${profile?.unit?.property?.name}</span></div>
            <div class="row"><strong>Unit Number:</strong> <span>Unit ${profile?.unit?.unitNumber}</span></div>
            <div class="row"><strong>Tenant Name:</strong> <span>${profile?.user?.firstName} ${profile?.user?.lastName}</span></div>
          </div>

          <div style="margin-bottom:30px">
            <div class="row"><strong>Reference Number:</strong> <span>${selectedReceipt?.referenceNumber ?? "N/A"}</span></div>
            <div class="row"><strong>Payment Date:</strong> <span>${new Date(selectedReceipt?.paymentDate).toLocaleDateString()}</span></div>
            <div class="row"><strong>Payment Method:</strong> <span style="text-transform:uppercase">${selectedReceipt?.method}</span></div>
            <div class="row"><strong>Statement Period:</strong> <span>${new Date(0, selectedReceipt?.chargeMonth - 1).toLocaleString("default", { month: "long" })} ${selectedReceipt?.chargeYear}</span></div>
          </div>

          <div class="total-row">
            <div class="row"><span>Amount Paid</span> <span>KES ${Number(selectedReceipt?.amount).toLocaleString()}</span></div>
          </div>

          <div class="footer">
            <p>Thank you for choosing KeyNest Property Management System.</p>
            <p>This is a computer generated document and does not require a physical signature.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">My Receipts</h1>
          <p className="text-white/50 mt-1">Review and download digital receipts for settled rent payments.</p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input 
            placeholder="Search by Transaction Ref or Date..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-black/40 border-white/10 text-white"
          />
        </div>
      </div>

      {/* Receipts Card */}
      <Card className="bg-black/40 border-white/5 backdrop-blur-xl p-6">
        {filtered.length === 0 ? (
          <div className="py-24 text-center text-white/40 space-y-3">
            <ReceiptText className="w-12 h-12 text-white/10 mx-auto" />
            <p className="text-base font-medium">No confirmed receipts found</p>
            <p className="text-sm text-white/30 max-w-xs mx-auto">Receipts are automatically generated as soon as your payments are confirmed by the manager.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((receipt) => (
              <div 
                key={receipt.id}
                className="p-5 bg-white/[0.02] border border-white/5 rounded-xl space-y-4 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <ReceiptText className="w-5 h-5" />
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 font-normal">
                    Paid
                  </Badge>
                </div>

                <div>
                  <h4 className="text-white font-medium text-base">KES {Number(receipt.amount).toLocaleString()}</h4>
                  <p className="text-white/40 text-xs mt-1">
                    Rent — {new Date(0, receipt.chargeMonth - 1).toLocaleString("default", { month: "long" })} {receipt.chargeYear}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
                  <span>Ref: <strong className="font-mono text-white/80">{receipt.referenceNumber}</strong></span>
                  <span>{new Date(receipt.paymentDate).toLocaleDateString()}</span>
                </div>

                <div className="pt-2">
                  <Button 
                    onClick={() => handleOpenReceipt(receipt)}
                    className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs h-8 gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> View Receipt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* RECEIPT PREVIEW DIALOG */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-white/10 text-white p-6">
          <div id="printable-receipt" className="space-y-6">
            <DialogHeader className="border-b border-white/5 pb-4">
              <div className="flex justify-between items-center">
                <DialogTitle className="text-xl font-heading text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" /> KeyNest Receipt
                </DialogTitle>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                  Confirmed
                </Badge>
              </div>
              <DialogDescription className="text-white/40 text-xs mt-1">
                Generated dynamically on {new Date().toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-white/[0.01] border border-white/5 rounded-lg p-4">
                <div>
                  <span className="text-white/40 text-xs block">Property</span>
                  <span className="font-medium text-white">{profile?.unit?.property?.name}</span>
                </div>
                <div>
                  <span className="text-white/40 text-xs block">Unit</span>
                  <span className="font-medium text-white">Unit {profile?.unit?.unitNumber}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-white/5">
                  <span className="text-white/40 text-xs block">Tenant</span>
                  <span className="font-medium text-white">{profile?.user?.firstName} {profile?.user?.lastName}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/40">Statement Month</span>
                  <span className="font-medium text-white">
                    {selectedReceipt && new Date(0, selectedReceipt.chargeMonth - 1).toLocaleString("default", { month: "long" })} {selectedReceipt?.chargeYear}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Transaction Reference</span>
                  <span className="font-mono text-white">{selectedReceipt?.referenceNumber ?? "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Method</span>
                  <span className="text-white uppercase">{selectedReceipt?.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Payment Date</span>
                  <span className="text-white">{selectedReceipt && new Date(selectedReceipt.paymentDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-center text-base p-3 bg-primary/10 rounded-lg">
                  <span className="font-medium text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-5 h-5 text-primary" /> Net Amount Paid
                  </span>
                  <span className="font-heading font-bold text-primary">
                    KES {selectedReceipt && Number(selectedReceipt.amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogClose render={
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-white/5">
              <Button 
                onClick={handlePrint}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9 px-4 gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </Button>
            </div>
          } />
        </DialogContent>
      </Dialog>
    </div>
  );
}
