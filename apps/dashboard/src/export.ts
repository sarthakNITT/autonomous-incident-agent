import PDFDocument from "pdfkit";
import fs from "fs";
import { join } from "path";
import type { AutopsyResult } from "@repo/types";

// Setup paths (Assuming running from root)
const OUTPUT_DIR = "dashboard/reports";
const OUTPUT_FILE = join(OUTPUT_DIR, "incident-1.pdf");

const AUTOPSY_PATH = "autopsy/sample_output/incident-1-autopsy.json";
const PR_PATH = "autopsy/pr_description/incident-1-pr.md";
const PRE_LOG_PATH = "repro/logs/pre.txt";
const POST_LOG_PATH = "repro/logs/post.txt";

async function generatePDF() {
    console.log("Generating Incident PDF Report...");

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Read Data
    const autopsy = await Bun.file(AUTOPSY_PATH).json() as AutopsyResult;
    const prDesc = await Bun.file(PR_PATH).text();
    const preLogs = await Bun.file(PRE_LOG_PATH).text();
    const postLogs = await Bun.file(POST_LOG_PATH).text();

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(OUTPUT_FILE);

    doc.pipe(stream);

    // Header
    doc.fontSize(24).text("Autonomous Incident Report", { align: "center" });
    doc.fontSize(12).text(`Generated: ${new Date().toISOString()}`, { align: "center" });
    doc.moveDown(2);

    // Root Cause
    doc.fontSize(16).text("Root Cause Analysis");
    doc.fontSize(12).text(`Diagnosis: ${autopsy.root_cause_text}`);
    doc.text(`Confidence: ${(autopsy.confidence * 100).toFixed(0)}%`);
    doc.text(`File: ${autopsy.file_path}:${autopsy.line_range}`);
    doc.moveDown();

    // Patch
    doc.fontSize(16).text("Generated Patch");
    doc.fontSize(10).font("Courier").text(autopsy.suggested_patch.patch_diff);
    doc.font("Helvetica").moveDown();

    // PR Description
    doc.fontSize(16).text("Pull Request Details");
    doc.fontSize(12).text(prDesc);
    doc.moveDown();

    // Verification Logs
    doc.addPage();
    doc.fontSize(16).text("Verification Logs");

    doc.fontSize(14).text("Pre-Patch (Failure)", { underline: true });
    doc.fontSize(8).font("Courier").text(preLogs.slice(0, 2000)); // Truncate if too long
    doc.moveDown();

    doc.fontSize(14).font("Helvetica").text("Post-Patch (Success)", { underline: true });
    doc.fontSize(8).font("Courier").text(postLogs.slice(0, 2000));

    doc.end();

    console.log(`PDF Report generated at: ${OUTPUT_FILE}`);
}

generatePDF();
