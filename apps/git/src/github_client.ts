import type { GitHubConfig, PullRequestResult } from "@repo/types";

export class GitHubClient {
    private baseUrl = "https://api.github.com";

    constructor(private config: GitHubConfig) { }

    async createPullRequest(title: string, body: string, head: string, base: string): Promise<PullRequestResult> {
        if (this.config.provider === "mock") {
            console.log(`[GitHub Mock] creating PR: ${title} from ${head} into ${base}`);
            return {
                url: `https://github.com/${this.config.org}/${this.config.repo}/pull/${Math.floor(Math.random() * 1000)}`,
                number: Math.floor(Math.random() * 1000),
                branch: head,
                status: "created"
            };
        }

        const url = `${this.baseUrl}/repos/${this.config.org}/${this.config.repo}/pulls`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `token ${this.config.token}`,
                    "Accept": "application/vnd.github.v3+json",
                    "Content-Type": "application/json",
                    "User-Agent": "Autonomous-Incident-Agent"
                },
                body: JSON.stringify({ title, body, head, base })
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`GitHub API Error: ${response.status} ${err}`);
            }

            const data = await response.json() as any;
            return {
                url: data.html_url,
                number: data.number,
                branch: head,
                status: "created"
            };
        } catch (e) {
            console.error("Failed to create PR", e);
            throw e;
        }
    }
}
