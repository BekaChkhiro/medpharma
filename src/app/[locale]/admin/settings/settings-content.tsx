'use client';

import { useState, useEffect, useCallback } from 'react';

import {
  Loader2,
  Save,
  CheckCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button, Input, Label, Textarea } from '@/components/ui';

const SETTING_KEYS = [
  'siteName',
  'siteDescription',
  'contactPhone',
  'contactEmail',
  'contactAddress',
  'socialFacebook',
  'socialInstagram',
  'socialTwitter',
  'defaultMetaTitle',
  'defaultMetaDesc',
  'logo',
  'favicon',
];

export function SettingsContent() {
  const t = useTranslations('admin.settings');

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSettings(data.data || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSaved(false);

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSettings(data.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#df2b1b]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
          <p className="mt-1 text-slate-500">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              {t('saved')}
            </span>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t('saveSettings')}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-600/20 bg-red-600/5 p-4 text-red-600">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General */}
        <div className="rounded-xl border border-slate-200 bg-[#FDFBF7] p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            General
          </h3>
          <div className="space-y-4">
            <div>
              <Label>{t('siteName')}</Label>
              <Input
                value={settings.siteName || ''}
                onChange={(e) => updateSetting('siteName', e.target.value)}
              />
            </div>
            <div>
              <Label>{t('siteDescription')}</Label>
              <Textarea
                value={settings.siteDescription || ''}
                onChange={(e) => updateSetting('siteDescription', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label>{t('logo')}</Label>
              <Input
                value={settings.logo || ''}
                onChange={(e) => updateSetting('logo', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>{t('favicon')}</Label>
              <Input
                value={settings.favicon || ''}
                onChange={(e) => updateSetting('favicon', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-xl border border-slate-200 bg-[#FDFBF7] p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Contact
          </h3>
          <div className="space-y-4">
            <div>
              <Label>{t('contactPhone')}</Label>
              <Input
                value={settings.contactPhone || ''}
                onChange={(e) => updateSetting('contactPhone', e.target.value)}
              />
            </div>
            <div>
              <Label>{t('contactEmail')}</Label>
              <Input
                type="email"
                value={settings.contactEmail || ''}
                onChange={(e) => updateSetting('contactEmail', e.target.value)}
              />
            </div>
            <div>
              <Label>{t('contactAddress')}</Label>
              <Textarea
                value={settings.contactAddress || ''}
                onChange={(e) => updateSetting('contactAddress', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="rounded-xl border border-slate-200 bg-[#FDFBF7] p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Social Media
          </h3>
          <div className="space-y-4">
            <div>
              <Label>{t('socialFacebook')}</Label>
              <Input
                value={settings.socialFacebook || ''}
                onChange={(e) => updateSetting('socialFacebook', e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <Label>{t('socialInstagram')}</Label>
              <Input
                value={settings.socialInstagram || ''}
                onChange={(e) => updateSetting('socialInstagram', e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <Label>{t('socialTwitter')}</Label>
              <Input
                value={settings.socialTwitter || ''}
                onChange={(e) => updateSetting('socialTwitter', e.target.value)}
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="rounded-xl border border-slate-200 bg-[#FDFBF7] p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            SEO
          </h3>
          <div className="space-y-4">
            <div>
              <Label>{t('defaultMetaTitle')}</Label>
              <Input
                value={settings.defaultMetaTitle || ''}
                onChange={(e) => updateSetting('defaultMetaTitle', e.target.value)}
              />
            </div>
            <div>
              <Label>{t('defaultMetaDesc')}</Label>
              <Textarea
                value={settings.defaultMetaDesc || ''}
                onChange={(e) => updateSetting('defaultMetaDesc', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
