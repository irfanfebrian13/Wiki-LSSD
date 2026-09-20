"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  computePenalCode,
  countCharges,
  describeCharge,
  EMPTY_PENAL_INPUT,
  formatPenalCode,
  type PenalInput,
} from "@/lib/penal";

import { BTN_GOLD, BTN_OUTLINE, CheckField, FIELD, Field } from "./ui";

/**
 * Penal Code Generator.
 *
 * Every threshold and charge name lives in `lib/penal.ts`, which is pinned by
 * `lib/penal.test.ts` and matches the static Penal Code sections in
 * `lib/data.ts`. This file is presentation only — it holds form state and hands
 * it to `computePenalCode`. The per-charge explanations come from
 * `describeCharge` in the same module, so the preview says what a charge means
 * without this file restating any of it.
 *
 * The category numbering (1–8) matches the reference's card tags and is part of
 * how the tool reads, not decoration.
 */

/** A number field that tolerates an empty box as 0 rather than NaN.
 *
 * The box holds a string, not the number itself. A controlled `type="number"`
 * bound straight to the value cannot be cleared: the empty box parses back to
 * 0, and React immediately writes the 0 in again. The number the generator
 * computes with still lives in the parent — this is only what is displayed.
 *
 * The starting `0` reads as a placeholder. Focusing it selects the whole value,
 * so the first keystroke replaces it rather than appending to it — no Backspace
 * needed, and `05`/`010` are never produced. Stripping leading zeros on the way
 * in is the second line of defence, for any path the selection does not cover.
 */
function NumberField({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) {
  const [text, setText] = useState(() => String(value));
  const editing = useRef(false);

  /* Re-sync when the value is set from outside (Reset). Skipped mid-edit so a
     half-typed box is never overwritten by the echo of its own change. */
  useEffect(() => {
    if (editing.current) return;
    setText(String(value));
  }, [value]);

  const commit = (raw: string) => {
    const cleaned = raw.replace(/^0+(?=\d)/, "");
    setText(cleaned);
    onChange(Number.parseFloat(cleaned) || 0);
  };

  return (
    <Field label={label}>
      <input
        type="number"
        min={min}
        value={text}
        onFocus={(e) => {
          editing.current = true;
          // The placeholder 0 is replaced by the first keystroke, not appended.
          if (e.currentTarget.value === "0") e.currentTarget.select();
        }}
        onChange={(e) => commit(e.target.value)}
        onBlur={(e) => {
          editing.current = false;
          /* Empty means 0 to the maths, but the field should not be left blank
             once the deputy has moved on, so restore the canonical value. */
          commit(e.currentTarget.value === "" ? "0" : e.currentTarget.value);
        }}
        className={`${FIELD} font-mono`}
      />
    </Field>
  );
}

/**
 * One form group: a Fraunces heading over a hairline, its fields beneath.
 *
 * The brief's shape for the generator's form — groups, not boxed cards. The
 * numbered tag is part of how the tool reads, not decoration.
 */
function Group({
  tag,
  title,
  children,
}: {
  tag: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-3">
      <h3 className="flex items-baseline gap-2.5 border-b border-border pb-2 font-display text-[20px] font-semibold text-text">
        <span
          aria-hidden
          className="font-mono text-[12px] font-semibold text-gold"
        >
          {tag}
        </span>
        {title}
      </h3>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

export function PenalCodeGenerator() {
  const [input, setInput] = useState<PenalInput>(EMPTY_PENAL_INPUT);
  const [copied, setCopied] = useState(false);

  const groups = useMemo(() => computePenalCode(input), [input]);
  const total = countCharges(groups);

  const set = <K extends keyof PenalInput>(key: K, value: PenalInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const copy = async () => {
    if (total === 0) return;
    try {
      await navigator.clipboard.writeText(formatPenalCode(groups));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be denied; the list stays selectable.
    }
  };

  const reset = () => {
    setInput(EMPTY_PENAL_INPUT);
    setCopied(false);
  };

  return (
    <div className="grid items-start gap-10 min-[980px]:grid-cols-[minmax(0,1fr)_340px]">
      {/* ---- Form ----
          `reveal-stack` so each group enters on the shared delay ladder. The
          section's own stack only sees this grid as one child, so without this
          the eight groups would appear together. The ladder is clamped at 360ms
          in `globals.css`, so the last group is never more than that behind the
          first. */}
      <div className="reveal-stack grid gap-6">
        <Group tag="1" title="Robbery">
          <Field label="Jenis Robbery">
            <select
              value={input.robberyType}
              onChange={(e) => set("robberyType", e.target.value as PenalInput["robberyType"])}
              className={FIELD}
            >
              <option value="none">Tidak ada</option>
              <option value="ltd">LTD / Commercial Robbery</option>
              <option value="fleeca">Fleeca Robbery</option>
              <option value="major">
                Grupee / Cash Exchange / Laundromat / Bobcat / Cargo
              </option>
              <option value="bank">Pacific / Maze / Blaine County Bank</option>
              <option value="vangelico">Vangelico Jewelry</option>
            </select>
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField
              label="Jumlah Sandera"
              value={input.hostages}
              onChange={(v) => set("hostages", v)}
            />
            <Field label="Peran Suspect">
              <select
                value={input.isDriver ? "yes" : "no"}
                onChange={(e) => set("isDriver", e.target.value === "yes")}
                className={FIELD}
              >
                <option value="no">Bukan driver</option>
                <option value="yes">Driver (evading)</option>
              </select>
            </Field>
          </div>

          <CheckField
            label="Kedapatan membawa barang/uang hasil curian"
            checked={input.stolenGoods}
            onChange={(v) => set("stolenGoods", v)}
          />
        </Group>

        <Group tag="2" title="Kekerasan">
          <CheckField
            label="Terlibat baku tembak (Gang War)"
            checked={input.gangWar}
            onChange={(v) => set("gangWar", v)}
          />
          <CheckField
            label="Menyerang Deputy/Officer dengan senjata"
            checked={input.assaultDeputy}
            onChange={(v) => set("assaultDeputy", v)}
          />
          <CheckField
            label="Hasil GSR test positif (menembak)"
            checked={input.gsr}
            onChange={(v) => set("gsr", v)}
          />
        </Group>

        <Group tag="3" title="Properti">
          <Field label="Kerusakan Properti">
            <select
              value={input.property}
              onChange={(e) => set("property", e.target.value as PenalInput["property"])}
              className={FIELD}
            >
              <option value="none">Tidak ada</option>
              <option value="vandalism">Vandalism (properti umum/pribadi)</option>
              <option value="vandalismGov">Vandalism on Government Property</option>
              <option value="destructionGov">
                Destruction of Government Property (mayor)
              </option>
            </select>
          </Field>
        </Group>

        <Group tag="4" title="Senjata Api">
          <Field label="Class Senjata Ilegal">
            <select
              value={input.firearmClass}
              onChange={(e) =>
                set("firearmClass", e.target.value as PenalInput["firearmClass"])
              }
              className={FIELD}
            >
              <option value="none">Tidak ada</option>
              <option value="1">Class 1</option>
              <option value="2">Class 2</option>
              <option value="3">Class 3</option>
            </select>
          </Field>

          <CheckField
            label="Pistol/Handgun gunstore tanpa lisensi"
            checked={input.unlicensedPistol}
            onChange={(v) => set("unlicensedPistol", v)}
          />
          <CheckField
            label="Shotgun/Rifle gunstore tanpa lisensi"
            checked={input.unlicensedLong}
            onChange={(v) => set("unlicensedLong", v)}
          />
          <CheckField
            label="Menggunakan Suppressor"
            checked={input.suppressor}
            onChange={(v) => set("suppressor", v)}
          />
        </Group>

        <Group tag="5" title="Amunisi & Vest">
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField
              label="Jumlah Amunisi (butir)"
              value={input.ammo}
              onChange={(v) => set("ammo", v)}
            />
            <NumberField
              label="Jumlah Vest"
              value={input.vest}
              onChange={(v) => set("vest", v)}
            />
          </div>
        </Group>

        <Group tag="6" title="Narcotics">
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField
              label="Weed / Opium (gram)"
              value={input.sched1}
              onChange={(v) => set("sched1", v)}
            />
            <NumberField
              label="Meth / Cocaine (gram)"
              value={input.sched2}
              onChange={(v) => set("sched2", v)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField
              label="Alat Produksi (jumlah item)"
              value={input.paraphernalia}
              onChange={(v) => set("paraphernalia", v)}
            />
            <NumberField
              label="Poppy (kg)"
              value={input.poppy}
              onChange={(v) => set("poppy", v)}
            />
          </div>
          <CheckField
            label="Sedang melakukan proses produksi narkotika"
            checked={input.manufacturing}
            onChange={(v) => set("manufacturing", v)}
          />
          <CheckField
            label="Menjual / menawarkan untuk menjual narkotika"
            checked={input.drugSelling}
            onChange={(v) => set("drugSelling", v)}
          />
        </Group>

        <Group tag="7" title="Traffic">
          <CheckField
            label="Membawa tabung NOS"
            checked={input.nosPossession}
            onChange={(v) => set("nosPossession", v)}
          />
          <CheckField
            label="Menggunakan NOS saat mengemudi"
            checked={input.nosUsage}
            onChange={(v) => set("nosUsage", v)}
          />
          <CheckField
            label="Tidak pakai helm/seatbelt"
            checked={input.noSeatbelt}
            onChange={(v) => set("noSeatbelt", v)}
          />
        </Group>

        <Group tag="8" title="Lainnya">
          <CheckField
            label="Membawa lockpick / hacking device"
            checked={input.hackingDevice}
            onChange={(v) => set("hackingDevice", v)}
          />
          <CheckField
            label="Menghalangi / melarikan diri dari penangkapan (Resisting Arrest)"
            checked={input.resistingArrest}
            onChange={(v) => set("resistingArrest", v)}
          />
          <NumberField
            label="Uang Merah (illegal money)"
            value={input.illegalMoney}
            onChange={(v) => set("illegalMoney", v)}
          />
        </Group>
      </div>

      {/* ---- Charge sheet ----
          The one place the hard offset shadow appears. `charge-sheet` is what
          the print stylesheet uses to drop it. Sticky only from 980px up; below
          that it stacks under the form and the floating button below scrolls
          back to it. */}
      <aside
        id="charge-sheet"
        aria-live="polite"
        className="charge-sheet rounded-sm border border-outline bg-surface p-4 shadow-[6px_6px_0_var(--border)] min-[980px]:sticky min-[980px]:top-[132px]"
      >
        <h3 className="font-display text-[20px] font-semibold text-text">
          Pasal yang Dikenakan
        </h3>

        {total === 0 ? (
          <p className="mt-2.5 text-[13px] leading-relaxed text-text-dim">
            Isi form di atas — daftar pasal muncul di sini secara otomatis.
          </p>
        ) : (
          <div className="mt-3 grid gap-3">
            {groups.map((group) => (
              <div key={group.group}>
                <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-dim">
                  {group.group}
                </div>
                <ul>
                  {group.items.map((item) => {
                    const description = describeCharge(item.name);
                    return (
                      <li
                        key={item.name}
                        className="border-b border-dotted border-text-dim py-2 font-mono text-[13px] leading-snug text-text"
                      >
                        {item.name}
                        {description ? (
                          <p className="mt-1 font-sans text-[11.5px] leading-snug text-text-dim">
                            {description}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <span className="mr-auto font-mono text-[13px] font-semibold text-text">
            {total} pasal
          </span>
          <button type="button" onClick={reset} className={BTN_OUTLINE}>
            Reset
          </button>
          <button
            type="button"
            onClick={copy}
            disabled={total === 0}
            className={BTN_GOLD}
          >
            {copied ? "Tersalin!" : "Salin daftar pasal"}
          </button>
        </div>
      </aside>

      {/* Mobile only: the sheet is below the form at these widths, so this is
          the way back to it. Clears the bottom nav from task-08. */}
      <button
        type="button"
        onClick={() =>
          document
            .getElementById("charge-sheet")
            ?.scrollIntoView({ behavior: "smooth", block: "center" })
        }
        className="charge-fab fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px))] right-3.5 z-30 rounded-sm border border-outline bg-gold px-3.5 py-2 font-mono text-[13px] font-semibold text-on-accent min-[760px]:hidden"
      >
        {total} pasal
      </button>
    </div>
  );
}
