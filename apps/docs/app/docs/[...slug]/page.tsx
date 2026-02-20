import { compileMDX } from "next-mdx-remote/rsc";
import { components } from "@/components/mdx-components";
import { DocsPager } from "@/components/docs-pager";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";

export default async function Page(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;
  const slug = params.slug.join("/");

  const contentDir = path.join(process.cwd(), "content");

  const routeMap: Record<string, string> = {
    // Getting Started
    "getting-started": "GettingStarted.mdx",
    install: "Install.mdx",
    "running-agent": "RunningAgent.mdx",

    // Architecture
    architecture: "Architecture.mdx",
    "architecture/overview": "ArchitectureOverview.mdx",
    "architecture/data-flow": "DataFlow.mdx",
    "architecture/ai-engine": "AIEngine.mdx",

    // References
    "reference/config": "ConfigReference.mdx",
    "reference/state": "StateSchema.mdx",

    // Monitoring
    webhooks: "Webhooks.mdx",
    "features/timeline": "IncidentTimeline.mdx",
    opentelemetry: "OpenTelemetry.mdx",

    // Dashboard Features
    "features/chat": "AIChat.mdx",
    "features/voice": "VoiceControl.mdx",

    // Integrations
    "integrations/foxit": "FoxitReports.mdx",
    "integrations/kilo": "KiloIntegration.mdx",
    "integrations/cline": "ClinePipeline.mdx",
    "integrations/miro": "MiroIntegration.mdx",
    "github-bot": "GitHubBot.mdx",

    // Tutorials
    "tutorials/node": "TutorialNode.mdx",
    "tutorials/next": "TutorialNext.mdx",

    // Operations
    troubleshooting: "Troubleshooting.mdx",
  };

  const filename = routeMap[slug];

  if (!filename) {
    notFound();
  }

  const filePath = path.join(contentDir, filename);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const source = fs.readFileSync(filePath, "utf8");

  const { content } = await compileMDX({
    source,
    options: { parseFrontmatter: true },
    components,
  });

  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      {content}
      <DocsPager />
    </article>
  );
}

export function generateStaticParams() {
  return [
    { slug: ["getting-started"] },
    { slug: ["install"] },
    { slug: ["running-agent"] },
    { slug: ["architecture"] },
    { slug: ["architecture", "overview"] },
    { slug: ["architecture", "data-flow"] },
    { slug: ["architecture", "ai-engine"] },
    { slug: ["reference", "config"] },
    { slug: ["reference", "state"] },
    { slug: ["webhooks"] },
    { slug: ["features", "timeline"] },
    { slug: ["features", "chat"] },
    { slug: ["features", "voice"] },
    { slug: ["opentelemetry"] },
    { slug: ["integrations", "foxit"] },
    { slug: ["integrations", "kilo"] },
    { slug: ["integrations", "cline"] },
    { slug: ["integrations", "miro"] },
    { slug: ["github-bot"] },
    { slug: ["tutorials", "node"] },
    { slug: ["tutorials", "next"] },
    { slug: ["troubleshooting"] },
  ];
}
