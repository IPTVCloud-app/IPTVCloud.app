"use client";

import { useState, useEffect } from "react";
import { Smartphone, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

export default function TwoFactorSettingsPage() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<{ secret: string, qrCodeUrl: string } | null>(null);
  const [authCode, setAuthCode] = useState("");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");
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
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");
      const res = await fetch(`${apiUrl}/api/account/2fa/setup`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize setup");
      setSetupData(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (action: 'verify' | 'disable') => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");
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
      setSetupData(null);
      setAuthCode("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !setupData) return <div className="p-8 text-tertiary">Loading 2FA settings...</div>;

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
        <div className="bg-surface border border-emerald/20 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-medium text-primary mb-2">2FA is Currently Enabled</h2>
          <p className="text-sm text-tertiary max-w-md mx-auto mb-8">
            Your account is secured. You will be required to enter a 6-digit code from your authenticator app whenever you sign in or make sensitive changes.
          </p>
          
          <div className="max-w-sm mx-auto bg-page border border-border p-6 rounded-lg">
            <h3 className="text-sm font-medium text-primary mb-4 text-left">Disable 2FA</h3>
            <p className="text-xs text-tertiary text-left mb-4">To disable Two-Factor Authentication, please enter a code from your authenticator app.</p>
            <div className="flex items-center gap-3">
              <input 
                type="text" placeholder="6-digit code" maxLength={6} value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                className="flex-1 bg-[rgba(255,255,255,0.02)] text-primary border border-input focus:border-red-500 px-3 py-2 rounded-md text-sm outline-none transition-all"
              />
              <button 
                onClick={() => handleVerify('disable')}
                disabled={authCode.length !== 6 || loading}
                className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                Disable
              </button>
            </div>
          </div>
        </div>
      ) : setupData ? (
        <div className="bg-surface border border-border rounded-xl p-8">
          <h2 className="text-lg font-medium text-primary mb-6">Set up Authenticator App</h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="shrink-0 bg-white p-4 rounded-xl">
              <Image src={setupData.qrCodeUrl} alt="2FA QR Code" width={160} height={160} />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-primary mb-1">1. Scan the QR Code</h3>
                <p className="text-sm text-tertiary">Use Google Authenticator, Authy, or your preferred 2FA app to scan this QR code.</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-primary mb-1">Manual Entry Code</h3>
                <code className="bg-page px-3 py-1.5 rounded-md border border-border text-brand text-xs block w-full select-all">
                  {setupData.secret}
                </code>
              </div>
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-primary mb-2">2. Verify Setup</h3>
                <div className="flex items-center gap-3">
                  <input 
                    type="text" placeholder="6-digit code" maxLength={6} value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    className="flex-1 bg-[rgba(255,255,255,0.02)] text-primary border border-input focus:border-brand px-3 py-2 rounded-md text-sm outline-none transition-all"
                  />
                  <button 
                    onClick={() => handleVerify('verify')}
                    disabled={authCode.length !== 6 || loading}
                    className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-medium text-primary mb-2">2FA is Not Enabled</h2>
          <p className="text-sm text-tertiary max-w-md mx-auto mb-8">
            Two-Factor Authentication is highly recommended. It adds an extra layer of security to your account by requiring more than just a password to sign in.
          </p>
          <button 
            onClick={startSetup}
            disabled={loading}
            className="bg-brand text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50 shadow-lg shadow-brand/20"
          >
            Set Up 2FA
          </button>
        </div>
      )}
    </div>
  );
}
