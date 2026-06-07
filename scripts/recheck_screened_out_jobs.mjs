import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const allPath = join(root, "job_research", "2026_winter_new_grad_leads_verified_all.csv");
const finalPath = join(root, "job_research", "2026_winter_new_grad_final_1000.csv");
const recheckCsvPath = join(root, "job_research", "2026_winter_new_grad_screened_out_recheck.csv");
const rejectedCsvPath = join(root, "job_research", "2026_winter_new_grad_confirmed_not_apply.csv");
const noCapCsvPath = join(root, "job_research", "2026_winter_new_grad_no_cap_rechecked.csv");
const summaryPath = join(root, "job_research", "2026_winter_new_grad_screened_out_recheck_summary.json");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (ch === '"' && next === '"') {
        cur += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(cur);
      cur = "";
    } else if (ch === "\n") {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else if (ch !== "\r") {
      cur += ch;
    }
  }
  if (cur || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || r[0]);
}

function loadCsv(path) {
  return readFile(path, "utf8").then((text) => {
    const rows = parseCsv(text);
    const headers = rows[0];
    return rows.slice(1).map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""])));
  });
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsv(rows, headers) {
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(",")),
  ].join("\n");
}

function normalizeUrl(url) {
  if (!url) return "";
  const workableMatch = url.match(/^https:\/\.workable\.com\/([^/?#]+)\/j\/([^/?#]+)\/?/i);
  if (workableMatch) return `https://apply.workable.com/${workableMatch[1]}/j/${workableMatch[2]}/`;
  const kbrWorkdayMatch = url.match(/^https:\/\/bs\.com\/KBR_Careers\/job\/([^?#]+)/i);
  if (kbrWorkdayMatch) return `https://kbr.wd5.myworkdayjobs.com/KBR_Careers/job/${kbrWorkdayMatch[1]}`;
  if (/^https?:\/\//i.test(url)) return url;
  if (/^https:\//i.test(url)) return url.replace(/^https:\/*/i, "https://");
  if (/^http:\//i.test(url)) return url.replace(/^http:\/*/i, "http://");
  return url;
}

function classifyBody(body, status) {
  const text = body.toLowerCase().replace(/\s+/g, " ");
  const closedPatterns = [
    /job (is )?(no longer available|closed|expired|not found)/,
    /position (is )?(no longer available|closed|filled|expired)/,
    /posting (is )?(no longer available|closed|expired)/,
    /no longer accepting applications/,
    /we are no longer accepting applications/,
    /this job has been closed/,
    /this job is no longer accepting applications/,
    /the job you are looking for is no longer open/,
    /page not found/,
    /404/,
    /410 gone/,
  ];
  const applyPatterns = [
    /apply now/,
    /submit application/,
    /start application/,
    /apply for this job/,
    /apply to this job/,
    /join our talent community/,
    /greenhouse\.io/,
    /lever\.co/,
    /ashbyhq/,
    /workdayjobs/,
    /icims/,
  ];
  if ([404, 410].includes(status)) return { verdict: "confirmed_closed_or_dead", reason: `HTTP ${status}` };
  if (closedPatterns.some((pattern) => pattern.test(text))) return { verdict: "confirmed_closed_or_dead", reason: "Page content says closed/not found/no longer accepting" };
  if ([401, 403, 406, 429, 500, 502, 503].includes(status)) return { verdict: "needs_browser_check", reason: `curl reached blocker/error HTTP ${status}` };
  if (status >= 200 && status < 400 && applyPatterns.some((pattern) => pattern.test(text))) return { verdict: "recovered_can_apply", reason: "curl page is live and shows apply signal" };
  if (status >= 200 && status < 400) return { verdict: "live_unclear_manual_check", reason: "curl page is live but apply/closed signal is unclear" };
  return { verdict: "needs_browser_check", reason: `Unhandled HTTP ${status || "unknown"}` };
}

async function curlCheck(url) {
  const normalized = normalizeUrl(url);
  if (!/^https?:\/\//i.test(normalized)) {
    return { checkedUrl: normalized, curlStatus: "", curlFinalUrl: "", verdict: "invalid_url", reason: "Malformed URL", checkedBy: "curl" };
  }
  try {
    const { stdout } = await execFileAsync("curl", [
      "-L",
      "--compressed",
      "--max-time", "25",
      "--connect-timeout", "8",
      "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
      "-H", "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "-H", "Accept-Language: en-US,en;q=0.9",
      "-w", "\n__CURL_META__%{http_code} %{url_effective}",
      normalized,
    ], { maxBuffer: 2_500_000 });
    const marker = "\n__CURL_META__";
    const markerIndex = stdout.lastIndexOf(marker);
    const body = markerIndex >= 0 ? stdout.slice(0, markerIndex) : stdout;
    const meta = markerIndex >= 0 ? stdout.slice(markerIndex + marker.length).trim() : "";
    const firstSpace = meta.indexOf(" ");
    const status = Number(firstSpace >= 0 ? meta.slice(0, firstSpace) : meta);
    const finalUrl = firstSpace >= 0 ? meta.slice(firstSpace + 1) : normalized;
    const classified = classifyBody(body, status);
    return {
      checkedUrl: normalized,
      curlStatus: Number.isFinite(status) ? String(status) : "",
      curlFinalUrl: finalUrl,
      ...classified,
      checkedBy: "curl",
    };
  } catch (error) {
    return {
      checkedUrl: normalized,
      curlStatus: "",
      curlFinalUrl: "",
      verdict: "needs_browser_check",
      reason: `curl error: ${String(error.message ?? error).slice(0, 160)}`,
      checkedBy: "curl",
    };
  }
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      out[index] = await fn(items[index], index);
      if ((index + 1) % 50 === 0) console.error(`checked ${index + 1}/${items.length}`);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return out;
}

const all = await loadCsv(allPath);
const final = await loadCsv(finalPath);
const finalKeys = new Set(final.map((row) => `${row.company}|${row.role}|${row.applicationUrl}`));
const screenedOut = all.filter((row) => !finalKeys.has(`${row.company}|${row.role}|${row.applicationUrl}`));

const checks = await mapLimit(screenedOut, 10, async (row) => {
  const check = await curlCheck(row.applicationUrl);
  return { ...row, ...check };
});

const recheckHeaders = [
  "verdict", "reason", "checkedBy", "curlStatus", "company", "role", "location", "fitTier", "riskFlags",
  "applicationUrl", "curlFinalUrl", "source", "httpStatus", "liveStatus", "error",
];
await writeFile(recheckCsvPath, toCsv(checks, recheckHeaders));

const rejected = checks.filter((row) => ["confirmed_closed_or_dead", "invalid_url"].includes(row.verdict));
await writeFile(rejectedCsvPath, toCsv(rejected, recheckHeaders));

const recovered = checks.filter((row) => ["recovered_can_apply", "live_unclear_manual_check"].includes(row.verdict));
const noCap = [...final, ...recovered]
  .sort((a, b) => Number(a.priority || 999999) - Number(b.priority || 999999))
  .map((row, index) => ({ ...row, noCapRank: index + 1, recheckVerdict: row.verdict || "already_in_final_1000", recheckReason: row.reason || "" }));
const noCapHeaders = ["noCapRank", "recheckVerdict", "recheckReason", "priority", "fitTier", "riskFlags", "company", "role", "location", "season", "date", "applicationUrl", "source", "liveStatus", "reachable", "httpStatus", "finalUrl", "error"];
await writeFile(noCapCsvPath, toCsv(noCap, noCapHeaders));

const summary = {
  generatedAt: new Date().toISOString(),
  allVerifiedRows: all.length,
  previousFinalRows: final.length,
  screenedOutRows: screenedOut.length,
  recoveredRows: recovered.length,
  noCapRows: noCap.length,
  confirmedNotApplyRows: rejected.length,
  verdicts: checks.reduce((acc, row) => {
    acc[row.verdict] = (acc[row.verdict] ?? 0) + 1;
    return acc;
  }, {}),
  curlStatuses: checks.reduce((acc, row) => {
    acc[row.curlStatus || ""] = (acc[row.curlStatus || ""] ?? 0) + 1;
    return acc;
  }, {}),
};
await writeFile(summaryPath, JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ recheckCsvPath, rejectedCsvPath, noCapCsvPath, summaryPath, ...summary }, null, 2));
