"use client";

import { useMemo, useState } from "react";

import {
  buildFullReport,
  bbToHtml,
  EMPTY_REPORT,
  type ReportEntry,
  type ReportInput,
} from "@/lib/bbcode";

/**
 * Patrol Report Generator.
 *
 * The form is redesigned; the generated BBCode is NOT. `lib/bbcode.ts` is a
 * verbatim port of the original logic and is pinned by `lib/bbcode.test.ts`,
 * because the output gets pasted into a forum post.
 */

interface EvidenceProps {
  links: string[];
  onChange: (links: string[]) => void;
}

function EvidenceFields({ links, onChange }: EvidenceProps) {
  return (
    <div className="grid gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint">
        Evidence
      </span>
      {links.map((link, i) => (
        <div key={i} className="flex gap-1.5">
          <input
            type="url"
            value={link}
            placeholder="https://..."
            aria-label={`Evidence link ${i + 1}`}
            onChange={(e) => {
              const next = [...links];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="min-w-0 flex-1 border border-border bg-bg px-2.5 py-1.5 font-mono text-[12.5px] text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
          />
          {links.length > 1 ? (
            <button
              type="button"
              aria-label={`Remove evidence link ${i + 1}`}
              onClick={() => onChange(links.filter((_, k) => k !== i))}
              className="border border-border px-2 font-mono text-xs text-text-faint transition-colors hover:border-danger hover:text-danger"
            >
              ×
            </button>
          ) : null}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...links, ""])}
        className="justify-self-start border border-dashed border-border px-2.5 py-1 font-mono text-[11px] font-semibold text-accent transition-colors hover:border-accent"
      >
        + Evidence
      </button>
    </div>
  );
}

interface EntryFieldsProps {
  legend: string;
  entry: ReportEntry;
  onChange: (entry: ReportEntry) => void;
}

function EntryFields({ legend, entry, onChange }: EntryFieldsProps) {
  const set = <K extends keyof ReportEntry>(key: K, value: ReportEntry[K]) =>
    onChange({ ...entry, [key]: value });

  return (
    <fieldset className="border border-border bg-surface px-4 py-3.5">
      <legend className="px-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
        {legend}
      </legend>

      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint">
            Title
          </span>
          <input
            value={entry.title}
            placeholder="Report title"
            onChange={(e) => set("title", e.target.value)}
            className="border border-border bg-bg px-2.5 py-1.5 text-[13px] text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
          />
        </label>

        <label className="grid gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint">
            Date
          </span>
          <input
            type="date"
            value={entry.date}
            onChange={(e) => set("date", e.target.value)}
            className="border border-border bg-bg px-2.5 py-1.5 font-mono text-[13px] text-text focus:border-accent focus:outline-none"
          />
        </label>

        <label className="grid gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint">
            Details
          </span>
          <textarea
            rows={7}
            value={entry.details}
            placeholder="Write details..."
            onChange={(e) => set("details", e.target.value)}
            className="resize-y border border-border bg-bg px-2.5 py-1.5 text-[13px] leading-relaxed text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
          />
        </label>

        <EvidenceFields
          links={entry.evidence}
          onChange={(evidence) => set("evidence", evidence)}
        />
      </div>
    </fieldset>
  );
}

export function PatrolReportForm() {
  const [input, setInput] = useState<ReportInput>(EMPTY_REPORT);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const preview = useMemo(() => (output ? bbToHtml(output) : ""), [output]);

  const setDeputy = (key: "name" | "station" | "rank" | "badge", value: string) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const generate = () => {
    setOutput(buildFullReport(input));
    setCopied(false);
  };

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be denied; the textarea stays selectable.
    }
  };

  const clear = () => {
    setInput(EMPTY_REPORT);
    setOutput("");
    setCopied(false);
  };

  const deputyFields: Array<{
    key: "name" | "station" | "rank" | "badge";
    label: string;
    placeholder: string;
  }> = [
    { key: "name", label: "Name", placeholder: "Full name" },
    { key: "station", label: "Station", placeholder: "Station" },
    { key: "rank", label: "Rank", placeholder: "Rank" },
    { key: "badge", label: "Badge", placeholder: "Badge number" },
  ];

  return (
    <div className="grid gap-4">
      <fieldset className="border border-border bg-surface px-4 py-3.5">
        <legend className="px-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
          Deputy Information
        </legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {deputyFields.map((f) => (
            <label key={f.key} className="grid gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint">
                {f.label}
              </span>
              <input
                value={input[f.key]}
                placeholder={f.placeholder}
                onChange={(e) => setDeputy(f.key, e.target.value)}
                className="border border-border bg-bg px-2.5 py-1.5 text-[13px] text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
              />
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 lg:grid-cols-2">
        <EntryFields
          legend="First Report"
          entry={input.first}
          onChange={(first) => setInput((prev) => ({ ...prev, first }))}
        />
        <EntryFields
          legend="Second Report"
          entry={input.second}
          onChange={(second) => setInput((prev) => ({ ...prev, second }))}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={generate}
          className="bg-accent px-4 py-2 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-bg transition-opacity hover:opacity-85"
        >
          Generate
        </button>
        <button
          type="button"
          onClick={copy}
          disabled={!output}
          className="border border-border bg-surface-2 px-4 py-2 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-text transition-colors hover:border-accent disabled:opacity-40"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          onClick={clear}
          className="border border-border bg-surface-2 px-4 py-2 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-text transition-colors hover:border-danger hover:text-danger"
        >
          Clear
        </button>
      </div>

      <label className="grid gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint">
          BBCode output
        </span>
        <textarea
          readOnly
          rows={12}
          value={output}
          placeholder="Output will appear here..."
          className="resize-y border border-border bg-bg px-3 py-2.5 font-mono text-[12px] leading-relaxed text-text-dim placeholder:text-text-faint focus:border-accent focus:outline-none"
        />
      </label>

      <div className="grid gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint">
          Preview
        </span>
        {/*
          The one place generated HTML is injected. `bbToHtml` renders the
          deputy's own form input back to their own browser — the same trust
          model as the original build. Never extend this to lib/data.ts content.
        */}
        <div
          className="report-preview min-h-[44px] border border-border bg-surface px-4 py-3.5"
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      </div>
    </div>
  );
}
