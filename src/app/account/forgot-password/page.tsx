"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isSent, setIsSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`${API_URL}/auth/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to send reset link");
      }

      setIsSent(true);
      toast.success("Reset link sent!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="card">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-medium tracking-[-0.288px] text-primary mb-2">Forgot Password?</h1>
        <p className="text-sm text-tertiary">Enter your email and we&apos;ll send you a link to reset your password.</p>
      </div>

      {!isSent ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              {...register("email")}
              placeholder="name@example.com"
              className={`form-input ${errors.email ? 'form-input--error' : ''}`}
            />
            {errors.email && <p className="form-state-label" style={{color: '#e5484d'}}>{errors.email.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn-brand w-full"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4"
        >
          <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-6 shadow-elevated">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </div>
          <h3 className="text-lg font-medium text-primary mb-2">Check your email</h3>
          <p className="text-sm text-tertiary mb-8">We&apos;ve sent a password reset link to your email address.</p>
          <button 
            onClick={() => setIsSent(false)}
            className="text-xs text-accent hover:text-brand transition-colors font-medium"
          >
            Didn&apos;t receive it? Try again
          </button>
        </motion.div>
      )}

      <div className="mt-8 pt-6 border-t border-border text-center">
        <Link href="/account/signin" className="text-xs text-quaternary hover:text-secondary flex items-center justify-center gap-1 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
