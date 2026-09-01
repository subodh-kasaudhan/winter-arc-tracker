export type Theme = 'light' | 'dark'

const THEME_KEY = 'wa_theme'

export function loadTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Ignore quota / private-mode failures.
  }
}

applyTheme(loadTheme())
