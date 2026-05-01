"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { PasswordStrengthBar } from "../signup/PasswordStrength";

const schema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const passwordValue = watch("password", "");

  const onSubmit = async (data: FormData) => {
    if (!email || !token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const response = await fetch(`${apiUrl}/auth/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to reset password");
      }

      setIsSuccess(true);
      toast.success("Password reset successful!");
      setTimeout(() => router.push("/account/signin"), 3000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="card">
        <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-6 shadow-elevated">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h3 className="text-xl font-medium text-primary mb-2">Password Reset!</h3>
        <p className="text-sm text-tertiary mb-8">Your password has been updated successfully. Redirecting you to login...</p>
        <Link href="/account/signin" className="text-xs text-accent hover:text-brand transition-colors font-medium">
          Click here if you are not redirected
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-medium tracking-[-0.288px] text-primary mb-2">Set New Password</h1>
        <p className="text-sm text-tertiary">Please enter and confirm your new password below.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input 
            type="password" 
            {...register("password")}
            placeholder="••••••••"
            className={`form-input ${errors.password ? 'form-input--error' : ''}`}
          />
          {errors.password && <p className="form-state-label" style={{color: '#e5484d'}}>{errors.password.message}</p>}
          <PasswordStrengthBar password={passwordValue} />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input 
            type="password" 
            {...register("confirmPassword")}
            placeholder="••••••••"
            className={`form-input ${errors.confirmPassword ? 'form-input--error' : ''}`}
          />
          {errors.confirmPassword && <p className="form-state-label" style={{color: '#e5484d'}}>{errors.confirmPassword.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || !email || !token}
          className="btn-brand w-full"
        >
          {isSubmitting ? "Updating..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="card">
        <div className="h-8 w-48 bg-panel rounded mx-auto mb-4" />
        <div className="h-4 w-64 bg-panel rounded mx-auto mb-8" />
        <div className="space-y-6">
          <div className="h-10 bg-panel rounded w-full" />
          <div className="h-10 bg-panel rounded w-full" />
          <div className="h-10 bg-brand/20 rounded w-full mt-4" />
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
