'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import Link from 'next/link';

export function CookieConsentBanner() {
  const { loaded, hasConsent, acceptAll, acceptNecessary, savePreferences } =
    useCookieConsent();
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [preferences, setPreferences] = useState(true);

  // Don't render until client-side check is done, or if already consented
  if (!loaded || hasConsent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#232323] p-4 shadow-2xl"
      >
        <div className="mx-auto max-w-3xl">
          {!expanded ? (
            /* Collapsed view */
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#9CA3AF]">
                We use cookies for authentication and to improve your experience.{' '}
                <Link href="/privacy" className="underline hover:text-white">
                  Privacy Policy
                </Link>
              </p>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={acceptNecessary}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[#9CA3AF] hover:bg-white/5 transition-colors"
                >
                  Necessary Only
                </button>
                <button
                  onClick={() => setExpanded(true)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[#9CA3AF] hover:bg-white/5 transition-colors"
                >
                  Manage
                </button>
                <button
                  onClick={acceptAll}
                  className="rounded-lg bg-[#D9F968] px-4 py-1.5 text-xs font-medium text-[#1A1A1A] hover:bg-[#c8e85a] transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>
          ) : (
            /* Expanded view with toggles */
            <div className="space-y-4">
              <p className="text-sm text-[#9CA3AF]">
                Choose which cookies you&apos;d like to allow.{' '}
                <Link href="/privacy" className="underline hover:text-white">
                  Privacy Policy
                </Link>
              </p>

              <div className="space-y-3">
                {/* Necessary - always on */}
                <label className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white">Necessary</span>
                    <p className="text-xs text-[#6B7280]">
                      Authentication and security. Always active.
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="sr-only"
                    />
                    <div className="h-5 w-9 rounded-full bg-[#D9F968]/50 cursor-not-allowed">
                      <div className="absolute top-0.5 left-[18px] h-4 w-4 rounded-full bg-[#D9F968]" />
                    </div>
                  </div>
                </label>

                {/* Analytics */}
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm text-white">Analytics</span>
                    <p className="text-xs text-[#6B7280]">
                      Help us understand how you use the app.
                    </p>
                  </div>
                  <button
                    onClick={() => setAnalytics(!analytics)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      analytics ? 'bg-[#D9F968]' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                        analytics ? 'left-[18px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </label>

                {/* Preferences */}
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm text-white">Preferences</span>
                    <p className="text-xs text-[#6B7280]">
                      Remember your settings and preferences.
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences(!preferences)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      preferences ? 'bg-[#D9F968]' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                        preferences ? 'left-[18px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </label>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => savePreferences(analytics, preferences)}
                  className="rounded-lg border border-white/10 px-4 py-1.5 text-xs text-[#9CA3AF] hover:bg-white/5 transition-colors"
                >
                  Save Preferences
                </button>
                <button
                  onClick={acceptAll}
                  className="rounded-lg bg-[#D9F968] px-4 py-1.5 text-xs font-medium text-[#1A1A1A] hover:bg-[#c8e85a] transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
