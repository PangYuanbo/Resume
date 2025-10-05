"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, Database, Cloud, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function Skills() {
  const skillCategories = [
    {
      icon: Code2,
      title: "Programming Languages",
      skills: ["Python", "C++", "Java", "TypeScript", "Swift", "JavaScript"],
      color: "text-blue-500",
    },
    {
      icon: Cpu,
      title: "Machine Learning & AI",
      skills: [
        "PyTorch",
        "TensorFlow",
        "scikit-learn",
        "OpenAI API",
        "Computer Vision",
        "NLP",
      ],
      color: "text-purple-500",
    },
    {
      icon: Database,
      title: "Backend & Databases",
      skills: [
        "FastAPI",
        "Node.js",
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "GraphQL",
      ],
      color: "text-green-500",
    },
    {
      icon: Cloud,
      title: "Frontend & Cloud",
      skills: [
        "React",
        "Next.js",
        "Tailwind CSS",
        "AWS",
        "Docker",
        "Vercel",
      ],
      color: "text-orange-500",
    },
  ];

  const expertise = [
    "Federated Learning",
    "Differential Privacy",
    "Deep Learning",
    "Data Science",
    "Full-Stack Development",
    "System Design",
    "API Development",
    "Cloud Architecture",
  ];

  return (
    <section id="skills" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Skills & Technologies
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            A comprehensive toolkit for building intelligent systems
          </p>
        </motion.div>

        {/* Skill Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 ${category.color}`}
                    >
                      <category.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{category.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Areas of Expertise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-center">
                Areas of Expertise
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {expertise.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Badge
                      variant="outline"
                      className="text-base py-2 px-4 hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                    >
                      {item}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-muted-foreground">
            Continuously learning and adapting to new technologies and research
            methodologies
          </p>
        </motion.div>
      </div>
    </section>
  );
}
