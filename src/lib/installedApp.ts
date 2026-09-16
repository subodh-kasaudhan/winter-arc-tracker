import { useSyncExternalStore } from 'react'

/**
 * True only in the Android APK (TWA) or iPhone/iPad Home Screen icon.
 * Do not use display-mode media queries: they can match a normal tab when
 * the manifest says standalone, which hid Get the app on the website.
 */
export function isRunningAsInstalledApp(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean }
  if (nav.standalone === true) return true
  return document.referrer.startsWith('android-app://')
}

export function useInstalledApp() {
  return useSyncExternalStore(
    () => () => {},
    isRunningAsInstalledApp,
    () => false,
  )
}
