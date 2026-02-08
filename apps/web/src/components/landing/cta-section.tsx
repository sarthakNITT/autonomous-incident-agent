"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="bg-background py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-muted/50 px-6 py-16 text-center sm:px-16"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to automate your incident response?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Join teams using AIA to detect, analyze, and resolve incidents
            automatically.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/sign-in">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/docs">View Documentation</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
