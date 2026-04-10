"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png?v=2"
            alt=""
            width={32}
            height={32}
            className="object-contain opacity-90"
            unoptimized
          />
          <span className="text-sm font-semibold text-zinc-300">
            New Legacy AI
          </span>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
          <Link href="/case-studies" className="hover:text-zinc-200">
            Case studies
          </Link>
          <Link href="/industries" className="hover:text-zinc-200">
            Industries
          </Link>
          <Link href="/login" className="hover:text-zinc-200">
            Client login
          </Link>
        </nav>
        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} New Legacy AI
        </p>
      </div>
    </footer>
  );
}
