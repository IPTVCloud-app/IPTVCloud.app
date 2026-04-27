"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const schema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
});

type FormData = z.infer<typeof schema>;

export default function FindAccountPage() {
  const [result, setResult] = useState<{ email: string; maskedEmail: string } | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(`${apiUrl}/auth/find-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Account not found");
      }

      setResult(resData);
      toast.success("Account found!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-8 linear-shadow-card">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-medium tracking-[-0.288px] text-primary mb-2">Find your account</h1>
        <p className="text-sm text-tertiary">Enter your username and we'll help you identify your registered email.</p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.form 
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit(onSubmit)} 
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-secondary tracking-[-0.182px]">Username</label>
              <input 
                type="text" 
                {...register("username")}
                placeholder="johndoe88"
                className={`w-full bg-[rgba(255,255,255,0.02)] text-primary border ${errors.username ? 'border-[#e5484d]' : 'border-input focus:border-accent'} px-3.5 py-2.5 rounded-md text-sm outline-none transition-all focus:ring-2 focus:ring-[rgba(113,112,255,0.1)]`}
              />
              {errors.username && <p className="text-[11px] text-[#e5484d] mt-1">{errors.username.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-brand text-white px-4 py-2.5 rounded-md text-sm font-medium transition-all hover:bg-accent disabled:opacity-50 mt-2 shadow-[0_2px_10px_rgba(94,106,210,0.3)] hover:-translate-y-0.5 active:translate-y-0"
            >
              {isSubmitting ? "Searching..." : "Search Account"}
            </button>
          </motion.form>
        ) : (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">Is this you?</h3>
            <p className="text-sm text-tertiary mb-6">We found an account associated with:</p>
            <div className="bg-[rgba(255,255,255,0.03)] border border-border rounded-lg py-3 px-4 mb-8 font-mono text-secondary">
              {result.maskedEmail}
            </div>
            <div className="flex flex-col gap-3">
              <Link href={`/account/signin?email=${encodeURIComponent(result.email)}`} className="w-full bg-brand text-white px-4 py-2.5 rounded-md text-sm font-medium transition-all hover:bg-accent shadow-[0_2px_10px_rgba(94,106,210,0.3)]">
                Yes, let me sign in
              </Link>
              <button 
                onClick={() => setResult(null)}
                className="text-xs text-quaternary hover:text-secondary transition-colors"
              >
                No, this is not my account
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 pt-6 border-t border-border text-center">
        <Link href="/account/signin" className="text-xs text-quaternary hover:text-secondary flex items-center justify-center gap-1 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
