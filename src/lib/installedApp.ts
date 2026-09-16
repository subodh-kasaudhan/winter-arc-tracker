import { useSyncExternalStore } from 'react'

function displayMode(query: string): MediaQueryList | null {
  try {
    return window.matchMedia(query)
  } catch {
    return null
  }
}

function isInstalledAppSignals(signals: {
  iosStandalone: boolean
  referrer: string
  standaloneDisplay: boolean
  fullscreenDisplay: boolean
}): boolean {
  return (
    signals.iosStandalone ||
    signals.referrer.startsWith('android-app://') ||
    signals.standaloneDisplay ||
    signals.fullscreenDisplay
  )
}

/** True in the Android TWA/APK or iPhone Add to Home Screen, not in a normal tab. */
export function isRunningAsInstalledApp(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return isInstalledAppSignals({
    iosStandalone: nav.standalone === true,
    referrer: document.referrer,
    standaloneDisplay: Boolean(displayMode('(display-mode: standalone)')?.matches),
    fullscreenDisplay: Boolean(displayMode('(display-mode: fullscreen)')?.matches),
  })
}

function subscribe(onChange: () => void) {
  const medias = [
    displayMode('(display-mode: standalone)'),
    displayMode('(display-mode: fullscreen)'),
  ].filter((media): media is MediaQueryList => media !== null)
  for (const media of medias) media.addEventListener('change', onChange)
  return () => {
    for (const media of medias) media.removeEventListener('change', onChange)
  }
}

export function useInstalledApp() {
  return useSyncExternalStore(subscribe, isRunningAsInstalledApp, () => false)
}
