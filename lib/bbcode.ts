/**
 * Patrol Report BBCode generation.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * These functions are a VERBATIM port of the logic that lived in
 * `public/app.js`. The strings they produce are pasted into a game forum, so
 * the output must stay byte-identical to what the old build generated.
 *
 * Do not "clean up" the regex chains, reorder the passes, or reformat the
 * templates. `lib/bbcode.test.ts` pins the behaviour against fixtures captured
 * from the original implementation.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * The only change from the original is the input shape: the old code read
 * values straight out of the DOM by element id, so these now take plain values
 * instead. The emitted strings are untouched.
 */

/** Renders BBCode to HTML for the live preview. */
export function bbToHtml(bb: string): string {
  let html = bb;
  // Handle nested divbox by repeatedly replacing innermost
  while (/\[divbox=([^\]]+)\]((?:(?!\[divbox)[\s\S])*?)\[\/divbox\]/gi.test(html)) {
    html = html.replace(
      /\[divbox=([^\]]+)\]((?:(?!\[divbox)[\s\S])*?)\[\/divbox\]/gi,
      (_, c, content) => {
        const bg = c === "white" ? "var(--surface-2)" : c;
        return `<div style="background:${bg};border:1px solid var(--border);border-radius:6px;padding:10px;margin:6px 0">${content}</div>`;
      },
    );
  }
  return html
    .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, "<b>$1</b>")
    .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, "<i>$1</i>")
    .replace(/\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi, '<span style="color:$1">$2</span>')
    .replace(/\[center\]([\s\S]*?)\[\/center\]/gi, '<div style="text-align:center">$1</div>')
    .replace(
      /\[img\]([\s\S]*?)\[\/img\]/gi,
      '<img src="$1" style="max-width:100%;border-radius:4px;margin:4px 0">',
    )
    .replace(/\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi, "<details><summary>Spoiler</summary>$1</details>")
    .replace(/\n/g, "<br>");
}

/**
 * Wraps dates, times, names, streets, plates and incident keywords in [b].
 *
 * Existing [b] spans are stashed behind `@@B{n}@@` placeholders first, so the
 * later passes cannot nest bold tags inside them.
 */
export function autoBold(text: string): string {
  if (!text || text === "-") return text;
  const ph: string[] = [];
  const pr = (v: string) => {
    const t = `@@B${ph.length}@@`;
    ph.push(v);
    return t;
  };
  let f = text.replace(/\[b\][\s\S]*?\[\/b\]/gi, pr);
  [
    /\b\d{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi,
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
    /\b(?:pukul|jam|time)\s*\d{1,2}[:.]\d{2}\b/gi,
    /\b\d{1,2}[:.]\d{2}\b/g,
    /\b(?:Deputy|Officer|Sheriff|Sergeant|Corporal|Lieutenant|Detective)\s+[A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*)*\b/g,
    /\b(?:suspect|witness|korban|pelaku|saksi)\b/gi,
    /\b[A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*)*\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Station)\b/g,
    /\b(?:lokasi|location|area)\b/gi,
    /\b(?:perampokan bersenjata|armed robbery|robbery|shooting|pursuit|traffic stop|patroli|pemeriksaan|kejadian|incident|violation)\b/gi,
    /\b(?:kendaraan\s+berjenis|vehicle\s+model|model)\s+[A-Za-z0-9\s-]+?(?=\s+(?:berwarna|dengan|with)|[,.]|$)/gi,
    /\b(?:berwarna|warna|color(?:ed)?)\s+[A-Za-z]+\b/gi,
    /\b(?:Plate(?:\s+Nomor)?|License\s+Plate|Plat(?:e)?(?:\s+Nomor)?)\s*[:#-]?\s*[A-Z0-9-]{2,}\b/gi,
    /\b(?:karena|because|reason|alasan|mengapa|kenapa)\b/gi,
  ].forEach((p) => {
    f = f.replace(p, (m) => pr(`[b]${m}[/b]`));
  });
  return ph.reduce((r, val, i) => r.replace(`@@B${i}@@`, val), f);
}

/** `YYYY-MM-DD` from a date input to the `DD/MM/YYYY` the forum expects. */
export function formatReportDate(date: string): string {
  if (!date) return "-";
  const [y, m, dd] = date.split("-");
  return `${dd}/${m}/${y}`;
}

/** Trims a field and falls back when it is empty — the original's `v()`. */
function field(value: string, fallback = "Answer"): string {
  return value.trim() || fallback;
}

/** Each evidence link becomes a spoilered image, or `-` when there are none. */
function formatEvidence(links: string[]): string {
  const wrapped = links
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => `[spoiler][img]${l}[/img][/spoiler]`);
  return wrapped.length ? wrapped.join("\n") : "-";
}

export interface ReportEntry {
  title: string;
  date: string;
  details: string;
  evidence: string[];
}

export interface ReportInput {
  name: string;
  station: string;
  rank: string;
  badge: string;
  first: ReportEntry;
  second: ReportEntry;
}

function buildReport(label: string, entry: ReportEntry): string {
  return `[divbox=white]\n[b]${label} - ${field(entry.title, "<Insert Report Title>")}[/b]\n\n[b]Date:[/b]\n[divbox=white] ${formatReportDate(entry.date)} [/divbox]\n\n[b]Details:[/b]\n[divbox=white] ${autoBold(field(entry.details, "-"))} [/divbox]\n\n[b]Evidence:[/b]\n[divbox=white] \n${formatEvidence(entry.evidence)}\n[/divbox]\n\n[/divbox]`;
}

/** Assembles the complete patrol report posted to the forum. */
export function buildFullReport(input: ReportInput): string {
  return `[divbox=white]\n[center][img]https://imagizer.imageshack.com/v2/200x200q70/924/Rs1Hi8.png[/img][/center]\n[/divbox]\n[divbox=#008040]\n[center][b][color=#FFFFFF]Los Santos Sheriff Department[/color][/b][/center]\n[/divbox]\n\n[divbox=white]\n[center][b]Patrol Report[/b][/center]\n[divbox=white]\n[b]Name:[/b] ${field(input.name)}\n[b]Station:[/b] ${field(input.station)}\n[b]Rank:[/b] ${field(input.rank)}\n[b]Badge:[/b] ${field(input.badge)}\n[/divbox]\n\n${buildReport("First Report", input.first)}\n\n${buildReport("Second Report", input.second)}\n[/divbox]`;
}

export const EMPTY_REPORT: ReportInput = {
  name: "",
  station: "",
  rank: "",
  badge: "",
  first: { title: "", date: "", details: "", evidence: [] },
  second: { title: "", date: "", details: "", evidence: [] },
};
