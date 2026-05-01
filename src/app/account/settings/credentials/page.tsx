"use client";

import { useState } from "react";
import { User, Mail, Lock, Key, Smartphone, X, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-border bg-page/50">
            <h3 className="font-bold text-primary flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-brand" /> {title}
            </h3>
            <button onClick={onClose} className="text-secondary hover:text-primary transition-colors p-1"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function CredentialsSettingsPage() {
  const [loading, setLoading] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [emailForm, setEmailForm] = useState({ newEmail: "", confirmEmail: "" });
  const [usernameForm, setUsernameForm] = useState({ newUsername: "" });

  const [verifyModal, setVerifyModal] = useState<{ isOpen: boolean, actionType: 'password' | 'email' | 'username' | null, authCode: string }>({ isOpen: false, actionType: null, authCode: "" });

  const requestOtp = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const res = await fetch(`${apiUrl}/api/account/credentials/request-otp`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request OTP");
      toast.success(data.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred");
    }
  };

  const handleOpenVerify = (type: 'password' | 'email' | 'username') => {
    if (type === 'password' && passwordForm.new !== passwordForm.confirm) {
      toast.error("Passwords do not match"); return;
    }
    if (type === 'email' && emailForm.newEmail !== emailForm.confirmEmail) {
      toast.error("Emails do not match"); return;
    }
    setVerifyModal({ isOpen: true, actionType: type, authCode: "" });
  };

  const executeUpdate = async () => {
    if (!verifyModal.actionType || verifyModal.authCode.length !== 6) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      
      let bodyData = {};
      if (verifyModal.actionType === 'password') {
        bodyData = { currentPassword: passwordForm.current, newPassword: passwordForm.new, authCode: verifyModal.authCode };
      } else if (verifyModal.actionType === 'email') {
        bodyData = { newEmail: emailForm.newEmail, authCode: verifyModal.authCode };
      } else if (verifyModal.actionType === 'username') {
        bodyData = { newUsername: usernameForm.newUsername, authCode: verifyModal.authCode };
      }

      const res = await fetch(`${apiUrl}/api/account/credentials/${verifyModal.actionType}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(bodyData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      
      toast.success(data.message);
      setVerifyModal({ isOpen: false, actionType: null, authCode: "" });
      setPasswordForm({ current: "", new: "", confirm: "" });
      setEmailForm({ newEmail: "", confirmEmail: "" });
      setUsernameForm({ newUsername: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
          <Key className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-medium tracking-tight text-primary">Credentials & Security</h1>
          <p className="text-sm text-tertiary">Manage your password, email, and 2FA settings.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Change Password */}
        <section className="card">
          <h2 className="text-sm font-medium text-primary mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-tertiary" /> Change Password
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input 
              type="password" placeholder="Current Password" value={passwordForm.current}
              onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
              className="form-input"
            />
            <input 
              type="password" placeholder="New Password" value={passwordForm.new}
              onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
              className="form-input"
            />
            <input 
              type="password" placeholder="Confirm New Password" value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
              className="form-input"
            />
          </div>
          <button 
            onClick={() => handleOpenVerify('password')}
            disabled={!passwordForm.current || !passwordForm.new || !passwordForm.confirm}
            className="bg-surface border border-border text-primary px-4 py-2 rounded-md text-sm font-medium hover:border-brand transition-colors whitespace-nowrap"
          >
            Change Password
          </button>
        </section>

        {/* Change Email */}
        <section className="card">
          <h2 className="text-sm font-medium text-primary mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-tertiary" /> Change Email
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input 
              type="email" placeholder="New Email Address" value={emailForm.newEmail}
              onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
              className="form-input"
            />
            <input 
              type="email" placeholder="Confirm New Email" value={emailForm.confirmEmail}
              onChange={(e) => setEmailForm({...emailForm, confirmEmail: e.target.value})}
              className="form-input"
            />
          </div>
          <button 
            onClick={() => handleOpenVerify('email')}
            disabled={!emailForm.newEmail || !emailForm.confirmEmail}
            className="bg-surface border border-border text-primary px-4 py-2 rounded-md text-sm font-medium hover:border-brand transition-colors whitespace-nowrap"
          >
            Update Email
          </button>
        </section>

        {/* Change Username */}
        <section className="card">
          <h2 className="text-sm font-medium text-primary mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-tertiary" /> Change Username
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input 
              type="text" placeholder="New Username" value={usernameForm.newUsername}
              onChange={(e) => setUsernameForm({...usernameForm, newUsername: e.target.value})}
              className="form-input"
            />
            <button 
              onClick={() => handleOpenVerify('username')}
              disabled={!usernameForm.newUsername}
              className="w-full sm:w-auto bg-surface border border-border text-primary px-4 py-2 rounded-md text-sm font-medium hover:border-brand transition-colors whitespace-nowrap"
            >
              Update Username
            </button>
          </div>
        </section>

        {/* Manage 2FA Section */}
        <section className="bg-gradient-to-r from-brand/10 to-accent/10 border border-brand/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-base font-bold text-primary mb-1 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-brand" /> Two-Factor Authentication
            </h2>
            <p className="text-sm text-secondary">Enhance your account security by requiring an app-based code during login.</p>
          </div>
          <Link 
            href="/account/settings/credentials/two-factor"
            className="px-6 py-2.5 bg-brand text-white rounded-full text-sm font-bold shadow-lg shadow-brand/20 hover:scale-105 transition-transform whitespace-nowrap shrink-0"
          >
            Manage 2FA Setup
          </Link>
        </section>
      </div>

      {/* Verification Modal */}
      <Modal isOpen={verifyModal.isOpen} onClose={() => setVerifyModal({ isOpen: false, actionType: null, authCode: "" })} title="Security Verification Required">
        <p className="text-sm text-secondary mb-4 leading-relaxed">
          Please enter your 6-digit verification code to confirm this action. Use your Authenticator app if 2FA is enabled.
        </p>
        <div className="mb-6 flex gap-2">
           <input 
             type="text" placeholder="Enter 6-digit code" maxLength={6} value={verifyModal.authCode}
             onChange={(e) => setVerifyModal({...verifyModal, authCode: e.target.value})}
             className="form-input"
           />
        </div>
        <div className="flex flex-col gap-3">
          <button 
            onClick={executeUpdate}
            disabled={verifyModal.authCode.length !== 6 || loading}
            className="btn-brand"
          >
            {loading ? "Verifying..." : "Confirm & Update"}
          </button>
          <button onClick={requestOtp} className="text-xs text-brand font-medium hover:underline text-center">
            Don't have an app? Send Email OTP
          </button>
        </div>
      </Modal>

    </div>
  );
}
