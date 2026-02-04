import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="relative max-w-4xl mx-auto text-center">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-linear-to-r from-chart-1/10 via-chart-2/10 to-chart-3/10 rounded-3xl blur-3xl" />

          <div className="relative bg-card/50 border border-border rounded-2xl p-12 md:p-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to deploy?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of developers earning with vixle. Get started
              in seconds with our free tier.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signin">
                  Start for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs">View Documentation</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
