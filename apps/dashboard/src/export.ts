import PDFDocument from "pdfkit";
import fs from "fs";
import { join } from "path";
import type { AutopsyResult } from "@repo/types";
import { loadConfig } from "../../../shared/config_loader";

const config = loadConfig();

interface ReportData {
  autopsy: AutopsyResult | null;
  patch: string;
  logs: string;
}

export async function generatePdfReport(
  incidentId: string,
  data: ReportData,
): Promise<string> {
  console.log(`Generating Incident PDF Report for ${incidentId}...`);

  const OUTPUT_DIR = config.paths.reports;
  const OUTPUT_FILE = join(OUTPUT_DIR, `${incidentId}.pdf`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(OUTPUT_FILE);

    doc.pipe(stream);

    doc.fontSize(24).text("Autonomous Incident Report", { align: "center" });
    doc
      .fontSize(12)
      .text(`Generated: ${new Date().toISOString()}`, { align: "center" });
    doc.fontSize(12).text(`Incident ID: ${incidentId}`, { align: "center" });
    doc.moveDown(2);

    if (data.autopsy) {
      doc.fontSize(16).text("Root Cause Analysis");
      doc.fontSize(12).text(`Diagnosis: ${data.autopsy.root_cause_text}`);
      doc.text(`Confidence: ${(data.autopsy.confidence * 100).toFixed(0)}%`);
      doc.text(`File: ${data.autopsy.file_path}:${data.autopsy.line_range}`);
      doc.moveDown();
    }

    if (data.patch) {
      doc.fontSize(16).text("Generated Patch");
      doc.fontSize(10).font("Courier").text(data.patch);
      doc.font("Helvetica").moveDown();
    }

    if (data.logs) {
      doc.addPage();
      doc.fontSize(16).text("Verification Logs");
      doc.fontSize(8).font("Courier").text(data.logs.slice(0, 4000));
    }

    doc.end();

    stream.on("finish", () => {
      console.log(`PDF Report generated at: ${OUTPUT_FILE}`);
      resolve(OUTPUT_FILE);
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
}
