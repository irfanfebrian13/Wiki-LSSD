/** Content model for the LSSD Deputy Pocketbook. */

/** A titled body of prose — note, example, and quote share this shape. */
interface TitledText {
  title: string;
  text: string;
}

export type Block =
  | { type: "intro"; text: string }
  | ({ type: "note" } & TitledText)
  | ({ type: "example" } & TitledText)
  | ({ type: "quote" } & TitledText)
  | { type: "callout"; text: string }
  | { type: "ranks"; items: string[] }
  | { type: "legend"; title: string; items: LegendItem[] }
  | { type: "tree"; items: TreeNode[] }
  | { type: "table"; title?: string; head: string[]; rows: string[][] }
  | { type: "deflist"; title?: string; items: DefItem[] }
  | { type: "steps"; title?: string; items: string[] }
  | { type: "bullets"; title?: string; items: string[] }
  | {
      type: "radiocall";
      title: string;
      phrase: string;
      phrase_id: string;
      note?: string;
    }
  | { type: "flow"; title?: string; tracks: FlowTrack[] }
  | { type: "weapons"; classes: WeaponClass[]; variant?: "illegal" }
  | { type: "penal"; title: string; main: string; charges: string[] }
  | { type: "patrol-form" }
  | { type: "penal-form" };

export interface LegendItem {
  color: string;
  label: string;
  desc: string;
}

export interface TreeNode {
  name: string;
  children: string[];
}

export interface DefItem {
  term: string;
  desc: string;
  color?: string;
}

export interface WeaponClass {
  name: string;
  items: string[];
}

/** One step in a quick-reference flow diagram. */
export interface FlowStep {
  label: string;
  /** Alternative outcomes branching off this step, rendered side by side. */
  branches?: FlowBranch[];
}

export interface FlowBranch {
  label: string;
  /** `ok` for a clean outcome, `danger` for the escalated one. */
  tone: "ok" | "danger";
}

/** One route through a flow — e.g. the traffic-stop route, or the pursuit one. */
export interface FlowTrack {
  title: string;
  steps: FlowStep[];
}

export interface Section {
  id: string;
  icon: string;
  title: string;
  group: string;
  blocks: Block[];
}

export interface Pocketbook {
  meta: { title: string; subtitle: string };
  sections: Section[];
}

/** A section's nav entry, grouped for the sidebar. */
export interface NavGroup {
  name: string;
  items: Section[];
}
