"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface Project {
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  url?: string;
}

const projects: Project[] = [
  {
    title: "Ludus",
    subtitle: "AI agent marketplace",
    description:
      "Outcome-first marketplace where multiple coding and research agents execute the same task in parallel, with users paying only for accepted results.",
    tags: ["AI Agents", "React", "Hono", "Postgres", "Docker", "VM Dispatch"],
    url: "https://ludus.ai",
  },
  {
    title: "Context8",
    subtitle: "Agent knowledge system",
    description:
      "Self-evolving Stack Overflow for AI agents where community votes and feedback turn one agent's solved bug into reusable knowledge for future agents.",
    tags: ["AI Agents", "Knowledge Network", "Full Stack"],
    url: "https://context8.org",
  },
  {
    title: "Agent's Last Exam",
    subtitle: "NeurIPS 2026 benchmark submission",
    description:
      "Benchmark infrastructure for long-horizon AI agent workflows across 55 sub-fields and 13 industry clusters, built with executable task harnesses and deliverable-based scoring.",
    tags: ["Benchmark", "Evaluation", "Agent Harnesses", "VM Workflows"],
  },
  {
    title: "AI Mario Level Generator",
    subtitle: "HackMIT 2025 Modal Sponsor Prize",
    description:
      "Sketch-to-playable-level pipeline using LLaVA 1.5, H100 GPU inference on Modal, OpenCV layout extraction, FastAPI, and React.",
    tags: ["Computer Vision", "LLaVA", "Modal", "FastAPI", "React"],
    url: "https://mario-hackmit.vercel.app",
  },
  {
    title: "UAV Perception Research",
    subtitle: "UC Berkeley small-object detection",
    description:
      "Benchmarked UAV detection methods against 1,600 manually annotated DJI frames and evaluated optical-flow/background-compensation pipelines for low-false-positive tracking.",
    tags: ["Robotics", "UAV Detection", "Optical Flow", "OpenCV"],
  },
  {
    title: "Geopogo AI Rendering",
    subtitle: "Production AI rendering platform",
    description:
      "Production architectural rendering platform integrating Gemini image reasoning, RunwayML text-to-video workflows, Firebase auth, and Vercel CI/CD.",
    tags: ["React", "FastAPI", "Gemini API", "RunwayML", "CI/CD"],
    url: "https://geopogo.com/AI/geopogoAIPage",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Featured Projects
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Recent work across AI agent infrastructure, production full-stack
            systems, and robotics perception.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <Card className="h-full flex flex-col hover:shadow-xl dark:hover:shadow-white/5 transition-all duration-300 dark:border-white/10 dark:hover:border-white/20">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.subtitle}
                      </p>
                    </div>
                    {project.url && (
                      <Button size="icon" variant="ghost" className="shrink-0" asChild>
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${project.title}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground mb-5 flex-1">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" variant="outline" asChild>
            <a
              href="https://github.com/PangYuanbo"
              target="_blank"
              rel="noopener noreferrer"
            >
              View GitHub
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
