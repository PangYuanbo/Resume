"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, FlaskConical, Hammer, BookOpen, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  const highlights = [
    {
      icon: GraduationCap,
      title: "Education",
      description:
        "UC Berkeley EECS (transferred 2025) · Stanford CS 229 · 4.0 GPA at De Anza & Foothill",
    },
    {
      icon: FlaskConical,
      title: "Research",
      description:
        "Agent evaluation at UC Berkeley BAIR (Prof. Dawn Song); federated learning at Stevens Institute (Prof. Hao Wang)",
    },
    {
      icon: Hammer,
      title: "Building",
      description:
        "Ludus — AI agent marketplace (Co-Founder & CTO); Context8 — agent knowledge network",
    },
  ];

  const coursework = [
    { code: "CS 61B", name: "Data Structures (UC Berkeley)" },
    { code: "CS 70", name: "Discrete Mathematics & Probability Theory (UC Berkeley)" },
    { code: "EECS 16A", name: "Designing Information Devices and Systems I (UC Berkeley)" },
    { code: "CS 229", name: "Machine Learning (Stanford, Summer 2025)" },
  ];

  return (
    <section id="about" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            About
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Research and building at the intersection of AI agents, evaluation,
            and infrastructure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg dark:hover:shadow-white/5 transition-all duration-300 dark:border-white/10 dark:hover:border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 dark:bg-blue-500/10 mb-4">
                    <item.icon className="h-6 w-6 text-primary dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Card className="dark:border-white/10">
            <CardContent className="p-8">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed">
                  I&apos;m a junior at <strong>UC Berkeley EECS</strong>,
                  studying how AI agents can deliver production-grade economic
                  value and building the infrastructure that evaluates and
                  routes them. I transferred into Berkeley in 2025 from{" "}
                  <strong>De Anza &amp; Foothill</strong> with a 4.0 GPA, and
                  previously took CS 229 (Machine Learning) at{" "}
                  <strong>Stanford</strong> in Summer 2025.
                </p>
                <p className="text-lg leading-relaxed mt-4">
                  My current research is at{" "}
                  <strong>UC Berkeley BAIR</strong>, where I serve as
                  Engineering Co-Lead and co-first author on{" "}
                  <strong>Agent&apos;s Last Exam (ALE)</strong> — a NeurIPS 2026
                  benchmark advised by <strong>Prof. Dawn Song</strong> that
                  evaluates AI agents across 90%+ of non-physical industries.
                  Earlier, I worked on personalized federated learning and
                  differential privacy with{" "}
                  <strong>Prof. Hao Wang</strong> at Stevens Institute of
                  Technology.
                </p>
                <p className="text-lg leading-relaxed mt-4">
                  Outside of research, I&apos;m Co-Founder &amp; CTO of{" "}
                  <strong>Ludus</strong>, an outcome-first marketplace where
                  multiple AI agents execute the same task in parallel and users
                  pay only for the result they keep. I also independently built{" "}
                  <strong>Context8</strong> (Oct 2025 – Jan 2026), a
                  self-evolving knowledge network for AI agents.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Selected Publication */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <Card className="dark:border-white/10 border-l-4 border-l-primary dark:border-l-blue-400">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 dark:bg-blue-500/10">
                  <FileText className="h-5 w-5 text-primary dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold">Selected Publication</h3>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  Agent&apos;s Last Exam (ALE): A Benchmark for Production-Grade
                  AI Agent Evaluation
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Yuanbo Pang</strong> (co-first author), et al.
                  Submitted to <em>NeurIPS 2026</em>, Datasets and Benchmarks
                  Track. Advised by Prof. Dawn Song, UC Berkeley BAIR.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed pt-2">
                  ALE is a benchmark of 1,000+ real-world tasks across 55
                  sub-fields and 13 industry clusters, contributed by 300+
                  industry experts. As the primary builder, I filtered the noisy
                  expert submissions down to ~300 tasks using parallel agents,
                  then engineered each into a standardized, execution-ready
                  benchmark under a unified evaluation architecture covering
                  90%+ of non-physical industries.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Coursework Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <Card className="dark:border-white/10">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 dark:bg-blue-500/10">
                  <BookOpen className="h-5 w-5 text-primary dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold">Selected Coursework</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coursework.map((course, index) => (
                  <motion.div
                    key={course.code}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <Badge
                      variant="outline"
                      className="shrink-0 mt-1 dark:border-white/20 dark:text-blue-400"
                    >
                      {course.code}
                    </Badge>
                    <p className="text-muted-foreground">{course.name}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
