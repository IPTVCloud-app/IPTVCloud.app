"use client";

import { useState, useEffect } from "react";
import { Smartphone, CheckCircle2, AlertCircle, ArrowLeft, X, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto pt-20"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
          className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-auto"
        >
          <div className="flex items-center justify-between p-4 border-b border-border bg-page/50 sticky top-0 z-10">
            <h3 className="font-bold text-primary flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-brand" /> {title}
            </h3>
            <button onClick={onClose} className="text-secondary hover:text-primary transition-colors p-1"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[80vh]">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function TwoFactorSettingsPage() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<{ secret: string, qrCodeUrl: string } | null>(null);
  const [authCode, setAuthCode] = useState("");
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
        const res = await fetch(`${apiUrl}/api/account/2fa/status`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setIsEnabled(data.is_enabled);
        }
      } catch (error) {
        console.error("Failed to check 2FA status", error);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  const startSetup = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const res = await fetch(`${apiUrl}/api/account/2fa/setup`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize setup");
      setSetupData(data);
      setIsSetupModalOpen(true);
      setAuthCode("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (action: 'verify' | 'disable') => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const res = await fetch(`${apiUrl}/api/account/2fa/${action}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ code: authCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${action} 2FA`);
      
      toast.success(data.message);
      setIsEnabled(action === 'verify');
      if (action === 'verify') setIsSetupModalOpen(false);
      setSetupData(null);
      setAuthCode("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !setupData && !isEnabled) return <div className="p-8 text-tertiary">Loading 2FA settings...</div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/account/settings/credentials" className="inline-flex items-center gap-2 text-sm text-tertiary hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Credentials
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-emerald/10 flex items-center justify-center text-emerald">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-medium tracking-tight text-primary">Two-Factor Authentication</h1>
          <p className="text-sm text-tertiary">Protect your account with an extra layer of security.</p>
        </div>
      </div>

      {isEnabled ? (
        <div className="bg-surface border border-emerald/20 rounded-xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-primary mb-2">2FA is Currently Enabled</h2>
          <p className="text-sm text-tertiary max-w-md mx-auto mb-8">
            Your account is secured. You will be required to enter a 6-digit code from your authenticator app whenever you sign in or make sensitive changes.
          </p>
          
          <div className="max-w-sm mx-auto bg-page border border-border p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-primary mb-2 text-left text-red-500">Disable 2FA</h3>
            <p className="text-xs text-tertiary text-left mb-4">To disable Two-Factor Authentication, please enter a code from your authenticator app.</p>
            <div className="flex flex-col gap-3">
              <input 
                type="text" placeholder="Enter 6-digit code" maxLength={6} value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                className="form-input"
              />
              <button 
                onClick={() => handleVerify('disable')}
                disabled={authCode.length !== 6 || loading}
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                Disable Protection
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-primary mb-2">2FA is Not Enabled</h2>
          <p className="text-sm text-tertiary max-w-md mx-auto mb-8">
            Two-Factor Authentication is highly recommended. It adds an extra layer of security to your account by requiring more than just a password to sign in.
          </p>
          <button 
            onClick={startSetup}
            disabled={loading}
            className="bg-brand text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-xl shadow-brand/20"
          >
            Set Up Authenticator App
          </button>
        </div>
      )}

      <Modal isOpen={isSetupModalOpen} onClose={() => setIsSetupModalOpen(false)} title="Configure Authenticator App">
        {setupData && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
               <p className="text-sm text-secondary mb-4">Scan this QR code using Google Authenticator, Authy, or any standard TOTP app.</p>
               <div className="inline-block bg-white p-4 rounded-2xl shadow-inner mx-auto border border-border">
                 <Image src={setupData.qrCodeUrl} alt="2FA QR Code" width={200} height={200} className="rounded" />
               </div>
            </div>

            <div className="bg-page/50 p-4 rounded-xl border border-border text-center">
              <h3 className="text-xs font-bold text-quaternary uppercase tracking-wider mb-2">Manual Entry Code</h3>
              <code className="bg-surface px-4 py-2 rounded-lg border border-border text-brand text-sm block w-full select-all font-mono">
                {setupData.secret}
              </code>
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-bold text-primary mb-3 text-center">Verify Setup Code</h3>
              <div className="flex flex-col gap-3">
                <input 
                  type="text" placeholder="Enter 6-digit code" maxLength={6} value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  className="form-input"
                />
                <button 
                  onClick={() => handleVerify('verify')}
                  disabled={authCode.length !== 6 || loading}
                  className="btn-brand"
                >
                  Enable Protection
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
