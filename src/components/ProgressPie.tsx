import { Cell, Pie, PieChart } from 'recharts'
import type { Progress } from '../lib/types'
import { percent } from '../lib/dates'

export function ProgressPie({
  progress,
  color = '#3d9b4a',
  label,
}: {
  progress: Progress
  color?: string
  label: string
}) {
  const pct = percent(progress)
  const remaining = Math.max(progress.scheduled - progress.done, 0)
  const data = [
    { name: 'done', value: progress.done || 0 },
    { name: 'left', value: remaining || (progress.scheduled === 0 ? 1 : 0) },
  ]

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[92px] w-[92px] shrink-0">
        <PieChart width={92} height={92}>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={30}
            outerRadius={42}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={false}
          >
            <Cell fill={progress.done > 0 ? color : '#e7e1d8'} />
            <Cell fill="#e7e1d8" />
          </Pie>
        </PieChart>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-extrabold text-ink">{pct}%</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-ink">{label}</p>
        <p className="text-xs text-muted">
          {progress.done} of {progress.scheduled} scheduled
        </p>
      </div>
    </div>
  )
}
