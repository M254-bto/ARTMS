"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Building2, KeyRound } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      setIsLoading(true);
      const { data } = await api.post("/auth/login", values);
      
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setUser(data.user);
      
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
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
            Intelligent Property <br />
            <span className="text-white/60">Management, Simplified.</span>
          </h1>
          <p className="text-lg text-white/50 max-w-md font-light leading-relaxed">
            Gain complete visibility over your properties. Automate rent collection, track vacancies, and manage maintenance effortlessly.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-white/30">
          &copy; {new Date().getFullYear()} ARTMS Platform. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-zinc-950 lg:bg-zinc-950/50 relative">
        {/* Subtle glow behind card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative z-10">
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="font-heading text-2xl tracking-tight text-white">Sign In</CardTitle>
            <CardDescription className="text-white/50">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="admin@property.com" 
                          className="bg-black/50 border-white/10 text-white placeholder:text-white/30 h-11 focus-visible:ring-primary/50 transition-all" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-white/70">Password</FormLabel>
                        <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">
                          Forgot password?
                        </a>
                      </div>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="bg-black/50 border-white/10 text-white placeholder:text-white/30 h-11 focus-visible:ring-primary/50 transition-all" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wide mt-2 shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                      Authenticating...
                    </div>
                  ) : (
                    "Access Dashboard"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-white/5 pt-6 mt-2">
            <p className="text-sm text-white/50">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:text-primary/80 transition-colors font-medium">
                Create one now
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
