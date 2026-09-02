export function CreditsPage() {
  return (
    <section className="rounded-[28px] bg-card p-6 shadow-[0_8px_24px_rgba(28,25,23,0.06)] sm:p-8">
      <p className="text-xs font-extrabold tracking-wide text-leaf uppercase">
        Credits
      </p>
      <div className="mt-5 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
        <img
          src="/shivam.png"
          alt="Shivam Kasaudhan"
          className="h-36 w-36 shrink-0 rounded-[28px] object-cover shadow-md sm:h-40 sm:w-40"
        />
        <div className="mt-5 sm:mt-0 sm:ml-6">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Hi, I am Shivam</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
            An IIT Kanpur graduate, a full-time software engineer, and a content creator for fun. This
            tracker is a small gift from me to every hustler who refuses to give up on
            their dreams.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
            You are not alone in this Winter Arc. We share this journey, and
            together we will make a difference.
          </p>
          <p className="mt-3 text-base font-extrabold text-ink">
            Let&apos;s grow together 📈
          </p>
        </div>
      </div>
      <a
        href="https://www.instagram.com/the.shivam.aesthetics/"
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-extrabold text-paper"
      >
        @the.shivam.aesthetics
      </a>
    </section>
  )
}
