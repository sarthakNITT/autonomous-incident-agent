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
    "getting-started": "GettingStarted.mdx",
    architecture: "Architecture.mdx",
    "architecture/overview": "ArchitectureOverview.mdx",
    "architecture/data-flow": "DataFlow.mdx",
    "architecture/ai-engine": "AIEngine.mdx",
    "architecture/r2-lifecycle": "R2Lifecycle.mdx",
    "architecture/git-integration": "GitIntegration.mdx",
    "architecture/repro-pipeline": "ReproPipeline.mdx",
    "tutorials/node": "TutorialNode.mdx",
    "tutorials/next": "TutorialNext.mdx",
    "tutorials/vercel": "TutorialVercel.mdx",
    "tutorials/netlify": "TutorialNetlify.mdx",
    "tutorials/debug": "DebugGuide.mdx",
    install: "Install.mdx",
    opentelemetry: "OpenTelemetry.mdx",
    "r2-setup": "R2Setup.mdx",
    "github-bot": "GitHubBot.mdx",
    "running-agent": "RunningAgent.mdx",
    troubleshooting: "Troubleshooting.mdx",
    "reference/config": "ConfigReference.mdx",
    "reference/events": "EventSchema.mdx",
    "reference/r2-layout": "R2Layout.mdx",
    "reference/state": "StateSchema.mdx",
    "reference/cli": "CLIReference.mdx",
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
    { slug: ["architecture", "overview"] },
  ];
}
