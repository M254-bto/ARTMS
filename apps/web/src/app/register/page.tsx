"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Building2, UserPlus, KeyRound, Loader2, CheckCircle2, Home } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter,
} from "@/components/ui/card";

// ─── Owner registration schema ───────────────────────────────────────────────
const ownerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ─── Tenant invite acceptance schema ─────────────────────────────────────────
const tenantSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ─── Invite preview shape ─────────────────────────────────────────────────────
type InvitePreview = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  unitNumber: string;
  propertyName: string;
};

// ─── Inner component (uses useSearchParams — must be inside Suspense) ─────────
function RegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const setUser = useAuthStore((s) => s.setUser);

  const [isLoading, setIsLoading] = useState(false);
  const [invitePreview, setInvitePreview] = useState<InvitePreview | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(!!token);
  const [accepted, setAccepted] = useState(false);

  // ── Load invite preview when token present ──────────────────────────────────
  useEffect(() => {
    if (!token) return;
    async function loadInvite() {
      try {
        const { data } = await api.get(`/tenants/invite-preview/${token}`);
        setInvitePreview(data);
      } catch (err: any) {
        setInviteError(err.response?.data?.message || "Invalid or expired invite link.");
      } finally {
        setInviteLoading(false);
      }
    }
    loadInvite();
  }, [token]);

  // ─── Owner form ─────────────────────────────────────────────────────────────
  const ownerForm = useForm<z.infer<typeof ownerSchema>>({
    resolver: zodResolver(ownerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  async function onOwnerSubmit(values: z.infer<typeof ownerSchema>) {
    try {
      setIsLoading(true);
      const { data } = await api.post("/auth/register", { ...values, role: "PROPERTY_OWNER" });
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setUser(data.user);
      toast.success("Account created! Welcome to ARTMS.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Tenant invite form ─────────────────────────────────────────────────────
  const tenantForm = useForm<z.infer<typeof tenantSchema>>({
    resolver: zodResolver(tenantSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onTenantSubmit(values: z.infer<typeof tenantSchema>) {
    try {
      setIsLoading(true);
      await api.post("/tenants/accept-invite", { token, password: values.password });
      setAccepted(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to set up account");
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Success screen ─────────────────────────────────────────────────────────
  if (accepted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />
        <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl text-center relative z-10">
          <CardContent className="pt-10 pb-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-white">Account Created!</h2>
            <p className="text-white/50 max-w-xs">
              Your tenant account is ready. Sign in to access your dashboard, pay rent, and submit maintenance requests.
            </p>
            <Button
              className="mt-4 w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => router.push("/login")}
            >
              Sign In to Your Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Loading invite ─────────────────────────────────────────────────────────
  if (token && inviteLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-white/50">Verifying your invite…</p>
        </div>
      </div>
    );
  }

  // ─── Invite error ───────────────────────────────────────────────────────────
  if (token && inviteError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8">
        <Card className="w-full max-w-md border-red-500/20 bg-black/40 backdrop-blur-xl shadow-2xl text-center">
          <CardContent className="pt-10 pb-8 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <KeyRound className="w-7 h-7 text-red-400" />
            </div>
            <h2 className="text-xl font-heading font-bold text-white">Invite Link Invalid</h2>
            <p className="text-white/50 max-w-xs">{inviteError}</p>
            <p className="text-white/30 text-sm">Please contact your property manager for a new invite link.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Tenant invite acceptance form ─────────────────────────────────────────
  if (token && invitePreview) {
    return (
      <div className="flex min-h-screen bg-zinc-950">
        {/* Left branding panel */}
        <div className="hidden lg:flex w-1/2 bg-zinc-950 relative overflow-hidden flex-col justify-between p-12 border-r border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg ring-1 ring-primary/30">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <span className="font-heading font-bold text-2xl tracking-tight text-white">ARTMS.</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">Your new home</p>
                <p className="text-white font-heading font-semibold">{invitePreview.propertyName}</p>
                <p className="text-white/50 text-sm">Unit {invitePreview.unitNumber}</p>
              </div>
            </div>
            <h1 className="font-heading text-4xl font-medium tracking-tight text-white mb-4 leading-tight">
              Welcome,<br />
              <span className="text-primary">{invitePreview.firstName}.</span>
            </h1>
            <p className="text-lg text-white/50 max-w-md font-light leading-relaxed">
              Your landlord has added you to the ARTMS platform. Set your password below to access your tenant dashboard.
            </p>
          </div>
          <div className="relative z-10 text-sm text-white/30">
            &copy; {new Date().getFullYear()} ARTMS Platform. All rights reserved.
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center p-8 bg-zinc-950 lg:bg-zinc-950/50 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
          <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative z-10">
            <CardHeader className="space-y-2 text-center pb-6">
              <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="font-heading text-2xl tracking-tight text-white">
                Set Your Password
              </CardTitle>
              <CardDescription className="text-white/50">
                You're joining as a tenant at <span className="text-white">{invitePreview.propertyName}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Read-only prefilled info */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div>
                  <p className="text-white/40 text-xs mb-0.5">Name</p>
                  <p className="text-white text-sm font-medium">{invitePreview.firstName} {invitePreview.lastName}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">Unit</p>
                  <p className="text-white text-sm font-medium">{invitePreview.unitNumber}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-white/40 text-xs mb-0.5">Email</p>
                  <p className="text-white text-sm font-medium">{invitePreview.email}</p>
                </div>
              </div>

              <Form {...tenantForm}>
                <form onSubmit={tenantForm.handleSubmit(onTenantSubmit)} className="space-y-4">
                  <FormField
                    control={tenantForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">Choose a Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-black/50 border-white/10 text-white placeholder:text-white/30 h-11 focus-visible:ring-primary/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={tenantForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-black/50 border-white/10 text-white placeholder:text-white/30 h-11 focus-visible:ring-primary/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wide mt-2 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Setting up account…
                      </span>
                    ) : "Activate My Account"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Default: Owner registration form ──────────────────────────────────────
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex w-1/2 bg-zinc-950 relative overflow-hidden flex-col justify-between p-12 border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg ring-1 ring-primary/30">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <span className="font-heading font-bold text-2xl tracking-tight text-white">ARTMS.</span>
        </div>
        <div className="relative z-10">
          <h1 className="font-heading text-5xl font-medium tracking-tight text-white mb-4 leading-[1.1]">
            Scale Your Property <br />
            <span className="text-white/60">Portfolio with Ease.</span>
          </h1>
          <p className="text-lg text-white/50 max-w-md font-light leading-relaxed">
            Join thousands of property owners who use ARTMS to streamline operations, collect rent faster, and keep tenants happy.
          </p>
        </div>
        <div className="relative z-10 text-sm text-white/30">
          &copy; {new Date().getFullYear()} ARTMS Platform. All rights reserved.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-zinc-950 lg:bg-zinc-950/50 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative z-10">
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="font-heading text-2xl tracking-tight text-white">Create an Account</CardTitle>
            <CardDescription className="text-white/50">
              Start managing your properties today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...ownerForm}>
              <form onSubmit={ownerForm.handleSubmit(onOwnerSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={ownerForm.control} name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" className="bg-black/50 border-white/10 text-white placeholder:text-white/30 h-11 focus-visible:ring-primary/50" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField control={ownerForm.control} name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" className="bg-black/50 border-white/10 text-white placeholder:text-white/30 h-11 focus-visible:ring-primary/50" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField control={ownerForm.control} name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="owner@property.com" className="bg-black/50 border-white/10 text-white placeholder:text-white/30 h-11 focus-visible:ring-primary/50" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField control={ownerForm.control} name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" className="bg-black/50 border-white/10 text-white placeholder:text-white/30 h-11 focus-visible:ring-primary/50" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wide mt-4 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating account…
                    </span>
                  ) : "Sign Up as Owner"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-white/5 pt-6 mt-2">
            <p className="text-sm text-white/50">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                Sign in instead
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// ─── Page export wrapped in Suspense (required for useSearchParams) ───────────
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <RegisterInner />
    </Suspense>
  );
}
