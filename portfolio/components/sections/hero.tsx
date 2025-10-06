"use client";

import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, ArrowDown, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30" />
        <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.03]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                Yuanbo Pang
              </span>
            </h1>
          </motion.div>

          {/* Animated Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-muted-foreground mb-4">
              UC Berkeley EECS Student
            </h2>
          </motion.div>

          {/* Animated Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Research Intern at Stevens Institute of Technology, specializing in{" "}
              <span className="text-foreground font-semibold">
                Federated Learning
              </span>{" "}
              and{" "}
              <span className="text-foreground font-semibold">
                Privacy-Preserving AI
              </span>
            </p>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <Button
              size="lg"
              variant="default"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 dark:shadow-lg dark:shadow-blue-500/20"
              asChild
            >
              <a
                href="/Yuanbo_Pang_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                View Resume
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group dark:border-white/20 dark:hover:border-white/30 dark:hover:bg-white/5"
              asChild
            >
              <a
                href="https://github.com/PangYuanbo"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                GitHub
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group dark:border-white/20 dark:hover:border-white/30 dark:hover:bg-white/5"
              asChild
            >
              <a
                href="https://www.linkedin.com/in/yuanbopang/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                LinkedIn
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group dark:border-white/20 dark:hover:border-white/30 dark:hover:bg-white/5"
              asChild
            >
              <a href="mailto:yuanbopang@gmail.com">
                <Mail className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Email
              </a>
            </Button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex justify-center"
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full animate-bounce"
              onClick={() => scrollToSection("about")}
            >
              <ArrowDown className="h-6 w-6" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
