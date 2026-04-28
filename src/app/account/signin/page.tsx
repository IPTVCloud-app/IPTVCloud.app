"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const signinSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const otpSchema = z.object({
  code: z.string().length(6, { message: "Code must be 6 digits" }),
});

type SignInData = z.infer<typeof signinSchema>;
type OtpData = z.infer<typeof otpSchema>;

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const { register: registerSignIn, handleSubmit: handleSignIn, formState: { errors: signinErrors, isSubmitting: isSigninSubmitting } } = useForm<SignInData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: searchParams.get("email") || ""
    }
  });

  const { register: registerOtp, handleSubmit: handleOtp, formState: { errors: otpErrors, isSubmitting: isOtpSubmitting } } = useForm<OtpData>({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onSignInSubmit = async (data: SignInData) => {
    try {
      const apiUrl = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
      const response = await fetch(`${apiUrl}/auth/signin/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error("Server returned an invalid response");
      }

      if (!response.ok) {
        throw new Error(result.error || "Invalid credentials");
      }

      setEmail(data.email);
      setStep("otp");
      toast.success("Verification code sent to your email");
      setResendCooldown(60);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  const onOtpSubmit = async (data: OtpData) => {
    try {
      const apiUrl = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
      const response = await fetch(`${apiUrl}/auth/signin/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: data.code }),
      });

      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error("Server returned an invalid response");
      }

      if (!response.ok) {
        throw new Error(result.error || "Invalid or expired code");
      }

      localStorage.setItem("token", result.token);
      toast.success("Welcome back!");
      router.push("/account");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  const onValidationError = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(firstError.message);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      const apiUrl = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
      const response = await fetch(`${apiUrl}/auth/otp/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to resend code");
      }

      toast.success("New code sent!");
      setResendCooldown(60);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-8 linear-shadow-card overflow-hidden">
      <AnimatePresence mode="wait">
        {step === "credentials" ? (
          <motion.div
            key="credentials"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-medium tracking-[-0.288px] text-primary mb-2 text-display">Welcome back</h1>
              <p className="text-sm text-tertiary text-body">Sign in to your IPTVCloud account</p>
            </div>

            <form onSubmit={handleSignIn(onSignInSubmit, onValidationError)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-secondary tracking-[-0.182px]">Email</label>
                <input 
                  type="email" 
                  {...registerSignIn("email")}
                  placeholder="name@example.com"
                  className={`w-full bg-[rgba(255,255,255,0.02)] text-primary border ${signinErrors.email ? 'border-[#e5484d]' : 'border-input focus:border-accent'} px-3.5 py-2.5 rounded-md text-sm outline-none transition-all focus:ring-2 focus:ring-[rgba(113,112,255,0.1)]`}
                />
                {signinErrors.email && <p className="text-[11px] text-[#e5484d] mt-1">{signinErrors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-secondary tracking-[-0.182px]">Password</label>
                  <Link href="/account/forgot-password" className="text-xs text-tertiary hover:text-primary transition-colors">Forgot password?</Link>
                </div>
                <input 
                  type="password" 
                  {...registerSignIn("password")}
                  placeholder="••••••••"
                  className={`w-full bg-[rgba(255,255,255,0.02)] text-primary border ${signinErrors.password ? 'border-[#e5484d]' : 'border-input focus:border-accent'} px-3.5 py-2.5 rounded-md text-sm outline-none transition-all focus:ring-2 focus:ring-[rgba(113,112,255,0.1)]`}
                />
                {signinErrors.password && <p className="text-[11px] text-[#e5484d] mt-1">{signinErrors.password.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isSigninSubmitting}
                className="w-full bg-brand text-white px-4 py-2.5 rounded-md text-sm font-medium transition-all hover:bg-accent disabled:opacity-50 mt-2 shadow-[0_2px_10px_rgba(94,106,210,0.3)] hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSigninSubmitting ? "Checking credentials..." : "Continue"}
              </button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center text-sm text-tertiary">
                Don&apos;t have an account? <Link href="/account/signup" className="text-accent hover:text-primary transition-colors font-medium">Sign up</Link>
              </div>
              <div className="text-center">
                <Link href="/account/find-account" className="text-xs text-quaternary hover:text-secondary transition-colors">Can&apos;t remember your email?</Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-medium tracking-[-0.288px] text-primary mb-2">Verify your identity</h1>
              <p className="text-sm text-tertiary">Enter the 6-digit code sent to <span className="text-secondary font-medium">{email}</span></p>
            </div>

            <form onSubmit={handleOtp(onOtpSubmit)} className="space-y-6">
              <div className="space-y-1.5 text-center">
                <input 
                  type="text" 
                  maxLength={6}
                  {...registerOtp("code")}
                  placeholder="000000"
                  className={`w-full bg-[rgba(255,255,255,0.02)] text-primary border ${otpErrors.code ? 'border-[#e5484d]' : 'border-input focus:border-accent'} px-3.5 py-4 rounded-md text-2xl font-mono tracking-[0.5em] text-center outline-none transition-all focus:ring-2 focus:ring-[rgba(113,112,255,0.1)]`}
                  autoFocus
                />
                {otpErrors.code && <p className="text-[11px] text-[#e5484d] mt-1">{otpErrors.code.message}</p>}
              </div>

              <div className="space-y-3">
                <button 
                  type="submit" 
                  disabled={isOtpSubmitting}
                  className="w-full bg-brand text-white px-4 py-2.5 rounded-md text-sm font-medium transition-all hover:bg-accent disabled:opacity-50 shadow-[0_2px_10px_rgba(94,106,210,0.3)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isOtpSubmitting ? "Verifying..." : "Verify Code"}
                </button>
                
                <div className="text-center">
                  <button 
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                    className="text-xs text-tertiary hover:text-primary transition-colors disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive a code? Resend"}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-center">
                <button 
                  type="button"
                  onClick={() => setStep("credentials")}
                  className="text-xs text-quaternary hover:text-secondary flex items-center gap-1 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  Back to login
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="bg-surface border border-border rounded-xl p-8 linear-shadow-card animate-pulse">
        <div className="h-8 w-48 bg-[rgba(255,255,255,0.05)] rounded mx-auto mb-4" />
        <div className="h-4 w-64 bg-[rgba(255,255,255,0.05)] rounded mx-auto mb-8" />
        <div className="space-y-4">
          <div className="h-10 bg-[rgba(255,255,255,0.05)] rounded w-full" />
          <div className="h-10 bg-[rgba(255,255,255,0.05)] rounded w-full" />
          <div className="h-10 bg-brand/20 rounded w-full mt-4" />
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
