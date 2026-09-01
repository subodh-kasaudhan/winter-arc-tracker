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
}

export const ICON_NAMES = Object.keys(ICONS) as HabitIcon[]

export function HabitGlyph({
  name,
  className,
}: {
  name: HabitIcon
  className?: string
}) {
  return <>{ICONS[name]({ className })}</>
}
