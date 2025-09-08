import "./global.css";

import { useEffect, useState } from "react";
import { Sun, Moon, Sparkles, Phone, User, Linkedin, Github, Instagram, Twitter } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-dvh flex flex-col">
          <SiteHeader />
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SiteFooter />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-background via-card to-background border-b border-primary/20 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-2xl shadow-primary/10">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
      <div className="container relative h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 font-bold tracking-tight text-xl group">
          <div className="relative">
            <span className="inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary via-secondary to-accent text-white shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-110">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-extrabold">
            HackDev
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <a href="#winners-heading" className="relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary rounded-lg hover:bg-primary/10 transition-all duration-200 hover:shadow-md hover:shadow-primary/20 group">
            <span className="relative z-10">Winners</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-300"></div>
          </a>
          <a href="#ideas-heading" className="relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary rounded-lg hover:bg-primary/10 transition-all duration-200 hover:shadow-md hover:shadow-primary/20 group">
            <span className="relative z-10">Ideas</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-300"></div>
          </a>
          <a href="#tools-list" className="relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary rounded-lg hover:bg-primary/10 transition-all duration-200 hover:shadow-md hover:shadow-primary/20 group">
            <span className="relative z-10">Tools</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-300"></div>
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="relative mt-auto border-t border-primary/10 bg-gradient-to-r from-background/80 to-card/40 backdrop-blur-sm">
      <div className="container py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side - Brand and description */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                HackDev
              </span>
            </div>
            <div className="hidden md:block w-px h-6 bg-primary/20"></div>
            <p className="text-sm text-muted-foreground hidden md:block">
              AI-powered hackathon intelligence
            </p>
          </div>

          {/* Center - Contact Developer */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">Fatir Armaan</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <a
                href="https://fatir-s-portfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors font-medium hover:underline"
              >
                Portfolio
              </a>
            </div>
          </div>

          {/* Right side - Social links */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden md:block mr-2">Connect:</span>
            <div className="flex gap-2">
              <a
                href="https://www.linkedin.com/in/syed-fatir-armaan-967320224"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-blue-600/10 hover:bg-blue-600/20 flex items-center justify-center transition-all duration-200 hover:scale-110"
                title="LinkedIn"
              >
                <Linkedin className="h-4 w-4 text-blue-600" />
              </a>
              <a
                href="https://github.com/Fatir227"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-700/10 hover:bg-gray-700/20 flex items-center justify-center transition-all duration-200 hover:scale-110"
                title="GitHub"
              >
                <Github className="h-4 w-4 text-gray-700" />
              </a>
              <a
                href="https://instagram.com/fatir_armaan"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-pink-500/10 hover:bg-pink-500/20 flex items-center justify-center transition-all duration-200 hover:scale-110"
                title="Instagram"
              >
                <Instagram className="h-4 w-4 text-pink-500" />
              </a>
              <a
                href="https://twitter.com/Armaan_227"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-600/10 hover:bg-slate-600/20 flex items-center justify-center transition-all duration-200 hover:scale-110"
                title="X (Twitter)"
              >
                <Twitter className="h-4 w-4 text-slate-600" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-4 pt-4 border-t border-primary/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} HackDev. Built with modern web technologies.</p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
              <span>Always innovating</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
