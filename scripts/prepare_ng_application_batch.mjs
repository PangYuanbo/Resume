import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const htmlDashboardPath = join(root, "job_research", "2026_winter_new_grad_key_applications.html");
const buildDir = join(root, "build", "ng_domain_resumes_clean");
const fullDomainBuildDir = join(root, "build", "ng_domain_resumes_full");
const queueDir = join(root, "ng_applications");
const queueCsvPath = join(root, "job_research", "2026_winter_new_grad_startup_small_queue.csv");
const trackerHtmlPath = join(root, "job_research", "2026_winter_new_grad_application_tracker.html");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseResumePath = join(root, "Yuanbo_Pang_Resume_Base.pdf");

function extractDashboardData(html) {
  const match = html.match(/const DATA = (.*?);\n    const controls/s);
  if (!match) throw new Error("Could not find embedded DATA in key applications HTML.");
  return JSON.parse(match[1]);
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsv(rows, headers) {
  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
}

function slug(value, max = 96) {
  return String(value)
    .normalize("NFKD")
    .replace(/[^\w\s.-]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, max)
    || "Application";
}

function domainKey(domain) {
  if (domain.includes("AI/ML")) return "ai_ml";
  if (domain.includes("Data")) return "data";
  if (domain.includes("Infrastructure")) return "infra";
  if (domain.includes("Frontend")) return "frontend";
  if (domain.includes("Mobile")) return "mobile";
  if (domain.includes("QA")) return "qa";
  if (domain.includes("Embedded")) return "embedded";
  if (domain.includes("Product")) return "product";
  if (domain.includes("Quant")) return "quant";
  return "backend";
}

function isStartupOrSmall(row) {
  return row.companyType.includes("Startup") || row.companyType.includes("small-to-mid") || row.companyType.includes("待标注");
}

function isSafeFirstWave(row) {
  if (!["high", "medium"].includes(row.fitTier)) return false;
  if (!["already_in_final_1000", "recovered_can_apply"].includes(row.status)) return false;
  if (row.riskFlags) return false;
  if (/defense|clearance|citizen|security clearance|u\.s\. person/i.test(`${row.role} ${row.companyType}`)) return false;
  return isStartupOrSmall(row);
}

function section(title, content) {
  return `<section><h2>${title}</h2>${content}</section>`;
}

function item(title, meta, date, bullets) {
  return `<div class="item"><div class="top"><strong>${title}</strong><span>${date}</span></div><div class="meta">${meta}</div><ul>${bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul></div>`;
}

const style = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Yuanbo Pang Resume</title>
  <style>
    @page { size: letter; margin: 0.48in; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111; font-family: Arial, Helvetica, sans-serif; font-size: 9.8px; line-height: 1.22; }
    main { width: 100%; }
    h1 { margin: 0; text-align: center; font-size: 21px; line-height: 1.05; letter-spacing: 0; }
    .contact { margin-top: 4px; text-align: center; font-size: 8.8px; }
    a { color: #111; text-decoration: none; }
    section { margin-top: 7px; }
    h2 { margin: 0 0 3px; border-bottom: 1px solid #111; font-size: 10.7px; line-height: 1.15; text-transform: uppercase; letter-spacing: 0; }
    .item { margin-bottom: 4.5px; }
    .top { display: flex; justify-content: space-between; gap: 12px; }
    .top span { white-space: nowrap; }
    .meta { font-style: italic; }
    ul { margin: 1.5px 0 0 13px; padding: 0; }
    li { margin: 1.2px 0; }
    .skills div { margin: 1.5px 0; }
    .skills strong { font-weight: 700; }
  </style>
</head>
<body><main>
<h1>Yuanbo Pang</h1>
<div class="contact">
  yuanbopang@berkeley.edu | 408-460-7526 | San Jose, CA |
  <a href="https://www.linkedin.com/in/yuanbopang/">linkedin.com/in/yuanbopang</a> |
  <a href="https://github.com/PangYuanbo">github.com/PangYuanbo</a> |
  <a href="https://yuanbopang.pro">yuanbopang.pro</a>
</div>`;

const education = section("Education", `
${item("University of California, Berkeley", "B.S. Electrical Engineering and Computer Sciences (EECS), Aug 2025 - Dec 2026", "Berkeley, CA", [
  "Coursework: CS 61B, CS 70, CS 170, CS 184, EECS 16A, EECS 106A. Stanford Summer School 2025: CS 229 Machine Learning."
])}
${item("De Anza Community College", "Computer Science transfer coursework, Sep 2023 - Jun 2025", "Cupertino, CA", [])}
`);

const skillBlocks = {
	  backend: section("Skills", `<div class="skills">
	    <div><strong>Languages:</strong> Python, TypeScript, JavaScript, C++, Java, SQL</div>
	    <div><strong>Backend/Full Stack:</strong> React, Next.js, Node.js/Hono, FastAPI, REST APIs, GraphQL, WebSockets</div>
	    <div><strong>Data/Infra:</strong> PostgreSQL/Neon, Redis, Docker, Linux, AWS, Cloudflare, Railway, Firebase, Vercel, Modal, CI/CD</div>
	    <div><strong>Agentic Development:</strong> Claude Code, Codex, Cursor, Grok, Droid</div>
	    <div><strong>AI Systems:</strong> agent harnesses, benchmark infrastructure, LLaVA, PyTorch, TensorFlow, CUDA</div>
	  </div>`),
	  ai_ml: section("Skills", `<div class="skills">
	    <div><strong>AI/ML:</strong> agent evaluation, benchmark infrastructure, PyTorch, TensorFlow, CUDA, LLaVA, OpenCV</div>
	    <div><strong>Agent Systems:</strong> agent harnesses, tool-calling workflows, VM/GUI/CLI evaluation, artifact capture, Claude Code, Codex, Cursor, Grok, Droid</div>
	    <div><strong>Engineering:</strong> Python, TypeScript, FastAPI, React, Docker, Modal, REST APIs, GraphQL, WebSockets</div>
	  </div>`),
	  data: section("Skills", `<div class="skills">
	    <div><strong>Data/Research:</strong> Python, SQL, PostgreSQL/Neon, data validation, experiment design, model benchmarking</div>
	    <div><strong>ML/Vision:</strong> PyTorch, TensorFlow, CUDA, OpenCV, optical-flow evaluation, UAV detection</div>
	    <div><strong>Engineering:</strong> TypeScript, FastAPI, React, Docker, Redis, REST APIs, CI/CD, Codex, Cursor</div>
	  </div>`),
	  infra: section("Skills", `<div class="skills">
	    <div><strong>Infra/Platform:</strong> Docker, Linux, AWS, Cloudflare, Railway, CI/CD, VM workflows, artifact capture</div>
	    <div><strong>Backend Systems:</strong> Python, TypeScript, Node.js/Hono, FastAPI, REST APIs, GraphQL, WebSockets, Redis, PostgreSQL/Neon</div>
	    <div><strong>AI Systems:</strong> agent harnesses, benchmark infrastructure, Modal, CUDA, PyTorch, Claude Code, Codex, Cursor</div>
	  </div>`),
	  frontend: section("Skills", `<div class="skills">
	    <div><strong>Frontend:</strong> React, Next.js, TypeScript, Tailwind CSS, shadcn/ui, Radix UI, Framer Motion, responsive UI</div>
	    <div><strong>Product/Backend:</strong> FastAPI, Node.js/Hono, REST APIs, GraphQL, WebSockets, Firebase, Vercel</div>
	    <div><strong>Infra/AI:</strong> AWS, Cloudflare, Railway, Docker, agent workflows, Claude Code, Codex, Cursor, LLaVA, OpenCV</div>
	  </div>`),
	  mobile: section("Skills", `<div class="skills">
	    <div><strong>Software:</strong> Python, TypeScript, JavaScript, C++, Java, REST APIs, GraphQL, WebSockets</div>
	    <div><strong>Product Engineering:</strong> React, Next.js, FastAPI, Firebase, Vercel, CI/CD, testing</div>
	    <div><strong>AI/Robotics:</strong> UAV detection, optical flow, ROS2, OpenCV, PyTorch, CUDA, Codex, Cursor</div>
	  </div>`),
	  qa: section("Skills", `<div class="skills">
	    <div><strong>Testing/QA:</strong> benchmark design, reproducible harness runs, validation, artifact capture, debugging</div>
	    <div><strong>Engineering:</strong> Python, TypeScript, JavaScript, C++, Docker, Linux, Git, REST APIs, Redis</div>
	    <div><strong>AI/Vision:</strong> model benchmarking, PyTorch, TensorFlow, CUDA, OpenCV, optical-flow evaluation, Codex, Cursor</div>
	  </div>`),
	  embedded: section("Skills", `<div class="skills">
	    <div><strong>Robotics/Vision:</strong> UAV detection, optical flow, ROS2, OpenCV, 3D perception, SLAM, camera-motion compensation</div>
	    <div><strong>Systems:</strong> C++, Python, Linux, Docker, REST APIs, WebSockets, Redis, performance-minded tooling</div>
	    <div><strong>AI/ML:</strong> PyTorch, TensorFlow, CUDA, LLaVA, model benchmarking, Codex, Cursor</div>
	  </div>`),
	  product: section("Skills", `<div class="skills">
	    <div><strong>Product/Full Stack:</strong> React, Next.js, TypeScript, FastAPI, Node.js/Hono, REST APIs, GraphQL, WebSockets</div>
	    <div><strong>Systems:</strong> PostgreSQL/Neon, Redis, Firebase, AWS, Cloudflare, Railway, Vercel, CI/CD</div>
	    <div><strong>AI Product:</strong> agent workflows, Claude Code, Codex, Cursor, Grok, Droid, LLaVA, OpenCV, model-backed interfaces, benchmark design</div>
	  </div>`),
	  quant: section("Skills", `<div class="skills">
	    <div><strong>Quant/Research:</strong> Python, C++, algorithms, ML, experiment design, data validation, model benchmarking</div>
	    <div><strong>ML/Systems:</strong> PyTorch, TensorFlow, CUDA, SQL, PostgreSQL/Neon, Docker, Linux</div>
	    <div><strong>Engineering:</strong> TypeScript, FastAPI, REST APIs, Redis, Codex, Cursor, optical-flow evaluation, statistical debugging</div>
	  </div>`),
};

const experienceBlocks = {
  backend: [
    item("Full-Stack Engineer, Ludus", "AI agent marketplace, backend systems, full-stack product engineering", "Apr 2026 - Present", [
      "Built outcome-first marketplace where multiple coding and research agents execute the same task in parallel and users pay for accepted results.",
      "Implemented React/TypeScript frontend, Node/Hono backend, Neon Postgres task store, and Docker-based VM dispatch layer."
    ]),
    item("Software Engineering Intern, Geopogo", "Production AI rendering platform, sole engineer", "Sep 2025 - Dec 2025", [
      "Shipped React/TypeScript frontend, FastAPI backend, Firebase auth, Vercel CI/CD, image reasoning, and RunwayML video workflows."
    ]),
    item("ENGR Team Co-Lead, UC Berkeley BAIR - Agent's Last Exam", "Agent benchmark infrastructure and evaluation systems", "Jan 2026 - Present", [
      "Built reproducible benchmark workflows for long-horizon AI-agent tasks, including VM setup, artifact capture, and deliverable-based scoring."
    ])
  ],
  ai_ml: [
    item("ENGR Team Co-Lead, UC Berkeley BAIR - Agent's Last Exam", "AI agent evaluation, benchmark infrastructure", "Jan 2026 - Present", [
      "Co-first author on a arXiv-published benchmark evaluating frontier AI agents on real professional workflows across 55 sub-fields.",
      "Converted expert-submitted tasks into executable benchmark instances with reproducible GUI/CLI runs and deliverable-based scoring."
    ]),
    item("Robotics AI Engineering Intern, Starbot", "Agent harness for restaurant service robots", "Dec 2025 - Feb 2026", [
      "Built agent harness with tool APIs, task-state orchestration, and recovery paths for ordering, delivery, and customer-service workflows."
    ]),
    item("Undergraduate Researcher, UC Berkeley - Prof. Avideh Zakhor", "UAV small-object detection and tracking", "Mar 2026 - Present", [
      "Benchmarked UAV detection methods against 1,600 manually annotated DJI frames and evaluated optical-flow/background-compensation pipelines."
    ])
  ],
  data: [
    item("Undergraduate Researcher, UC Berkeley - Prof. Avideh Zakhor", "UAV detection benchmarking, data validation", "Mar 2026 - Present", [
      "Created and used 1,600-frame annotation set to evaluate small-object detection and tracking methods under camera motion.",
      "Compared optical-flow and background-compensation pipelines to reduce false positives in tiny airborne object tracking."
    ]),
    item("Software Engineering Intern, Geopogo", "AI rendering platform analytics and product workflows", "Sep 2025 - Dec 2025", [
      "Built production platform flows around user uploads, model outputs, credit usage, and real-time previews across frontend and backend systems."
    ]),
    item("Research Intern, Prof. Hao Wang - Stevens Institute of Technology", "Federated learning and privacy-preserving ML", "Jun 2024 - Feb 2026", [
      "Built personalized federated learning experiments with differential privacy guarantees in PyTorch and TensorFlow."
    ])
  ],
  infra: [
    item("ENGR Team Co-Lead, UC Berkeley BAIR - Agent's Last Exam", "Benchmark infrastructure, VM workflows, evaluation systems", "Jan 2026 - Present", [
      "Built infrastructure for VM-based agent benchmark runs, task setup, artifact capture, reproducible execution, and deliverable scoring.",
      "Converted real expert workflows into executable benchmark tasks spanning 55 sub-fields and 13 industry clusters."
    ]),
    item("Full-Stack Engineer, Ludus", "Agent execution infrastructure", "Apr 2026 - Present", [
      "Implemented Docker-based VM dispatch layer, task storage, backend APIs, and full-stack interfaces for parallel agent execution."
    ]),
    item("Software Engineering Intern, Geopogo", "Full-stack production platform", "Sep 2025 - Dec 2025", [
      "Shipped React/TypeScript frontend, FastAPI backend, Firebase auth, Vercel CI/CD, and AI API integrations as sole engineer."
    ])
  ],
  frontend: [
    item("Software Engineering Intern, Geopogo", "Frontend-heavy AI rendering product", "Sep 2025 - Dec 2025", [
      "Built React/TypeScript UI for drag-and-drop uploads, image previews, AI rendering flows, real-time status updates, and subscription-aware usage."
    ]),
    item("Full-Stack Engineer, Ludus", "Agent marketplace frontend and backend", "Apr 2026 - Present", [
      "Built marketplace UI for task creation, agent result comparison, accepted-result payment flow, and backend task state."
    ]),
    item("HackMIT Project - Stud.ai", "Chrome extension and AI planning UI", "Sep 2024", [
      "Built Chrome extension that turns assignment rubrics into timelines and scheduled work blocks."
    ])
  ],
  embedded: [
    item("Robotics AI Engineering Intern, Starbot", "Service robot agent workflows", "Dec 2025 - Feb 2026", [
      "Built task orchestration and recovery paths for restaurant service robot workflows; system was demonstrated at CES 2026 and covered by NHK News."
    ]),
    item("Undergraduate Researcher, UC Berkeley - Prof. Avideh Zakhor", "UAV perception, optical flow, small-object tracking", "Mar 2026 - Present", [
      "Evaluated detection and tracking pipelines for tiny airborne objects using annotated drone video and motion-cue analysis."
    ]),
    item("ENGR Team Co-Lead, UC Berkeley BAIR - Agent's Last Exam", "Evaluation harnesses for embodied/GUI workflows", "Jan 2026 - Present", [
      "Built reproducible GUI/CLI evaluation flows with artifact capture and state-based scoring."
    ])
  ],
};

experienceBlocks.mobile = experienceBlocks.frontend;
experienceBlocks.qa = experienceBlocks.infra;
experienceBlocks.product = experienceBlocks.backend;
experienceBlocks.quant = experienceBlocks.data;

const projectBlocks = {
  backend: [
    item("Context8 - context8.org", "Agent knowledge system", "Oct 2025 - Jan 2026", [
      "Built solo self-evolving Stack Overflow for AI agents where solved bugs become reusable knowledge through voting and feedback loops."
    ]),
    item("AI Mario Level Generator", "HackMIT 2025 Modal Sponsor Prize", "Sep 2025", [
      "Built sketch-to-playable-level pipeline with LLaVA 1.5, Modal H100 inference, FastAPI, React, and OpenCV."
    ])
  ],
  ai_ml: [
    item("AI Mario Level Generator", "HackMIT 2025 Modal Sponsor Prize", "Sep 2025", [
      "Built sketch-to-playable-level pipeline with LLaVA 1.5, H100 inference on Modal, FastAPI, React, and OpenCV."
    ]),
    item("Context8 - context8.org", "Agent knowledge system", "Oct 2025 - Jan 2026", [
      "Built self-evolving knowledge system for AI agents, turning solved bugs into reusable agent memory."
    ])
  ],
  data: [
    item("UAV Detection Evaluation", "Research data, benchmarking, validation", "Mar 2026 - Present", [
      "Annotated and evaluated drone-video frames to compare tiny-object detection and motion-compensation approaches."
    ]),
    item("AI Mario Level Generator", "Computer vision and generative pipeline", "Sep 2025", [
      "Built vision-to-game pipeline with LLaVA, OpenCV, FastAPI, and React."
    ])
  ],
  infra: [
    item("Context8 - context8.org", "Agent knowledge system and full-stack product", "Oct 2025 - Jan 2026", [
      "Built feedback-loop product that turns one agent's solved bug into reusable knowledge for future agents."
    ]),
    item("AI Mario Level Generator", "GPU-backed inference workflow", "Sep 2025", [
      "Built GPU-backed sketch-to-game pipeline with Modal H100 inference, FastAPI, React, and OpenCV."
    ])
  ],
  frontend: [
    item("Stud.ai", "HackMIT 2024 Smartest AI Agent Award", "Sep 2024", [
      "Built Chrome extension and AI planning UI that converts assignment rubrics into scheduled work blocks."
    ]),
    item("AI Mario Level Generator", "Interactive sketch-to-game interface", "Sep 2025", [
      "Built React interface and backend pipeline for converting sketches into playable Mario-style levels."
    ])
  ],
  embedded: [
    item("AI Mario Level Generator", "Vision pipeline and playable simulation", "Sep 2025", [
      "Built computer-vision pipeline with OpenCV and LLaVA to convert drawn levels into executable game layouts."
    ]),
    item("UAV Detection Evaluation", "Aerial perception research", "Mar 2026 - Present", [
      "Benchmarked small-object tracking methods under motion and low-pixel-count detection conditions."
    ])
  ],
};
projectBlocks.mobile = projectBlocks.frontend;
projectBlocks.qa = projectBlocks.infra;
projectBlocks.product = projectBlocks.backend;
projectBlocks.quant = projectBlocks.data;

function resumeHtml(keyName) {
  return `${style}
${education}
${skillBlocks[keyName] ?? skillBlocks.backend}
${section("Experience", (experienceBlocks[keyName] ?? experienceBlocks.backend).join(""))}
${section("Projects", (projectBlocks[keyName] ?? projectBlocks.backend).join(""))}
</main></body></html>`;
}

function exportPdf(htmlPath, pdfPath) {
  const result = spawnSync(chrome, [
    "--headless=new",
	    "--disable-gpu",
	    "--no-first-run",
	    "--no-default-browser-check",
	    "--no-pdf-header-footer",
	    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href
  ], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`Chrome PDF export failed: ${result.stderr || result.stdout}`);
  }
}

const rows = extractDashboardData(await readFile(htmlDashboardPath, "utf8"));
const queue = rows
  .filter(isSafeFirstWave)
  .sort((a, b) => {
    const fitScore = { high: 0, medium: 1, low: 2 };
    return (fitScore[a.fitTier] ?? 9) - (fitScore[b.fitTier] ?? 9) || a.rank - b.rank;
  })
  .map((row, index) => {
    const domain = domainKey(row.jobDomain);
    const folder = `${String(index + 1).padStart(4, "0")}__${slug(row.company, 38)}__${slug(row.role, 58)}`;
    return {
      queueRank: index + 1,
      status: "ready",
      submitted: "",
      company: row.company,
      role: row.role,
      fitTier: row.fitTier,
      companyType: row.companyType,
      jobDomain: row.jobDomain,
      domainResume: domain,
      location: row.location,
      applicationUrl: row.applicationUrl,
      folder: `ng_applications/${folder}`,
      resumePath: `ng_applications/${folder}/Yuanbo_Pang_Resume.pdf`,
      trackerNote: row.status === "recovered_can_apply" ? row.statusReason : "previously verified live link",
    };
  });

await mkdir(buildDir, { recursive: true });
await mkdir(queueDir, { recursive: true });

const domainPdfPaths = new Map();
for (const keyName of ["backend", "ai_ml", "data", "infra", "frontend", "mobile", "qa", "embedded", "product", "quant"]) {
  const htmlPath = join(buildDir, `${keyName}.html`);
  const pdfPath = join(buildDir, `Yuanbo_Pang_${keyName}_Resume.pdf`);
  await writeFile(htmlPath, resumeHtml(keyName), "utf8");
  exportPdf(htmlPath, pdfPath);
  domainPdfPaths.set(keyName, pdfPath);
}

for (const row of queue) {
  const folderPath = join(root, row.folder);
  await mkdir(folderPath, { recursive: true });
  const fullDomainResumePath = join(fullDomainBuildDir, `Yuanbo_Pang_${row.domainResume}_Resume.pdf`);
  const domainResumePath = existsSync(fullDomainResumePath)
    ? fullDomainResumePath
    : (domainPdfPaths.get(row.domainResume) || baseResumePath);
  await copyFile(domainResumePath, join(folderPath, "Yuanbo_Pang_Resume.pdf"));
  await writeFile(join(folderPath, "application.json"), JSON.stringify(row, null, 2));
}

const queueHeaders = ["queueRank", "status", "submitted", "company", "role", "fitTier", "companyType", "jobDomain", "domainResume", "location", "applicationUrl", "folder", "resumePath", "trackerNote"];
await writeFile(queueCsvPath, toCsv(queue, queueHeaders));

const trackerRows = JSON.stringify(queue).replace(/</g, "\\u003c");
const trackerHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>2026 NG Startup Application Tracker</title>
  <style>
    :root { --bg:#f7f8fa; --panel:#fff; --ink:#17202a; --muted:#687385; --line:#dce2ea; --accent:#155eef; --green:#0f7a4f; --soft:#eaf2ff; }
    * { box-sizing: border-box; }
    body { margin:0; background:var(--bg); color:var(--ink); font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    header { position:sticky; top:0; z-index:3; background:var(--panel); border-bottom:1px solid var(--line); padding:18px 24px; }
    h1 { margin:0 0 5px; font-size:23px; letter-spacing:0; }
    .muted { color:var(--muted); }
    main { padding:18px 24px 40px; }
    .stats { display:grid; grid-template-columns:repeat(4,minmax(140px,1fr)); gap:12px; margin-bottom:14px; }
    .stat { background:var(--panel); border:1px solid var(--line); border-radius:8px; padding:12px; }
    .stat b { display:block; font-size:24px; }
    .toolbar { display:grid; grid-template-columns:1.7fr repeat(4, minmax(140px,1fr)); gap:10px; background:var(--panel); border:1px solid var(--line); border-radius:8px; padding:12px; margin-bottom:14px; }
    label { display:grid; gap:5px; color:var(--muted); font-size:12px; font-weight:650; }
    input, select { height:34px; border:1px solid var(--line); border-radius:6px; padding:0 9px; font:inherit; }
    .table { background:var(--panel); border:1px solid var(--line); border-radius:8px; overflow:auto; }
    table { border-collapse:collapse; min-width:1320px; width:100%; }
    th, td { border-bottom:1px solid var(--line); padding:9px 10px; vertical-align:top; text-align:left; }
    th { position:sticky; top:0; background:#fbfcfe; color:#465266; font-size:12px; text-transform:uppercase; z-index:2; }
    .pill { display:inline-flex; border-radius:999px; padding:5px 8px; font-size:12px; font-weight:700; background:var(--soft); color:var(--accent); margin:0 4px 4px 0; }
    .submitted { background:#e7f6ef; color:var(--green); }
    .company { font-weight:700; }
    a { color:var(--accent); font-weight:700; text-decoration:none; }
    a:hover { text-decoration:underline; }
    @media (max-width:900px) { .stats, .toolbar { grid-template-columns:1fr; } header, main { padding-left:14px; padding-right:14px; } }
  </style>
</head>
<body>
<header>
  <h1>2026 NG Startup / Small-Company Application Tracker</h1>
  <div class="muted">First wave excludes risk-flagged, defense/export, non-US, and unclear-live rows. Check a row after each real submission.</div>
</header>
<main>
  <section class="stats">
    <div class="stat"><b id="total">0</b><span class="muted">Ready targets</span></div>
    <div class="stat"><b id="submitted">0</b><span class="muted">Checked submitted</span></div>
    <div class="stat"><b id="high">0</b><span class="muted">High fit</span></div>
    <div class="stat"><b id="shown">0</b><span class="muted">Shown</span></div>
  </section>
  <section class="toolbar">
    <label>Search<input id="q" type="search" placeholder="company, role, domain"></label>
    <label>Fit<select id="fit"><option value="">All</option></select></label>
    <label>Domain<select id="domain"><option value="">All</option></select></label>
    <label>Status<select id="status"><option value="">All</option><option value="submitted">Submitted</option><option value="ready">Ready</option></select></label>
    <label>Resume<select id="resume"><option value="">All</option></select></label>
  </section>
  <section class="table">
    <table>
      <thead><tr><th>Submit</th><th>#</th><th>Company</th><th>Role</th><th>Fit</th><th>Type</th><th>Domain</th><th>Location</th><th>Resume</th><th>Folder</th><th>Apply</th></tr></thead>
      <tbody id="body"></tbody>
    </table>
  </section>
</main>
<script>
const DATA = ${trackerRows};
const KEY = "ng-startup-submitted-v1";
let submittedOverrides = JSON.parse(localStorage.getItem(KEY) || "{}");
const els = {
  q: document.getElementById("q"),
  fit: document.getElementById("fit"),
  domain: document.getElementById("domain"),
  status: document.getElementById("status"),
  resume: document.getElementById("resume"),
  body: document.getElementById("body"),
};
function uniq(field) { return [...new Set(DATA.map(r => r[field]).filter(Boolean))].sort((a,b)=>a.localeCompare(b)); }
function addOptions(select, values) { for (const v of values) { const o = document.createElement("option"); o.value = v; o.textContent = v; select.appendChild(o); } }
addOptions(els.fit, uniq("fitTier")); addOptions(els.domain, uniq("jobDomain")); addOptions(els.resume, uniq("domainResume"));
function esc(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c])); }
function isSubmitted(row) { return row.status === "submitted" || Boolean(submittedOverrides[row.queueRank]); }
function match(row) {
  const text = [row.company,row.role,row.jobDomain,row.companyType,row.location].join(" ").toLowerCase();
  if (els.q.value && !text.includes(els.q.value.toLowerCase())) return false;
  if (els.fit.value && row.fitTier !== els.fit.value) return false;
  if (els.domain.value && row.jobDomain !== els.domain.value) return false;
  if (els.resume.value && row.domainResume !== els.resume.value) return false;
  if (els.status.value === "submitted" && !isSubmitted(row)) return false;
  if (els.status.value === "ready" && row.status !== "ready") return false;
  return true;
}
function render() {
  const rows = DATA.filter(match);
  total.textContent = DATA.filter(r => r.status === "ready").length;
  high.textContent = DATA.filter(r => r.fitTier === "high").length;
  document.getElementById("submitted").textContent = DATA.filter(r => r.status === "submitted").length;
  shown.textContent = rows.length;
  els.body.innerHTML = rows.map(row => {
    const checked = isSubmitted(row) ? "checked" : "";
    return '<tr>' +
      '<td><input type="checkbox" data-rank="' + row.queueRank + '" ' + checked + '></td>' +
      '<td>' + row.queueRank + '</td>' +
      '<td class="company">' + esc(row.company) + '</td>' +
      '<td>' + esc(row.role) + '</td>' +
      '<td><span class="pill">' + esc(row.fitTier) + '</span></td>' +
      '<td>' + esc(row.companyType) + '</td>' +
      '<td>' + esc(row.jobDomain) + '</td>' +
      '<td>' + esc(row.location || "-") + '</td>' +
      '<td><span class="pill">' + esc(row.domainResume) + '</span></td>' +
      '<td><code>' + esc(row.resumePath) + '</code></td>' +
      '<td><a href="' + esc(row.applicationUrl) + '" target="_blank" rel="noreferrer">Apply</a></td>' +
    '</tr>';
  }).join("");
}
for (const control of [els.q, els.fit, els.domain, els.status, els.resume]) control.addEventListener("input", render);
els.body.addEventListener("change", event => {
  const rank = event.target?.dataset?.rank;
  if (!rank) return;
  if (event.target.checked) submittedOverrides[rank] = new Date().toISOString();
  else delete submittedOverrides[rank];
  localStorage.setItem(KEY, JSON.stringify(submittedOverrides));
  render();
});
render();
</script>
</body>
</html>`;
await writeFile(trackerHtmlPath, trackerHtml);

console.log(JSON.stringify({
  queueRows: queue.length,
  domainResumes: [...domainPdfPaths.values()].map((path) => path.replace(`${root}/`, "")),
  queueCsvPath: queueCsvPath.replace(`${root}/`, ""),
  trackerHtmlPath: trackerHtmlPath.replace(`${root}/`, ""),
}, null, 2));
