import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
        Autonomous Incident Agent
      </h1>
      <p className="text-xl text-muted-foreground mb-10 max-w-[600px]">
        Documentation for the AI-powered incident response agent that
        autonomously investigates and resolves production issues.
      </p>
      <div className="flex gap-4">
        <Link href="/docs/getting-started">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link
          href="https://github.com/sarthakNITT/autonomous-incident-agent"
          target="_blank"
        >
          <Button variant="outline" size="lg">
            GitHub
          </Button>
        </Link>
      </div>
    </div>
  );
}
