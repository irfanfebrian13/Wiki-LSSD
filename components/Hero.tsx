import { ArrowRight, Shield } from "lucide-react";

import { BTN_GOLD, BTN_OUTLINE, CONTENT_ICON_PROPS } from "./ui";

interface HeroProps {
  meta: { sections: number; tenCodes: number; groups: number };
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
    <div className="mb-12">
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
            className="min-w-[120px] rounded-md border border-border bg-surface px-5 py-4"
          >
            <div className="font-display text-[24px] font-bold leading-none text-gold">
              {stat.value}
            </div>
            <div className="mt-1 text-[11px] text-text-faint">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
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
        </a>
        <a href="#penal-generator" className={BTN_OUTLINE}>
          Penal Code Generator
        </a>
      </div>
    </div>
  );
}
