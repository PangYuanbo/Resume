"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface ExperienceItem {
  title: string;
  award: string | null;
  location: string;
  date: string;
  highlights: string[];
  tags: string[];
  demoUrl?: string;
  repoUrl?: string;
  backendUrl?: string;
  devpostUrl?: string;
}

export default function Experience() {
  const experiences: ExperienceItem[] = [
    {
      title: "Full-Stack Engineer",
      award: null,
      location: "Ludus",
      date: "Apr 2026 – Present",
      highlights: [
        "Building an outcome-first marketplace for AI agent work: multiple agents execute the same task in parallel, and users pay only for the result they keep.",
        "Integrated 9 task agents and growing — Claude Code, Codex CLI, GitHub Copilot, Gemini CLI, Hermes, Factory Droid, Forge (Claude/Codex modes), and Perplexity Agent.",
        "Designed full stack: React/TypeScript frontend on Cloudflare, Node.js/Hono backend on Railway, Neon Postgres, Docker-based agent execution on VM nodes with remote dispatch.",
      ],
      tags: ["AI Agents", "Marketplace", "TypeScript", "Hono", "Postgres", "Cloudflare"],
      demoUrl: "https://ludus.ai",
    },
    {
      title: "Engineering Co-Lead — Agent's Last Exam (ALE)",
      award: "NeurIPS 2026 submission · co-first author",
      location: "UC Berkeley BAIR · Advised by Prof. Dawn Song",
      date: "Jan 2026 – Present",
      highlights: [
        "Co-first author on a NeurIPS 2026 benchmark evaluating whether AI agents can deliver production-grade economic value across 90%+ of non-physical industries.",
        "As the primary builder, filtered ~1,000 noisy expert-submitted tasks to ~300 by orchestrating parallel agents alongside my own review.",
        "Engineered each surviving task into a standardized, execution-ready benchmark under a unified evaluation architecture covering 55 sub-fields across 13 industry clusters.",
      ],
      tags: ["Benchmark", "AI Agent Evaluation", "Research", "NeurIPS 2026"],
    },
    {
      title: "Software Engineering Intern",
      award: null,
      location: "Geopogo",
      date: "Sep 2025 – Dec 2025",
      highlights: [
        "Sole engineer on an AI architectural rendering platform shipped to production.",
        "Built end-to-end: Google Gemini API integration, RunwayML text-to-video pipeline, React/TypeScript frontend, FastAPI backend, Firebase auth, Vercel CI/CD.",
        "Designed responsive chat interface with drag-and-drop image upload, real-time previews, and credit-based subscription system.",
      ],
      tags: ["React", "TypeScript", "Gemini API", "RunwayML", "Firebase", "FastAPI", "Vercel"],
      demoUrl: "https://geopogo.com/AI/geopogoAIPage",
    },
    {
      title: "Independent Project — Context8",
      award: null,
      location: "context8.org",
      date: "Oct 2025 – Jan 2026",
      highlights: [
        "Built solo: a self-evolving Stack Overflow for AI agents. A community vote/feedback loop turns one agent's solved bug into reusable knowledge for all agents.",
        "Two months after shipping, Andrew Ng's Context Hub and Evomap launched in adjacent directions, validating the underlying thesis that agents need persistent, shared experience.",
      ],
      tags: ["AI Agents", "Knowledge Network", "Solo Project"],
      demoUrl: "https://context8.org",
    },
    {
      title: "Research Intern",
      award: null,
      location: "Prof. Hao Wang Lab · Stevens Institute of Technology",
      date: "Jun 2024 – Feb 2026",
      highlights: [
        "Investigated personalized federated learning systems with differential privacy guarantees.",
        "Implemented training pipelines in PyTorch and TensorFlow, focusing on protecting local data while accelerating on-device model personalization.",
      ],
      tags: ["Federated Learning", "Differential Privacy", "PyTorch", "TensorFlow", "Research"],
    },
    {
      title: "Student Ambassador",
      award: null,
      location: "Fetch.ai Innovation Lab",
      date: "Sep 2024 – Oct 2025",
      highlights: [
        "Mentored 20+ teams at CalHack 11.0 (UC Berkeley) and SF Hacks on full-stack and agent development.",
        "Scouted early-stage startups at Bay Area Founders Club demo summits (5,000+ startups, 1,000+ VCs) on behalf of Fetch.ai; reported shortlists to the Innovation Lab lead for investment follow-up.",
      ],
      tags: ["AI Agents", "Mentorship", "Deal Sourcing"],
    },
    {
      title: "AI Mario Level Generator",
      award: "Modal Sponsor Prize — HackMIT 2025",
      location: "Cambridge, MA",
      date: "Sep 2025",
      highlights: [
        "Built a sketch-to-playable-level pipeline: LLaVA 1.5 for sketch interpretation, OpenCV for layout extraction, H100 GPU inference on Modal.",
        "FastAPI backend + React frontend; live demo available.",
      ],
      tags: ["Computer Vision", "LLaVA", "Modal", "FastAPI", "Game Dev"],
      demoUrl: "https://mario-hackmit.vercel.app",
    },
    {
      title: "Stud.ai",
      award: "\"Smartest AI Agent\" Award — HackMIT 2024",
      location: "Cambridge, MA",
      date: "Sep 2024",
      highlights: [
        "Chrome extension + AI agent that turns assignment rubrics into step-by-step timelines and auto-schedules work blocks on students' calendars.",
        "FastAPI backend with uAgents framework for autonomous task handling.",
      ],
      tags: ["AI Agents", "Chrome Extension", "FastAPI", "uAgents"],
      repoUrl: "https://github.com/andyjphu/studai-teacher-extension",
      backendUrl: "https://github.com/PangYuanbo/MITHACK_Agent",
    },
    {
      title: "GetResearch",
      award: "Best Use of .Tech Domain — HackDavis 2024",
      location: "Davis, CA",
      date: "Apr 2024",
      highlights: [
        "Platform connecting students with research opportunities and professors, with real-time project listings and a streamlined application flow.",
        "PropelAuth + PostgreSQL, FastAPI backend, React frontend, deployed on AWS.",
      ],
      tags: ["React", "FastAPI", "PostgreSQL", "AWS"],
      demoUrl: "https://getresearch.tech",
      repoUrl: "https://github.com/AGDholo/hack-davis",
      devpostUrl: "https://devpost.com/software/getresearch",
    },
  ];

  return (
    <section id="experience" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Experience
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Research, building, and selected awarded projects.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <motion.div
                key={`${exp.title}-${exp.date}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg dark:hover:shadow-white/5 transition-all duration-300 dark:border-white/10 dark:hover:border-white/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{exp.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {exp.location}
                        </p>
                        {exp.award && (
                          <div className="flex items-start gap-2 mb-2">
                            <Trophy className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-500">
                              {exp.award}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                        <Calendar className="h-4 w-4" />
                        <span>{exp.date}</span>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-4">
                      {exp.highlights.map((highlight, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-primary mt-1.5">•</span>
                          <span className="flex-1">{highlight}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap items-center gap-2">
                      {exp.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                      <div className="ml-auto flex flex-wrap gap-2">
                        {exp.demoUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a
                              href={exp.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Live
                            </a>
                          </Button>
                        )}
                        {exp.repoUrl && (
                          <Button size="sm" variant="ghost" asChild>
                            <a
                              href={exp.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Frontend
                            </a>
                          </Button>
                        )}
                        {exp.backendUrl && (
                          <Button size="sm" variant="ghost" asChild>
                            <a
                              href={exp.backendUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Backend
                            </a>
                          </Button>
                        )}
                        {exp.devpostUrl && (
                          <Button size="sm" variant="ghost" asChild>
                            <a
                              href={exp.devpostUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Devpost
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
