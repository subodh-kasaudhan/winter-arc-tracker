export function MadeBy({ light = false }: { light?: boolean }) {
  return (
    <a
      href="https://www.instagram.com/the.shivam.aesthetics/"
      target="_blank"
      rel="noreferrer"
      className={`made-by shrink-0 text-right text-sm leading-snug font-bold sm:text-base ${
        light ? 'text-emerald-50/80' : 'text-muted'
      }`}
    >
      Made with <span className="text-red-500">❤</span> by{' '}
      <span className={light ? 'text-white underline underline-offset-2' : 'text-ink underline underline-offset-2'}>
        Shivam
      </span>
    </a>
  )
}
