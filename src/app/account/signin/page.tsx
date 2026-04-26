"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof schema>;

export default function SignInPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // Mock submit
    console.log(data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-8 linear-shadow-card">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-medium tracking-[-0.288px] text-primary mb-2">Welcome back</h1>
        <p className="text-sm text-tertiary">Sign in to your IPTVCloud account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-secondary tracking-[-0.182px]">Email</label>
          <input 
            type="email" 
            {...register("email")}
            placeholder="name@example.com"
            className={`w-full bg-[rgba(255,255,255,0.02)] text-primary border ${errors.email ? 'border-[#e5484d] focus:border-[#e5484d] focus:ring-[rgba(229,72,77,0.25)]' : 'border-input focus:border-accent focus:ring-[rgba(113,112,255,0.25)]'} px-3.5 py-2.5 rounded-md text-sm outline-none transition-all focus:ring-2`}
          />
          {errors.email && <p className="text-[11px] text-[#e5484d] mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-secondary tracking-[-0.182px]">Password</label>
            <Link href="#" className="text-xs text-tertiary hover:text-primary transition-colors">Forgot password?</Link>
          </div>
          <input 
            type="password" 
            {...register("password")}
            placeholder="••••••••"
            className={`w-full bg-[rgba(255,255,255,0.02)] text-primary border ${errors.password ? 'border-[#e5484d] focus:border-[#e5484d] focus:ring-[rgba(229,72,77,0.25)]' : 'border-input focus:border-accent focus:ring-[rgba(113,112,255,0.25)]'} px-3.5 py-2.5 rounded-md text-sm outline-none transition-all focus:ring-2`}
          />
          {errors.password && <p className="text-[11px] text-[#e5484d] mt-1">{errors.password.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-brand text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50 mt-2"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-tertiary">
        Don't have an account? <Link href="/account/signup" className="text-accent hover:text-primary transition-colors">Sign up</Link>
      </div>
    </div>
  );
}