import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const inputPath = join(root, "job_research", "2026_winter_new_grad_final_1000.csv");
const outCsvPath = join(root, "job_research", "2026_winter_new_grad_final_1000_enriched.csv");
const outMdPath = join(root, "job_research", "2026_winter_new_grad_final_1000_enriched.md");
const summaryPath = join(root, "job_research", "2026_winter_new_grad_enrichment_summary.json");

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

const largeCompanies = new Set([
  "adobe", "airbnb", "amazon", "amazon lab126", "amazon web services (aws)", "amd", "american express",
  "apple", "asana", "atlassian", "autodesk", "blackrock", "bytedance", "capital one", "ciena", "cisco",
  "citi", "comcast", "docusign", "doordash", "duolingo", "figma", "fiserv", "general motors",
  "google", "hashicorp", "hewlett packard enterprise", "ibm", "intel", "intuit", "jpmorganchase",
  "linkedin", "lyft", "meta", "micron technology", "mongodb", "netflix", "nextdoor",
  "nutanix", "nvidia", "paypal", "pinterest", "qualcomm", "qualtrics", "roblox", "salesforce",
  "samsara", "servicenow", "shopify", "slack", "snowflake", "sofi", "sony interactive entertainment",
  "spotify", "tiktok", "twitch", "uber", "unity", "visa", "waymo",
]);

const lateStagePrivate = new Set([
  "databricks", "glean", "notion", "replit", "stripe", "whoop", "x.ai", "xai", "zip",
]);

const financeTrading = new Set([
  "aquatic capital management", "belvedere trading", "balyasny asset management", "blackstone",
  "chicago trading company", "citadel securities", "drw", "dv trading llc", "edgehog trading",
  "geneva trading", "hudson river trading", "imc", "imc trading", "jane street", "jump trading",
  "old mission", "old mission capital", "optiver", "point72", "renaissance technologies",
  "sig", "susquehanna international group (sig)", "transmarket group", "trexquant", "valkyrie trading",
  "volean", "voleon",
]);

const defenseGov = [
  "accenture federal", "acclaim technical", "agile defense", "amentum", "bae systems", "ball aerospace",
  "blue origin", "boeing", "booZ allen", "booz allen", "caci", "captivation", "collins aerospace",
  "curtiss-wright", "draper", "gdit", "general dynamics", "honeywell aerospace", "idt", "innovative defense",
  "jacobs", "kbr", "kratos", "leidos", "lmi", "lockheed", "mantech", "northrop", "palantir", "parsons",
  "peraton", "radiance", "raytheon", "rtx", "saic", "scitec", "sev1tech", "smx",
  "technology service corporation", "textron", "tria federal", "true anomaly", "vistas", "viasat", "visionist",
  "wyetech", "york space",
].map((s) => s.toLowerCase());

const knownStartups = new Set([
  "10beauty", "8vc", "agave (w22)", "agentmail", "amperesand", "anaplan", "anima", "anyscale",
  "apex fintech solutions", "appian", "applovin", "aptEn".toLowerCase(), "assort health", "aurora", "aurora innovation",
  "automat", "benchify", "bending spoons", "bits to atoms", "brain co.", "brain corp", "brm", "caddy",
  "candid health", "cape", "cerebras systems", "channel3", "citizen health", "climateai", "clipboard health",
  "coalition", "collective hub, inc", "commure", "compa", "continue", "corgi", "credit genie", "cvector energy",
  "cylake", "d3", "d3 global inc", "da vinci", "dat freight & analytics", "decagon", "deepgrove", "doppel",
  "dscribe ai", "dune", "dv01", "ecopia ai", "elevenlabs", "eliseai", "ellipsis labs", "eluvio", "eventual",
  "flexai", "forma.ai", "furtherai", "gecko robotics", "giga ai", "gigaml", "glide", "greenboard (w24)",
  "harvey", "heartflow", "hume ai", "hypha", "icon", "inquery", "interaction", "invisible technologies",
  "ivo", "julius", "julius ai", "lambda", "lance (yc w26)", "latitude", "lightfield", "lightspark",
  "lila sciences", "liquid", "liva ai", "loombotic", "luma", "lumafield", "maitai", "mandolin", "mark43",
  "mesh optical technologies", "mirage", "n1", "neuralink", "newton research", "nexhealth", "noctua technology",
  "northwood space", "northslope technologies", "orb", "owner", "parafin", "parallel web systems", "perplexity",
  "phonely", "planbase", "poka labs", "porter", "proception inc", "profound", "pylon", "qode.world", "quadric",
  "quince", "realm", "relay", "remitly", "remodel health", "ranger", "redfin", "runpod", "scale", "scout ai",
  "secureframe", "sentilink", "sentry", "sierra", "sigma computing", "silver", "sixtyfour (x25)", "sonia",
  "starsling (x25)", "stamp", "stamp (w25)", "state affairs", "stepful", "strac", "suno", "taro",
  "thera", "third eye health", "trellis ai", "truebuilt", "uare.ai", "unlimited", "valon", "vultron",
  "wanderlog", "wanderlog (w19)", "warp", "wonderschool", "worldscape", "yotta labs", "you.com", "youlearn",
  "zettabyte",
]);

const midMarket = new Set([
  "aerotek", "aig", "affirm", "aflac", "ahead", "albertsons", "alteryx", "altice usa", "applied systems",
  "arm", "assetmark", "axon", "axos bank", "baker tilly", "bank of montreal", "bentley", "berkshire hathaway energy",
  "blackhawk network", "bosch", "boston scientific", "cadence", "cadence design systems", "canonical", "capgemini",
  "carollo engineers", "cdk global", "chewy", "choice hotels", "cirrus logic", "clearwater analytics", "cox",
  "cox automotive inc.", "cvs health", "d2l", "deloitte", "dexcom", "disney", "epsilon", "ericsson", "esri",
  "fidelity investments", "finra", "ford", "fortinet", "fox corporation", "franklin templeton", "garmin",
  "ge appliances", "ge healthcare", "globalfoundries", "gm financial", "gpc", "h&r block", "handshake",
  "hcltech", "honeywell", "ixl learning", "kla", "known", "konrad group", "kyndryl", "laserfiche",
  "letsgetchecked", "liberty mutual insurance", "life fitness", "london stock exchange group (lseg)", "m&t bank",
  "magna", "manulife", "marsh mclennan", "marvell", "marvell technology", "massmutual ascend life insurance",
  "mcdonald's", "medtronic", "metlife", "microchip", "microchip technology", "morgan stanley", "motorola",
  "mthree", "mutual of omaha", "navan", "nexon america", "nice", "nokia", "nordstrom", "oclc", "odoo",
  "omnicell", "omnissa", "opensesame", "optum", "oscar health", "pega", "philips", "playstation", "pnc",
  "protolabs", "ptc", "pure storage", "quinstreet", "rambus", "realtor.com", "revionics", "rocket companies",
  "rokt", "royal caribbean group", "scopely", "seatGeek".toLowerCase(), "sel", "signify", "sixth street",
  "smith+nephew", "softheon", "sony interactive entertainment", "spectrum", "squaretrade", "ss&c technologies",
  "starkey hearing", "stewart", "stubhub", "supermicro", "swift", "symbotic", "td bank", "teamworks",
  "tektronix", "tenstorrent", "tesla", "testlio", "thomson reuters", "torc robotics", "travelers",
  "trimble inc.", "trulioo", "u.s. bank", "unum", "ups", "warner bros. discovery", "western governors university",
  "wolters kluwer", "zebra technologies", "zoll medical corporation",
]);

function normalizeCompany(company) {
  return company.toLowerCase().replace(/^["']|["']$/g, "").replace(/\s+/g, " ").trim();
}

function classifyCompany(row) {
  const company = normalizeCompany(row.company);
  const text = `${company} ${row.role} ${row.location} ${row.riskFlags}`.toLowerCase();
  const source = row.source || "";
  const defenseCompanySignal = defenseGov.some((name) => company.includes(name));
  const defenseRoleSignal = /clearance|secret|top secret|ts\/sci|dod|national security|defense contractor|aerospace|space systems/.test(text);
  if (defenseCompanySignal || defenseRoleSignal) {
    return {
      companyType: "政府/国防 contractor",
      companyTypeConfidence: "medium",
      companyTypeEvidence: "Name/role/source has defense, government, aerospace, or clearance-adjacent signal",
    };
  }
  if (largeCompanies.has(company)) {
    return { companyType: "大厂 / large public or mega-scale company", companyTypeConfidence: "high", companyTypeEvidence: "Known large public, mega-scale, or major-platform employer" };
  }
  if (lateStagePrivate.has(company)) {
    return { companyType: "独角兽 / late-stage private tech company", companyTypeConfidence: "high", companyTypeEvidence: "Known late-stage private technology company" };
  }
  if (financeTrading.has(company)) {
    return { companyType: "量化 / trading firm", companyTypeConfidence: "high", companyTypeEvidence: "Known quant/trading/finance employer" };
  }
  if (knownStartups.has(company) || /\((w|s|x)\d{2}\)/i.test(row.company) || /ashbyhq|lever\.co/.test(row.applicationUrl)) {
    return { companyType: "Startup / venture-backed company", companyTypeConfidence: knownStartups.has(company) || /\((w|s|x)\d{2}\)/i.test(row.company) ? "high" : "medium", companyTypeEvidence: "Known startup, YC batch marker, or startup ATS signal" };
  }
  if (midMarket.has(company)) {
    return { companyType: "中厂 / established mid-size company", companyTypeConfidence: "high", companyTypeEvidence: "Known established non-mega-cap employer" };
  }
  if (/university|county|city of|state of|department|hospital|research hospital|school|college/.test(text)) {
    return { companyType: "公共机构 / education or healthcare institution", companyTypeConfidence: "medium", companyTypeEvidence: "Institutional name signal" };
  }
  if (/workdayjobs|icims|oraclecloud|successfactors|jobvite|smartrecruiters/.test(row.applicationUrl)) {
    return { companyType: "中厂 / established mid-size company", companyTypeConfidence: "low", companyTypeEvidence: "Enterprise ATS signal; needs manual company-size check" };
  }
  return { companyType: "Startup / small-to-mid company", companyTypeConfidence: "low", companyTypeEvidence: "No large-company or defense signal found; needs manual confirmation" };
}

function classifyDomain(row) {
  const text = `${row.role} ${row.company}`.toLowerCase();
  const checks = [
    ["AI/ML / applied AI", /ai|machine learning| ml |deep learning|llm|agent|model|computer vision|vision foundation|genai|generative|nlp|recommendation|data scientist|applied scientist/],
    ["Data / analytics / BI", /data|analytics|business intelligence|bi |etl|warehouse|database|insights/],
    ["Infrastructure / platform / SRE / DevOps", /infra|infrastructure|platform|site reliability|sre|devops|cloud|network|systems|distributed|reliability|performance|kernel|compiler|security engineer|application security/],
    ["Backend / full-stack software", /backend|back end|full.?stack|software engineer|software developer|developer|api|web engineer|product engineer/],
    ["Frontend / web / UI", /front.?end|frontend|ui|ux|react|web developer/],
    ["Mobile", /ios|android|mobile/],
    ["Embedded / firmware / robotics / hardware-adjacent", /embedded|firmware|robot|robotics|autonomous|avionics|flight|hardware|fpga|asic|electrical|vehicle|perception|slam/],
    ["Quant / trading / finance tech", /quant|trading|trader|researcher|investment|risk|finance|financial|capital markets/],
    ["Security / cybersecurity", /security|cyber|vulnerability|threat|infosec/],
    ["QA / test / validation", /test|qa|quality|validation|verification|sdet/],
    ["Product / TPM / solutions", /product manager|technical program|solutions engineer|forward deployed|sales engineer|implementation/],
  ];
  const found = checks.find(([, regex]) => regex.test(text));
  if (!found) return { jobDomain: "General software / IT", jobDomainConfidence: "low" };
  const confidence = found[0] === "Backend / full-stack software" && /software engineer|software developer|developer/.test(text) ? "medium" : "high";
  return { jobDomain: found[0], jobDomainConfidence: confidence };
}

const csv = await readFile(inputPath, "utf8");
const lines = csv.trim().split("\n");
const headers = parseLine(lines[0]);
const rows = lines.slice(1).map((line) => {
  const values = parseLine(line);
  return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
});

const enriched = rows.map((row) => ({
  ...row,
  ...classifyCompany(row),
  ...classifyDomain(row),
}));

const outHeaders = [
  "priority",
  "companyType",
  "companyTypeConfidence",
  "jobDomain",
  "jobDomainConfidence",
  "fitTier",
  "riskFlags",
  "company",
  "role",
  "location",
  "date",
  "httpStatus",
  "applicationUrl",
  "source",
  "companyTypeEvidence",
];

await writeFile(outCsvPath, [outHeaders, ...enriched.map((row) => outHeaders.map((h) => csvEscape(row[h])).join(","))].join("\n"));

const mdRows = enriched.map((row) => `| ${row.priority} | ${row.companyType} | ${row.companyTypeConfidence} | ${row.jobDomain} | ${row.jobDomainConfidence} | ${row.company} | ${row.role} | ${row.location || "-"} | ${row.riskFlags || "-"} | [Apply](${row.applicationUrl}) |`);
await writeFile(outMdPath, [
  "# Enriched Final 1000 2026 Winter / New Grad Leads",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "Columns classify company scale/type and job domain for every row. Low-confidence company-type rows should be manually checked before relying on the tier.",
  "",
  "| # | Company Type | Type Confidence | Job Domain | Domain Confidence | Company | Role | Location | Risk Flags | Link |",
  "|---:|---|---|---|---|---|---|---|---|---|",
  ...mdRows,
  "",
].join("\n"));

const summary = enriched.reduce((acc, row) => {
  acc.rows += 1;
  acc.companyTypes[row.companyType] = (acc.companyTypes[row.companyType] ?? 0) + 1;
  acc.companyTypeConfidence[row.companyTypeConfidence] = (acc.companyTypeConfidence[row.companyTypeConfidence] ?? 0) + 1;
  acc.jobDomains[row.jobDomain] = (acc.jobDomains[row.jobDomain] ?? 0) + 1;
  acc.jobDomainConfidence[row.jobDomainConfidence] = (acc.jobDomainConfidence[row.jobDomainConfidence] ?? 0) + 1;
  return acc;
}, { rows: 0, companyTypes: {}, companyTypeConfidence: {}, jobDomains: {}, jobDomainConfidence: {} });

await writeFile(summaryPath, JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ outCsvPath, outMdPath, summaryPath, ...summary }, null, 2));
