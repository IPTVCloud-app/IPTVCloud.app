"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";

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
  const [authError, setAuthError] = useState<string | null>(null);

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
      const response = await fetch(`${API_URL}/auth/signin/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("Server returned an invalid response");
      }

      if (!response.ok) {
        throw new Error(result.error || result.message || "Invalid credentials");
      }

      setEmail(data.email);
      setStep("otp");
      setAuthError(null);
      toast.success("Verification code sent to your email");
      setResendCooldown(60);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "An unexpected error occurred";
      setAuthError(msg);
      toast.error(msg);
    }
  };

  const onOtpSubmit = async (data: OtpData) => {
    try {
      setAuthError(null);
      const response = await fetch(`${API_URL}/auth/signin/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: data.code }),
      });

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("Server returned an invalid response");
      }

      if (!response.ok) {
        throw new Error(result.error || result.message || "Invalid or expired code");
      }

      localStorage.setItem("token", result.token);
      window.dispatchEvent(new Event('storage'));
      toast.success("Welcome back!");
      router.push("/account");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "An unexpected error occurred";
      setAuthError(msg);
      toast.error(msg);
    }
  };

  const onValidationError = (errors: Record<string, { message?: string }>) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      const response = await fetch(`${API_URL}/auth/otp/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || result.message || "Failed to resend code");
      }

      toast.success("New code sent!");
      setResendCooldown(60);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  return (
    <div className="card w-full overflow-hidden p-6 md:p-8">
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
              <h1 className="text-heading-2 text-primary mb-2">Welcome back</h1>
              <p className="text-sm text-tertiary">Sign in to your IPTVCloud account</p>
            </div>

            {authError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-md border border-border bg-panel p-3 text-center text-sm font-medium"
                style={{ color: '#e5484d' }}
              >
                {authError}
              </motion.div>
            )}

            <form onSubmit={handleSignIn(onSignInSubmit, onValidationError)} className="space-y-5">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  {...registerSignIn("email")}
                  placeholder="name@example.com"
                  className={`form-input ${signinErrors.email ? 'form-input--error' : ''}`}
                />
              </div>

              <div className="form-group">
                <div className="flex justify-between items-center">
                  <label className="form-label">Password</label>
                  <Link href="/account/forgot-password" className="text-xs text-tertiary hover:text-primary transition-colors">Forgot password?</Link>
                </div>
                <input 
                  type="password" 
                  {...registerSignIn("password")}
                  placeholder="••••••••"
                  className={`form-input ${signinErrors.password ? 'form-input--error' : ''}`}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSigninSubmitting}
                className="btn-brand w-full mt-2"
              >
                {isSigninSubmitting ? "Checking credentials..." : "Continue"}
              </button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center text-sm text-tertiary">
                Don&apos;t have an account? <Link href="/account/signup" className="text-accent hover:text-primary transition-colors font-medium">Sign up</Link>
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
              <h1 className="text-heading-2 text-primary mb-2">Verify your identity</h1>
              <p className="text-sm text-tertiary">Enter the 6-digit code sent to <span className="text-secondary font-medium">{email}</span></p>
            </div>

            <form onSubmit={handleOtp(onOtpSubmit)} className="space-y-6">
              <div className="form-group text-center">
                <input 
                  type="text" 
                  maxLength={6}
                  {...registerOtp("code")}
                  placeholder="000000"
                  className={`form-input py-4 text-center font-mono text-2xl tracking-[0.45em] ${otpErrors.code ? 'form-input--error' : ''}`}
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                <button 
                  type="submit" 
                  disabled={isOtpSubmitting}
                  className="btn-brand w-full"
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
    <Suspense fallback={<div className="card" />}>
      <SignInForm />
    </Suspense>
  );
}
