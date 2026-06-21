"use client";

import * as React from "react";
import { getProfile, updateProfile } from "@/lib/actions";

export function ProfileTab() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [alternateEmail, setAlternateEmail] = React.useState("");
  const [addressLine1, setAddressLine1] = React.useState("");
  const [city, setCity] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  React.useEffect(() => {
    getProfile().then((profile) => {
      if (profile) {
        setName(profile.name || "");
        setEmail(profile.email || "");
        setPhone(profile.phone || "");
        setAlternateEmail(profile.alternate_email || "");
        setAddressLine1(profile.address_line1 || "");
        setCity(profile.city || "");
        setPostalCode(profile.postal_code || "");
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile({
        name,
        phone,
        alternate_email: alternateEmail,
        address_line1: addressLine1,
        city,
        postal_code: postalCode,
      });
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch {
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* ── Personal Info ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 lg:p-10">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
          Personal Information
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Manage your name and profile photo.
        </p>

        {/* Avatar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
          <div className="size-24 rounded-full bg-gradient-to-br from-muted to-border flex items-center justify-center shrink-0">
            <span className="text-3xl font-serif font-bold text-muted-foreground">
              {name ? name.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              {name || "Your Name"}
            </p>
            <button className="px-5 py-2.5 text-xs font-semibold tracking-wider uppercase border border-border text-foreground hover:border-gold hover:text-gold transition-colors">
              Change Photo
            </button>
          </div>
        </div>

        {/* Name fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3.5 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Primary Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3.5 bg-muted border border-border text-sm text-muted-foreground"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Email cannot be changed here.
            </p>
          </div>
        </div>
      </div>

      {/* ── Contact & Delivery Details ─────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 lg:p-10">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
          Contact & Delivery Details
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Used for order delivery and account recovery.
        </p>

        <div className="flex flex-col gap-6 max-w-2xl">
          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 300 1234567"
              className="w-full px-4 py-3.5 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Required by courier for delivery updates.
            </p>
          </div>

          {/* Alternate email */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Alternate Email{" "}
              <span className="text-muted-foreground/60">(Optional)</span>
            </label>
            <input
              type="email"
              value={alternateEmail}
              onChange={(e) => setAlternateEmail(e.target.value)}
              placeholder="backup@example.com"
              className="w-full px-4 py-3.5 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              For account recovery if primary email is inaccessible.
            </p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Default Shipping Address
            </label>
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="Street address, apartment, suite, etc."
              className="w-full px-4 py-3.5 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {/* City + Postal Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Lahore"
                className="w-full px-4 py-3.5 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Postal Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="54000"
                className="w-full px-4 py-3.5 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Save ────────────────────────────────────────────────────────────── */}
      <div>
        {message && (
          <p
            className={`mb-4 text-sm ${
              message.type === "success" ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {message.text}
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3.5 bg-foreground text-background text-xs font-semibold tracking-[0.2em] uppercase hover:bg-gold hover:text-foreground transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}
