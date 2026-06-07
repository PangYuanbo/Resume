import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const noCapPath = join(root, "job_research", "2026_winter_new_grad_no_cap_rechecked.csv");
const enrichedPath = join(root, "job_research", "2026_winter_new_grad_final_1000_enriched.csv");
const recheckPath = join(root, "job_research", "2026_winter_new_grad_screened_out_recheck.csv");
const summaryPath = join(root, "job_research", "2026_winter_new_grad_screened_out_recheck_summary.json");
const outPath = join(root, "job_research", "2026_winter_new_grad_key_applications.html");

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

async function loadCsv(path) {
  const rows = parseCsv(await readFile(path, "utf8"));
  const headers = rows[0];
  return rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function key(row) {
  return `${row.company}|${row.role}|${row.applicationUrl}`;
}

function mode(values, fallback) {
  const counts = new Map();
  for (const value of values.filter(Boolean)) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? fallback;
}

function inferDomain(role) {
  const text = role.toLowerCase();
  const rules = [
    ["AI/ML / applied AI", /machine learning|ml\b|ai\b|artificial intelligence|deep learning|computer vision|nlp|model|data scientist/],
    ["Data / analytics / BI", /data engineer|data analyst|analytics|bi\b|business intelligence|dashboard|etl|warehouse/],
    ["Infrastructure / platform / SRE / DevOps", /infra|infrastructure|platform|site reliability|sre|devops|cloud|network|systems|security engineer|linux/],
    ["Embedded / firmware / robotics / hardware-adjacent", /embedded|firmware|robot|hardware|fpga|vehicle|manufacturing test|test engineer/],
    ["QA / test / validation", /qa|quality|test|tester|validation/],
    ["Frontend / web / UI", /frontend|front-end|web|ui|ux|react|javascript|typescript/],
    ["Mobile", /mobile|ios|android/],
    ["Quant / trading / finance tech", /quant|trading|trader|strategy developer/],
    ["Product / TPM / solutions", /product manager|program manager|tpm|solutions engineer|sales engineer/],
  ];
  return rules.find(([, pattern]) => pattern.test(text))?.[0] ?? "Backend / full-stack software";
}

function normalizeUrl(url) {
  if (!url) return "";
  const workableMatch = url.match(/^https:\/\.workable\.com\/([^/?#]+)\/j\/([^/?#]+)\/?/i);
  if (workableMatch) return `https://apply.workable.com/${workableMatch[1]}/j/${workableMatch[2]}/`;
  const kbrWorkdayMatch = url.match(/^https:\/\/bs\.com\/KBR_Careers\/job\/([^?#]+)/i);
  if (kbrWorkdayMatch) return `https://kbr.wd5.myworkdayjobs.com/KBR_Careers/job/${kbrWorkdayMatch[1]}`;
  return url;
}

const quantCompanies = new Set([
  "citadel securities", "hudson river trading", "imc", "jane street", "optiver",
  "renaissance technologies", "susquehanna international group (sig)", "trexquant",
]);

function htmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const noCap = await loadCsv(noCapPath);
const enriched = await loadCsv(enrichedPath);
const recheck = await loadCsv(recheckPath);
const summary = JSON.parse(await readFile(summaryPath, "utf8"));

const enrichedByKey = new Map(enriched.map((row) => [key(row), row]));
const companyTypes = new Map();
const companyDomains = new Map();
for (const row of enriched) {
  const companyKey = row.company.toLowerCase();
  companyTypes.set(companyKey, [...(companyTypes.get(companyKey) ?? []), row.companyType]);
  companyDomains.set(companyKey, [...(companyDomains.get(companyKey) ?? []), row.jobDomain]);
}
const recheckByKey = new Map(recheck.map((row) => [key(row), row]));

const rows = noCap.map((row) => {
  const enrichedRow = enrichedByKey.get(key(row));
  const recheckRow = recheckByKey.get(key(row));
  const companyKey = row.company.toLowerCase();
  let companyType = enrichedRow?.companyType;
  if (!companyType && row.riskFlags.includes("defense")) companyType = "政府/国防 contractor";
  if (!companyType && quantCompanies.has(companyKey)) companyType = "量化 / trading firm";
  if (!companyType) companyType = mode(companyTypes.get(companyKey) ?? [], "待标注 / needs manual company-type tag");
  const jobDomain = enrichedRow?.jobDomain ?? mode(companyDomains.get(companyKey) ?? [], inferDomain(row.role));
  const companyTypeConfidence = enrichedRow?.companyTypeConfidence ?? (companyTypes.has(companyKey) ? "company-match" : "low");
  const jobDomainConfidence = enrichedRow?.jobDomainConfidence ?? (companyDomains.has(companyKey) ? "company-match" : "inferred");
  const normalizedApplicationUrl = normalizeUrl(row.applicationUrl);
  const normalizedCurlFinalUrl = normalizeUrl(recheckRow?.curlFinalUrl ?? "");
  const effectiveUrl = /^https?:\/\//.test(normalizedCurlFinalUrl) ? normalizedCurlFinalUrl : normalizedApplicationUrl;
  return {
    rank: Number(row.noCapRank),
    priority: Number(row.priority),
    fitTier: row.fitTier || "unknown",
    status: row.recheckVerdict,
    statusReason: row.recheckReason,
    company: row.company,
    role: row.role,
    location: row.location,
    date: row.date,
    riskFlags: row.riskFlags,
    companyType,
    companyTypeConfidence,
    jobDomain,
    jobDomainConfidence,
    applicationUrl: effectiveUrl,
    originalApplicationUrl: row.applicationUrl,
    finalUrl: row.finalUrl,
    source: row.source,
    httpStatus: row.httpStatus,
    evidence: recheckRow?.reason ?? row.recheckReason,
    checkedBy: recheckRow?.checkedBy ?? (row.recheckVerdict === "already_in_final_1000" ? "prior verification" : ""),
  };
});

const counts = {
  total: rows.length,
  high: rows.filter((row) => row.fitTier === "high").length,
  recovered: rows.filter((row) => row.status !== "already_in_final_1000").length,
  risk: rows.filter((row) => row.riskFlags).length,
  defense: rows.filter((row) => row.riskFlags.includes("defense") || row.companyType.includes("国防")).length,
  ai: rows.filter((row) => row.jobDomain.includes("AI/ML")).length,
};

const dataJson = JSON.stringify(rows).replace(/</g, "\\u003c");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>2026 Winter / New Grad Key Applications</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f6f7f9;
      --panel: #ffffff;
      --ink: #18202a;
      --muted: #697386;
      --line: #dce2ea;
      --accent: #1662c4;
      --accent-soft: #e8f1ff;
      --green: #0f7a4f;
      --green-soft: #e7f6ef;
      --amber: #936100;
      --amber-soft: #fff4d7;
      --red: #ad2f2f;
      --red-soft: #ffe8e8;
      --cyan: #0d6f78;
      --cyan-soft: #e3f7f9;
      --shadow: 0 14px 34px rgba(24, 32, 42, 0.08);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    header {
      background: var(--panel);
      border-bottom: 1px solid var(--line);
      padding: 22px 28px 18px;
      position: sticky;
      top: 0;
      z-index: 3;
    }
    h1 {
      font-size: 24px;
      line-height: 1.2;
      margin: 0 0 6px;
      letter-spacing: 0;
    }
    .subhead {
      color: var(--muted);
      display: flex;
      flex-wrap: wrap;
      gap: 10px 18px;
    }
    main { padding: 22px 28px 40px; }
    .stats {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(6, minmax(130px, 1fr));
      margin-bottom: 18px;
    }
    .stat {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      box-shadow: var(--shadow);
      min-height: 78px;
    }
    .stat b { display: block; font-size: 24px; line-height: 1; margin-bottom: 8px; }
    .stat span { color: var(--muted); font-size: 12px; text-transform: uppercase; }
    .toolbar {
      align-items: end;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      display: grid;
      gap: 12px;
      grid-template-columns: 1.6fr repeat(5, minmax(130px, 1fr));
      margin-bottom: 16px;
      padding: 14px;
    }
    label { color: var(--muted); display: grid; gap: 6px; font-size: 12px; font-weight: 650; }
    input, select {
      border: 1px solid var(--line);
      border-radius: 6px;
      color: var(--ink);
      font: inherit;
      height: 36px;
      padding: 0 10px;
      width: 100%;
    }
    .result-line {
      color: var(--muted);
      margin: 0 0 10px;
    }
    .table-wrap {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow: auto;
      box-shadow: var(--shadow);
    }
    table {
      border-collapse: collapse;
      min-width: 1420px;
      width: 100%;
    }
    th, td {
      border-bottom: 1px solid var(--line);
      padding: 10px 12px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f9fafc;
      color: #435064;
      font-size: 12px;
      position: sticky;
      top: 0;
      z-index: 2;
      text-transform: uppercase;
      white-space: nowrap;
    }
    tbody tr:hover { background: #fbfdff; }
    .rank { color: var(--muted); font-variant-numeric: tabular-nums; width: 56px; }
    .company { font-weight: 700; min-width: 170px; }
    .role { min-width: 290px; }
    .muted { color: var(--muted); }
    .pill {
      border-radius: 999px;
      display: inline-flex;
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
      margin: 0 5px 5px 0;
      padding: 6px 8px;
      white-space: nowrap;
    }
    .fit-high, .status-recovered_can_apply { background: var(--green-soft); color: var(--green); }
    .fit-medium, .status-live_unclear_manual_check { background: var(--amber-soft); color: var(--amber); }
    .status-already_in_final_1000 { background: var(--accent-soft); color: var(--accent); }
    .risk { background: var(--red-soft); color: var(--red); }
    .domain { background: var(--cyan-soft); color: var(--cyan); }
    .type { background: #eef1f5; color: #344154; }
    a {
      color: var(--accent);
      font-weight: 700;
      text-decoration: none;
    }
    a:hover { text-decoration: underline; }
    .empty {
      color: var(--muted);
      padding: 28px;
      text-align: center;
    }
    @media (max-width: 1100px) {
      header, main { padding-left: 16px; padding-right: 16px; }
      .stats { grid-template-columns: repeat(2, minmax(120px, 1fr)); }
      .toolbar { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 680px) {
      .toolbar { grid-template-columns: 1fr; }
      .stats { grid-template-columns: 1fr; }
      h1 { font-size: 20px; }
    }
  </style>
</head>
<body>
  <header>
    <h1>2026 Winter / New Grad Key Applications</h1>
    <div class="subhead">
      <span>Generated ${htmlEscape(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }))}</span>
      <span>Source: no-cap rechecked list + enriched company/domain tags</span>
      <span>Confirmed not-apply rows excluded: ${summary.confirmedNotApplyRows}</span>
    </div>
  </header>
  <main>
    <section class="stats">
      <div class="stat"><b>${counts.total}</b><span>Key rows</span></div>
      <div class="stat"><b>${counts.high}</b><span>High fit</span></div>
      <div class="stat"><b>${counts.recovered}</b><span>Recovered after recheck</span></div>
      <div class="stat"><b>${counts.ai}</b><span>AI / ML</span></div>
      <div class="stat"><b>${counts.risk}</b><span>Risk-flagged</span></div>
      <div class="stat"><b>${counts.defense}</b><span>Defense review</span></div>
    </section>
    <section class="toolbar" aria-label="Filters">
      <label>Search
        <input id="q" type="search" placeholder="company, role, location, source">
      </label>
      <label>Fit
        <select id="fit"><option value="">All</option></select>
      </label>
      <label>Status
        <select id="status"><option value="">All</option></select>
      </label>
      <label>Company Type
        <select id="type"><option value="">All</option></select>
      </label>
      <label>Domain
        <select id="domain"><option value="">All</option></select>
      </label>
      <label>Risk
        <select id="risk">
          <option value="">All</option>
          <option value="has-risk">Has risk flag</option>
          <option value="no-risk">No risk flag</option>
          <option value="defense">Defense/export review</option>
        </select>
      </label>
    </section>
    <p class="result-line"><span id="shown">0</span> rows shown. Sorted by no-cap rank.</p>
    <section class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Fit / Status</th>
            <th>Company</th>
            <th>Role</th>
            <th>Type</th>
            <th>Domain</th>
            <th>Location</th>
            <th>Date</th>
            <th>Risk</th>
            <th>Evidence</th>
            <th>Apply</th>
          </tr>
        </thead>
        <tbody id="rows"></tbody>
      </table>
      <div id="empty" class="empty" hidden>No rows match these filters.</div>
    </section>
  </main>
  <script>
    const DATA = ${dataJson};
    const controls = {
      q: document.getElementById('q'),
      fit: document.getElementById('fit'),
      status: document.getElementById('status'),
      type: document.getElementById('type'),
      domain: document.getElementById('domain'),
      risk: document.getElementById('risk'),
    };
    const tbody = document.getElementById('rows');
    const empty = document.getElementById('empty');
    const shown = document.getElementById('shown');

    function unique(field) {
      return [...new Set(DATA.map(row => row[field]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    }
    function addOptions(select, values) {
      for (const value of values) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      }
    }
    addOptions(controls.fit, unique('fitTier'));
    addOptions(controls.status, unique('status'));
    addOptions(controls.type, unique('companyType'));
    addOptions(controls.domain, unique('jobDomain'));

    function esc(value) {
      return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[char]));
    }
    function pill(text, kind) {
      if (!text) return '';
      return '<span class="pill ' + kind + '">' + esc(text) + '</span>';
    }
    function rowMatches(row) {
      const query = controls.q.value.trim().toLowerCase();
      const haystack = [row.company, row.role, row.location, row.source, row.companyType, row.jobDomain].join(' ').toLowerCase();
      if (query && !haystack.includes(query)) return false;
      if (controls.fit.value && row.fitTier !== controls.fit.value) return false;
      if (controls.status.value && row.status !== controls.status.value) return false;
      if (controls.type.value && row.companyType !== controls.type.value) return false;
      if (controls.domain.value && row.jobDomain !== controls.domain.value) return false;
      if (controls.risk.value === 'has-risk' && !row.riskFlags) return false;
      if (controls.risk.value === 'no-risk' && row.riskFlags) return false;
      if (controls.risk.value === 'defense' && !((row.riskFlags || '').includes('defense') || row.companyType.includes('国防'))) return false;
      return true;
    }
    function render() {
      const rows = DATA.filter(rowMatches).slice(0, 700);
      shown.textContent = DATA.filter(rowMatches).length + (DATA.filter(rowMatches).length > rows.length ? ' (first ' + rows.length + ' rendered)' : '');
      tbody.innerHTML = rows.map(row => {
        const fitClass = row.fitTier === 'high' ? 'fit-high' : 'fit-medium';
        const statusClass = 'status-' + row.status.replace(/[^a-z0-9_]/gi, '_');
        const evidence = row.status === 'already_in_final_1000'
          ? 'Previously verified live link'
          : [row.checkedBy, row.evidence || row.statusReason].filter(Boolean).join(' · ');
        return '<tr>' +
          '<td class="rank">' + esc(row.rank) + '</td>' +
          '<td>' + pill(row.fitTier, fitClass) + pill(row.status, statusClass) + '</td>' +
          '<td class="company">' + esc(row.company) + '</td>' +
          '<td class="role">' + esc(row.role) + '<div class="muted">' + esc(row.source) + '</div></td>' +
          '<td>' + pill(row.companyType, 'type') + '<div class="muted">' + esc(row.companyTypeConfidence) + '</div></td>' +
          '<td>' + pill(row.jobDomain, 'domain') + '<div class="muted">' + esc(row.jobDomainConfidence) + '</div></td>' +
          '<td>' + esc(row.location || '-') + '</td>' +
          '<td>' + esc(row.date || '-') + '</td>' +
          '<td>' + (row.riskFlags ? pill(row.riskFlags, 'risk') : '<span class="muted">-</span>') + '</td>' +
          '<td class="muted">' + esc(evidence || '-') + '</td>' +
          '<td><a href="' + esc(row.applicationUrl) + '" target="_blank" rel="noreferrer">Open</a></td>' +
        '</tr>';
      }).join('');
      empty.hidden = rows.length > 0;
    }
    for (const control of Object.values(controls)) control.addEventListener('input', render);
    render();
  </script>
</body>
</html>
`;

await writeFile(outPath, html);
console.log(JSON.stringify({ outPath, rows: rows.length, counts }, null, 2));
