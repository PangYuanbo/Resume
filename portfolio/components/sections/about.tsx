"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Briefcase, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  const highlights = [
    {
      icon: GraduationCap,
      title: "Education",
      description: "UC Berkeley EECS + Physics Minor • Stanford ML • 4.0 GPA",
    },
    {
      icon: Briefcase,
      title: "Research",
      description: "Stevens Institute • Federated Learning & Privacy",
    },
    {
      icon: Award,
      title: "Achievements",
      description: "HackMIT Winner • 5+ Hackathon Awards",
    },
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
            About Me
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Passionate about advancing AI research and building innovative
            solutions
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
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
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
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed">
                  I&apos;m currently pursuing a Bachelor of Science in{" "}
                  <strong>Electrical Engineering and Computer Sciences</strong>{" "}
                  with a <strong>Physics minor</strong> at UC Berkeley, with a
                  focus on machine learning and artificial intelligence. My
                  research at Stevens Institute of Technology centers on{" "}
                  <strong>personalized federated learning</strong> and{" "}
                  <strong>differential privacy</strong>, working to protect
                  local data while enhancing model performance.
                </p>
                <p className="text-lg leading-relaxed mt-4">
                  As a <strong>Student Ambassador</strong> for Fetch.AI, I
                  mentor teams at major hackathons like CalHack 11.0 and SF
                  Hacks, sharing my passion for AI and full-stack development.
                  I&apos;ve won awards at HackMIT, HackDavis, and other
                  competitions, building everything from AI-powered classroom
                  assistants to financial transparency tools.
                </p>
                <p className="text-lg leading-relaxed mt-4">
                  Beyond academics, I&apos;m committed to making technology
                  accessible and impactful. Whether it&apos;s through research,
                  hackathons, or open-source contributions, I strive to create
                  solutions that matter.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
