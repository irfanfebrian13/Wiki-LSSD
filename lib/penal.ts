/**
 * Penal Code Generator — charge computation.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * The thresholds and charge names here are a VERBATIM port of the generator in
 * `lssd-wiki-modern.html`, which is itself derived from the same departmental
 * source as the static Penal Code sections in `lib/data.ts`. The two must agree:
 * if a threshold moves here it has moved on the reference pages too.
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

  nosPossession: boolean;
  nosUsage: boolean;
  noSeatbelt: boolean;

  hackingDevice: boolean;
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

  nosPossession: false,
  nosUsage: false,
  noSeatbelt: false,

  hackingDevice: false,
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

/** The plain-text list the Copy button puts on the clipboard. */
export function formatPenalCode(groups: PenalGroup[]): string {
  return groups
    .map((g) => `${g.group}:\n` + g.items.map((i) => `- ${i.name}`).join("\n"))
    .join("\n\n");
}
