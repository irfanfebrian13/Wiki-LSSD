import { Shell } from "@/components/Shell";
import { PocketbookProvider } from "@/components/pocketbook-context";
import { POCKETBOOK } from "@/lib/data";

export default function Page() {
  return (
    <PocketbookProvider>
      <Shell sections={POCKETBOOK.sections} />
    </PocketbookProvider>
  );
}
