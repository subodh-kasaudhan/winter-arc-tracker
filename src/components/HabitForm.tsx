import { useState } from 'react'
import { HABIT_COLORS } from '../lib/storage'
import { HabitGlyph, ICON_NAMES } from '../lib/icons'
import type { Frequency, Habit, HabitIcon } from '../lib/types'

const DAYS: { label: string; value: number }[] = [
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
  { label: 'S', value: 0 },
]

export function HabitForm({
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  initial?: Habit
  onClose: () => void
  onSave: (habit: Omit<Habit, 'id' | 'createdAt'> & { id?: string }) => void
  onDelete?: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [icon, setIcon] = useState<HabitIcon>(initial?.icon ?? 'flame')
  const [color, setColor] = useState(initial?.color ?? HABIT_COLORS[0])
  const [everyday, setEveryday] = useState(initial?.frequency === 'everyday' || !initial)
  const [days, setDays] = useState<number[]>(
    Array.isArray(initial?.frequency) ? initial.frequency : [1, 2, 3, 4, 5, 6, 0],
  )

  function toggleDay(value: number) {
    setEveryday(false)
    setDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value],
    )
  }

  function submit() {
    const trimmed = name.trim()
    if (!trimmed) return
    const frequency: Frequency = everyday || days.length === 7 ? 'everyday' : days
    if (frequency !== 'everyday' && frequency.length === 0) return
    onSave({ id: initial?.id, name: trimmed, icon, color, frequency })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-x-hidden bg-ink/40 p-3 sm:items-center">
      <div className="flex max-h-[min(92dvh,720px)] w-full min-w-0 max-w-[calc(100vw-1.5rem)] flex-col overflow-y-auto overscroll-contain rounded-[28px] bg-card p-4 shadow-xl sm:max-w-md sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="min-w-0 truncate text-lg font-extrabold">
            {initial ? 'Edit habit' : 'New habit'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-2xl px-3 py-2 text-sm font-extrabold text-muted"
          >
            Close
          </button>
        </div>
        <label className="block text-xs font-bold text-muted">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Read 20 pages"
          className="mt-1 w-full rounded-2xl border border-line bg-paper px-3 py-3 font-semibold outline-none focus:border-leaf"
        />

        <p className="mt-3 text-xs font-bold text-muted">Icon</p>
        <div className="mt-2 grid grid-cols-6 gap-1.5 sm:grid-cols-8">
          {ICON_NAMES.map((key) => (
            <button
              type="button"
              key={key}
              onClick={() => setIcon(key)}
              className="grid aspect-square w-full min-w-0 place-items-center rounded-2xl border p-0"
              style={{
                color,
                borderColor: icon === key ? color : 'var(--color-line)',
                background: icon === key ? `${color}22` : 'var(--color-card)',
              }}
            >
              <HabitGlyph name={key} className="h-5 w-5" />
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs font-bold text-muted">Color</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {HABIT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="h-8 w-8 shrink-0 rounded-full"
              style={{
                background: c,
                outline: color === c ? `3px solid ${c}66` : undefined,
              }}
            />
          ))}
        </div>

        <p className="mt-3 text-xs font-bold text-muted">Frequency</p>
        <button
          type="button"
          onClick={() => setEveryday(true)}
          className={`mt-2 rounded-full px-3 py-1.5 text-sm font-bold ${
            everyday ? 'bg-leaf text-white' : 'bg-paper text-muted'
          }`}
        >
          Everyday
        </button>
        <div className="mt-2 flex min-w-0 gap-1">
          {DAYS.map((d, i) => (
            <button
              key={`${d.label}-${i}`}
              type="button"
              onClick={() => toggleDay(d.value)}
              className="min-w-0 flex-1 rounded-full py-2 text-xs font-extrabold"
              style={{
                background: !everyday && days.includes(d.value) ? color : 'var(--color-paper)',
                color: !everyday && days.includes(d.value) ? '#fff' : 'var(--color-muted)',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-2xl px-4 py-3 text-sm font-extrabold text-red-600"
            >
              Delete
            </button>
          ) : null}
          <button
            type="button"
            onClick={submit}
            className="ml-auto flex-1 rounded-2xl bg-leaf py-3 text-sm font-extrabold text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
