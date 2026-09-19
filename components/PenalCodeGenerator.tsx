"use client";

import { useMemo, useState } from "react";

import {
  computePenalCode,
  countCharges,
  describeCharge,
  EMPTY_PENAL_INPUT,
  formatPenalCode,
  type PenalInput,
} from "@/lib/penal";

import { BTN_GOLD, BTN_MINT, Card, CardTitle, CheckField, FIELD, Field } from "./ui";

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

/** A number field that tolerates an empty box as 0 rather than NaN. */
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
  return (
    <Field label={label}>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
        className={`${FIELD} font-mono`}
      />
    </Field>
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
    <div className="grid gap-[18px]">
      <div className="grid items-start gap-[18px] lg:grid-cols-2">
        {/* ---- Left column ----
            `reveal-stack` so each form card enters on the shared delay ladder.
            The section's own stack only sees this grid as one child, so without
            this the eight cards would appear together. The ladder is clamped at
            360ms in `globals.css`, so the last card is never more than that
            behind the first. */}
        <div className="reveal-stack grid gap-[18px]">
          <Card accent="gold">
            <CardTitle tag="1">Robbery</CardTitle>
            <div className="grid gap-3">
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
            </div>
          </Card>

          <Card accent="mint">
            <CardTitle tag="2">Kekerasan</CardTitle>
            <div className="grid gap-2.5">
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
            </div>
          </Card>

          <Card>
            <CardTitle tag="3">Properti</CardTitle>
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
          </Card>

          <Card accent="gold">
            <CardTitle tag="4">Senjata Api</CardTitle>
            <div className="grid gap-3">
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

              <div className="grid gap-2.5">
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
              </div>
            </div>
          </Card>
        </div>

        {/* ---- Right column ---- (see the left column's note) */}
        <div className="reveal-stack grid gap-[18px]">
          <Card accent="mint">
            <CardTitle tag="5">Amunisi &amp; Vest</CardTitle>
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
          </Card>

          <Card>
            <CardTitle tag="6">Narcotics</CardTitle>
            <div className="grid gap-3">
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
            </div>
          </Card>

          <Card accent="gold">
            <CardTitle tag="7">Traffic</CardTitle>
            <div className="grid gap-2.5">
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
            </div>
          </Card>

          <Card>
            <CardTitle tag="8">Lainnya</CardTitle>
            <div className="grid gap-3">
              <CheckField
                label="Membawa lockpick / hacking device"
                checked={input.hackingDevice}
                onChange={(v) => set("hackingDevice", v)}
              />
              <NumberField
                label="Uang Merah (illegal money)"
                value={input.illegalMoney}
                onChange={(v) => set("illegalMoney", v)}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* ---- Output ---- */}
      <Card accent="mint">
        <CardTitle tag={`${total} pasal`}>Pasal yang Dikenakan</CardTitle>

        {total === 0 ? (
          <p className="text-[12.5px] text-text-faint">
            Isi form di atas — daftar pasal muncul di sini secara otomatis.
          </p>
        ) : (
          <div className="grid gap-4">
            {groups.map((group) => (
              <div key={group.group}>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-text-faint">
                  {group.group}
                </div>
                <ul className="grid gap-1.5">
                  {group.items.map((item) => {
                    const description = describeCharge(item.name);
                    return (
                      <li
                        key={item.name}
                        className="rounded-sm border border-border bg-surface-2 px-3 py-2 text-[13px] text-text"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-coral"
                          />
                          {item.name}
                        </div>
                        {description ? (
                          <p className="mt-1 pl-3.5 text-[12px] leading-snug text-text-faint">
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

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={copy}
            disabled={total === 0}
            className={BTN_GOLD}
          >
            {copied ? "Tersalin!" : "Copy Daftar Pasal"}
          </button>
          <button type="button" onClick={reset} className={BTN_MINT}>
            Reset
          </button>
          {total === 0 && !copied ? null : (
            <span aria-live="polite" className="text-[12px] text-mint">
              {copied ? "Tersalin ke clipboard." : ""}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}
