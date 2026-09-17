import { Shell } from "@/components/Shell";
import { POCKETBOOK } from "@/lib/data";

/**
 * The pocketbook is a single scrolling page: every section stacked, with a
 * scroll-spy sidebar and search that filters across every section at once.
 *
 * This stays a Server Component — the content is rendered to HTML on the
 * server and only the interactive shell ships as a client bundle.
 */
export default function Page() {
  return <Shell sections={POCKETBOOK.sections} />;
}
