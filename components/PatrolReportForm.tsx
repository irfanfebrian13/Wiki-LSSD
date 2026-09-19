"use client";

import { useMemo, useState } from "react";

import {
  buildFullReport,
  bbToHtml,
  EMPTY_REPORT,
  type ReportEntry,
  type ReportInput,
} from "@/lib/bbcode";

import {
  BTN_DANGER,
  BTN_GOLD,
  BTN_MINT,
  BTN_OUTLINE,
  Card,
  CardTitle,
  FIELD,
  Field,
  OutputBox,
} from "./ui";

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
    <div className="grid gap-2">
      <span className="text-[12px] font-semibold text-text-dim">Evidence</span>
      {links.map((link, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto] items-center gap-2.5">
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
            className={`${FIELD} font-mono text-[12.5px]`}
          />
          {links.length > 1 ? (
            <button
              type="button"
              aria-label={`Remove evidence link ${i + 1}`}
              onClick={() => onChange(links.filter((_, k) => k !== i))}
              className={`${BTN_DANGER} h-9 w-9 px-0 text-base leading-none`}
            >
              ×
            </button>
          ) : null}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...links, ""])}
        className={`${BTN_MINT} justify-self-start`}
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
    <Card>
      <CardTitle tag={legend}>Report</CardTitle>

      <div className="grid gap-3">
        <Field label="Title">
          <input
            value={entry.title}
            placeholder="Report title"
            onChange={(e) => set("title", e.target.value)}
            className={FIELD}
          />
        </Field>

        <Field label="Date">
          <input
            type="date"
            value={entry.date}
            onChange={(e) => set("date", e.target.value)}
            className={`${FIELD} font-mono`}
          />
        </Field>

        <Field label="Details">
          <textarea
            rows={7}
            value={entry.details}
            placeholder="Write details..."
            onChange={(e) => set("details", e.target.value)}
            className={`${FIELD} resize-y leading-relaxed`}
          />
        </Field>

        <EvidenceFields
          links={entry.evidence}
          onChange={(evidence) => set("evidence", evidence)}
        />
      </div>
    </Card>
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
    <div className="grid gap-[18px]">
      <Card accent="gold">
        <CardTitle tag="1">Deputy Information</CardTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {deputyFields.map((f) => (
            <Field key={f.key} label={f.label}>
              <input
                value={input[f.key]}
                placeholder={f.placeholder}
                onChange={(e) => setDeputy(f.key, e.target.value)}
                className={FIELD}
              />
            </Field>
          ))}
        </div>
      </Card>

      {/* `reveal-stack` on both grids: the section's own stack sees each grid as
          a single child, so the two report cards would otherwise enter together
          rather than staggered. */}
      <div className="reveal-stack grid gap-[18px] lg:grid-cols-2">
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

      <div className="flex flex-wrap gap-2.5">
        <button type="button" onClick={generate} className={BTN_GOLD}>
          Generate
        </button>
        <button type="button" onClick={copy} disabled={!output} className={BTN_OUTLINE}>
          {copied ? "Copied!" : "Copy BBCode"}
        </button>
        <button type="button" onClick={clear} className={BTN_DANGER}>
          Clear
        </button>
      </div>

      <Card accent="mint">
        <CardTitle tag={output ? "BBCode" : "empty"}>Generated Output</CardTitle>
        {output ? (
          <OutputBox>{output}</OutputBox>
        ) : (
          <p className="text-[12.5px] text-text-faint">
            Isi form di atas lalu tekan Generate — BBCode muncul di sini.
          </p>
        )}
      </Card>

      <Card>
        <CardTitle tag="live">Preview</CardTitle>
        {/*
          The one place generated HTML is injected. `bbToHtml` renders the
          deputy's own form input back to their own browser — the same trust
          model as the original build. Never extend this to lib/data.ts content.
        */}
        <div
          className="report-preview min-h-[44px] rounded-md border border-border bg-surface-2 px-4 py-3.5"
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      </Card>
    </div>
  );
}
