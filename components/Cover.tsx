"use client";

import type { Chapter } from "./presentation";

/**
 * The title page.
 *
 * The intro copy is the paragraph that used to open `Hero.tsx` — UI copy, not
 * handbook content, carried over verbatim. The table of contents takes its
 * section counts from `chapter.count`, which is computed from the data, never
 * hard-coded.
 *
 * No stat boxes and no pill eyebrow label: both are explicitly forbidden.
 */
export function Cover({
  chapters,
  onSelect,
}: {
  chapters: Chapter[];
  onSelect: (slug: string) => void;
}) {
  return (
    <div>
      <section className="border-b-[3px] border-double border-border pb-9">
        <h1 className="font-display text-[clamp(46px,8.5vw,88px)] font-extrabold leading-[0.98] tracking-[-0.025em] text-text">
          LSSD Deputy
          <br />
          Pocketbook
        </h1>
        <p className="mt-4 font-display text-[22px] font-medium text-text">
          Los Santos Sheriff Department
        </p>
        <p className="mt-2.5 max-w-[58ch] text-[15px] leading-relaxed text-text-dim">
          Los Santos Sheriff Department — semua yang kamu butuhkan sebelum turun
          patroli: kode radio, SOP taktis, penal code, sampai tool bikin laporan
          otomatis.
        </p>

        {/* Real anchors, so they work without JavaScript; the shell's hash
            listener handles the navigation. Each points at its own tool's
            section id, which is that tool's page. */}
        <div className="mt-6 flex flex-wrap gap-6">
          <a
            href="#patrol-report"
            onClick={() => onSelect("patrol-report")}
            className="font-semibold text-mint underline decoration-2 underline-offset-4"
          >
            Buka Patrol Report Generator
          </a>
          <a
            href="#penal-generator"
            onClick={() => onSelect("penal-generator")}
            className="font-semibold text-mint underline decoration-2 underline-offset-4"
          >
            Buka Penal Code Generator
          </a>
        </div>
      </section>

      <ol className="mt-9 max-w-[680px] list-none p-0">
        <h2 className="mb-2.5 font-display text-[26px] font-semibold text-text">
          Daftar isi
        </h2>
        {chapters.map((chapter) => (
          <li key={chapter.slug}>
            <a
              href={`#${chapter.slug}`}
              onClick={() => onSelect(chapter.slug)}
              className="flex w-full items-baseline gap-3 py-2.5 text-left"
            >
              <span className="w-[26px] shrink-0 font-mono text-[13px] text-gold">
                {String(chapter.index).padStart(2, "0")}
              </span>
              <span className="font-display text-[23px] font-semibold text-text">
                {chapter.name}
              </span>
              <span
                aria-hidden
                className="min-w-[20px] flex-1 translate-y-[-5px] border-b-2 border-dotted border-border"
              />
              <span className="font-mono text-[13px] text-text-dim">
                {chapter.count} bagian
              </span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
