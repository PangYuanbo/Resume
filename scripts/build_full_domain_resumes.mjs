import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const baseHtmlPath = join(root, "index.html");
const buildDir = join(root, "build", "ng_domain_resumes_full");
const queueCsvPath = join(root, "job_research", "2026_winter_new_grad_startup_small_queue.csv");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const skillBlocks = {
  backend: `<div class="skills">
        <span>Languages:</span> Python, TypeScript/JavaScript, C++, Java, SQL |
        <span>Backend/Full Stack:</span> React, Next.js, Node.js/Hono, FastAPI, REST APIs, GraphQL, WebSockets |
        <span>Data/Infra:</span> PostgreSQL/Neon, Redis, Docker, Linux, AWS, Cloudflare, Railway, Firebase, Vercel, Modal, CI/CD |
        <span>Agentic Development:</span> Claude Code, Codex, Cursor, Grok, Droid |
        <span>AI/ML:</span> agent evaluation, PyTorch, TensorFlow, CUDA, LLaVA, OpenCV
      </div>`,
  ai_ml: `<div class="skills">
        <span>AI/ML:</span> agent evaluation, benchmark infrastructure, PyTorch, TensorFlow, CUDA, LLaVA, OpenCV |
        <span>Agent Systems:</span> agent harnesses, tool-calling workflows, VM/GUI/CLI evaluation, artifact capture, Claude Code, Codex, Cursor, Grok, Droid |
        <span>Engineering:</span> Python, TypeScript, FastAPI, React, Docker, Modal, REST APIs, GraphQL, WebSockets |
        <span>Vision/Robotics:</span> UAV detection, optical flow, ROS2, 3D perception
      </div>`,
  data: `<div class="skills">
        <span>Data/Research:</span> Python, SQL, PostgreSQL/Neon, data validation, experiment design, model benchmarking |
        <span>ML/Vision:</span> PyTorch, TensorFlow, CUDA, OpenCV, optical-flow evaluation, UAV detection |
        <span>Engineering:</span> TypeScript, FastAPI, React, Docker, Redis, REST APIs, CI/CD, Codex, Cursor
      </div>`,
  infra: `<div class="skills">
        <span>Infra/Platform:</span> Docker, Linux, AWS, Cloudflare, Railway, CI/CD, VM workflows, artifact capture |
        <span>Backend Systems:</span> Python, TypeScript, Node.js/Hono, FastAPI, REST APIs, GraphQL, WebSockets, Redis, PostgreSQL/Neon |
        <span>AI Systems:</span> agent harnesses, benchmark infrastructure, Modal, CUDA, PyTorch, Claude Code, Codex, Cursor
      </div>`,
  frontend: `<div class="skills">
        <span>Frontend:</span> React, Next.js, TypeScript, Tailwind CSS, shadcn/ui, Radix UI, Framer Motion, responsive UI |
        <span>Product/Backend:</span> FastAPI, Node.js/Hono, REST APIs, GraphQL, WebSockets, Firebase, Vercel |
        <span>Infra/AI:</span> AWS, Cloudflare, Railway, Docker, agent workflows, Claude Code, Codex, Cursor, LLaVA, OpenCV
      </div>`,
  mobile: `<div class="skills">
        <span>Software:</span> Python, TypeScript/JavaScript, C++, Java, REST APIs, GraphQL, WebSockets |
        <span>Product Engineering:</span> React, Next.js, FastAPI, Firebase, Vercel, CI/CD, testing |
        <span>AI/Robotics:</span> UAV detection, optical flow, ROS2, OpenCV, PyTorch, CUDA, Codex, Cursor
      </div>`,
  qa: `<div class="skills">
        <span>Testing/QA:</span> reproducible harness runs, validation, debugging, artifact capture, test workflows |
        <span>Engineering:</span> Python, TypeScript/JavaScript, C++, Docker, Linux, Git, REST APIs, Redis |
        <span>AI/Vision:</span> model benchmarking, PyTorch, TensorFlow, CUDA, OpenCV, optical-flow evaluation, Codex, Cursor
      </div>`,
  embedded: `<div class="skills">
        <span>Robotics/Vision:</span> UAV detection, optical flow, ROS2, OpenCV, 3D perception, SLAM, camera-motion compensation |
        <span>Systems:</span> C++, Python, Linux, Docker, REST APIs, WebSockets, Redis, performance-minded tooling |
        <span>AI/ML:</span> PyTorch, TensorFlow, CUDA, LLaVA, model benchmarking, Codex, Cursor
      </div>`,
  product: `<div class="skills">
        <span>Product/Full Stack:</span> React, Next.js, TypeScript, FastAPI, Node.js/Hono, REST APIs, GraphQL, WebSockets |
        <span>Systems:</span> PostgreSQL/Neon, Redis, Firebase, AWS, Cloudflare, Railway, Vercel, CI/CD |
        <span>AI Product:</span> agent workflows, Claude Code, Codex, Cursor, Grok, Droid, LLaVA, OpenCV, model-backed interfaces, benchmark design
      </div>`,
  quant: `<div class="skills">
        <span>Quant/Research:</span> Python, C++, algorithms, ML, experiment design, data validation, model benchmarking |
        <span>ML/Systems:</span> PyTorch, TensorFlow, CUDA, SQL, PostgreSQL/Neon, Docker, Linux |
        <span>Engineering:</span> TypeScript, FastAPI, REST APIs, Redis, Codex, Cursor, optical-flow evaluation, statistical debugging
      </div>`,
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (c === '"' && next === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        cur += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(cur);
      cur = "";
    } else if (c === "\n") {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else if (c !== "\r") {
      cur += c;
    }
  }
  if (cur.length || row.length) {
    row.push(cur);
    rows.push(row);
  }
  const headers = rows.shift();
  return rows
    .filter((values) => values.some((value) => value !== ""))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function withSkills(baseHtml, keyName) {
  const skillBlock = skillBlocks[keyName] ?? skillBlocks.backend;
  const nextHtml = baseHtml.replace(/<div class="skills">[\s\S]*?<\/div>\s*<\/section>/, `${skillBlock}
    </section>`);
  if (nextHtml === baseHtml) throw new Error("Could not replace Skills section in base resume HTML.");
  return nextHtml;
}

function exportPdf(htmlPath, pdfPath) {
  const result = spawnSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--no-pdf-header-footer",
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href,
  ], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`Chrome PDF export failed: ${result.stderr || result.stdout}`);
  }
}

await mkdir(buildDir, { recursive: true });

const baseHtml = await readFile(baseHtmlPath, "utf8");
const domainPdfPaths = new Map();
for (const keyName of Object.keys(skillBlocks)) {
  const htmlPath = join(buildDir, `${keyName}.html`);
  const pdfPath = join(buildDir, `Yuanbo_Pang_${keyName}_Resume.pdf`);
  await writeFile(htmlPath, withSkills(baseHtml, keyName), "utf8");
  exportPdf(htmlPath, pdfPath);
  domainPdfPaths.set(keyName, pdfPath);
}

let copied = 0;
let skipped = 0;
let missing = 0;
if (existsSync(queueCsvPath)) {
  const rows = parseCsv(await readFile(queueCsvPath, "utf8"));
  for (const row of rows) {
    const source = domainPdfPaths.get(row.domainResume) ?? domainPdfPaths.get("backend");
    const dest = join(root, row.resumePath);
    if (!existsSync(dest)) {
      missing++;
      continue;
    }
    await copyFile(source, dest);
    copied++;
  }
}

console.log(JSON.stringify({ generated: domainPdfPaths.size, copied, skipped, missing }, null, 2));
