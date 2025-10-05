"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Github, Linkedin, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  const contactMethods = [
    {
      icon: Mail,
      label: "Email",
      value: "yuanbopang@gmail.com",
      href: "mailto:yuanbopang@gmail.com",
      color: "text-blue-500",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+1 (408) 460-7526",
      href: "tel:+14084607526",
      color: "text-green-500",
    },
    {
      icon: Github,
      label: "GitHub",
      value: "@PangYuanbo",
      href: "https://github.com/PangYuanbo",
      color: "text-gray-700 dark:text-gray-300",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      value: "YuanboPang",
      href: "https://www.linkedin.com/in/yuanbopang/",
      color: "text-blue-600",
    },
  ];

  return (
    <section id="contact" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Get In Touch
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            I&apos;m always open to discussing new opportunities, research
            collaborations, or interesting projects. Feel free to reach out!
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all group">
                  <CardContent className="p-6">
                    <a
                      href={method.href}
                      target={
                        method.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        method.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="flex items-center gap-4"
                    >
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 ${method.color} group-hover:scale-110 transition-transform`}
                      >
                        <method.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {method.label}
                        </p>
                        <p className="font-semibold group-hover:text-primary transition-colors">
                          {method.value}
                        </p>
                      </div>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">
                  Let&apos;s Build Something Amazing
                </h3>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Whether you&apos;re looking for a research collaborator, a
                  full-stack developer, or someone passionate about AI and
                  privacy-preserving technologies, I&apos;d love to hear from
                  you.
                </p>
                <Button size="lg" asChild>
                  <a href="mailto:yuanbopang@gmail.com">
                    <Mail className="mr-2 h-5 w-5" />
                    Send Me an Email
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
