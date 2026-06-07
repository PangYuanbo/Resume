import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('../..', import.meta.url).pathname);
const queuePath = path.join(root, 'Resume/job_research/2026_winter_new_grad_startup_small_queue.csv');
const keyPath = path.join(root, 'Resume/job_research/2026_winter_new_grad_no_cap_rechecked.csv');
const trackerPath = path.join(root, 'Resume/job_research/2026_winter_new_grad_application_tracker.html');
const summaryPath = path.join(root, 'Resume/job_research/2026_winter_new_grad_all_key_applications_summary.html');
const logPath = path.join(root, 'Resume/job_applications.md');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (quoted) {
      if (c === '"' && n === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        cur += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ',') {
      row.push(cur);
      cur = '';
    } else if (c === '\n') {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = '';
    } else if (c !== '\r') {
      cur += c;
    }
  }
  if (cur.length || row.length) {
    row.push(cur);
    rows.push(row);
  }
  const header = rows.shift();
  return {
    header,
    rows: rows
      .filter((r) => r.some((v) => v !== ''))
      .map((r) => Object.fromEntries(header.map((k, i) => [k, r[i] ?? '']))),
  };
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(header, rows) {
  return `${header.join(',')}\n${rows.map((row) => header.map((k) => csvCell(row[k])).join(',')).join('\n')}\n`;
}

function keyOf(row) {
  return `${(row.company || '').trim().toLowerCase()}||${(row.role || '').trim().toLowerCase()}||${(row.applicationUrl || '').trim().toLowerCase()}`;
}

function syncTracker(queueRows) {
  let html = fs.readFileSync(trackerPath, 'utf8');
  html = html.replace(
    /const DATA = .*?;\nconst KEY/s,
    `const DATA = ${JSON.stringify(queueRows).replace(/</g, '\\u003c')};\nconst KEY`,
  );
  fs.writeFileSync(trackerPath, html);
}

function syncSummary(queueRows) {
  const keyRows = parseCsv(fs.readFileSync(keyPath, 'utf8')).rows;
  const queueByKey = new Map(queueRows.map((row) => [keyOf(row), row]));
  const data = keyRows
    .map((row, i) => {
      const q = queueByKey.get(keyOf(row)) || {};
      return {
        rank: Number(row.noCapRank || row.priority || i + 1),
        priority: row.priority || '',
        status: q.status || 'not_in_first_wave',
        queueRank: q.queueRank || '',
        submitted: q.submitted || '',
        company: row.company || '',
        role: row.role || '',
        location: row.location || '',
        season: row.season || '',
        date: row.date || '',
        fitTier: row.fitTier || '',
        companyType: q.companyType || '',
        jobDomain: q.jobDomain || '',
        domainResume: q.domainResume || '',
        riskFlags: row.riskFlags || '',
        liveStatus: row.liveStatus || '',
        reachable: row.reachable || '',
        httpStatus: row.httpStatus || '',
        recheckVerdict: row.recheckVerdict || '',
        recheckReason: row.recheckReason || '',
        source: row.source || '',
        applicationUrl: row.applicationUrl || '',
        finalUrl: row.finalUrl || '',
        folder: q.folder || '',
        resumePath: q.resumePath || '',
        trackerNote: q.trackerNote || '',
      };
    })
    .sort((a, b) => a.rank - b.rank);

  let html = fs.readFileSync(summaryPath, 'utf8');
  html = html.replace(/const DATA=.*?;\nconst el/s, `const DATA=${JSON.stringify(data).replace(/</g, '\\u003c')};\nconst el`);
  fs.writeFileSync(summaryPath, html);
}

function usage() {
  console.error('Usage: node Resume/scripts/update_ng_application_status.mjs --rank N --status submitted|closed|needs_captcha|needs_transcript|needs_recheck|ready --note TEXT [--submitted now|ISO] [--log]');
  process.exit(2);
}

const args = process.argv.slice(2);
const opts = {};
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--log') {
    opts.log = true;
  } else if (arg.startsWith('--')) {
    opts[arg.slice(2)] = args[++i];
  } else {
    usage();
  }
}

if (!opts.rank || !opts.status || !opts.note) usage();

const parsed = parseCsv(fs.readFileSync(queuePath, 'utf8'));
const row = parsed.rows.find((candidate) => candidate.queueRank === String(opts.rank));
if (!row) {
  console.error(`No queue row found for rank ${opts.rank}`);
  process.exit(1);
}

const now = new Date().toISOString();
row.status = opts.status;
row.submitted = opts.status === 'submitted' ? (opts.submitted === 'now' || !opts.submitted ? now : opts.submitted) : '';
row.trackerNote = opts.note;

fs.writeFileSync(queuePath, writeCsv(parsed.header, parsed.rows));

const appPath = path.join(root, 'Resume', row.folder, 'application.json');
if (fs.existsSync(appPath)) {
  const app = JSON.parse(fs.readFileSync(appPath, 'utf8'));
  app.status = row.status;
  app.submitted = row.submitted;
  app.trackerNote = row.trackerNote;
  app.updatedAt = now;
  fs.writeFileSync(appPath, `${JSON.stringify(app, null, 2)}\n`);
}

syncTracker(parsed.rows);
syncSummary(parsed.rows);

if (opts.log) {
  fs.appendFileSync(
    logPath,
    `- ${row.submitted || now} | ${row.company} | ${row.role} | ${row.applicationUrl} | ${row.status} | ${row.resumePath} | ${row.trackerNote}\n`,
  );
}

const counts = parsed.rows.reduce((acc, item) => {
  acc[item.status] = (acc[item.status] || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({ updated: `${row.queueRank} ${row.company} - ${row.role}`, status: row.status, submitted: row.submitted, counts }, null, 2));
