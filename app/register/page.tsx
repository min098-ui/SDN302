"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";
import AnimatedPlanet from "@/components/AnimatedPlanet";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        toast.success("Registration successful! Please login.");
        router.push("/login");
      } else {
        const data = await res.json();
        toast.error(data.error || "Registration failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-stretch bg-slate-50/50 p-4 lg:p-8">
      <div className="w-full max-w-6xl mx-auto flex rounded-[2.5rem] bg-white shadow-2xl overflow-hidden border border-slate-200/60">
        
        {/* Left Side: Brand Panel */}
        <div className="hidden lg:flex w-5/12 bg-slate-900 relative p-12 flex-col justify-center overflow-hidden">
          {/* Decorative Orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary-500/40 via-secondary-500/30 to-secondary-500/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary-500/30 to-secondary-500/10 blur-[60px] rounded-full -translate-x-1/4 translate-y-1/4 pointer-events-none" />
          
          {/* Content */}
          <div className="relative z-10 space-y-2 flex flex-col items-center text-center">
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight mb-4">
              Create an{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-300">
                Account
              </span>
            </h1>
            
            <AnimatedPlanet />
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="w-full lg:w-7/12 flex items-center justify-center p-8 lg:p-16 relative bg-white">
          <div className="w-full max-w-md space-y-8 relative z-10">
            
            {/* Mobile Only Heading */}
            <div className="text-center space-y-2 lg:hidden">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-slate-50 rounded-full border border-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mascot-bunny-nobg.png" alt="Snow Bunny" width={56} height={56} className="mascot-bunny-img object-contain" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create an Account</h2>
              <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">
                Start collaborating with your teams and organizing tasks today.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 lg:mt-0">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <span className="text-[10px] font-medium text-slate-400">Min. 6 characters</span>
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-2 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold shadow-xl shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none text-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm font-medium text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="text-primary-600 font-bold hover:text-primary-500 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
