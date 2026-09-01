import type { ReactNode } from 'react'
import type { HabitIcon } from './types'

type IconProps = { className?: string }

function Svg({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  )
}

export const ICONS: Record<HabitIcon, (p: IconProps) => ReactNode> = {
  sun: (p) => (
    <Svg className={p.className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Svg>
  ),
  dumbbell: (p) => (
    <Svg className={p.className}>
      <path d="M6 8v8M18 8v8M6 10h12M6 14h12M4 9v6M20 9v6" />
    </Svg>
  ),
  lotus: (p) => (
    <Svg className={p.className}>
      <path d="M12 19c-3-3-5-6-5-9 2 0 4 1 5 3 1-2 3-3 5-3 0 3-2 6-5 9Z" />
      <path d="M7 11c-2 1-3 3-3 5 3 0 5-1 6-3M17 11c2 1 3 3 3 5-3 0-5-1-6-3" />
    </Svg>
  ),
  book: (p) => (
    <Svg className={p.className}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
      <path d="M4 5.5v16" />
    </Svg>
  ),
  leaf: (p) => (
    <Svg className={p.className}>
      <path d="M5 19c8-1 13-8 14-14-6 1-13 6-14 14Z" />
      <path d="M9 15c2-3 5-6 9-8" />
    </Svg>
  ),
  moon: (p) => (
    <Svg className={p.className}>
      <path d="M16 3a8 8 0 1 0 5 13 7 7 0 0 1-5-13Z" />
    </Svg>
  ),
  run: (p) => (
    <Svg className={p.className}>
      <circle cx="14" cy="5" r="2" />
      <path d="M7 20l3-6 3 2 2-4 3 1M8 12l3-1 2-3" />
    </Svg>
  ),
  drop: (p) => (
    <Svg className={p.className}>
      <path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z" />
    </Svg>
  ),
  pen: (p) => (
    <Svg className={p.className}>
      <path d="M4 20h4l10-10-4-4L4 16v4Z" />
      <path d="M12 6l4 4" />
    </Svg>
  ),
  flame: (p) => (
    <Svg className={p.className}>
      <path d="M12 3c2 4-1 5-1 8 3 0 6-3 6-7 3 3 4 7 3 10a7 7 0 1 1-13-4c2-1 3-4 5-7Z" />
    </Svg>
  ),
  coffee: (p) => (
    <Svg className={p.className}>
      <path d="M4 8h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Z" />
      <path d="M16 9h2.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M6 20h10M8 4v2M12 4v2" />
    </Svg>
  ),
  bike: (p) => (
    <Svg className={p.className}>
      <circle cx="6.5" cy="16.5" r="3.5" />
      <circle cx="17.5" cy="16.5" r="3.5" />
      <path d="M6.5 16.5 11 8h4l2.5 8.5M11 8l-2 4h6" />
    </Svg>
  ),
  heart: (p) => (
    <Svg className={p.className}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10Z" />
    </Svg>
  ),
  bed: (p) => (
    <Svg className={p.className}>
      <path d="M3 20v-7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v7" />
      <path d="M3 13h18M6 10V7a2 2 0 0 1 2-2h3" />
    </Svg>
  ),
  apple: (p) => (
    <Svg className={p.className}>
      <path d="M12 8c-4 0-6 3.2-6 7s2.7 7 6 7 6-3.2 6-7-2-7-6-7Z" />
      <path d="M12 8c1-3 3-4 5-4" />
    </Svg>
  ),
  code: (p) => (
    <Svg className={p.className}>
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 6l-2 12" />
    </Svg>
  ),
  music: (p) => (
    <Svg className={p.className}>
      <path d="M9 18V6l10-2v12" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="16" r="2" />
    </Svg>
  ),
  phone: (p) => (
    <Svg className={p.className}>
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M11 18.5h2" />
    </Svg>
  ),
  stretch: (p) => (
    <Svg className={p.className}>
      <circle cx="12" cy="5" r="2" />
      <path d="M6 10h12M12 10v5l-4 6M12 15l4 6" />
    </Svg>
  ),
  walk: (p) => (
    <Svg className={p.className}>
      <circle cx="13" cy="5" r="2" />
      <path d="M8 21l3-7 2 2 2-5 3 2M9 12l3-2 2-3" />
    </Svg>
  ),
  shower: (p) => (
    <Svg className={p.className}>
      <path d="M4 12h16M12 4v8M8 16v1M12 16v2M16 16v1M7 20h.01M12 21h.01M17 20h.01" />
    </Svg>
  ),
  mountain: (p) => (
    <Svg className={p.className}>
      <path d="m3 19 6.5-10 3.5 5 2-3.5L21 19H3Z" />
      <path d="m10 12 1.5-2.2L14 13" />
    </Svg>
  ),
  snow: (p) => (
    <Svg className={p.className}>
      <path d="M12 3v18M5 6.5 19 17.5M19 6.5 5 17.5M3 12h18" />
    </Svg>
  ),
  target: (p) => (
    <Svg className={p.className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" />
    </Svg>
  ),
  utensils: (p) => (
    <Svg className={p.className}>
      <path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M16 3v8M14 7h4M16 11v10" />
    </Svg>
  ),
  brain: (p) => (
    <Svg className={p.className}>
      <path d="M9.5 5.5A2.5 2.5 0 1 0 7 8c0 1 .5 2 1.5 2.5M14.5 5.5A2.5 2.5 0 1 1 17 8c0 1-.5 2-1.5 2.5" />
      <path d="M8.5 10.5C6 11 5 13 5 15c0 3 2.5 5 7 5s7-2 7-5c0-2-1-4-3.5-4.5" />
    </Svg>
  ),
}

export const ICON_NAMES = Object.keys(ICONS) as HabitIcon[]

export function HabitGlyph({
  name,
  className,
}: {
  name: HabitIcon
  className?: string
}) {
  const render = ICONS[name] ?? ICONS.flame
  return <>{render({ className })}</>
}
