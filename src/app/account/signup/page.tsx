"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { PasswordStrengthBar } from "./PasswordStrength";
import { API_URL } from "@/lib/api";

const schema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  middleInitial: z.string().max(1, { message: "Must be 1 character" }).optional().or(z.literal("")),
  lastName: z.string().optional().or(z.literal("")),
  suffix: z.enum(["N/A", "Jr.", "Sr.", "II", "III", "IV", "V"]),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  birthday: z.string().refine((dateString) => {
    if (!dateString) return false;
    const birthday = new Date(dateString);
    if (isNaN(birthday.getTime())) return false;
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 13;
  }, { message: "You must be at least 13 years old to sign up." })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function SignUpPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      suffix: "N/A"
    }
  });

  const passwordValue = watch("password", "");

  const onSubmit = async (data: FormData) => {
    try {
      setAuthError(null);
      
      // Fixing the API URL - ensure it uses the full path
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          middleInitial: data.middleInitial,
          lastName: data.lastName,
          suffix: data.suffix,
          username: data.username,
          email: data.email,
          password: data.password,
          birthday: data.birthday,
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("Server returned an invalid response");
      }

      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to create account");
      }

      toast.success("Account created! Please sign in.");
      router.push(`/account/signin?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "An unexpected error occurred";
      setAuthError(msg);
      toast.error(msg);
    }
  };

  const onError = (errors: Record<string, { message?: string }>) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message);
    }
  };

  return (
    <div className="card relative z-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-medium tracking-[-0.288px] text-primary mb-2 text-display">Create an account</h1>
        <p className="text-sm text-tertiary text-body">Start streaming with IPTVCloud today</p>
      </div>

      {authError && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-8 form-group">
            <label className="form-label">First Name *</label>
            <input 
              type="text" 
              {...register("firstName")}
              placeholder="John"
              className={`form-input ${errors.firstName ? 'form-input--error' : ''}`}
            />
          </div>
          <div className="col-span-4 form-group">
            <label className="form-label">M.I.</label>
            <input 
              type="text" 
              maxLength={1}
              {...register("middleInitial")}
              placeholder="Q"
              className="form-input text-center"
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-8 form-group">
            <label className="form-label">Last Name</label>
            <input 
              type="text" 
              {...register("lastName")}
              placeholder="Doe"
              className="form-input"
            />
          </div>
          <div className="col-span-4 form-group">
            <label className="form-label">Suffix</label>
            <select 
              {...register("suffix")}
              className="form-input appearance-none cursor-pointer"
            >
              <option value="N/A">N/A</option>
              <option value="Jr.">Jr.</option>
              <option value="Sr.">Sr.</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
              <option value="V">V</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Username *</label>
          <input 
            type="text" 
            {...register("username")}
            placeholder="johndoe88"
            className={`form-input ${errors.username ? 'form-input--error' : ''}`}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email *</label>
          <input 
            type="email" 
            {...register("email")}
            placeholder="name@example.com"
            className={`form-input ${errors.email ? 'form-input--error' : ''}`}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Birthday *</label>
          <input 
            type="date" 
            {...register("birthday")}
            className={`form-input ${errors.birthday ? 'form-input--error' : ''}`}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password *</label>
          <input 
            type="password" 
            {...register("password")}
            placeholder="••••••••"
            className={`form-input ${errors.password ? 'form-input--error' : ''}`}
          />
          <PasswordStrengthBar password={passwordValue} />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password *</label>
          <input 
            type="password" 
            {...register("confirmPassword")}
            placeholder="••••••••"
            className={`form-input ${errors.confirmPassword ? 'form-input--error' : ''}`}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn-brand w-full mt-4"
        >
          {isSubmitting ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-tertiary">
        Already have an account? <Link href="/account/signin" className="text-accent hover:text-primary transition-colors">Sign in</Link>
      </div>
    </div>
  );
}
