import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "New Legacy AI | Custom AI Agents for Business Automation",
  description:
    "Custom websites, CRMs + automations, and growth operations — built to keep your business scalable and easy to run.",
};

const CALENDLY_URL =
  "https://calendly.com/newlegacyai/consultation?hide_event_type_details=1&hide_gdpr_banner=1&background_color=0f0f0f&text_color=ffffff&primary_color=e58a40";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png?v=2"
              alt="New Legacy"
              width={36}
              height={36}
              className="object-contain"
              priority
              unoptimized
            />
            <span className="text-lg font-semibold tracking-tight">
              New Legacy
            </span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-4">
            <a
              href="#services"
              className="hidden text-sm text-zinc-400 transition hover:text-zinc-100 sm:inline"
            >
              Services
            </a>
            <Link
              href="/login"
              className="text-sm text-zinc-400 transition hover:text-zinc-100"
            >
              Sign in
            </Link>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-amber-500/90 px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-amber-400"
            >
              Book a call
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-white/[0.06] px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-amber-500/90">
              AI + systems for operators
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl sm:leading-tight">
              The legacy you build shouldn&apos;t burn you out.
            </h1>
            <p className="mt-6 text-lg text-zinc-400 sm:text-xl">
              Custom websites, CRMs + automations, and growth operations —
              wired together so leads don&apos;t slip and you&apos;re not
              carrying it all alone.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-6 py-3 text-base font-semibold text-zinc-950 transition hover:bg-amber-400 sm:w-auto"
              >
                Book a consultation
              </a>
              <a
                href="#services"
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-base font-medium text-zinc-100 transition hover:bg-white/[0.06] sm:w-auto"
              >
                See what we build
              </a>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="scroll-mt-20 px-4 py-20 sm:px-6"
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-bold sm:text-3xl">
              Built for growth
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">
              Strategy-first delivery — outcomes you can measure, not generic
              templates.
            </p>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Custom websites",
                  body: "Fast, conversion-minded sites and landing experiences tailored to your offer.",
                },
                {
                  title: "CRMs & automations",
                  body: "Pipelines, follow-up, and handoffs wired so nothing falls through the cracks.",
                },
                {
                  title: "Growth operations",
                  body: "Systems for creators and service brands that need to scale without extra chaos.",
                },
              ].map((item) => (
                <li
                  key={item.title}
                  className="glass-panel rounded-2xl p-6 shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-zinc-100">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-white/[0.06] px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-8 text-center">
            <h2 className="text-xl font-bold sm:text-2xl">
              Ready to build it right?
            </h2>
            <p className="mt-2 text-zinc-400">
              Book a short call — we&apos;ll map what to automate first and what
              to ship next.
            </p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-xl bg-amber-500 px-6 py-3 font-semibold text-zinc-950 transition hover:bg-amber-400"
            >
              Schedule consultation
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} New Legacy AI. All rights reserved.
          </p>
          <Link
            href="/login"
            className="text-sm text-zinc-400 hover:text-zinc-200"
          >
            Client login →
          </Link>
        </div>
      </footer>
    </div>
  );
}
