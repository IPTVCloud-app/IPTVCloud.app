"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrengthBar({ password = "" }: PasswordStrengthProps) {
  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter", met: /[a-z]/.test(password) },
    { label: "At least one number", met: /[0-9]/.test(password) },
    { label: "At least one special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const getColor = (s: number) => {
    if (s <= 1) return "bg-red-500";
    if (s <= 3) return "bg-yellow-500";
    if (s <= 4) return "bg-emerald-500";
    return "bg-brand";
  };

  const getLabel = (s: number) => {
    if (!password) return "";
    if (s <= 1) return "Weak";
    if (s <= 3) return "Fair";
    if (s <= 4) return "Good";
    return "Strong";
  };

  return (
    <div className="space-y-3 mt-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] uppercase font-mono tracking-wider text-quaternary">Strength</span>
        <span className={`text-[10px] font-medium uppercase tracking-wider ${score > 3 ? 'text-brand' : 'text-secondary'}`}>
          {getLabel(score)}
        </span>
      </div>
      
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: score >= step ? "100%" : "0%" }}
              className={`h-full ${getColor(score)} transition-colors duration-500`}
            />
          </div>
        ))}
      </div>

      <ul className="space-y-1.5 pt-1">
        {requirements.map((req, i) => (
          <li key={i} className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${req.met ? 'bg-brand shadow-[0_0_8px_rgba(94,106,210,0.5)]' : 'bg-[rgba(255,255,255,0.1)]'}`} />
            <span className={`text-[11px] transition-colors duration-300 ${req.met ? 'text-secondary' : 'text-quaternary'}`}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
