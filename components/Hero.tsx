"use client";

import { ArrowRight, Shield } from "lucide-react";

import { useCountUp } from "./motion";
import { BTN_GOLD, BTN_LINK, BTN_OUTLINE, CONTENT_ICON_PROPS } from "./ui";

interface HeroProps {
  meta: { sections: number; tenCodes: number; groups: number };
}

/**
 * One stat number, counted up from zero when it scrolls into view.
 *
 * The server renders the final value, so the number is correct before — and
 * without — JavaScript; the count is a pure enhancement layered over it.
 */
function StatValue({ value }: { value: number }) {
  const ref = useCountUp(value);
  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}

/**
 * The landing block above the first section: identity chip, title, the stat row
 * and the two primary actions — the reference's `.hero-chip` / `.stat-row` /
 * `.hero-actions` composition.
 *
 * The actions are anchors rather than buttons so they keep working without
 * JavaScript, exactly as the quick-jump chips do.
 */
export function Hero({ meta }: HeroProps) {
  const stats = [
    { value: meta.sections, label: "Bagian" },
    { value: meta.tenCodes, label: "Ten Codes" },
    { value: meta.groups, label: "Kategori" },
  ];

  return (
    /* `hero-texture` draws the inverted topographic backdrop and its fade-out
       behind this block only — see the class in `globals.css`. */
    <div className="hero-texture mb-12">
      <span className="mb-3.5 inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-[5px] text-[11.5px] font-semibold text-gold">
        <Shield {...CONTENT_ICON_PROPS} />
        County of Los Santos
      </span>

      <h1 className="font-display text-[30px] font-bold leading-[1.1] tracking-[-0.01em] text-text lg:text-[38px]">
        LSSD Deputy Pocketbook
      </h1>
      <p className="mt-2 max-w-[58ch] text-[14.5px] leading-relaxed text-text-dim">
        Los Santos Sheriff Department — semua yang kamu butuhkan sebelum turun
        patroli: kode radio, SOP taktis, penal code, sampai tool bikin laporan
        otomatis.
      </p>

      <div className="mt-[22px] flex flex-wrap gap-3.5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="min-w-[120px] rounded-md border border-border bg-surface px-5 py-4 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-gold"
          >
            <div className="font-display text-[24px] font-bold leading-[1.1] text-gold">
              <StatValue value={stat.value} />
            </div>
            <div className="mt-1 text-[11px] text-text-faint">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Three tiers of emphasis, so the eye lands in one order: one filled
          gold primary, one outlined secondary, one plain text link. The link
          is last in the DOM as well as the weakest visually, so the tab order
          and the reading order agree with the visual order. */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <a href="#ten-codes" className={BTN_GOLD}>
          Mulai Belajar
          <ArrowRight
            aria-hidden
            size={16}
            strokeWidth={2}
            className="ml-1.5 shrink-0"
          />
        </a>
        <a href="#patrol-report" className={BTN_OUTLINE}>
          Buka Report Generator
          <ArrowRight aria-hidden size={14} strokeWidth={2} className="shrink-0" />
        </a>
        <a href="#penal-generator" className={BTN_LINK}>
          Buka Penal Generator
          <ArrowRight aria-hidden size={14} strokeWidth={2} className="shrink-0" />
        </a>
      </div>
    </div>
  );
}
