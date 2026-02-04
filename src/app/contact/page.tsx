import type { Metadata } from "next"
import { Mail, MessageSquare } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with TuneTapper. We'd love to hear your feedback, suggestions, or questions about our music production tools.",
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold lg:text-4xl">Contact Us</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Have feedback, suggestions, or questions? We&apos;d love to hear from
          you.
        </p>
      </div>

      {/* Contact Options */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--primary)] p-2 text-[var(--primary-foreground)]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Email</CardTitle>
                <CardDescription>
                  For general inquiries and support
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <a
              href="mailto:hello@tunetapper.com"
              className="text-lg font-medium hover:underline"
            >
              hello@tunetapper.com
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--primary)] p-2 text-[var(--primary-foreground)]">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Feedback</CardTitle>
                <CardDescription>
                  Help us improve TuneTapper
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--muted-foreground)]">
              We&apos;re always looking to improve. If you have suggestions for
              new tools, features, or improvements to existing ones, please let
              us know!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Common Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Is TuneTapper free to use?</h3>
            <p className="text-[var(--muted-foreground)] mt-1">
              Yes! All tools are completely free. We support the site through
              non-intrusive advertising.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Do I need to create an account?</h3>
            <p className="text-[var(--muted-foreground)] mt-1">
              No account needed. Just visit the site and start using the tools
              immediately.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Can I use TuneTapper on mobile?</h3>
            <p className="text-[var(--muted-foreground)] mt-1">
              Yes! All tools are designed to work great on phones, tablets, and
              desktop computers.
            </p>
          </div>
          <div>
            <h3 className="font-medium">How do I report a bug?</h3>
            <p className="text-[var(--muted-foreground)] mt-1">
              Please email us at hello@tunetapper.com with details about the
              issue, including what device and browser you&apos;re using.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
