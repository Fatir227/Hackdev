import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { IdeasResponse, WinnersResponse, IdeaItem, WinnerProject } from "@shared/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Mic, Upload, Plus, Github, Shield, Bot, Brain, Database as DatabaseIcon, Workflow, Cloud, Cpu, Coins, Book, Lock, Bug, Radar, Globe, CircuitBoard, BarChart3, Network, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
export default function Index() {
  const [query, setQuery] = useState("");
  const [visibleIdeas, setVisibleIdeas] = useState(10);

  const winners = useQuery<WinnersResponse>({
    queryKey: ["winners"],
    queryFn: async () => {
      const r = await fetch("/api/winners");
      if (!r.ok) throw new Error("Failed to load winners");
      return (await r.json()) as WinnersResponse;
    },
    staleTime: 5 * 60 * 1000,
  });

  const ideas = useMutation<IdeasResponse, Error, string>({
    mutationFn: async (q: string) => {
      const r = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (!r.ok) throw new Error("Failed to generate ideas");
      return (await r.json()) as IdeasResponse;
    },
  });

  const projects = winners.data?.projects ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/30 to-background">
      <Hero
        query={query}
        onChange={setQuery}
        onSubmit={() => query.trim() && ideas.mutate(query.trim())}
        loading={ideas.isPending}
      />

      <main className="container py-8 space-y-10">
        <section aria-labelledby="ideas-heading" className="space-y-4">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h2 id="ideas-heading" className="text-2xl font-bold tracking-tight">AI suggestions</h2>
              <p className="text-muted-foreground">Describe your theme, domain, or constraints. I\'ll propose weekend-ready hackathon projects with stacks and tools.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setQuery(examplePrompts[Math.floor(Math.random()*examplePrompts.length)])}>Random prompt</Button>
              <Button onClick={() => query.trim() && ideas.mutate(query.trim())}>Generate</Button>
            </div>
          </div>

          <DomainChips onPick={(p) => { setQuery(p); ideas.mutate(p); }} />
          <TemplatesStrip />

          {ideas.isIdle && (
            <TryIdeas onPick={(p) => { setQuery(p); ideas.mutate(p); }} />
          )}

          {ideas.isPending && (
            <div className="grid md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {ideas.isSuccess && ideas.data.ideas.length > 0 && (
            <IdeaList ideas={ideas.data.ideas} provider={ideas.data.provider} />
          )}
        </section>

        <section aria-labelledby="winners-heading" className="space-y-4">
          <div>
            <h2 id="winners-heading" className="text-2xl font-bold tracking-tight">100 hackathon AI project ideas</h2>
            <p className="text-muted-foreground">Transcribed from your screenshots. Each card links to a GitHub search.</p>
          </div>

          <WinnersGrid projects={curatedProjects.slice(0, visibleIdeas)} />
          <div className="flex justify-center pt-2">
            {visibleIdeas < curatedProjects.length ? (
              <Button variant="secondary" onClick={() => setVisibleIdeas((v) => Math.min(v + 10, curatedProjects.length))}>Show more</Button>
            ) : (
              <Button variant="outline" onClick={() => setVisibleIdeas(10)}>Show less</Button>
            )}
          </div>
        </section>

        <section id="tools-list" aria-labelledby="tools-heading" className="space-y-4">
          <div>
            <h2 id="tools-heading" className="text-2xl font-bold tracking-tight">Tools library</h2>
            <p className="text-muted-foreground">Explore stacks, frameworks, databases, and no-code platforms.</p>
          </div>
          <ToolsList />
        </section>
      </main>
    </div>
  );
}

function Hero({ query, onChange, onSubmit, loading }: { query: string; onChange: (v: string) => void; onSubmit: () => void; loading: boolean }) {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-secondary/10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container relative py-20 md:py-32">
        <div className="space-y-8 text-center max-w-5xl mx-auto">
          {/* Badge with glow effect */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse"></div>
            <Badge className="bg-transparent text-primary font-medium">🚀 Hackathon Intelligence</Badge>
          </div>

          {/* Main headline with gradient */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient-x">
              What will you
            </span>
            <br />
            <span className="bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent animate-gradient-x delay-300">
              build today?
            </span>
          </h1>

          {/* Subtitle with better styling */}
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
            We scrape recent hackathon winner projects across the web and help you craft
            <span className="text-primary font-semibold"> standout ideas</span> and
            <span className="text-secondary font-semibold"> stacks</span> with AI.
          </p>

          {/* Enhanced search container */}
          <div className="mx-auto max-w-5xl">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-card/80 backdrop-blur-xl border border-primary/10 rounded-3xl shadow-2xl shadow-primary/10 p-6 md:p-8 space-y-6">
                {/* AI Tags */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary text-sm font-medium flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer">
                    <Sparkles className="h-4 w-4" />
                    AI-Powered
                  </div>
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-secondary/10 to-secondary/5 border border-secondary/20 text-secondary text-sm font-medium flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer">
                    <Brain className="h-4 w-4" />
                    Smart Ideas
                  </div>
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 text-accent text-sm font-medium flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer">
                    <CircuitBoard className="h-4 w-4" />
                    Modern Stack
                  </div>
                </div>

                {/* Simplified search input */}
                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-2xl border border-primary/10 focus-within:border-primary/30 transition-colors">
                  <Input
                    value={query}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Create a winning hackathon project idea using..."
                    className="h-14 flex-1 border-0 focus-visible:ring-0 text-base bg-transparent placeholder:text-muted-foreground/60"
                    onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                  />
                  <Button
                    size="lg"
                    onClick={onSubmit}
                    disabled={loading || !query.trim()}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105 px-8"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Thinking...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Generate
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons with modern styling */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              variant="outline"
              className="rounded-full border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:scale-105"
              onClick={() => document.getElementById('winners-heading')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Find Winners
            </Button>
            <Button
              className="rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
              onClick={onSubmit}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Ideas
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-secondary/20 hover:border-secondary/40 hover:bg-secondary/5 transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link to="/roadmap">
                <Network className="mr-2 h-4 w-4" />
                Draft Roadmap
              </Link>
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-accent/20 hover:border-accent/40 hover:bg-accent/5 transition-all duration-300 hover:scale-105"
              asChild
            >
              <a href="#tools-list">
                <DatabaseIcon className="mr-2 h-4 w-4" />
                Tools Library
              </a>
            </Button>
          </div>

          {/* Privacy notice with better styling */}
          <div className="flex items-center justify-center gap-2 pt-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
            <p className="text-sm text-muted-foreground/80">
              🔒 <span className="font-medium">Privacy-first:</span> Your queries aren't stored on our servers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function IdeaList({ ideas, provider }: { ideas: IdeaItem[]; provider: "rules" | "openai" }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {ideas.map((idea, i) => (
        <Card key={i} className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>

          <CardHeader className="relative pb-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-secondary transition-all duration-300">
                {idea.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse"></div>
                <Badge className="bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-primary/20 font-medium">
                  {provider}
                </Badge>
              </div>
            </div>
            <CardDescription className="text-base text-muted-foreground leading-relaxed">
              {idea.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <div className="font-semibold text-foreground">Recommended Tools</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {idea.tools.map((t) => (
                  <Badge
                    key={t}
                    className="bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/20 hover:from-primary/20 hover:to-primary/10 transition-all duration-200 hover:scale-105"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                <div className="font-semibold text-foreground">Suggested Stack</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {idea.stack.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="border-secondary/30 text-secondary hover:bg-secondary/5 hover:border-secondary/50 transition-all duration-200 hover:scale-105"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                <div className="font-semibold text-foreground">Try Prompting</div>
              </div>
              <ul className="space-y-2 text-muted-foreground pl-4">
                {idea.samplePrompts.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1.5 text-xs">•</span>
                    <span className="leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TryIdeas({ onPick }: { onPick: (p: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">Ideas to try</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {examplePrompts.map((p) => (
          <button key={p} onClick={() => onPick(p)} className="text-left rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground/80 mb-2"><Sparkles className="h-4 w-4 text-primary" /> Design for me</div>
            <div className="font-semibold leading-snug">{p}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ToolsList() {
  const sections: { title: string; items: string[] }[] = [
    { title: "Languages & Stacks", items: ["MERN", "MEAN", "Python", "Django", "Flask", "FastAPI", "Java", "Spring Boot"] },
    { title: "Frontend", items: ["React", "Next.js", "Vue", "Nuxt", "Svelte", "Solid"] },
    { title: "Backend", items: ["Express", "NestJS", "Django", "Flask", "FastAPI", "Spring Boot"] },
    { title: "Databases", items: ["Postgres", "Neon", "Supabase", "MongoDB", "Atlas", "MySQL", "PlanetScale", "SQLite", "Redis", "Firebase"] },
    { title: "Auth & APIs", items: ["Auth.js", "Clerk", "Supabase Auth", "Stripe", "Twilio", "SendGrid"] },
    { title: "No‑code / Vibe‑coding", items: ["Bubble", "Glide", "Retool", "Softr", "Webflow", "Airtable", "Zapier", "Make", "Framer"] },
  ];

  const links: Record<string, string> = {
    MERN: "https://en.wikipedia.org/wiki/MEAN_(solution_stack)",
    MEAN: "https://en.wikipedia.org/wiki/MEAN_(solution_stack)",
    Python: "https://www.python.org/",
    Django: "https://www.djangoproject.com/",
    Flask: "https://flask.palletsprojects.com/",
    FastAPI: "https://fastapi.tiangolo.com/",
    Java: "https://www.oracle.com/java/",
    "Spring Boot": "https://spring.io/projects/spring-boot",
    React: "https://react.dev/",
    "Next.js": "https://nextjs.org/",
    Vue: "https://vuejs.org/",
    Nuxt: "https://nuxt.com/",
    Svelte: "https://svelte.dev/",
    Solid: "https://www.solidjs.com/",
    Express: "https://expressjs.com/",
    NestJS: "https://nestjs.com/",
    Postgres: "https://www.postgresql.org/",
    Neon: "https://neon.tech/",
    Supabase: "https://supabase.com/",
    MongoDB: "https://www.mongodb.com/",
    Atlas: "https://www.mongodb.com/atlas",
    MySQL: "https://www.mysql.com/",
    PlanetScale: "https://planetscale.com/",
    SQLite: "https://www.sqlite.org/",
    Redis: "https://redis.io/",
    Firebase: "https://firebase.google.com/",
    "Auth.js": "https://authjs.dev/",
    Clerk: "https://clerk.com/",
    "Supabase Auth": "https://supabase.com/auth",
    Stripe: "https://stripe.com/",
    Twilio: "https://www.twilio.com/",
    SendGrid: "https://sendgrid.com/",
    Bubble: "https://bubble.io/",
    Glide: "https://www.glideapps.com/",
    Retool: "https://retool.com/",
    Softr: "https://www.softr.io/",
    Webflow: "https://webflow.com/",
    Airtable: "https://airtable.com/",
    Zapier: "https://zapier.com/",
    Make: "https://www.make.com/",
    Framer: "https://www.framer.com/",
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Card key={s.title} className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/90 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {s.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse"></div>
                  <CardDescription className="text-sm font-medium text-muted-foreground">
                    {s.items.length} tools
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative p-6">
              <div className="flex flex-wrap gap-3">
                {[...s.items].sort((a, b) => a.localeCompare(b)).map((it) => (
                  <a
                    key={it}
                    href={links[it] || `https://www.google.com/search?q=${encodeURIComponent(it)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group/tool inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-gradient-to-r from-background/80 to-background/60 px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/40 hover:from-primary/5 hover:to-secondary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <span className="truncate text-foreground group-hover/tool:text-primary transition-colors">
                      {it}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover/tool:text-primary group-hover/tool:scale-110 transition-all" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function githubSearch(title: string) {
  return `https://github.com/search?q=${encodeURIComponent(title)}&type=repositories`;
}

const curatedIdeaTitles = [
  "AI SOC Analyst (Alert Triage Agent)",
  "Automated Threat Hunter Agent",
  "Compliance AI: GDPR Request Handler",
  "RAG Retrieval Agent for Docs Q&A",
  "AI Code Review Assistant for PRs",
  "AI Slide Generator from Text",
  "Work Automation Agent (Calendar + Email)",
  "AI Meeting Summary & Insights Bot",
  "AI Workflow Automator (CI/CD)",
  "AI Habit Coach with Streak Tracker",
  "On-Chain Autonomous DeFi Agent",
  "Agentic Swap & Yield Robot",
  "DAO Contributor Agent (Autonomous)",
  "Swarm AI Agent-Based Marketplace",
  "Supply-Chain Tracker Agent (Blockchain)",
  "Agentic Finance Worker (Rebalance + Trade)",
  "Agentic Identity Verifier (DID)",
  "Agentic Knowledge Miner (Web Crawling + Summary)",
  "Document Privacy Compliance Assistant",
  "Virtual Security Coach (Phishing Training)",
  "Voice-to-Action Organizer",
  "Recipe Assistant from Fridge Snapshot",
  "Expense Auto-Categorizer with OCR",
  "Email Digest & Smart Reply Tool",
  "Automatic PDF to Slides Converter",
  "Personal Finance Forecast Assistant",
  "Resume Analyzer & Job Score",
  "Automated Quiz Generator from Notes",
  "Flashcard Builder from Study Notes",
  "Chat Transcription & Action Item Auto-capture",
  "Task Auto-Paradigmer (CLI Workflow)",
  "Snippet Manager with AI Auto-Suggest",
  "Image to CSS Converter",
  "Low-code Form + Workflow Builder",
  "Website SEO Audit + Optimizer",
  "Social Media Posting Scheduler",
  "Code Documentation Auto-generator",
  "One-click Deploy Boilerplate Generator",
  "Transcript Summarizer for Videos",
  "AI-Powered Idea Brainstorm Generator",
  "AI-Enhanced Penetration Testing (PenTest++)",
  "AI SOC Triage Agent",
  "Malware AI Analysis Toolkit",
  "CTF Challenge Generator",
  "Phishing Simulation Platform",
  "Vulnerability Scanner with AI Suggestions",
  "Security Alert Auto-Summarizer Agent",
  "Code Security Auditor Agent",
  "Privacy-Aware Data Map Generator",
  "Threat Intelligence Aggregator Bot",
  "Fake News Detector with AI",
  "Voice Fraud Detection System",
  "Deepfake Image & Video Checker",
  "Anti-Spam AI Email Filter",
  "Secure Auth with Passkeys Automation",
  "2FA Integration Tool for SaaS",
  "Automated Incident Report Generator",
  "Access Logging & Alert System",
  "Gitleaks: Secret Leak Detector Bot",
  "Compliance Policy Auto-Monitoring Agent",
  "AI DeFi Portfolio Rebalancer",
  "On-chain Snapshot Voting Agent",
  "DAO Task Executor Agent",
  "AI Token Trading Bot (Uniswap)",
  "Smart Contract Arbitrator Agent",
  "Agentic NFT Metadata Updater",
  "Agent-to-Agent Economy Sim Sandbox",
  "AI Governance DAO Interface",
  "On-chain Agent Security Auditor",
  "Tokenomics Agent Simulator",
  "Agentic Web (AI-network simulation)",
  "Swarm Agent Coordination Demo",
  "TEEs for Secure Agent Execution",
  "Agentic DAO Funding Tool",
  "On-chain Agent Chatbot (Telegram)",
  "DeFi Risk Prediction Agent",
  "On-chain Identity Verifier Agent",
  "Agentic Alert System for DeFi Exploits",
  "Multi-Agent Task Marketplace Prototype",
  "ZKP Agent for Private Transactions",
  "Smart Waste Scheduler & Tracker",
  "IoT Air Quality Monitor Dashboard",
  "Community SOS Reporting Tool (Geo + Chat)",
  "Disaster Alert Aggregator Bot",
  "Carbon Footprint Tracker PWA",
  "NGO Donation Transparency Dashboard",
  "Food Rescue Logistics Platform",
  "Remote Energy Micro-Grid Planner",
  "Sustainable Fashion Swap Marketplace",
  "Green Supply Chain Tracker (Blockchain)",
  "AI Climate Prediction Tool",
  "Telehealth Queue + Video Appointment",
  "Mental Health Chatbot (Ethical)",
  "Accessibility Overlay for Websites",
  "Educational AR Experience for Remote Learning",
  "Flashcard Generator for NGO Training",
  "Climate Data Visualization Dashboard",
  "PWA Volunteer Coordination Tool",
  "Global Hackathon Submission",
  "Ethical AI Ideation Toolkit (Workbook)",
];

const curatedProjects: WinnerProject[] = curatedIdeaTitles.map((t) => ({
  title: t,
  url: githubSearch(t),
  source: "github",
  image: null,
  publishedAt: null,
  description: null,
  tags: ["idea"],
}));

function WinnersGrid({ projects }: { projects: WinnerProject[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((p, i) => (
        <a key={i} href={p.url} target="_blank" rel="noreferrer" className="group">
          <Card className="h-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 group-hover:scale-[1.02] bg-gradient-to-br from-card to-card/90 backdrop-blur-sm border-0">
            <div className="relative overflow-hidden">
              {p.image ? (
                <img src={p.image} alt="" className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <Thumbnail title={p.title} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                  <ExternalLink className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>

            <CardHeader className="p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <CardTitle className="text-lg line-clamp-2 text-black font-extrabold leading-tight flex-1 group-hover:text-primary transition-colors duration-300 bg-yellow-100 px-2 py-1 rounded-md border-2 border-yellow-300">
                  {p.title}
                </CardTitle>
                <div className="flex items-center gap-2 opacity-100 transition-opacity duration-300">
                  <Github className="h-6 w-6 text-gray-800" />
                  <ExternalLink className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-gray-200 text-gray-800 border-gray-400 font-bold capitalize shadow-md px-3 py-1">
                  <Github className="h-4 w-4 mr-2" />
                  {p.source}
                </Badge>
                {p.publishedAt && (
                  <span className="text-sm text-gray-700 flex items-center gap-1 font-bold bg-gray-100 px-2 py-1 rounded">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    {timeAgo(p.publishedAt)}
                  </span>
                )}
              </div>
            </CardHeader>
          </Card>
        </a>
      ))}
    </div>
  );
}

function timeAgo(date: string) {
  const d = new Date(date).getTime();
  const diff = Math.max(0, Date.now() - d);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function DomainChips({ onPick }: { onPick: (p: string) => void }) {
  const chips = [
    "Fintech for students",
    "Health & wellness",
    "Campus tools",
    "Climate & maps",
    "Accessibility",
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <Button key={c} variant="outline" className="rounded-full" onClick={() => onPick(c)}>{c}</Button>
      ))}
    </div>
  );
}

function TemplatesStrip() {
  const templates = [
    { name: "Vercel AI Chatbot", url: "https://github.com/vercel/ai-chatbot", desc: "Next.js + Vercel AI SDK" },
    { name: "Supabase Examples", url: "https://github.com/supabase/supabase/tree/master/examples", desc: "Auth, DB, Realtime" },
    { name: "OpenAI Node Starter", url: "https://github.com/openai/openai-quickstart-node", desc: "Node + OpenAI API" },
    { name: "LangChain JS Samples", url: "https://github.com/langchain-ai/langchainjs/tree/main/examples", desc: "LLM workflows" },
  ];
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-3 min-w-max py-1">
        {templates.map((t) => (
          <a key={t.url} href={t.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm shadow-sm hover:bg-accent">
            <Github className="h-4 w-4" />
            <span className="font-medium">{t.name}</span>
            <span className="text-muted-foreground">{t.desc}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

const examplePrompts = [
  "AI for mental health using SMS and offline-first design",
  "Fintech app for students to build savings habits",
  "Accessibility tooling for designers and developers",
  "Climate action app with maps and open data",
];

function hashHue(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h % 360;
}

function pickIcon(title: string) {
  const t = title.toLowerCase();
  if (/(soc|security|phishing|pentest|ctf|vulnerability)/.test(t)) return Shield;
  if (/(defi|token|swap|yield|dao|on-chain|blockchain)/.test(t)) return Coins;
  if (/(rag|docs|q&a|knowledge|document)/.test(t)) return Book;
  if (/(agent|bot|automation)/.test(t)) return Bot;
  if (/(ml|ai|brain|insight)/.test(t)) return Brain;
  if (/(database|sql|data map)/.test(t)) return DatabaseIcon;
  if (/(workflow|ci\/cd|orchestr|automation)/.test(t)) return Workflow;
  if (/(cloud|serverless)/.test(t)) return Cloud;
  if (/(bug|malware|threat)/.test(t)) return Bug;
  if (/(monitor|radar|tracker)/.test(t)) return Radar;
  if (/(global|on-chain|network)/.test(t)) return Globe;
  return CircuitBoard;
}

function Thumbnail({ title }: { title: string }) {
  const h1 = hashHue(title);
  const h2 = (h1 + 40) % 360;
  const Icon = pickIcon(title);
  return (
    <div className="relative h-40 w-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(60rem 30rem at 0% 0%, hsl(${h1} 84% 60% / .25), transparent), linear-gradient(135deg, hsl(${h1} 84% 55% /.25), hsl(${h2} 84% 55% /.25))`,
        }}
      />
      <svg className="absolute inset-0 opacity-20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <Icon className="absolute right-4 bottom-4 h-10 w-10 text-primary/70 drop-shadow" />
    </div>
  );
}


