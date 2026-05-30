"use client";

import { useEffect, useState } from "react";
import { ReceiptText, Search, Download } from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";

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

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchReceipts() {
      try {
        const { data } = await api.get("/receipts");
        setReceipts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReceipts();
  }, []);

  const filtered = receipts.filter(r => 
    r.receiptNumber.toLowerCase().includes(search.toLowerCase()) || 
    r.payment?.rentCharge?.lease?.tenant?.user?.firstName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Receipts</h1>
          <p className="text-white/50 mt-1">Generated receipts for confirmed payments.</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input 
            placeholder="Search by receipt number or tenant..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-black/40 border-white/10 text-white"
          />
        </div>
      </div>

      <Card className="bg-black/40 border-white/5 backdrop-blur-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full bg-white/5" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <ReceiptText className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-heading font-medium text-white mb-2">No receipts found</h3>
            <p className="text-white/50 max-w-sm">Receipts are automatically generated when payments are confirmed.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-white/[0.02] border-b border-white/5">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-white/40 font-medium">Receipt No.</TableHead>
                <TableHead className="text-white/40 font-medium">Date Generated</TableHead>
                <TableHead className="text-white/40 font-medium">Tenant</TableHead>
                <TableHead className="text-white/40 font-medium">Amount</TableHead>
                <TableHead className="text-right text-white/40 font-medium">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((receipt) => {
                const tenant = receipt.payment?.rentCharge?.lease?.tenant;
                return (
                  <TableRow key={receipt.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell className="font-mono text-primary text-sm">
                      {receipt.receiptNumber}
                    </TableCell>
                    <TableCell className="text-white/80">
                      {format(new Date(receipt.generatedAt), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-white">
                        {tenant?.user?.firstName} {tenant?.user?.lastName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-white">KES {Number(receipt.payment?.amount || 0).toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 gap-2">
                        <Download className="w-4 h-4" /> PDF
                      </Button>
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
