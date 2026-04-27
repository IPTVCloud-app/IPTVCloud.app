"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

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
      const apiUrl = (process.env.PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");
      const response = await fetch(`${apiUrl}/auth/password/forgot`, {
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
    <div className="bg-surface border border-border rounded-xl p-8 linear-shadow-card">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-medium tracking-[-0.288px] text-primary mb-2">Forgot Password?</h1>
        <p className="text-sm text-tertiary">Enter your email and we&apos;ll send you a link to reset your password.</p>
      </div>

      {!isSent ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-secondary tracking-[-0.182px]">Email</label>
            <input 
              type="email" 
              {...register("email")}
              placeholder="name@example.com"
              className={`w-full bg-[rgba(255,255,255,0.02)] text-primary border ${errors.email ? 'border-[#e5484d]' : 'border-input focus:border-accent'} px-3.5 py-2.5 rounded-md text-sm outline-none transition-all focus:ring-2 focus:ring-[rgba(113,112,255,0.1)]`}
            />
            {errors.email && <p className="text-[11px] text-[#e5484d] mt-1">{errors.email.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-brand text-white px-4 py-2.5 rounded-md text-sm font-medium transition-all hover:bg-accent disabled:opacity-50 mt-2 shadow-[0_2px_10px_rgba(94,106,210,0.3)] hover:-translate-y-0.5 active:translate-y-0"
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
          <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(94,106,210,0.2)]">
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
