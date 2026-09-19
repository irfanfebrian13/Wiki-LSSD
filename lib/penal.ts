/**
 * Penal Code Generator — charge computation.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * The thresholds and charge names here are a VERBATIM port of the generator in
 * `lssd-wiki-modern.html`, which is itself derived from the same departmental
 * source as the static Penal Code sections in `lib/data.ts`. The two must agree:
 * if a threshold moves here it has moved on the reference pages too.
 *
 * Two deliberate departures from that port: `Drugs Selling` and `Resisting
 * Arrest` are charges added later (both are in the `penal-*` reference sections
 * but not in the legacy HTML), so they are the entries below with no counterpart
 * in the old build.
 *
 * `lib/penal.test.ts` pins every boundary. Do not "tidy" the else-if chains —
 * several thresholds are inclusive at one end only, and that is deliberate.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface PenalInput {
  robberyType: "none" | "ltd" | "fleeca" | "major" | "bank" | "vangelico";
  hostages: number;
  isDriver: boolean;
  stolenGoods: boolean;

  gangWar: boolean;
  assaultDeputy: boolean;
  gsr: boolean;

  property: "none" | "vandalism" | "vandalismGov" | "destructionGov";

  firearmClass: "none" | "1" | "2" | "3";
  unlicensedPistol: boolean;
  unlicensedLong: boolean;
  suppressor: boolean;

  ammo: number;
  vest: number;

  sched1: number;
  sched2: number;
  paraphernalia: number;
  poppy: number;
  manufacturing: boolean;
  /** Selling or offering to sell a controlled substance. */
  drugSelling: boolean;

  nosPossession: boolean;
  nosUsage: boolean;
  noSeatbelt: boolean;

  hackingDevice: boolean;
  /** Deliberately obstructing a lawful arrest — fleeing on foot, breaking away, or hiding. */
  resistingArrest: boolean;
  illegalMoney: number;
}

export interface PenalGroup {
  group: string;
  items: { name: string }[];
}

export const EMPTY_PENAL_INPUT: PenalInput = {
  robberyType: "none",
  hostages: 0,
  isDriver: false,
  stolenGoods: false,

  gangWar: false,
  assaultDeputy: false,
  gsr: false,

  property: "none",

  firearmClass: "none",
  unlicensedPistol: false,
  unlicensedLong: false,
  suppressor: false,

  ammo: 0,
  vest: 0,

  sched1: 0,
  sched2: 0,
  paraphernalia: 0,
  poppy: 0,
  manufacturing: false,
  drugSelling: false,

  nosPossession: false,
  nosUsage: false,
  noSeatbelt: false,

  hackingDevice: false,
  resistingArrest: false,
  illegalMoney: 0,
};

const ROBBERY_LABELS: Record<Exclude<PenalInput["robberyType"], "none">, string> = {
  ltd: "Commercial Robbery (LTD Robbery)",
  fleeca: "Grand Larceny Public Bank (Fleeca Robbery)",
  major: "Grand Larceny Major Property",
  bank: "Grand Larceny Federal Bank",
  vangelico: "Robbery to Vangelico Property",
};

const PROPERTY_LABELS: Record<Exclude<PenalInput["property"], "none">, string> = {
  vandalism: "Vandalism",
  vandalismGov: "Vandalism on Government Property",
  destructionGov: "Destruction of Government Property",
};

/**
 * The explanation shown for a charge, keyed by the charge name.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * These are lifted verbatim from the Penal Code reference sections in
 * `lib/data.ts` (the `bullets` blocks under `penal-*`). The reference is the
 * source of truth: `lib/penal.test.ts` asserts that every entry here still
 * appears there, so a description cannot drift from the page it explains.
 *
 * Charges with no standalone explanation on the reference pages — the Robbery
 * and Kekerasan example blocks — are deliberately absent. `describeCharge`
 * returns `undefined` for them and the UI shows the charge name alone rather
 * than inventing prose the department never wrote.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const CHARGE_DESCRIPTIONS: Record<string, string> = {
  /* Properti */
  Vandalism:
    "perusakan ringan (minor physical damage) atau pengotoran properti milik orang lain/publik (contoh: corat-coret/graffiti, menggores, atau merusak fasilitas pribadi/publik).",
  "Vandalism on Government Property":
    "perusakan ringan (minor physical damage) atau pengotoran yang secara spesifik dilakukan terhadap properti milik Pemerintah/Negara.",
  "Destruction of Government Property":
    "merusak, merobohkan, atau menghancurkan fasilitas/properti milik pemerintah secara sengaja dengan skala kerusakan mayor (besar).",

  /* Senjata Api */
  "Criminal Use of a Firearm": "jika kedapatan positif menggunakan senjata.",
  "Criminal Possession of a Firearm [Class 1/2/3]":
    "membawa senjata ilegal sesuai class.",
  "Possession of Unlicensed Firearm [Class 1]":
    "membawa Pistol/Handgun gunstore tanpa lisensi.",
  "Possession of Unlicensed Firearm [Class 2]":
    "membawa Shotgun/Rifle gunstore tanpa lisensi.",
  "Usage of Suppressor":
    "dengan sengaja menggunakan, memasang (attach), melengkapi (equip), ataupun menembakkan senjata api yang telah terpasang Suppressor, tanpa kewenangan atau otorisasi yang sah.",

  /* Amunisi & Vest */
  "Unlawful Possession of Ammunition":
    "membawa < 300 butir (jenis apapun, total < 300).",
  "Illegal Distribution of Ammunition": "membawa > 300 dan < 2000 butir.",
  "Ammunition Smuggling (Court Verdict)": "membawa > 2000 butir.",
  "Misdemeanor Possession of Bulletproof Vest": "membawa < 10 vest.",
  "Felony Possession of Bulletproof Vest (Court Verdict)":
    "membawa 10 atau lebih vest.",

  /* Narcotics */
  "Misdemeanor Possession of Schedule I":
    "weed bag dam opium bag < 60 gram.",
  "Felony Possession of Schedule I": "weed bag dan opium bag > 60 gram.",
  "Misdemeanor Possession of Schedule II":
    "meth bag dan cocaine < 100 gram.",
  "Felony Possession of Schedule II": "meth bag dan cocaine > 100 gram.",
  "Distribute of a Schedule Category":
    "kedua jenis narcotics total > 800 gram.",
  "Drug Smuggling": "kedua jenis narcotics total > 2000 gram.",
  "Drug Trafficking": "kedua jenis narcotics total > 4000 gram.",
  "Drugs Selling":
    "setiap orang yang menjual atau menawarkan untuk menjual suatu zat yang diawasi kepada orang lain, serta memiliki zat yang diawasi tersebut, dinyatakan bersalah melakukan tindak pidana penjualan narkoba.",
  "Possession of Drug Paraphernalia":
    "alat produksi (A < 10, B > 10): Meth Oven, Meth Table, Bagging Table, Baggy, Planting Pot, Cannabis Seed, Weed, Phos, Pseudo, Acid, Liquid Meth, Meth.",
  "Drug Manufacturing":
    "melakukan proses produksi kedua jenis schedule controlled substances.",
  "Unlawful Possession of Poppy":
    "kepemilikan 101 kg – 200 kg Poppy tanpa izin yang sah.",
  "Felony Possession of Poppy":
    "kepemilikan 201 kg – 300 kg Poppy tanpa izin yang sah.",
  "Aggravated Possession of Poppy (Court Verdict)":
    "kepemilikan 301 kg atau lebih tanpa izin yang sah.",

  /* Traffic */
  "Possession of Nitrous Oxide":
    "menguasai, membawa, atau menyimpan tabung Nitrous Oxide (NOS) yang diperuntukkan bagi peningkatan performa kendaraan tanpa izin sah (authorization).",
  "Use of Nitrous Oxide":
    "mengaktifkan atau menggunakan sistem injeksi Nitrous Oxide (NOS) pada kendaraan secara ilegal saat kendaraan beroperasi/dikemudikan.",
  "Failure to Use Required Safety Equipment (Ticket Only)":
    "mengemudikan atau menumpang kendaraan bermotor di jalan umum tanpa menggunakan perlengkapan keselamatan yang diwajibkan oleh hukum (termasuk namun tidak terbatas pada Helm dan/atau Sabuk Pengaman / Seat Belt).",

  /* Lainnya */
  "Possession of Unauthorized Device (Hacking Device)":
    "membawa lockpick atau kartu seperti green card.",
  "Resisting Arrest":
    "Setiap orang yang dengan sengaja menghalangi atau berupaya menghalangi petugas penegak hukum melakukan penangkapan yang sah dengan cara melarikan diri dengan berjalan kaki, melepaskan diri, atau bersembunyi.",
  "Minor Possession of Illegal Money": "uang merah < 50.000.",
  "Third Degree Possession of Illegal Money": "uang merah < 149.999.",
  "Second Degree Possession of Illegal Money": "uang merah < 399.999.",
  "First Degree Possession of Illegal Money (Court Verdict)":
    "uang merah > 400.000.",
};

/**
 * Charge names the generator spells differently from the reference bullet that
 * documents them, mapped onto that bullet's exact name.
 *
 * Three cases, each because the reference lists the variants in one bullet:
 *   - the Kekerasan (gang war) branch drops the article from "Criminal Use of
 *     a Firearm";
 *   - "Criminal Possession of a Firearm" is one bullet covering `[Class 1/2/3]`;
 *   - "Possession of Drug Paraphernalia" is one bullet covering classes A and B.
 *
 * `Possession of Unlicensed Firearm [Class 1]` and `[Class 2]` are absent
 * deliberately — the reference documents those as two separate bullets with two
 * separate explanations, so they are map keys in their own right.
 */
const CHARGE_ALIASES: Record<string, string> = {
  "Criminal Use of Firearm": "Criminal Use of a Firearm",
  "Criminal Possession of a Firearm [Class 1]": "Criminal Possession of a Firearm [Class 1/2/3]",
  "Criminal Possession of a Firearm [Class 2]": "Criminal Possession of a Firearm [Class 1/2/3]",
  "Criminal Possession of a Firearm [Class 3]": "Criminal Possession of a Firearm [Class 1/2/3]",
  "Possession of Drug Paraphernalia (Class A)": "Possession of Drug Paraphernalia",
  "Possession of Drug Paraphernalia (Class B)": "Possession of Drug Paraphernalia",
};

/**
 * Maps a generated charge name onto its reference bullet's name.
 *
 * Exported so `lib/penal.test.ts` can check every description against the
 * reference page without restating the alias table and letting the two drift.
 */
export function normalizeChargeName(name: string): string {
  return CHARGE_ALIASES[name] ?? name;
}

/** The reference's explanation for a charge, or `undefined` when it has none. */
export function describeCharge(name: string): string | undefined {
  return CHARGE_DESCRIPTIONS[normalizeChargeName(name)];
}

/** Charges grouped by category, in the order the categories are declared. */
export function computePenalCode(input: PenalInput): PenalGroup[] {
  const groups: PenalGroup[] = [];
  const add = (group: string, name: string) => {
    let g = groups.find((x) => x.group === group);
    if (!g) {
      g = { group, items: [] };
      groups.push(g);
    }
    if (!g.items.some((i) => i.name === name)) g.items.push({ name });
  };

  const { gsr } = input;

  /* Robbery */
  if (input.robberyType !== "none") {
    add("Robbery", ROBBERY_LABELS[input.robberyType]);
    if (input.hostages >= 1 && input.hostages <= 2) add("Robbery", "Hostages (1-2 sandera)");
    if (input.hostages >= 3) add("Robbery", "Aggravated Hostages (3-4 sandera)");
    if (input.isDriver)
      add("Robbery", "Reckless Evading to Peace Officer / Reckless Driving");
    if (input.stolenGoods) add("Robbery", "Possession of Stolen Goods");
  }

  /* Kekerasan */
  if (input.gangWar) {
    add("Kekerasan", "Gang Related Shooting (Gang War)");
    if (gsr) add("Kekerasan", "Criminal Use of Firearm");
  }
  if (input.assaultDeputy) {
    add("Kekerasan", "Assault with Deadly Weapon to Government Employee");
    if (gsr) add("Kekerasan", "Criminal Use of a Firearm");
    add("Kekerasan", "Disturbing the Peace");
  }

  /* Properti */
  if (input.property !== "none") add("Properti", PROPERTY_LABELS[input.property]);

  /* Senjata Api */
  if (gsr) add("Senjata Api", "Criminal Use of a Firearm");
  if (input.firearmClass !== "none")
    add("Senjata Api", `Criminal Possession of a Firearm [Class ${input.firearmClass}]`);
  if (input.unlicensedPistol)
    add("Senjata Api", "Possession of Unlicensed Firearm [Class 1]");
  if (input.unlicensedLong)
    add("Senjata Api", "Possession of Unlicensed Firearm [Class 2]");
  if (input.suppressor) add("Senjata Api", "Usage of Suppressor");

  /* Amunisi & Vest */
  const { ammo } = input;
  if (ammo > 0 && ammo < 300) add("Amunisi & Vest", "Unlawful Possession of Ammunition");
  else if (ammo >= 300 && ammo <= 2000)
    add("Amunisi & Vest", "Illegal Distribution of Ammunition");
  else if (ammo > 2000) add("Amunisi & Vest", "Ammunition Smuggling (Court Verdict)");

  const { vest } = input;
  if (vest > 0 && vest < 10)
    add("Amunisi & Vest", "Misdemeanor Possession of Bulletproof Vest");
  else if (vest >= 10)
    add("Amunisi & Vest", "Felony Possession of Bulletproof Vest (Court Verdict)");

  /* Narcotics */
  const { sched1: s1, sched2: s2 } = input;
  if (s1 > 0)
    add(
      "Narcotics",
      s1 <= 60 ? "Misdemeanor Possession of Schedule I" : "Felony Possession of Schedule I",
    );
  if (s2 > 0)
    add(
      "Narcotics",
      s2 <= 100 ? "Misdemeanor Possession of Schedule II" : "Felony Possession of Schedule II",
    );
  const totalNarc = s1 + s2;
  if (totalNarc > 800) add("Narcotics", "Distribute of a Schedule Category");
  if (totalNarc > 2000) add("Narcotics", "Drug Smuggling");
  if (totalNarc > 4000) add("Narcotics", "Drug Trafficking");
  if (input.drugSelling) add("Narcotics", "Drugs Selling");

  const { paraphernalia: para } = input;
  if (para > 0)
    add(
      "Narcotics",
      para <= 10
        ? "Possession of Drug Paraphernalia (Class A)"
        : "Possession of Drug Paraphernalia (Class B)",
    );
  if (input.manufacturing) add("Narcotics", "Drug Manufacturing");

  const { poppy } = input;
  if (poppy >= 101 && poppy <= 200) add("Narcotics", "Unlawful Possession of Poppy");
  else if (poppy >= 201 && poppy <= 300) add("Narcotics", "Felony Possession of Poppy");
  else if (poppy > 300)
    add("Narcotics", "Aggravated Possession of Poppy (Court Verdict)");

  /* Traffic */
  if (input.nosPossession) add("Traffic", "Possession of Nitrous Oxide");
  if (input.nosUsage) add("Traffic", "Use of Nitrous Oxide");
  if (input.noSeatbelt)
    add("Traffic", "Failure to Use Required Safety Equipment (Ticket Only)");

  /* Lainnya */
  if (input.hackingDevice)
    add("Lainnya", "Possession of Unauthorized Device (Hacking Device)");
  if (input.resistingArrest) add("Lainnya", "Resisting Arrest");

  const { illegalMoney: money } = input;
  if (money > 0 && money < 50000) add("Lainnya", "Minor Possession of Illegal Money");
  else if (money >= 50000 && money <= 149999)
    add("Lainnya", "Third Degree Possession of Illegal Money");
  else if (money >= 150000 && money <= 399999)
    add("Lainnya", "Second Degree Possession of Illegal Money");
  else if (money >= 400000)
    add("Lainnya", "First Degree Possession of Illegal Money (Court Verdict)");

  return groups;
}

/** Total charge count across every category. */
export function countCharges(groups: PenalGroup[]): number {
  return groups.reduce((n, g) => n + g.items.length, 0);
}

/**
 * One charge as a clipboard line.
 *
 * `- Name — explanation` when the reference carries one, `- Name` otherwise.
 * The em-dash form mirrors how the Penal Code pages themselves list a charge,
 * so a deputy reading the pasted list sees the same shape as the page.
 */
function formatChargeLine(item: { name: string }): string {
  const description = describeCharge(item.name);
  return description ? `- ${item.name} — ${description}` : `- ${item.name}`;
}

/** The plain-text list the Copy button puts on the clipboard. */
export function formatPenalCode(groups: PenalGroup[]): string {
  return groups
    .map((g) => `${g.group}:\n` + g.items.map(formatChargeLine).join("\n"))
    .join("\n\n");
}
