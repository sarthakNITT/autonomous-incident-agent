"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
          >
            Autonomous Incident{" "}
            <span className="text-primary">Detection & Resolution</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-muted-foreground"
          >
            AI-powered system that detects incidents, performs root cause
            analysis, generates patches, and creates pull requests
            automatically.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Button asChild size="lg">
              <Link href="/sign-in">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/docs">Learn More</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
