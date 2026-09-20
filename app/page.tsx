import { Shell } from "@/components/Shell";
import { POCKETBOOK } from "@/lib/data";

/**
 * The pocketbook is a single route: the cover, or one category's chapter page,
 * chosen by the URL hash. `Shell` owns that routing and wraps its content in the
 * callsign/language provider.
 *
 * This stays a Server Component — the content is rendered to HTML on the
 * server and only the interactive shell ships as a client bundle.
 */
export default function Page() {
  return <Shell sections={POCKETBOOK.sections} />;
}
