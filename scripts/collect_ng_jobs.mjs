import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, "job_research");

const sources = [
  {
    name: "SimplifyJobs/New-Grad-Positions",
    url: "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/README.md",
  },
  {
    name: "speedyapply/2026-SWE-College-Jobs NEW_GRAD_USA",
    url: "https://raw.githubusercontent.com/speedyapply/2026-SWE-College-Jobs/main/NEW_GRAD_USA.md",
  },
  {
    name: "vanshb03/New-Grad-2026",
    url: "https://raw.githubusercontent.com/vanshb03/New-Grad-2026/main/README.md",
  },
  {
    name: "jobright-ai/2026-Software-Engineer-New-Grad",
    url: "https://raw.githubusercontent.com/jobright-ai/2026-Software-Engineer-New-Grad/master/README.md",
  },
];

function stripMd(value = "") {
  return value
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLinks(value = "") {
  const links = [];
  for (const match of value.matchAll(/\[([^\]]+)]\(([^)]+)\)/g)) {
    links.push({ label: stripMd(match[1]), url: match[2] });
  }
  for (const match of value.matchAll(/href="([^"]+)"/g)) {
    links.push({ label: "", url: match[1] });
  }
  return links;
}

function splitRow(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
  const cells = [];
  let cell = "";
  let depth = 0;
  for (let i = 1; i < trimmed.length - 1; i += 1) {
    const ch = trimmed[i];
    if (ch === "(") depth += 1;
    if (ch === ")" && depth > 0) depth -= 1;
    if (ch === "|" && depth === 0) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += ch;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function normalizeUrl(url = "", baseUrl = "") {
  const cleaned = url.replace(/^<|>$/g, "").trim();
  if (!cleaned) return "";
  if (cleaned.startsWith("http")) return cleaned;
  if (cleaned.startsWith("/")) {
    const gh = baseUrl.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\//);
    if (gh) return `https://github.com/${gh[1]}/${gh[2]}${cleaned}`;
  }
  return cleaned;
}

function inferColumns(headers) {
  const normalized = headers.map((h) => stripMd(h).toLowerCase());
  const find = (...names) => normalized.findIndex((h) => names.some((name) => h.includes(name)));
  return {
    company: find("company"),
    role: find("role", "position", "title"),
    location: find("location"),
    date: find("date", "posted"),
    season: find("season"),
    link: find("application", "apply", "link"),
  };
}

function parseMarkdownTable(markdown, source) {
  const lines = markdown.split(/\r?\n/);
  const jobs = [];
  let headers = null;
  let columns = null;

  for (const line of lines) {
    const cells = splitRow(line);
    if (!cells) {
      headers = null;
      columns = null;
      continue;
    }

    const isDivider = cells.every((cell) => /^:?-{2,}:?$/.test(cell.replace(/\s/g, "")));
    if (isDivider) continue;

    const maybeHeader = cells.some((cell) => /company|role|position|title|location|application|apply/i.test(cell));
    if (!headers && maybeHeader) {
      headers = cells;
      columns = inferColumns(headers);
      continue;
    }

    if (!headers || !columns) continue;
    const companyCell = cells[columns.company] ?? "";
    const roleCell = cells[columns.role] ?? "";
    if (!companyCell || !roleCell) continue;
    if (/company/i.test(companyCell) && /role|position|title/i.test(roleCell)) continue;

    const allLinks = cells.flatMap(extractLinks);
    const appCell = columns.link >= 0 ? cells[columns.link] : "";
    const appLinks = extractLinks(appCell);
    const chosenLink = appLinks.find((l) => /apply|app|job|greenhouse|lever|ashby|workday|icims|smartrecruiters|simplify/i.test(l.url + l.label)) ?? allLinks.at(-1);

    const role = stripMd(roleCell);
    const company = stripMd(companyCell).replace(/^↳\s*/, "");
    if (!role || !company || /closed|expired/i.test(role)) continue;

    jobs.push({
      company,
      role,
      location: stripMd(cells[columns.location] ?? ""),
      season: stripMd(cells[columns.season] ?? ""),
      date: stripMd(cells[columns.date] ?? ""),
      applicationUrl: normalizeUrl(chosenLink?.url ?? "", source.url),
      source: source.name,
      sourceUrl: source.url,
      notes: "",
    });
  }

  return jobs;
}

function parseHtmlTables(markdown, source) {
  const jobs = [];
  let lastCompany = "";
  for (const rowMatch of markdown.matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
    const cells = [...rowMatch[1].matchAll(/<td>([\s\S]*?)<\/td>/g)].map((match) => match[1].trim());
    if (cells.length < 4) continue;

    let company = stripMd(cells[0]).replace(/^🔥\s*/, "");
    if (company === "↳") company = lastCompany;
    if (company) lastCompany = company;

    const role = stripMd(cells[1]);
    const location = stripMd(cells[2]);
    const applyCell = cells[3] ?? "";
    const date = stripMd(cells[4] ?? "");
    if (!company || !role || /company/i.test(company) || /role/i.test(role)) continue;
    if (/🔒|closed|expired/i.test(stripMd(applyCell))) continue;

    const links = extractLinks(applyCell);
    const directApply = links.find((link) => !/simplify\.jobs\/p\//i.test(link.url)) ?? links[0];
    jobs.push({
      company,
      role,
      location,
      season: "",
      date,
      applicationUrl: normalizeUrl(directApply?.url ?? "", source.url),
      source: source.name,
      sourceUrl: source.url,
      notes: "",
    });
  }
  return jobs;
}

function roleScore(job) {
  const text = `${job.company} ${job.role} ${job.location} ${job.season} ${job.notes}`.toLowerCase();
  let score = 0;
  if (/new grad|new graduate|university grad|university graduate|entry.?level|early career|college grad|recent grad/.test(text)) score += 4;
  if (/2026|winter|january|december|fall|spring|summer/.test(text)) score += 2;
  if (/software|swe|engineer|backend|full.?stack|frontend|ai|ml|machine learning|data|infra|platform|agent/.test(text)) score += 2;
  if (/intern|internship|co-?op/.test(text)) score -= 2;
  if (/us citizen|u\.s\. citizen|clearance|secret|top secret|ts\/sci|u\.s\. person|green card/.test(text)) score -= 8;
  if (/closed|expired|unavailable/.test(text)) score -= 5;
  if (job.applicationUrl) score += 1;
  if (/remote|san francisco|sf|san jose|sunnyvale|mountain view|palo alto|california|ca|new york|nyc|seattle|austin|boston/.test(text)) score += 1;
  if (/canada|toronto|vancouver|ontario|uk|london|india|singapore/.test(text)) score -= 2;
  return score;
}

function riskFlags(job) {
  const text = `${job.company} ${job.role} ${job.location}`.toLowerCase();
  const flags = [];
  if (/us citizen|u\.s\. citizen|u\.s\. person|green card|permanent resident/.test(text)) flags.push("hard-auth-review");
  if (/clearance|secret|top secret|ts\/sci|dod|national security/.test(text)) flags.push("clearance-risk");
  if (/boeing|rtx|raytheon|general dynamics|gdit|kbr|caci|leidos|peraton|lockheed|northrop|l3harris|anduril|palantir|blue origin|space force|dod/.test(text)) flags.push("defense-export-review");
  if (/canada|toronto|vancouver|ontario|uk|london|india|singapore/.test(text)) flags.push("non-us-location");
  if (/phd|ph\.d|master|masters|ms\/phd|m\.s\./.test(text)) flags.push("advanced-degree-review");
  if (/intern|internship|co-?op/.test(text) && !/new grad|new graduate|early career|entry.?level/.test(text)) flags.push("not-new-grad-check");
  return flags;
}

function fitTier(job) {
  const text = `${job.company} ${job.role} ${job.location}`.toLowerCase();
  const flags = riskFlags(job);
  if (flags.some((flag) => ["hard-auth-review", "clearance-risk"].includes(flag))) return "manual-hard-filter";
  if (/agent|ai|machine learning|ml|data scientist|applied ai|llm|platform|infra|backend|full.?stack|software engineer|swe/.test(text) && /2026|new grad|new graduate|early career|entry.?level|university graduate|graduate/.test(text)) return "high";
  if (/software|engineer|developer|data|backend|frontend|full.?stack|platform/.test(text)) return "medium";
  return "low";
}

function dedupe(jobs) {
  const seen = new Map();
  for (const job of jobs) {
    const key = `${job.company}|${job.role}|${job.location}`.toLowerCase().replace(/\W+/g, " ").trim();
    const existing = seen.get(key);
    if (!existing || roleScore(job) > roleScore(existing) || (!existing.applicationUrl && job.applicationUrl)) {
      seen.set(key, job);
    }
  }
  return [...seen.values()];
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsv(jobs) {
  const headers = ["priority", "fitTier", "riskFlags", "company", "role", "location", "season", "date", "applicationUrl", "source", "notes"];
  const rows = jobs.map((job, index) => [
    index + 1,
    fitTier(job),
    riskFlags(job).join(";"),
    job.company,
    job.role,
    job.location,
    job.season,
    job.date,
    job.applicationUrl,
    job.source,
    job.notes,
  ]);
  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

function toMarkdown(jobs) {
  const rows = jobs.map((job, index) => {
    const link = job.applicationUrl ? `[Apply](${job.applicationUrl})` : "";
    return `| ${index + 1} | ${fitTier(job)} | ${riskFlags(job).join("; ") || "-"} | ${job.company} | ${job.role} | ${job.location || "-"} | ${job.season || "-"} | ${job.date || "-"} | ${link} | ${job.source} |`;
  });
  return [
    "# 2026 Winter / New Grad Application Leads",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Strategy: F-1 OPT/STEM OPT now; no employer visa sponsorship expected. Still avoid roles that explicitly require U.S. citizenship, green card, clearance, or U.S. Person status.",
    "",
    "| # | Fit | Risk Flags | Company | Role | Location | Season | Date | Link | Source |",
    "|---:|---|---|---|---|---|---|---|---|---|",
    ...rows,
    "",
  ].join("\n");
}

const collected = [];
for (const source of sources) {
  const response = await fetch(source.url);
  if (!response.ok) {
    console.error(`Skipping ${source.name}: ${response.status}`);
    continue;
  }
  const markdown = await response.text();
  const jobs = [...parseMarkdownTable(markdown, source), ...parseHtmlTables(markdown, source)];
  console.error(`${source.name}: ${jobs.length} rows`);
  collected.push(...jobs);
}

const unique = dedupe(collected)
  .map((job) => ({ ...job, score: roleScore(job) }))
  .filter((job) => job.score > 0 && job.applicationUrl)
  .sort((a, b) => {
    const tierOrder = { high: 0, medium: 1, low: 2, "manual-hard-filter": 3 };
    const aTier = tierOrder[fitTier(a)] ?? 9;
    const bTier = tierOrder[fitTier(b)] ?? 9;
    const aRisk = riskFlags(a).length;
    const bRisk = riskFlags(b).length;
    return aTier - bTier || aRisk - bRisk || b.score - a.score || a.company.localeCompare(b.company) || a.role.localeCompare(b.role);
  })
  .map(({ score, ...job }) => job);

await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, "2026_winter_new_grad_leads.csv"), toCsv(unique));
await writeFile(join(outDir, "2026_winter_new_grad_leads.md"), toMarkdown(unique.slice(0, 1000)));

console.log(JSON.stringify({
  sourceCount: collected.length,
  uniqueCount: unique.length,
  csv: join(outDir, "2026_winter_new_grad_leads.csv"),
  markdown: join(outDir, "2026_winter_new_grad_leads.md"),
}, null, 2));
