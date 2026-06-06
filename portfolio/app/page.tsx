import Navbar from "@/components/navbar";
import Hero from "@/components/sections/hero";
import About from "@/components/sections/about";
import Projects from "@/components/sections/projects";
import Experience from "@/components/sections/experience";
import Skills from "@/components/sections/skills";
import Contact from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        <div className="container mx-auto px-4">
          <p>
            &copy; {new Date().getFullYear()} Yuanbo Pang. All rights reserved.
          </p>
          <p className="mt-2">
            Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui
          </p>
        </div>
      </footer>
    </>
  );
}
