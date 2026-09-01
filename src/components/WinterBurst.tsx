export function WinterBurst() {
  const flakes = Array.from({ length: 48 }, (_, i) => i)
  return (
    <div
      className="winter-burst pointer-events-none fixed inset-0 z-[60] overflow-hidden"
      aria-hidden
    >
      {flakes.map((i) => (
        <span
          key={i}
          className="snowflake"
          style={{
            left: `${(i * 23) % 100}%`,
            animationDelay: `${(i % 12) * 0.18}s`,
            animationDuration: `${4.5 + (i % 6) * 0.4}s`,
            fontSize: `${11 + (i % 10)}px`,
            opacity: 0.45 + (i % 5) * 0.1,
          }}
        >
          *
        </span>
      ))}
    </div>
  )
}
