import { NextResponse } from "next/server";
import { R2Client } from "@repo/storage";
import { loadConfig } from "../../../../../../../shared/config_loader";
import type { AutopsyResult } from "@repo/types";
import PDFDocument from "pdfkit";
import fs from "fs";
import { join } from "path";

const config = loadConfig();
const storage = new R2Client(config.storage);

interface ReportData {
  autopsy: AutopsyResult | null;
  patch: string;
  logs: string;
}

async function generatePdfReport(
  incidentId: string,
  data: ReportData,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

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
  });
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const incidentId = params.id;
    console.log(`Generating PDF for ${incidentId}...`);

    let autopsyJson = null;
    let patchDiff = "";
    let preLog = "";

    try {
      autopsyJson = await storage.downloadJSON(
        `incidents/${incidentId}/autopsy.json`,
      );
    } catch (e) {}
    try {
      patchDiff = await storage.downloadText(
        `incidents/${incidentId}/patch.diff`,
      );
    } catch (e) {}
    try {
      preLog = await storage.downloadText(
        `incidents/${incidentId}/logs/pre.txt`,
      );
    } catch (e) {}

    const pdfBuffer = await generatePdfReport(incidentId, {
      autopsy: autopsyJson as AutopsyResult,
      patch: patchDiff,
      logs: preLog,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="incident-${incidentId}.pdf"`,
      },
    });
  } catch (e) {
    console.error("Export failed", e);
    return new NextResponse("Export failed", { status: 500 });
  }
}
