import type { Block, Section } from "@/lib/types";

import {
  Bullets,
  Callout,
  DefList,
  Intro,
  Legend,
  Penal,
  Quote,
  Table,
  TitledCard,
  Tree,
  Weapons,
} from "./blocks";
import { FlowDiagram } from "./FlowDiagram";
import { Ladder } from "./Ladder";
import { PatrolReportForm } from "./PatrolReportForm";
import { PenalCodeGenerator } from "./PenalCodeGenerator";
import { Procedures } from "./Procedures";
import { TenCodes } from "./TenCodes";
import { Transmission } from "./Transmission";

/**
 * Renders one content block.
 *
 * All content is passed as JSX children rather than injected HTML, so the
 * section text is escaped by React. That matters: several entries contain raw
 * `<` and `>` (e.g. "membawa < 300 butir").
 *
 * `section` is threaded through because two presentation-only routes need
 * context from the parent: the Ten Codes table is recognised by the published
 * `ten-codes` section id, and the rank ladder reads its sibling legend block.
 */
export function BlockRenderer({
  block,
  section,
}: {
  block: Block;
  section?: Section;
}) {
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
      return (
        <Bullets
          title={block.title}
          items={block.items}
          penalRows={section?.group === "Penal Code"}
        />
      );

    case "steps":
      return <Procedures key={`${section?.id ?? "steps"}-${block.title ?? "untitled"}`} title={block.title} items={block.items} />;

    case "ranks": {
      const legend = section?.blocks.find((candidate) => candidate.type === "legend");
      return <Ladder ranks={block.items} legend={legend?.type === "legend" ? legend.items : []} />;
    }

    case "legend":
      return <Legend title={block.title} items={block.items} />;

    case "tree":
      return <Tree items={block.items} />;

    case "table":
      if (section?.id === "ten-codes") return <TenCodes rows={block.rows} />;
      return <Table title={block.title} head={block.head} rows={block.rows} />;

    case "deflist":
      return <DefList title={block.title} items={block.items} />;

    case "radiocall":
      return (
        <Transmission
          title={block.title}
          phrase={block.phrase}
          phrase_id={block.phrase_id}
          note={block.note}
        />
      );

    case "flow":
      return <FlowDiagram title={block.title} tracks={block.tracks} />;

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
