"use client";

import { useState } from "react";
import { User, Mail, Lock, Key, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function CredentialsSettingsPage() {
  const [loading, setLoading] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", authCode: "" });
  const [emailForm, setEmailForm] = useState({ newEmail: "", authCode: "" });
  const [usernameForm, setUsernameForm] = useState({ newUsername: "", authCode: "" });

  const requestOtp = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
      const res = await fetch(`${apiUrl}/api/account/credentials/request-otp`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request OTP");
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdate = async (type: 'password' | 'email' | 'username', bodyData: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
      const res = await fetch(`${apiUrl}/api/account/credentials/${type}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast.success(data.message);
      
      // Reset forms
      setPasswordForm({ current: "", new: "", authCode: "" });
      setEmailForm({ newEmail: "", authCode: "" });
      setUsernameForm({ newUsername: "", authCode: "" });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-medium tracking-tight text-primary">Credentials & Security</h1>
            <p className="text-sm text-tertiary">Manage your password, email, and 2FA settings.</p>
          </div>
        </div>
        <Link 
          href="/account/settings/credentials/two-factor"
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border hover:border-brand text-sm font-medium text-secondary hover:text-brand rounded-md transition-colors"
        >
          <Smartphone className="w-4 h-4" />
          Manage 2FA
        </Link>
      </div>

      <div className="mb-6 bg-brand/5 border border-brand/20 p-4 rounded-xl flex items-start gap-3">
        <Lock className="w-5 h-5 text-brand shrink-0 mt-0.5" />
        <div className="text-sm text-secondary">
          <span className="font-medium text-brand block mb-1">Security Verification Required</span>
          Before changing sensitive credentials, you must provide a 6-digit code. If 2FA is enabled, use your Authenticator app. Otherwise, click below to receive an OTP via email.
          <button onClick={requestOtp} className="block mt-2 text-brand hover:text-accent font-medium underline-offset-4 hover:underline">
            Send Email OTP
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Change Password */}
        <section className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-sm font-medium text-primary mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-tertiary" /> Change Password
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input 
              type="password" placeholder="Current Password" value={passwordForm.current}
              onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
              className="w-full bg-[rgba(255,255,255,0.02)] text-primary border border-input focus:border-brand px-3 py-2 rounded-md text-sm outline-none transition-all"
            />
            <input 
              type="password" placeholder="New Password" value={passwordForm.new}
              onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
              className="w-full bg-[rgba(255,255,255,0.02)] text-primary border border-input focus:border-brand px-3 py-2 rounded-md text-sm outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="text" placeholder="6-digit Code (OTP/2FA)" maxLength={6} value={passwordForm.authCode}
              onChange={(e) => setPasswordForm({...passwordForm, authCode: e.target.value})}
              className="w-48 bg-[rgba(255,255,255,0.02)] text-primary border border-input focus:border-brand px-3 py-2 rounded-md text-sm outline-none transition-all"
            />
            <button 
              onClick={() => handleUpdate('password', { currentPassword: passwordForm.current, newPassword: passwordForm.new, authCode: passwordForm.authCode })}
              disabled={loading || !passwordForm.current || !passwordForm.new || passwordForm.authCode.length !== 6}
              className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent disabled:opacity-50 transition-colors"
            >
              Update Password
            </button>
          </div>
        </section>

        {/* Change Email */}
        <section className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-sm font-medium text-primary mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-tertiary" /> Change Email
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input 
              type="email" placeholder="New Email Address" value={emailForm.newEmail}
              onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
              className="flex-1 w-full bg-[rgba(255,255,255,0.02)] text-primary border border-input focus:border-brand px-3 py-2 rounded-md text-sm outline-none transition-all"
            />
            <input 
              type="text" placeholder="6-digit Code" maxLength={6} value={emailForm.authCode}
              onChange={(e) => setEmailForm({...emailForm, authCode: e.target.value})}
              className="w-full sm:w-48 bg-[rgba(255,255,255,0.02)] text-primary border border-input focus:border-brand px-3 py-2 rounded-md text-sm outline-none transition-all"
            />
            <button 
              onClick={() => handleUpdate('email', { newEmail: emailForm.newEmail, authCode: emailForm.authCode })}
              disabled={loading || !emailForm.newEmail || emailForm.authCode.length !== 6}
              className="w-full sm:w-auto bg-surface border border-border text-primary px-4 py-2 rounded-md text-sm font-medium hover:border-brand transition-colors whitespace-nowrap"
            >
              Update Email
            </button>
          </div>
        </section>

        {/* Change Username */}
        <section className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-sm font-medium text-primary mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-tertiary" /> Change Username
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input 
              type="text" placeholder="New Username" value={usernameForm.newUsername}
              onChange={(e) => setUsernameForm({...usernameForm, newUsername: e.target.value})}
              className="flex-1 w-full bg-[rgba(255,255,255,0.02)] text-primary border border-input focus:border-brand px-3 py-2 rounded-md text-sm outline-none transition-all"
            />
            <input 
              type="text" placeholder="6-digit Code" maxLength={6} value={usernameForm.authCode}
              onChange={(e) => setUsernameForm({...usernameForm, authCode: e.target.value})}
              className="w-full sm:w-48 bg-[rgba(255,255,255,0.02)] text-primary border border-input focus:border-brand px-3 py-2 rounded-md text-sm outline-none transition-all"
            />
            <button 
              onClick={() => handleUpdate('username', { newUsername: usernameForm.newUsername, authCode: usernameForm.authCode })}
              disabled={loading || !usernameForm.newUsername || usernameForm.authCode.length !== 6}
              className="w-full sm:w-auto bg-surface border border-border text-primary px-4 py-2 rounded-md text-sm font-medium hover:border-brand transition-colors whitespace-nowrap"
            >
              Update Username
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
