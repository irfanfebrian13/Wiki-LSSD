import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CHARGE_DESCRIPTIONS,
  computePenalCode,
  countCharges,
  describeCharge,
  EMPTY_PENAL_INPUT,
  formatPenalCode,
  normalizeChargeName,
  type PenalInput,
} from "./penal.ts";
import { POCKETBOOK } from "./data.ts";

/** The empty form plus the given overrides. */
function input(overrides: Partial<PenalInput> = {}): PenalInput {
  return { ...EMPTY_PENAL_INPUT, ...overrides };
}

/** Charge names in one category, or `[]` when the category is absent. */
function charges(groups: ReturnType<typeof computePenalCode>, group: string): string[] {
  return groups.find((g) => g.group === group)?.items.map((i) => i.name) ?? [];
}

test("an empty form produces no charges", () => {
  assert.deepEqual(computePenalCode(input()), []);
  assert.equal(countCharges(computePenalCode(input())), 0);
});

test("robbery adds its label, hostages, driver and stolen goods", () => {
  const groups = computePenalCode(
    input({ robberyType: "fleeca", hostages: 2, isDriver: true, stolenGoods: true }),
  );
  assert.deepEqual(charges(groups, "Robbery"), [
    "Grand Larceny Public Bank (Fleeca Robbery)",
    "Hostages (1-2 sandera)",
    "Reckless Evading to Peace Officer / Reckless Driving",
    "Possession of Stolen Goods",
  ]);
});

test("hostage tiers split at 3 and no hostages adds nothing", () => {
  assert.deepEqual(charges(computePenalCode(input({ robberyType: "ltd" })), "Robbery"), [
    "Commercial Robbery (LTD Robbery)",
  ]);
  assert.deepEqual(
    charges(computePenalCode(input({ robberyType: "ltd", hostages: 3 })), "Robbery"),
    ["Commercial Robbery (LTD Robbery)", "Aggravated Hostages (3-4 sandera)"],
  );
});

test("robbery details are ignored when no robbery type is selected", () => {
  const groups = computePenalCode(input({ hostages: 4, isDriver: true, stolenGoods: true }));
  assert.deepEqual(charges(groups, "Robbery"), []);
});

test("GSR pulls a firearm charge into every branch that reacts to it", () => {
  const groups = computePenalCode(
    input({ gangWar: true, assaultDeputy: true, gsr: true }),
  );
  assert.deepEqual(charges(groups, "Kekerasan"), [
    "Gang Related Shooting (Gang War)",
    "Criminal Use of Firearm",
    "Assault with Deadly Weapon to Government Employee",
    "Criminal Use of a Firearm",
    "Disturbing the Peace",
  ]);
  assert.deepEqual(charges(groups, "Senjata Api"), ["Criminal Use of a Firearm"]);
});

test("gang war and assault without GSR add no firearm charge", () => {
  const groups = computePenalCode(input({ gangWar: true, assaultDeputy: true }));
  assert.deepEqual(charges(groups, "Kekerasan"), [
    "Gang Related Shooting (Gang War)",
    "Assault with Deadly Weapon to Government Employee",
    "Disturbing the Peace",
  ]);
  assert.deepEqual(charges(groups, "Senjata Api"), []);
});

test("property charges only appear when a property type is chosen", () => {
  assert.deepEqual(charges(computePenalCode(input({ property: "none" })), "Properti"), []);
  assert.deepEqual(
    charges(computePenalCode(input({ property: "vandalismGov" })), "Properti"),
    ["Vandalism on Government Property"],
  );
});

test("firearm class, unlicensed weapons and suppressor stack", () => {
  const groups = computePenalCode(
    input({
      firearmClass: "3",
      unlicensedPistol: true,
      unlicensedLong: true,
      suppressor: true,
    }),
  );
  assert.deepEqual(charges(groups, "Senjata Api"), [
    "Criminal Possession of a Firearm [Class 3]",
    "Possession of Unlicensed Firearm [Class 1]",
    "Possession of Unlicensed Firearm [Class 2]",
    "Usage of Suppressor",
  ]);
});

test("ammunition boundaries are inclusive at 300 and 2000 only", () => {
  const at = (ammo: number) => charges(computePenalCode(input({ ammo })), "Amunisi & Vest");
  assert.deepEqual(at(1), ["Unlawful Possession of Ammunition"]);
  assert.deepEqual(at(299), ["Unlawful Possession of Ammunition"]);
  assert.deepEqual(at(300), ["Illegal Distribution of Ammunition"]);
  assert.deepEqual(at(2000), ["Illegal Distribution of Ammunition"]);
  assert.deepEqual(at(2001), ["Ammunition Smuggling (Court Verdict)"]);
  assert.deepEqual(at(0), []);
});

test("vest boundaries split at 10", () => {
  const at = (vest: number) => charges(computePenalCode(input({ vest })), "Amunisi & Vest");
  assert.deepEqual(at(1), ["Misdemeanor Possession of Bulletproof Vest"]);
  assert.deepEqual(at(9), ["Misdemeanor Possession of Bulletproof Vest"]);
  assert.deepEqual(at(10), ["Felony Possession of Bulletproof Vest (Court Verdict)"]);
  assert.deepEqual(at(0), []);
});

test("schedule I and II split at their own gram thresholds", () => {
  const at = (sched1: number) => charges(computePenalCode(input({ sched1 })), "Narcotics");
  assert.deepEqual(at(60), ["Misdemeanor Possession of Schedule I"]);
  assert.deepEqual(at(61), ["Felony Possession of Schedule I"]);

  const s2 = (sched2: number) => charges(computePenalCode(input({ sched2 })), "Narcotics");
  assert.deepEqual(s2(100), ["Misdemeanor Possession of Schedule II"]);
  assert.deepEqual(s2(101), ["Felony Possession of Schedule II"]);
});

test("combined narcotic weight stacks distribution, smuggling and trafficking", () => {
  const groups = computePenalCode(input({ sched1: 5000, sched2: 0 }));
  const narc = charges(groups, "Narcotics");
  assert.ok(narc.includes("Distribute of a Schedule Category"));
  assert.ok(narc.includes("Drug Smuggling"));
  assert.ok(narc.includes("Drug Trafficking (Court Verdict)"));

  // Exactly 800 is not "distribute" — the comparison is strictly greater.
  assert.deepEqual(
    charges(computePenalCode(input({ sched1: 800 })), "Narcotics"),
    ["Felony Possession of Schedule I"],
  );
});

test("paraphernalia classes split at 10", () => {
  assert.deepEqual(
    charges(computePenalCode(input({ paraphernalia: 10 })), "Narcotics"),
    ["Possession of Drug Paraphernalia (Class A)"],
  );
  assert.deepEqual(
    charges(computePenalCode(input({ paraphernalia: 11 })), "Narcotics"),
    ["Possession of Drug Paraphernalia (Class B)"],
  );
});

test("poppy tiers begin at 101 and never fire below it", () => {
  const at = (poppy: number) => charges(computePenalCode(input({ poppy })), "Narcotics");
  assert.deepEqual(at(100), []);
  assert.deepEqual(at(101), ["Unlawful Possession of Poppy"]);
  assert.deepEqual(at(200), ["Unlawful Possession of Poppy"]);
  assert.deepEqual(at(201), ["Felony Possession of Poppy"]);
  assert.deepEqual(at(300), ["Felony Possession of Poppy"]);
  assert.deepEqual(at(301), ["Aggravated Possession of Poppy (Court Verdict)"]);
});

test("drug manufacturing is a standalone charge", () => {
  assert.deepEqual(
    charges(computePenalCode(input({ manufacturing: true })), "Narcotics"),
    ["Drug Manufacturing"],
  );
});

test("traffic charges are independent toggles", () => {
  const groups = computePenalCode(
    input({ nosPossession: true, nosUsage: true, noSeatbelt: true }),
  );
  assert.deepEqual(charges(groups, "Traffic"), [
    "Possession of Nitrous Oxide",
    "Use of Nitrous Oxide",
    "Failure to Use Required Safety Equipment (Ticket Only)",
  ]);
});

test("illegal money brackets step at 50k, 150k and 400k", () => {
  const at = (illegalMoney: number) =>
    charges(computePenalCode(input({ illegalMoney })), "Lainnya");
  assert.deepEqual(at(1), ["Minor Possession of Illegal Money"]);
  assert.deepEqual(at(49999), ["Minor Possession of Illegal Money"]);
  assert.deepEqual(at(50000), ["Third Degree Possession of Illegal Money"]);
  assert.deepEqual(at(149999), ["Third Degree Possession of Illegal Money"]);
  assert.deepEqual(at(150000), ["Second Degree Possession of Illegal Money"]);
  assert.deepEqual(at(399999), ["Second Degree Possession of Illegal Money"]);
  assert.deepEqual(at(400000), ["First Degree Possession of Illegal Money (Court Verdict)"]);
  assert.deepEqual(at(0), []);
});

test("hacking device is a standalone charge", () => {
  assert.deepEqual(
    charges(computePenalCode(input({ hackingDevice: true })), "Lainnya"),
    ["Possession of Unauthorized Device (Hacking Device)"],
  );
});

test("categories keep their declaration order and never duplicate a charge", () => {
  const groups = computePenalCode(
    input({ robberyType: "bank", property: "vandalism", gsr: true }),
  );
  assert.deepEqual(
    groups.map((g) => g.group),
    ["Robbery", "Properti", "Senjata Api"],
  );
});

test("formatted output groups charges under a heading", () => {
  const groups = computePenalCode(input({ nosUsage: true, hackingDevice: true }));
  assert.equal(
    formatPenalCode(groups),
    "Traffic:\n- Use of Nitrous Oxide — mengaktifkan atau menggunakan sistem injeksi Nitrous Oxide (NOS) pada kendaraan secara ilegal saat kendaraan beroperasi/dikemudikan." +
      "\n\nLainnya:\n- Possession of Unauthorized Device (Hacking Device) — membawa lockpick atau kartu seperti green card.",
  );
});

test("drug selling is a standalone narcotics charge", () => {
  assert.deepEqual(
    charges(computePenalCode(input({ drugSelling: true })), "Narcotics"),
    ["Drugs Selling"],
  );
  assert.deepEqual(charges(computePenalCode(input()), "Narcotics"), []);
});

test("drug selling stacks with the weight-based narcotics charges", () => {
  const narc = charges(
    computePenalCode(input({ drugSelling: true, sched1: 5000 })),
    "Narcotics",
  );
  assert.ok(narc.includes("Drugs Selling"));
  assert.ok(narc.includes("Drug Trafficking (Court Verdict)"));
});

test("resisting arrest is a standalone Lainnya charge", () => {
  assert.deepEqual(
    charges(computePenalCode(input({ resistingArrest: true })), "Lainnya"),
    ["Resisting Arrest"],
  );
  assert.deepEqual(charges(computePenalCode(input()), "Lainnya"), []);
});

test("resisting arrest stacks with the other Lainnya charges", () => {
  const lain = charges(
    computePenalCode(input({ resistingArrest: true, hackingDevice: true, illegalMoney: 1 })),
    "Lainnya",
  );
  assert.ok(lain.includes("Resisting Arrest"));
  assert.ok(lain.includes("Possession of Unauthorized Device (Hacking Device)"));
  assert.ok(lain.includes("Minor Possession of Illegal Money"));
});

/* ---------- Charge descriptions ---------- */

test("describeCharge folds class variants onto the reference entry", () => {
  // The generator emits a class number; the reference writes the whole range.
  assert.equal(
    describeCharge("Criminal Possession of a Firearm [Class 2]"),
    describeCharge("Criminal Possession of a Firearm [Class 3]"),
  );
  assert.equal(
    describeCharge("Possession of Drug Paraphernalia (Class B)"),
    describeCharge("Possession of Drug Paraphernalia (Class A)"),
  );
});

test("charges with no reference explanation describe as undefined", () => {
  // Robbery and Kekerasan live in example blocks, not explanatory bullets.
  for (const name of [
    "Hostages (1-2 sandera)",
    "Aggravated Hostages (3-4 sandera)",
    "Possession of Stolen Goods",
    "Reckless Evading to Peace Officer / Reckless Driving",
    "Grand Larceny Public Bank (Fleeca Robbery)",
    "Gang Related Shooting (Gang War)",
    "Disturbing the Peace",
    "Assault with Deadly Weapon to Government Employee",
  ]) {
    assert.equal(describeCharge(name), undefined, `${name} should have no description`);
  }
});

test("the description map is drawn from the Penal Code reference in data.ts", () => {
  // Every bullet in the penal-* sections is "Charge Name — explanation".
  const reference = new Map<string, string>();
  for (const section of POCKETBOOK.sections) {
    if (!section.id.startsWith("penal-") || section.id === "penal-generator") continue;
    for (const block of section.blocks) {
      if (block.type !== "bullets") continue;
      for (const item of block.items) {
        const at = item.indexOf(" — ");
        if (at > 0) reference.set(item.slice(0, at), item.slice(at + 3));
      }
    }
  }

  assert.ok(reference.size > 0, "expected the penal sections to carry explanations");
  assert.equal(reference.get("Drugs Selling"), CHARGE_DESCRIPTIONS["Drugs Selling"]);

  // Every description we show must still be findable on a reference page, so a
  // charge cannot explain itself with wording the department never published.
  for (const [name, description] of Object.entries(CHARGE_DESCRIPTIONS)) {
    const bullet = [...reference.entries()].find(
      ([refName]) => normalizeChargeName(refName) === name,
    );
    assert.ok(bullet, `no reference bullet matches the description key "${name}"`);
    assert.equal(
      bullet[1],
      description,
      `the description for "${name}" has drifted from its reference bullet`,
    );
  }
});
