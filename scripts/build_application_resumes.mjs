import { mkdir, writeFile, copyFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const appsDir = join(root, "applications");
const buildDir = join(root, "build", "category_resumes");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const baseStyle = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Yuanbo Pang - Resume</title>
  <style>
    :root { --ink: #111; --rule: #111; --page: #fff; --bg: #f4f4f4; }
    @page { size: letter; margin: 0.4in; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: Arial, Helvetica, sans-serif; font-size: 9.6px; line-height: 1.17; }
    .page { width: 8.5in; min-height: 11in; margin: 24px auto; padding: 0.4in; background: var(--page); box-shadow: 0 2px 18px rgba(0, 0, 0, 0.12); }
    h1 { margin: 0; text-align: center; font-size: 21px; line-height: 1; letter-spacing: 0; }
    a { color: inherit; text-decoration: none; }
    .contact { margin-top: 5px; text-align: center; font-size: 8.8px; }
    .summary { margin-top: 5px; text-align: center; font-size: 9px; line-height: 1.16; }
    .section { margin-top: 7px; }
    .section-title { margin-bottom: 3px; padding-bottom: 1px; border-bottom: 1px solid var(--rule); font-size: 10.5px; font-weight: 700; text-transform: uppercase; }
    .item { margin-bottom: 4.5px; }
    .row, .meta { display: flex; justify-content: space-between; gap: 14px; }
    .row { font-weight: 700; }
    .meta { color: var(--ink); font-style: italic; }
    .right { flex: 0 0 auto; text-align: right; white-space: nowrap; }
    ul { margin: 2px 0 0 13px; padding: 0; }
    li { margin: 1.2px 0; }
    .skills span { font-weight: 700; }
    @media print { body { background: #fff; } .page { width: auto; min-height: 0; margin: 0; padding: 0; box-shadow: none; } }
  </style>
</head>
<body>
  <main class="page">
    <h1>Yuanbo Pang</h1>
    <div class="contact">
      <a href="mailto:yuanbopang@berkeley.edu">yuanbopang@berkeley.edu</a> |
      408-460-7526 |
      Berkeley, CA |
      <a href="https://www.linkedin.com/in/yuanbopang/">linkedin.com/in/yuanbopang</a> |
      <a href="https://github.com/PangYuanbo">github.com/PangYuanbo</a> |
      <a href="https://yuanbopang.pro">yuanbopang.pro</a>
    </div>`;

const footer = `  </main>
</body>
</html>
`;

const summary = `
    <div class="summary">UC Berkeley EECS student building AI agent evaluation, infrastructure, and robotics/vision systems; co-first author on the NeurIPS 2026 Agent's Last Exam benchmark submission.</div>`;

const education = `
    <section class="section">
      <div class="section-title">Education</div>
      <div class="item">
        <div class="row"><div>University of California, Berkeley</div><div class="right">Berkeley, CA</div></div>
        <div class="meta"><div>B.S. Electrical Engineering and Computer Sciences (EECS)</div><div class="right">Aug 2025 - Dec 2026</div></div>
        <ul><li>Coursework: CS 61B, CS 70, CS 170, EECS 16A, EECS 106A.</li></ul>
      </div>
      <div class="item">
        <div class="row"><div>Stanford University, Summer Session</div><div class="right">Stanford, CA</div></div>
        <div class="meta"><div>CS 229: Machine Learning</div><div class="right">Summer 2025</div></div>
      </div>
      <div class="item">
        <div class="row"><div>Community College Coursework</div><div class="right">Cupertino, CA</div></div>
        <div class="meta"><div>Computer Science coursework at De Anza, Foothill, Evergreen, and Diablo Valley; Phi Theta Kappa; Academic Director, Quantum Club; President, Data Club</div><div class="right">Sep 2023 - Jun 2025</div></div>
      </div>
    </section>`;

const awards = `
    <section class="section">
      <div class="section-title">Awards</div>
      <div>Modal Sponsor Prize, HackMIT 2025; Smartest AI Agent Award, HackMIT 2024; Best Use of .Tech Domain, HackDavis 2024; Winner, Hack for Impact 2024; First Prize, Jiangsu Province Chinese National Physics Olympiad 2022.</div>
    </section>`;

const publication = `
    <section class="section">
      <div class="section-title">Publications</div>
      <div class="item">
        <div class="row"><div>Agent's Last Exam (ALE) - NeurIPS 2026 Evaluations and Datasets Track submission</div><div class="right">May 2026</div></div>
        <ul><li>Co-first author. Benchmark of 1,000+ real-world agent tasks across 55 sub-fields and 13 industry clusters, led by 300+ industry experts and Prof. Dawn Song, UC Berkeley.</li></ul>
      </div>
    </section>`;

function item(title, loc, meta, date, bullets) {
  return `      <div class="item">
        <div class="row"><div>${title}</div><div class="right">${loc}</div></div>
        <div class="meta"><div>${meta}</div><div class="right">${date}</div></div>
        <ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
      </div>`;
}

const blocks = {
  ludusAgent: item(
    "Full-Stack Engineer, Ludus",
    "Remote",
    "AI agent marketplace, full-stack systems, agent execution",
    "Apr 2026 - Present",
    [
      "Built outcome-first marketplace where multiple coding/research agents execute the same task in parallel and users pay only for accepted results.",
      "Built React/TypeScript frontend, Node/Hono backend, Neon Postgres task store, and Docker-based VM dispatch layer for agent execution."
    ]
  ),
  aleAgent: item(
    "ENGR Team Co-Lead, UC Berkeley BAIR - Agent's Last Exam (ALE)",
    "Berkeley, CA",
    "AI agent evaluation, benchmark infrastructure, agent harnesses",
    "Jan 2026 - Present",
    [
      "Co-first author on ALE, a NeurIPS 2026 benchmark submission led by Prof. Dawn Song for evaluating frontier AI agents on long-horizon professional workflows.",
      "Primary builder for converting expert-submitted real-world tasks into executable benchmark instances across 55 sub-fields and 13 industry clusters.",
      "Built evaluation infrastructure for VM-based GUI/CLI workflows, reproducible harness runs, and deliverable-based scoring."
    ]
  ),
  aleInfra: item(
    "ENGR Team Co-Lead, UC Berkeley BAIR - Agent's Last Exam (ALE)",
    "Berkeley, CA",
    "Benchmark infrastructure, VM workflows, evaluation systems",
    "Jan 2026 - Present",
    [
      "Built infrastructure for reproducible agent benchmark runs across VM-based GUI/CLI workflows, task setup, artifact capture, and deliverable-based scoring.",
      "Converted expert-submitted tasks into executable benchmark instances spanning 55 sub-fields and 13 industry clusters.",
      "Co-first author on ALE, a NeurIPS 2026 benchmark submission for evaluating frontier AI agents on long-horizon professional workflows."
    ]
  ),
  starbotAgent: item(
    "Robotics AI Engineering Intern, Starbot",
    "Remote",
    "Agent harness for restaurant service robots",
    "Dec 2025 - Feb 2026",
    [
      "Built agent harness for restaurant service robots with tool APIs, task-state orchestration, and recovery paths for ordering, delivery, and customer-service workflows.",
      "Designed tool interfaces, task state handling, and recovery paths to make real service workflows reliable enough for live demo settings.",
      "System was demonstrated at CES 2026 and covered by NHK News, one of Japan's leading national media outlets."
    ]
  ),
  starbotRobotics: item(
    "Robotics AI Engineering Intern, Starbot",
    "Remote",
    "Robotics agent systems, task orchestration, service workflows",
    "Dec 2025 - Feb 2026",
    [
      "Built agent harness for a restaurant service robot, coordinating ordering, delivery, and customer-service tasks through structured robot workflows.",
      "Implemented tool interfaces, task-state logic, and recovery paths for reliable human-robot service interactions in demo conditions.",
      "System was demonstrated at CES 2026 and covered by NHK News, one of Japan's leading national media outlets."
    ]
  ),
  urapRobotics: item(
    "Undergraduate Researcher, UC Berkeley - Prof. Avideh Zakhor",
    "Berkeley, CA",
    "UAV small-object detection, motion priors, airborne target tracking",
    "Mar 2026 - Present",
    [
      "Research small UAV detection and tracking in aerial video, focusing on tiny-object recognition, camera-motion compensation, and low-false-positive perception.",
      "Benchmarked UAV detection methods including TransVisDrone, AOT Winner v022, ESOD, and Li-TETC/NPS against 1,600 manually annotated DJI frames.",
      "Evaluated optical-flow and background-compensation pipelines to reduce false positives in tiny airborne object tracking."
    ]
  ),
  urapShort: item(
    "Undergraduate Researcher, UC Berkeley - Prof. Avideh Zakhor",
    "Berkeley, CA",
    "UAV perception, optical flow, small-object detection",
    "Mar 2026 - Present",
    [
      "Benchmarked UAV detection/tracking methods against 1,600 manually annotated DJI frames.",
      "Evaluated optical-flow and background-compensation pipelines for tiny-object tracking and low-false-positive perception."
    ]
  ),
  geopogoInfra: item(
    "Software Engineering Intern, Geopogo",
    "Berkeley, CA",
    "AI rendering platform, full-stack production engineering",
    "Sep 2025 - Dec 2025",
    [
      "Shipped production AI architectural rendering platform as sole engineer, implementing React/TypeScript frontend, FastAPI backend, Firebase auth, and Vercel CI/CD.",
      "Integrated Gemini image reasoning and RunwayML text-to-video workflows with drag-and-drop uploads, real-time previews, and credit-based subscriptions."
    ]
  ),
  geopogoFull: item(
    "Software Engineering Intern, Geopogo",
    "Berkeley, CA",
    "AI rendering platform, full-stack production engineering",
    "Sep 2025 - Dec 2025",
    [
      "Shipped production AI rendering platform as sole engineer, implementing React/TypeScript frontend, FastAPI backend, Firebase auth, Vercel CI/CD, Gemini API, and RunwayML pipelines."
    ]
  ),
  fetch: item(
    "Student Ambassador, Fetch.ai Innovation Lab",
    "San Francisco, CA",
    "AI agent mentoring, startup scouting",
    "Sep 2024 - Oct 2025",
    [
      "Mentored 20+ teams at CalHack 11.0 and SF Hacks on full-stack development and AI agent product direction.",
      "Scouted early-stage startups at Bay Area Founders Club demo summits with 5,000+ startups and 1,000+ VCs for investment follow-up."
    ]
  ),
  stevens: item(
    "Research Intern, Prof. Hao Wang - Stevens Institute of Technology",
    "Hoboken, NJ",
    "Personalized federated learning, differential privacy, PyTorch/TensorFlow",
    "Jun 2024 - Feb 2026",
    [
      "Built personalized federated learning systems with differential privacy guarantees in PyTorch/TensorFlow to protect local data while accelerating on-device model personalization."
    ]
  )
};

const projects = {
  agent: `
    <section class="section">
      <div class="section-title">Projects</div>
${item("Context8 - context8.org", "", "Agent knowledge systems", "Oct 2025 - Jan 2026", ["Built solo self-evolving Stack Overflow for AI agents where community votes and feedback turn one agent's solved bug into reusable knowledge for all agents."])}
${item("Stud.ai", "", "HackMIT 2024 - Smartest AI Agent Award", "Sep 2024", ["Built Chrome extension and AI agent that turns assignment rubrics into step-by-step timelines and auto-schedules work blocks on students' calendars."])}
${item("AI Mario Level Generator - mario-hackmit.vercel.app", "", "HackMIT 2025 - Modal Sponsor Prize", "Sep 2025", ["Built sketch-to-playable-level pipeline using LLaVA 1.5, H100 GPU inference on Modal, FastAPI, React, and OpenCV."])}
    </section>`,
  robotics: `
    <section class="section">
      <div class="section-title">Projects</div>
${item("AI Mario Level Generator - mario-hackmit.vercel.app", "", "HackMIT 2025 - Modal Sponsor Prize", "Sep 2025", ["Built sketch-to-playable-level pipeline using LLaVA 1.5, H100 GPU inference on Modal, FastAPI, React, and OpenCV."])}
${item("Context8 - context8.org", "", "Agent knowledge systems", "Oct 2025 - Jan 2026", ["Built self-evolving knowledge system for AI agents, focused on reusable debugging traces, structured feedback, and reliable agent workflows."])}
${item("Stud.ai", "", "HackMIT 2024 - Smartest AI Agent Award", "Sep 2024", ["Built AI planning agent that converts assignment rubrics into timelines and calendar work blocks."])}
    </section>`,
  infra: `
    <section class="section">
      <div class="section-title">Projects</div>
${item("Context8 - context8.org", "", "Agent knowledge systems, full-stack product", "Oct 2025 - Jan 2026", ["Built solo self-evolving Stack Overflow for AI agents with feedback loops that turn solved bugs into reusable knowledge for future agents."])}
${item("AI Mario Level Generator - mario-hackmit.vercel.app", "", "HackMIT 2025 - Modal Sponsor Prize", "Sep 2025", ["Built GPU-backed sketch-to-game pipeline with LLaVA 1.5, Modal H100 inference, FastAPI, React, and OpenCV."])}
${item("Stud.ai", "", "HackMIT 2024 - Smartest AI Agent Award", "Sep 2024", ["Built Chrome extension and AI scheduling agent for assignment planning workflows."])}
    </section>`
};

const skills = {
  agent: `
    <section class="section"><div class="section-title">Skills</div><div class="skills">
      <span>Languages:</span> Python, TypeScript/JavaScript, C++, Java, Rust |
      <span>AI/Agents:</span> agent harnesses, GCUA evaluation, benchmark design, LLaVA, Gemini API, PyTorch, TensorFlow |
      <span>Infra/Product:</span> FastAPI, React, Node.js, Docker, Linux, Git, REST APIs, CI/CD, Firebase, Vercel, Modal |
      <span>Robotics/Vision:</span> 3D perception, UAV detection, optical flow, OpenCV
    </div></section>`,
  robotics: `
    <section class="section"><div class="section-title">Skills</div><div class="skills">
      <span>Languages:</span> Python, C++, TypeScript/JavaScript, Java, Rust |
      <span>Robotics/Vision:</span> 3D perception, SLAM, UAV detection, optical flow, camera-motion compensation, OpenCV |
      <span>AI/ML:</span> agent harnesses, LLaVA, PyTorch, TensorFlow, Gemini API |
      <span>Infra:</span> FastAPI, React, Docker, Linux, Git, REST APIs, CI/CD, Firebase, Vercel, Modal
    </div></section>`,
  infra: `
    <section class="section"><div class="section-title">Skills</div><div class="skills">
      <span>Languages:</span> Python, TypeScript/JavaScript, C++, Java, Rust |
      <span>Backend/Infra:</span> FastAPI, React, Node.js, Docker, Linux, Git, REST APIs, SQL, Firebase, Vercel, Modal, CI/CD |
      <span>AI Systems:</span> agent harnesses, benchmark infrastructure, Gemini API, LLaVA, PyTorch, TensorFlow |
      <span>Vision:</span> OpenCV, optical flow, 3D perception
    </div></section>`,
  simulation: `
    <section class="section"><div class="section-title">Skills</div><div class="skills">
      <span>Languages:</span> Python, C++, TypeScript/JavaScript, Java, Rust |
      <span>Systems/Simulation:</span> distributed workflows, Linux, Git, REST APIs, performance-minded tooling, visualization, Docker, Modal |
      <span>Robotics/Vision:</span> 3D perception, SLAM, UAV detection, optical flow, OpenCV |
      <span>AI:</span> agent harnesses, PyTorch, TensorFlow, LLaVA, Gemini API
    </div></section>`
};

const categories = {
  agent: {
    filename: "agent_ai.html",
    html: `${baseStyle}${summary}${skills.agent}${education}<section class="section"><div class="section-title">Experience</div>${blocks.ludusAgent}${blocks.aleAgent}${blocks.starbotAgent}${blocks.geopogoInfra}${blocks.urapShort}${blocks.stevens}</section>${projects.agent}${publication}${awards}${footer}`
  },
  robotics: {
    filename: "robotics_autonomy.html",
    html: `${baseStyle}${summary}${skills.robotics}${education}<section class="section"><div class="section-title">Experience</div>${blocks.starbotRobotics}${blocks.urapRobotics}${blocks.ludusAgent}${blocks.aleInfra}${blocks.geopogoInfra}${blocks.stevens}</section>${projects.robotics}${publication}${awards}${footer}`
  },
  infra: {
    filename: "infra_fullstack.html",
    html: `${baseStyle}${summary}${skills.infra}${education}<section class="section"><div class="section-title">Experience</div>${blocks.ludusAgent}${blocks.geopogoFull}${blocks.aleInfra}${blocks.starbotAgent}${blocks.urapShort}${blocks.stevens}</section>${projects.infra}${publication}${awards}${footer}`
  },
  simulation: {
    filename: "simulation_systems.html",
    html: `${baseStyle}${summary}${skills.simulation}${education}<section class="section"><div class="section-title">Experience</div>${blocks.urapRobotics}${blocks.starbotRobotics}${blocks.ludusAgent}${blocks.aleInfra}${blocks.geopogoInfra}${blocks.stevens}</section>${projects.robotics}${publication}${awards}${footer}`
  }
};

const applications = [
  ["PlusAI_Software_Engineer_Intern_Data", "infra"],
  ["PlusAI_Systems_Engineer_Intern", "robotics"],
  ["PlusAI_Software_Engineer_Intern_Data_Infrastructure_and_Tools", "infra"],
  ["PlusAI_Simulation_Engineer_Intern", "simulation"],
  ["GreatQuestion_AI_Engineer_Intern", "agent"],
  ["Meshy_Data_Infra_Engineer_Intern", "infra"],
  ["BasePower_Software_Engineer_Intern", "infra"],
  ["Nash_Full_Stack_Engineer_Intern", "infra"],
  ["iHerb_Software_Development_Engineer_Intern", "infra"],
  ["Skydio_Autonomy_Engineer_Intern", "robotics"],
  ["Socure_Engineering_Intern_AI_Agents", "agent"],
  ["Kognitos_Software_Engineer_Intern_AI_Native", "agent"],
  ["Homebase_AI_Engineer_Intern", "agent"],
  ["Astera_Software_Engineer_Intern_Distributed_Simulation_Systems", "simulation"],
  ["Neuralink_Software_Engineer_Intern_Infrastructure", "infra"],
  ["Arine_AI_Engineer_Intern", "agent"],
  ["Hadrian_Software_Engineer_Intern", "infra"],
  ["AxiomaticAI_Software_Engineering_Internship_AI_Agentic_Systems", "agent"],
  ["XPENG_AI_Agent_Data_Pipeline_Intern", "agent"],
  ["PlusAI_Software_Engineer_Intern_Runtime_Robotics", "robotics"],
  ["PlusAI_Software_Engineer_Intern_Robotics", "robotics"],
  ["LiveRamp_Software_Engineer_Coop_Pixel_Serving", "infra"],
  ["WealthCom_AppliedScientist_AIML_Intern", "agent"],
  ["WealthCom_Applied_Scientist_AIML_Intern", "agent"],
  ["Nuro_Vehicle_Reliability_Intern", "robotics"],
  ["FSG_AI_Automation_Intern", "agent"],
  ["Axway_Business_Analytics_Intern", "infra"],
  ["Axway_Software_Engineering_Intern", "infra"],
  ["Cotiviti_Data_Analytics_Intern", "agent"],
  ["Cotiviti_Agentic_AI_Neural_Symbolic_Intern", "agent"],
  ["Cotiviti_Generative_AI_Agentic_AI_Research_Intern", "agent"],
  ["StateStreet_Agentic_Automation_Intern", "agent"],
  ["Maersk_Artificial_Intelligence_Intern", "agent"],
  ["Bosch_Engine_Vehicle_Embedded_Controls_Intern", "robotics"],
  ["Kira_SWE_Intern_SF", "agent"],
  ["Kira_SWE_Intern_NYC", "agent"],
  ["Kira_Software_Engineering_Intern_SF", "agent"],
  ["Kira_Software_Engineering_Intern_NYC", "agent"],
  ["VitalLyfe_Software_Engineering_Internship", "infra"],
  ["LiveRamp_Data_Science_Intern", "agent"]
];

await mkdir(buildDir, { recursive: true });
await mkdir(appsDir, { recursive: true });

const pdfByCategory = {};
for (const [category, spec] of Object.entries(categories)) {
  const htmlPath = join(buildDir, spec.filename);
  const pdfPath = join(buildDir, `${category}.pdf`);
  await writeFile(htmlPath, spec.html, "utf8");
  const result = spawnSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href
  ], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`Chrome PDF export failed for ${category}: ${result.stderr || result.stdout}`);
  }
  pdfByCategory[category] = pdfPath;
}

for (const [folder, category] of applications) {
  const destDir = join(appsDir, folder);
  await mkdir(destDir, { recursive: true });
  await copyFile(pdfByCategory[category], join(destDir, "Yuanbo_Pang_Resume.pdf"));
}

const trackerPath = join(root, "job_applications.md");
let tracker = await readFile(trackerPath, "utf8");
const replacements = new Map([
  ["tailored_resumes/Yuanbo_Pang_PlusAI_Data_Resume.pdf", "applications/PlusAI_Software_Engineer_Intern_Data/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_PlusAI_Systems_Resume.pdf", "applications/PlusAI_Systems_Engineer_Intern/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_PlusAI_DataInfra_Resume.pdf", "applications/PlusAI_Software_Engineer_Intern_Data_Infrastructure_and_Tools/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_PlusAI_Simulation_Resume.pdf", "applications/PlusAI_Simulation_Engineer_Intern/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_GreatQuestion_AI_Resume.pdf", "applications/GreatQuestion_AI_Engineer_Intern/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_Meshy_DataInfra_Resume.pdf", "applications/Meshy_Data_Infra_Engineer_Intern/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_BasePower_SWE_Resume.pdf", "applications/BasePower_Software_Engineer_Intern/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_Nash_FullStack_Resume.pdf", "applications/Nash_Full_Stack_Engineer_Intern/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_iHerb_SDE_Resume.pdf", "applications/iHerb_Software_Development_Engineer_Intern/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_Skydio_Autonomy_Resume.pdf", "applications/Skydio_Autonomy_Engineer_Intern/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_Socure_AIAgents_Resume.pdf", "applications/Socure_Engineering_Intern_AI_Agents/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_Kognitos_AINative_Resume.pdf", "applications/Kognitos_Software_Engineer_Intern_AI_Native/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_Homebase_AI_Resume.pdf", "applications/Homebase_AI_Engineer_Intern/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_Astera_Simulation_Resume.pdf", "applications/Astera_Software_Engineer_Intern_Distributed_Simulation_Systems/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_Neuralink_Infrastructure_Resume.pdf", "applications/Neuralink_Software_Engineer_Intern_Infrastructure/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_Arine_AI_Resume.pdf", "applications/Arine_AI_Engineer_Intern/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_Hadrian_SWE_Resume.pdf", "applications/Hadrian_Software_Engineer_Intern/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_AxiomaticAI_AgenticSystems_Resume.pdf", "applications/AxiomaticAI_Software_Engineering_Internship_AI_Agentic_Systems/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_XPENG_AgentPipeline_Resume.pdf", "applications/XPENG_AI_Agent_Data_Pipeline_Intern/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_PlusAI_RuntimeRobotics_Resume.pdf", "applications/PlusAI_Software_Engineer_Intern_Runtime_Robotics/Yuanbo_Pang_Resume.pdf"],
  ["tailored_resumes/Yuanbo_Pang_PlusAI_Robotics_Resume.pdf", "applications/PlusAI_Software_Engineer_Intern_Robotics/Yuanbo_Pang_Resume.pdf"]
]);
for (const [from, to] of replacements) {
  tracker = tracker.split(from).join(to);
}
await writeFile(trackerPath, tracker, "utf8");

console.log(`Generated ${Object.keys(categories).length} category PDFs and ${applications.length} application folders.`);
