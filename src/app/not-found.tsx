import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-4 text-lg text-[var(--muted-foreground)]">
        That page does not exist or has moved. All the tools are still one click away.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button asChild size="lg">
          <Link href="/tools">See all tools</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">Go to the home page</Link>
        </Button>
      </div>
    </div>
  )
}
