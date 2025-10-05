"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function Experience() {
  const experiences = [
    {
      title: "AI-Powered Mario Level Generator",
      award: "Modal Sponsor Prize - HackMIT 2025",
      location: "Cambridge, MA",
      date: "Sep 2025",
      highlights: [
        "Won Modal Sponsor Prize at HackMIT 2025",
        "Built end-to-end system transforming hand-drawn sketches into playable Mario levels",
        "Integrated LLaVA 1.5, OpenCV, and H100 GPU inference on Modal cloud platform",
        "Deployed FastAPI backend and React frontend with real-time game generation",
      ],
      tags: ["Computer Vision", "LLaVA", "Modal", "FastAPI", "Game Dev"],
      demoUrl: "https://frontend-ui-alpha-one.vercel.app",
    },
    {
      title: "Stud.ai",
      award: "Smartest AI Agent - HackMIT 2024",
      location: "Cambridge, MA",
      date: "Sep 2024",
      highlights: [
        "Won [Smartest AI Agent] at HackMIT 2024",
        "Built Chrome extension and AI agent system for intelligent assignment management",
        "Streamlined assignment completion by generating step-by-step timelines",
        "Automatically scheduled work periods in students' available calendar slots",
        "Integrated FastAPI backend with uAgents framework for autonomous task handling",
      ],
      tags: ["AI Agents", "Chrome Extension", "FastAPI", "Automation", "uAgents"],
      repoUrl: "https://github.com/andyjphu/studai-teacher-extension",
      backendUrl: "https://github.com/PangYuanbo/MITHACK_Agent",
    },
    {
      title: "Robotic-Arm Project",
      award: null,
      location: "Engineering Club, Foothill College",
      date: "Apr - Jul 2024",
      highlights: [
        "Developed end-to-end chess piece recognition and control system using UR10 robot",
        "Implemented ResNet-50 for piece detection",
        "Utilized Azure Kinect SDK for image processing",
      ],
      tags: ["Computer Vision", "Robotics", "Deep Learning"],
    },
    {
      title: "Golden Groceries",
      award: null,
      location: "Berkeley, CA",
      date: "Jun 2024",
      highlights: [
        "Team Project | Team Leader",
        "Created system for seniors to track nutrient intake from food photos",
        "Integrated ChatGPT for data analysis and You.com for real-time searches",
      ],
      tags: ["Healthcare", "AI", "Full-Stack"],
    },
    {
      title: "GetResearch",
      award: "Best Use of .Tech Domain Name - HackDavis 2024",
      location: "Davis, CA",
      date: "Apr 2024",
      highlights: [
        "Won [Best Use of .Tech Domain Name] at HackDavis 2024",
        "Built platform connecting students with research opportunities and professors",
        "Implemented real-time project listings and streamlined application process",
        "Integrated PropelAuth authentication with PostgreSQL database",
        "Deployed full-stack application on AWS with FastAPI backend and React frontend",
      ],
      tags: ["React", "FastAPI", "PostgreSQL", "PropelAuth", "AWS", ".NET Core"],
      demoUrl: "https://getresearch.tech",
      repoUrl: "https://github.com/AGDholo/hack-davis",
      backendUrl: "https://github.com/AGDholo/hack-davis-api",
      devpostUrl: "https://devpost.com/software/getresearch",
    },
    {
      title: "ClearSight",
      award: "Hack for Financial Transparency - Hack for Impact 2024",
      location: "Berkeley, CA",
      date: "Feb 2024",
      highlights: [
        "Won [Hack for Financial Transparency] award",
        "Developed financial transparency tool with real-time HCB API data",
        "Created intuitive, customizable dashboard with advanced visualization",
      ],
      tags: ["FinTech", "Data Visualization", "APIs"],
    },
    {
      title: "SlugHug",
      award: "Health Hack Second Place + Sponsor - Axure - CruzHacks 2024",
      location: "Santa Cruz, CA",
      date: "Jan 2024",
      highlights: [
        "Won [Health Hack Second Place] and [Sponsor - Axure] at CruzHacks 2024",
        "Built anonymous mental health platform for fleeting therapeutic messages",
        "Integrated MERN stack with Auth0 authentication and MongoDB database",
        "Implemented AI sentiment analysis to flag inappropriate content",
        "Designed playful UI with bubbly character theme using Axure RP 10",
      ],
      tags: ["React", "MongoDB", "Auth0", "MERN Stack", "UI/UX", "AI"],
      demoUrl: "https://slughug.us/",
      repoUrl: "https://github.com/marcus-leung/SlugHug",
      devpostUrl: "https://devpost.com/software/slughug",
    },
    {
      title: "AI-Enhanced Classroom Assistant",
      award: "Best API - De Anza Hack 2.0",
      location: "Cupertino, CA",
      date: "Oct 2023",
      highlights: [
        "Won [Best API] at De Anza Hack 2.0",
        "Integrated AI as teaching assistant for improved learning efficiency",
        "Used Vosk speech recognition and OpenAI API for real-time analysis",
      ],
      tags: ["AI", "Speech Recognition", "OpenAI", "Education"],
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
            Academic Experience
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Award-winning hackathon projects and research initiatives
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-shadow">
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
                        {"demoUrl" in exp && exp.demoUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <a
                              href={exp.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Live Demo
                            </a>
                          </Button>
                        )}
                        {"repoUrl" in exp && exp.repoUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                          >
                            <a
                              href={exp.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Frontend
                            </a>
                          </Button>
                        )}
                        {"backendUrl" in exp && exp.backendUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                          >
                            <a
                              href={exp.backendUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Backend
                            </a>
                          </Button>
                        )}
                        {"devpostUrl" in exp && exp.devpostUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                          >
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
