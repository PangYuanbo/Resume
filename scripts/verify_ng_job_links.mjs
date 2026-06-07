import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const csvPath = join(root, "job_research", "2026_winter_new_grad_leads.csv");
const outPath = join(root, "job_research", "2026_winter_new_grad_leads_verified_all.csv");
const finalCsvPath = join(root, "job_research", "2026_winter_new_grad_final_1000.csv");
const finalMdPath = join(root, "job_research", "2026_winter_new_grad_final_1000.md");
const summaryPath = join(root, "job_research", "2026_winter_new_grad_verification_summary.json");

function parseLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

async function checkUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 job-link-verifier" },
    });
    if ([403, 405, 429].includes(response.status)) {
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 job-link-verifier" },
      });
    }
    return {
      httpStatus: response.status,
      finalUrl: response.url,
      reachable: response.status >= 200 && response.status < 500,
    };
  } catch (error) {
    return {
      httpStatus: "",
      finalUrl: "",
      reachable: false,
      error: error.name === "AbortError" ? "timeout" : error.message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

const csv = await readFile(csvPath, "utf8");
const lines = csv.trim().split("\n");
const headers = parseLine(lines[0]);
const rows = lines.slice(1).map((line) => {
  const values = parseLine(line);
  return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
});

const checked = await mapLimit(rows, 12, async (row, index) => {
  if ((index + 1) % 50 === 0) console.error(`verified ${index + 1}/${rows.length}`);
  const result = await checkUrl(row.applicationUrl);
  const liveStatus = [404, 410, 500].includes(result.httpStatus) || result.error ? "dead-or-error" : "usable-or-needs-browser";
  return { ...row, ...result, liveStatus };
});

const outHeaders = [...headers, "liveStatus", "reachable", "httpStatus", "finalUrl", "error"];
await writeFile(outPath, [outHeaders, ...checked.map((row) => outHeaders.map((header) => csvEscape(row[header])).join(","))].join("\n"));

const finalRows = checked
  .filter((row) => row.liveStatus === "usable-or-needs-browser")
  .slice(0, 1000)
  .map((row, index) => ({ ...row, priority: index + 1 }));

await writeFile(finalCsvPath, [outHeaders, ...finalRows.map((row) => outHeaders.map((header) => csvEscape(row[header])).join(","))].join("\n"));

const mdRows = finalRows.map((row) => `| ${row.priority} | ${row.fitTier} | ${row.riskFlags || "-"} | ${row.company} | ${row.role} | ${row.location || "-"} | ${row.date || "-"} | ${row.httpStatus} | [Apply](${row.applicationUrl}) | ${row.source} |`);
await writeFile(finalMdPath, [
  "# Final 1000 2026 Winter / New Grad Application Leads",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "Strategy: F-1 OPT/STEM OPT now; no employer visa sponsorship expected. Still manually check any defense/export/non-US location risk flags before applying.",
  "",
  "| # | Fit | Risk Flags | Company | Role | Location | Date | HTTP | Link | Source |",
  "|---:|---|---|---|---|---|---|---:|---|---|",
  ...mdRows,
  "",
].join("\n"));

const summary = checked.reduce((acc, row) => {
  acc.total += 1;
  acc.reachable += row.liveStatus === "usable-or-needs-browser" ? 1 : 0;
  acc.byStatus[row.httpStatus || row.error || "unknown"] = (acc.byStatus[row.httpStatus || row.error || "unknown"] ?? 0) + 1;
  return acc;
}, { total: 0, reachable: 0, finalRows: finalRows.length, byStatus: {} });

await writeFile(summaryPath, JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ outPath, finalCsvPath, finalMdPath, summaryPath, ...summary }, null, 2));
