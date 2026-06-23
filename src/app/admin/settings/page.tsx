'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAuth } from '@/lib/context/admin-auth-context';
import { createClient } from '@/lib/supabase/client';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { getSiteSettings, updateSiteSettings, updateAdminEmail } from '@/lib/admin-actions';
import { updateAdminSessionEmail } from '@/app/auth/actions';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [emailEdited, setEmailEdited] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const [exchangeRate, setExchangeRate] = React.useState('');
  const [savingRate, setSavingRate] = React.useState(false);
  const [rateMessage, setRateMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [taxPercentage, setTaxPercentage] = React.useState('');
  const [savingTax, setSavingTax] = React.useState(false);
  const [taxMessage, setTaxMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [shippingCostPkr, setShippingCostPkr] = React.useState('');
  const [freeShipping, setFreeShipping] = React.useState(true);
  const [savingShipping, setSavingShipping] = React.useState(false);
  const [shippingMessage, setShippingMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [socialLinks, setSocialLinks] = React.useState({
    instagram: '',
    facebook: '',
    twitter: '',
    tiktok: '',
    youtube: '',
    pinterest: '',
  });
  const [savingSocial, setSavingSocial] = React.useState(false);
  const [socialMessage, setSocialMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (authLoading) return;
    Promise.all([
      getSiteSettings('currency'),
      getSiteSettings('tax'),
      getSiteSettings('shipping'),
      getSiteSettings('social_links'),
    ]).then(([currencyData, taxData, shippingData, socialData]) => {
      if (currencyData?.exchange_rate) {
        setExchangeRate(String(currencyData.exchange_rate));
      }
      if (taxData?.tax_percentage !== undefined) {
        setTaxPercentage(String(taxData.tax_percentage));
      }
      if (shippingData?.shipping_cost_pkr !== undefined) {
        const cost = Number(shippingData.shipping_cost_pkr);
        setShippingCostPkr(String(cost));
        setFreeShipping(cost === 0);
      }
      if (socialData) {
        setSocialLinks({
          instagram: (socialData.instagram as string) || '',
          facebook: (socialData.facebook as string) || '',
          twitter: (socialData.twitter as string) || '',
          tiktok: (socialData.tiktok as string) || '',
          youtube: (socialData.youtube as string) || '',
          pinterest: (socialData.pinterest as string) || '',
        });
      }
      setLoading(false);
    });
  }, [authLoading]);

  const displayEmail = emailEdited ? newEmail : (user?.email || '');

  const handleEmailChange = (value: string) => {
    setEmailEdited(true);
    setNewEmail(value);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpdateEmail = async () => {
    const emailToSend = emailEdited ? newEmail : (user?.email || '');
    if (!emailToSend || emailToSend === user?.email) {
      showMessage('error', 'Please enter a different email address.');
      return;
    }
    setSaving(true);

    // Step 1: Swap profile roles (old → customer, new → admin)
    try {
      await updateAdminEmail(user?.email || '', emailToSend);
    } catch (err) {
      setSaving(false);
      showMessage('error', err instanceof Error ? err.message : 'Failed to update admin role.');
      return;
    }

    // Step 2: Update auth email
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: emailToSend });
    setSaving(false);

    if (error) {
      // Rollback: swap roles back
      try { await updateAdminEmail(emailToSend, user?.email || ''); } catch { /* ignore */ }
      showMessage('error', error.message);
    } else {
      // Update admin_session cookie's _admin_email field
      try { await updateAdminSessionEmail(emailToSend); } catch { /* ignore */ }
      showMessage('success', 'Verification email sent. Please check your inbox.');
      setEmailEdited(false);
      setNewEmail('');
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      showMessage('error', 'Please enter a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage('error', 'Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters.');
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);

    if (error) {
      showMessage('error', error.message);
    } else {
      showMessage('success', 'Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleSaveRate = async () => {
    const rate = parseFloat(exchangeRate);
    if (!rate || rate <= 0) {
      setRateMessage({ type: 'error', text: 'Please enter a valid exchange rate.' });
      return;
    }

    setSavingRate(true);
    try {
      await updateSiteSettings('currency', { exchange_rate: rate });
      setRateMessage({ type: 'success', text: 'Exchange rate updated successfully.' });
    } catch {
      setRateMessage({ type: 'error', text: 'Failed to update exchange rate.' });
    }
    setSavingRate(false);
    setTimeout(() => setRateMessage(null), 5000);
  };

  const handleSaveTax = async () => {
    const pct = parseFloat(taxPercentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      setTaxMessage({ type: 'error', text: 'Please enter a valid tax percentage (0-100).' });
      return;
    }

    setSavingTax(true);
    try {
      await updateSiteSettings('tax', { tax_percentage: pct });
      setTaxMessage({ type: 'success', text: 'Tax settings updated successfully.' });
    } catch {
      setTaxMessage({ type: 'error', text: 'Failed to update tax settings.' });
    }
    setSavingTax(false);
    setTimeout(() => setTaxMessage(null), 5000);
  };

  const handleSaveShipping = async () => {
    const cost = freeShipping ? 0 : parseFloat(shippingCostPkr);
    if (!freeShipping && (isNaN(cost) || cost < 0)) {
      setShippingMessage({ type: 'error', text: 'Please enter a valid shipping cost.' });
      return;
    }

    setSavingShipping(true);
    try {
      await updateSiteSettings('shipping', { shipping_cost_pkr: cost });
      setShippingMessage({ type: 'success', text: 'Shipping settings updated successfully.' });
    } catch {
      setShippingMessage({ type: 'error', text: 'Failed to update shipping settings.' });
    }
    setSavingShipping(false);
    setTimeout(() => setShippingMessage(null), 5000);
  };

  const handleSaveSocial = async () => {
    setSavingSocial(true);
    try {
      await updateSiteSettings('social_links', socialLinks);
      setSocialMessage({ type: 'success', text: 'Social links updated successfully.' });
    } catch {
      setSocialMessage({ type: 'error', text: 'Failed to update social links.' });
    }
    setSavingSocial(false);
    setTimeout(() => setSocialMessage(null), 5000);
  };

  if (loading || authLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-[#0A0A0A]">Account Settings</h2>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Section A — Change Email */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
              Current Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
              New Email
            </label>
            <input
              type="email"
              value={displayEmail}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="new@email.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
            />
          </div>
          <button
            onClick={handleUpdateEmail}
            disabled={saving}
            className="px-6 py-2.5 bg-[#C9A84C] text-white text-sm font-semibold rounded-lg hover:bg-[#C9A84C]/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Email'}
          </button>
        </CardContent>
      </Card>

      {/* Section B — Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
              New Password
            </label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
              Confirm New Password
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
            />
          </div>
          <button
            onClick={handleUpdatePassword}
            disabled={saving || !newPassword || !confirmPassword}
            className="px-6 py-2.5 bg-[#C9A84C] text-white text-sm font-semibold rounded-lg hover:bg-[#C9A84C]/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </CardContent>
      </Card>

      {/* Section C — Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Currency Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rateMessage && (
            <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
              rateMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {rateMessage.text}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
              Exchange Rate
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 whitespace-nowrap">1 USD =</span>
              <input
                type="number"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                placeholder="278"
                min="1"
                step="0.01"
                className="w-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">PKR</span>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Used to convert prices when customer selects USD on the storefront.</p>
          </div>
          <button
            onClick={handleSaveRate}
            disabled={savingRate || !exchangeRate}
            className="px-6 py-2.5 bg-[#C9A84C] text-white text-sm font-semibold rounded-lg hover:bg-[#C9A84C]/90 transition-colors disabled:opacity-50"
          >
            {savingRate ? 'Saving...' : 'Save Exchange Rate'}
          </button>
        </CardContent>
      </Card>

      {/* Section D — Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tax Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {taxMessage && (
            <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
              taxMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {taxMessage.text}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
              Tax Percentage (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
                step="0.1"
                className="w-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              This percentage will be applied to the order subtotal regardless of selected currency (PKR/USD).
            </p>
          </div>
          <button
            onClick={handleSaveTax}
            disabled={savingTax || taxPercentage === ''}
            className="px-6 py-2.5 bg-[#C9A84C] text-white text-sm font-semibold rounded-lg hover:bg-[#C9A84C]/90 transition-colors disabled:opacity-50"
          >
            {savingTax ? 'Saving...' : 'Save Tax Settings'}
          </button>
        </CardContent>
      </Card>

      {/* Section E — Shipping Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shipping Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {shippingMessage && (
            <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
              shippingMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {shippingMessage.text}
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="freeShipping"
              checked={freeShipping}
              onChange={(e) => {
                setFreeShipping(e.target.checked);
                if (e.target.checked) setShippingCostPkr('0');
              }}
              className="size-4 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
            />
            <label htmlFor="freeShipping" className="text-sm text-gray-700">
              Free Shipping
            </label>
          </div>
          {!freeShipping && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
                Shipping Cost (PKR)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Rs</span>
                <input
                  type="number"
                  value={shippingCostPkr}
                  onChange={(e) => setShippingCostPkr(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1"
                  className="w-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                This is a fixed shipping cost in PKR. It will be converted automatically for other currencies.
              </p>
            </div>
          )}
          <button
            onClick={handleSaveShipping}
            disabled={savingShipping}
            className="px-6 py-2.5 bg-[#C9A84C] text-white text-sm font-semibold rounded-lg hover:bg-[#C9A84C]/90 transition-colors disabled:opacity-50"
          >
            {savingShipping ? 'Saving...' : 'Save Shipping Settings'}
          </button>
        </CardContent>
      </Card>

      {/* Section F — Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Social Media Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialMessage && (
            <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
              socialMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {socialMessage.text}
            </div>
          )}
          <p className="text-xs text-gray-400 mb-4">Leave a field empty to hide its icon from the footer.</p>
          {[
            { key: 'instagram' as const, label: 'Instagram', placeholder: 'https://instagram.com/yourbrand' },
            { key: 'facebook' as const, label: 'Facebook', placeholder: 'https://facebook.com/yourbrand' },
            { key: 'twitter' as const, label: 'Twitter / X', placeholder: 'https://x.com/yourbrand' },
            { key: 'tiktok' as const, label: 'TikTok', placeholder: 'https://tiktok.com/@yourbrand' },
            { key: 'youtube' as const, label: 'YouTube', placeholder: 'https://youtube.com/@yourbrand' },
            { key: 'pinterest' as const, label: 'Pinterest', placeholder: 'https://pinterest.com/yourbrand' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
                {field.label}
              </label>
              <input
                type="url"
                value={socialLinks[field.key]}
                onChange={(e) => setSocialLinks({ ...socialLinks, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
              />
            </div>
          ))}
          <button
            onClick={handleSaveSocial}
            disabled={savingSocial}
            className="px-6 py-2.5 bg-[#C9A84C] text-white text-sm font-semibold rounded-lg hover:bg-[#C9A84C]/90 transition-colors disabled:opacity-50"
          >
            {savingSocial ? 'Saving...' : 'Save Social Links'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
