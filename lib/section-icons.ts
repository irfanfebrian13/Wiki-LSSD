import {
  Ban,
  Banknote,
  BookA,
  Boxes,
  Building,
  Car,
  CarFront,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDollarSign,
  CircleDot,
  ClipboardCheck,
  ClipboardList,
  Crosshair,
  Gavel,
  Hash,
  HeartPulse,
  House,
  Layers,
  ListChecks,
  ListOrdered,
  Lock,
  LogOut,
  MapPin,
  MessagesSquare,
  MonitorSmartphone,
  Network,
  NotebookPen,
  OctagonAlert,
  Pill,
  Radio,
  RadioTower,
  Route,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  Siren,
  Swords,
  Syringe,
  Target,
  TrafficCone,
  TriangleAlert,
  Truck,
  UserRoundX,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * The sidebar's icon for every section, keyed by section id.
 *
 * Icons replace the emoji the content model stores on each section, so the nav
 * reads as one drawn set rather than a jumble of platform glyphs. They are all
 * rendered at a single size and stroke weight by `Sidebar`, which is what keeps
 * the column visually even — see `NAV_ICON_PROPS` there.
 *
 * This lives outside the component so `lib/section-icons.test.ts` can assert
 * that every section in the pocketbook has an entry, which is what makes the
 * "no emoji in the sidebar" guarantee hold as sections are added.
 */
export const SECTION_ICONS: Record<string, LucideIcon> = {
  /* Struktur — the department's shape. */
  "chain-of-command": Network,
  "divisi-biro": Building,
  callsign: Hash,

  /* Komunikasi — the shared language of the radio. */
  "ten-codes": ListOrdered,
  "response-code": CircleDot,
  "priority-threat": TriangleAlert,
  "radio-abbr": BookA,

  /* Radio — the call scripts, in the order a shift runs them. */
  "radio-basics": Radio,
  "radio-patrol": Car,
  "radio-traffic-stop": CarFront,
  "radio-pursuit": Siren,
  "radio-felony-stop": OctagonAlert,
  "radio-vehicle-search": Search,
  "radio-custody": Lock,
  "radio-narcotics": Pill,
  "radio-responding": ShieldAlert,
  "radio-on-scene": MapPin,
  "radio-breaking-off": LogOut,
  "radio-quick-flow": Route,

  /* Prosedur — what a deputy does, in order. */
  "prosedur-penangkapan": UserRoundX,
  "memproses-suspect": ClipboardCheck,
  "mdt-process": MonitorSmartphone,
  impound: Truck,
  "bls-miranda": HeartPulse,
  "peraturan-tidak-tertulis": NotebookPen,

  /* Senjata — authorised issue versus contraband. */
  "senjata-legal": Shield,
  "senjata-illegal": Ban,

  /* Penal Code — one icon per charge family. */
  "penal-robbery": Banknote,
  "penal-violence": Swords,
  "penal-property": House,
  "penal-firearms": Crosshair,
  "penal-ammo": Boxes,
  "penal-narcotics": Syringe,
  "penal-traffic": TrafficCone,
  "penal-money": CircleDollarSign,

  /* Form Helper — the two generators. */
  "patrol-report": ClipboardList,
  "penal-generator": Scale,
};

/**
 * Icon shown for a section with no entry above.
 *
 * A neutral dot rather than the section's emoji: the sidebar is emoji-free by
 * design, so a missing mapping must not silently reintroduce one. The coverage
 * test is what stops this from ever being reached in practice.
 */
export const FALLBACK_SECTION_ICON = Circle;

/** The icon for a section, falling back to a neutral dot. */
export function sectionIcon(id: string): LucideIcon {
  return SECTION_ICONS[id] ?? FALLBACK_SECTION_ICON;
}

/**
 * The icon marking each nav group, keyed by group name.
 *
 * Groups are the pocketbook's own taxonomy, so these follow the same idea as
 * the section icons: one drawn set, one size, one stroke weight. A group with
 * no entry falls back to the neutral dot, and the coverage test catches it.
 */
export const GROUP_ICONS: Record<string, LucideIcon> = {
  Struktur: Layers,
  Komunikasi: MessagesSquare,
  Radio: RadioTower,
  Prosedur: ListChecks,
  Senjata: Target,
  "Penal Code": Gavel,
  "Form Helper": Wrench,
};

/** The icon for a nav group, falling back to a neutral dot. */
export function groupIcon(name: string): LucideIcon {
  return GROUP_ICONS[name] ?? FALLBACK_SECTION_ICON;
}

/**
 * Disclosure markers for a collapsible group header: right when closed, down
 * when open. Replaces the `▸`/`▾` text glyphs the header used to draw.
 */
export const GROUP_CHEVRONS = {
  collapsed: ChevronRight,
  expanded: ChevronDown,
} as const;
