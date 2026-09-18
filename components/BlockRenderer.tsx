import type { Block } from "@/lib/types";

import {
  Bullets,
  Callout,
  DefList,
  Flow,
  Intro,
  Legend,
  Penal,
  Quote,
  Ranks,
  Steps,
  Table,
  TitledCard,
  Tree,
  Weapons,
} from "./blocks";
import { PatrolReportForm } from "./PatrolReportForm";
import { PenalCodeGenerator } from "./PenalCodeGenerator";
import { RadioCall } from "./RadioCall";

/**
 * Renders one content block.
 *
 * All content is passed as JSX children rather than injected HTML, so the
 * section text is escaped by React. That matters: several entries contain raw
 * `<` and `>` (e.g. "membawa < 300 butir").
 */
export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "intro":
      return <Intro text={block.text} />;

    case "note":
      return <TitledCard title={block.title} text={block.text} tone="info" />;

    case "example":
      return <TitledCard title={block.title} text={block.text} tone="ok" />;

    case "callout":
      return <Callout text={block.text} />;

    case "quote":
      return <Quote title={block.title} text={block.text} />;

    case "bullets":
      return <Bullets title={block.title} items={block.items} />;

    case "steps":
      return <Steps title={block.title} items={block.items} />;

    case "ranks":
      return <Ranks items={block.items} />;

    case "legend":
      return <Legend title={block.title} items={block.items} />;

    case "tree":
      return <Tree items={block.items} />;

    case "table":
      return <Table title={block.title} head={block.head} rows={block.rows} />;

    case "deflist":
      return <DefList title={block.title} items={block.items} />;

    case "radiocall":
      return (
        <RadioCall
          title={block.title}
          phrase={block.phrase}
          phrase_id={block.phrase_id}
          note={block.note}
        />
      );

    case "flow":
      return <Flow title={block.title} tracks={block.tracks} />;

    case "weapons":
      return <Weapons classes={block.classes} variant={block.variant} />;

    case "penal":
      return <Penal title={block.title} main={block.main} charges={block.charges} />;

    case "patrol-form":
      return <PatrolReportForm />;

    case "penal-form":
      return <PenalCodeGenerator />;
  }
}
