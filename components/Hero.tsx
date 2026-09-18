interface HeroProps {
  meta: { sections: number; tenCodes: number; groups: number };
}

export function Hero({ meta }: HeroProps) {
  const stats = [
    { value: meta.sections, label: "Bagian" },
    { value: meta.tenCodes, label: "Ten Codes" },
    { value: meta.groups, label: "Kategori" },
  ];

  return (
    <div className="mb-10">
      <span className="inline-block rounded-sm border border-accent/35 bg-accent-soft px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
        LSSD · Internal
      </span>

      <h1 className="mt-4 text-[32px] font-extrabold leading-[1.1] tracking-tight text-text lg:text-[40px]">
        LSSD Deputy Pocketbook
      </h1>
      <p className="mt-2.5 font-mono text-[13px] uppercase tracking-[0.14em] text-text-dim">
        Los Santos Sheriff Department
      </p>

      <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dd className="font-mono text-[24px] font-bold leading-none text-accent">
              {stat.value}
            </dd>
            <dt className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-text-faint">
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
