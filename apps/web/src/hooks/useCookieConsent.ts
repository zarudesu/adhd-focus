'use client';

import { useState, useEffect, useCallback } from 'react';

const COOKIE_NAME = 'cookie-consent';
const COOKIE_VERSION = '1';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export interface CookieConsent {
  necessary: true; // always true
  analytics: boolean;
  preferences: boolean;
  timestamp: string;
  version: string;
}

function parseCookie(): CookieConsent | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  try {
    const value = decodeURIComponent(match.split('=')[1]);
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function writeCookie(consent: CookieConsent) {
  const value = encodeURIComponent(JSON.stringify(consent));
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setConsent(parseCookie());
    setLoaded(true);
  }, []);

  const acceptAll = useCallback(() => {
    const c: CookieConsent = {
      necessary: true,
      analytics: true,
      preferences: true,
      timestamp: new Date().toISOString(),
      version: COOKIE_VERSION,
    };
    writeCookie(c);
    setConsent(c);
  }, []);

  const acceptNecessary = useCallback(() => {
    const c: CookieConsent = {
      necessary: true,
      analytics: false,
      preferences: false,
      timestamp: new Date().toISOString(),
      version: COOKIE_VERSION,
    };
    writeCookie(c);
    setConsent(c);
  }, []);

  const savePreferences = useCallback(
    (analytics: boolean, preferences: boolean) => {
      const c: CookieConsent = {
        necessary: true,
        analytics,
        preferences,
        timestamp: new Date().toISOString(),
        version: COOKIE_VERSION,
      };
      writeCookie(c);
      setConsent(c);
    },
    []
  );

  return {
    consent,
    loaded,
    hasConsent: consent !== null,
    acceptAll,
    acceptNecessary,
    savePreferences,
  };
}
