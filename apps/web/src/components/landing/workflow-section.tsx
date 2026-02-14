"use client";

import { motion } from "framer-motion";
import { AlertCircle, FileSearch, Wrench, GitPullRequest } from "lucide-react";

const steps = [
  {
    icon: AlertCircle,
    title: "Detect",
    description:
      "Monitors your application for incidents and anomalies in real-time",
  },
  {
    icon: FileSearch,
    title: "Autopsy",
    description:
      "Performs deep root cause analysis to identify the source of issues",
  },
  {
    icon: Wrench,
    title: "Patch",
    description:
      "Generates intelligent code patches to resolve the detected problems",
  },
  {
    icon: GitPullRequest,
    title: "PR",
    description:
      "Creates pull requests with fixes ready for your review and deployment",
  },
];

export function WorkflowSection() {
  return (
    <section className="bg-muted/30 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Four automated steps from detection to resolution
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-8 z-0 hidden h-0.5 w-full bg-border lg:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
