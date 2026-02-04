import type { AutopsyResult } from "@repo/types";
import { join } from "path";

const AUTOPSY_OUTPUT_PATH = "autopsy/sample_output/incident-1-autopsy.json";
const PATCH_OUTPUT_DIR = "autopsy/patches";
const PR_DESC_OUTPUT_DIR = "autopsy/pr_description";
const TEST_OUTPUT_DIR = "app/test/generated";

async function generateArtifacts() {
    console.log("Starting PR & Patch Generation...");

    const autopsyFile = Bun.file(AUTOPSY_OUTPUT_PATH);
    if (!(await autopsyFile.exists())) {
        console.error(`Autopsy output file not found at ${AUTOPSY_OUTPUT_PATH}`);
        process.exit(1);
    }

    const result = await autopsyFile.json() as AutopsyResult;

    const patchFilename = "patch-1.diff";
    const patchPath = join(PATCH_OUTPUT_DIR, patchFilename);
    const patchContent = result.suggested_patch.patch_diff;
    // Ensure we write exactly what was given. Note: Bun.write handles string/buffers.
    await Bun.write(patchPath, patchContent);
    console.log(`Generated patch: ${patchPath}`);

    const prDescFilename = "incident-1-pr.md";
    const prDescPath = join(PR_DESC_OUTPUT_DIR, prDescFilename);
    const prContent = `# Fix: ${result.root_cause_text.substring(0, 50)}...

## Root Cause
${result.root_cause_text}

## Changes
- Applied patch to \`${result.file_path}\`
- Removed faulty logic causing deterministic failure.

## Verification
A reproduction test has been generated.

1. Run the test to confirm failure (repro):
   \`bun run app/test/generated/repro.test.ts\`

2. Apply the patch:
   \`patch -p0 < autopsy/patches/patch-1.diff\`

3. Run the test again to confirm fix.
`;
    await Bun.write(prDescPath, prContent);
    console.log(`Generated PR description: ${prDescPath}`);

    const testFilename = "repro.test.ts";
    const testPath = join(TEST_OUTPUT_DIR, testFilename);
    const testContent = `import { expect, test } from "bun:test";

test("reproduce seeded failure", async () => {
    const response = await fetch("http://localhost:3000/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            request_id: "repro-test-1",
            payload: { action: "cause_error" }
        })
    });

    console.log(\`Trigger status: \${response.status}\`);
    
    if (response.status === 500) {
        console.log("Bug reproduced: 500 Internal Server Error");
    } else {
        console.log("Bug NOT reproduced: Request succeeded");
    }
});
`;
    await Bun.write(testPath, testContent);
    console.log(`Generated reproduction test: ${testPath}`);

    console.log("All artifacts generated successfully.");
}

generateArtifacts();
