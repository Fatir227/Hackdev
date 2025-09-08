import type { RequestHandler } from "express";
import type { IdeasRequest, IdeasResponse, IdeaItem } from "@shared/api";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const handleIdeas: RequestHandler = async (req, res) => {
  try {
    const body = req.body as IdeasRequest;
    const q = (body?.query || "").toString().slice(0, 2000);
    if (!q) return res.status(400).json({ error: "Missing query" });

    if (OPENAI_API_KEY) {
      try {
        const ideas = await ideasWithOpenAI(q);
        const resp: IdeasResponse = { ideas, provider: "openai" };
        return res.json(resp);
      } catch {
        // fallthrough to rules
      }
    }

    const ideas = ideasWithRules(q);
    const resp: IdeasResponse = { ideas, provider: "rules" };
    res.json(resp);
  } catch (e) {
    res.status(500).json({ error: "Failed to generate ideas" });
  }
};

function ideasWithRules(query: string): IdeaItem[] {
  const q = query.toLowerCase();
  const ideas: IdeaItem[] = [];

  const push = (title: string, description: string, tools: string[], stack: string[], samplePrompts: string[]) => {
    ideas.push({ title, description, tools, stack, samplePrompts });
  };

  const baseStack = [
    "React 18 + Vite",
    "Express API",
    "TailwindCSS",
    "Postgres (Neon) + Prisma",
    "Auth (Supabase)",
  ];

  if (/ai|ml|gpt|llm|openai|rag|vision/.test(q)) {
    push(
      "AI Mentor for Hackathons",
      "An AI mentor that critiques ideas, suggests datasets/APIs, and outputs a weekend delivery plan.",
      ["OpenAI (or local Ollama)", "LangChain", "Pinecone or Supabase Vector", "OpenRouter"],
      baseStack,
      [
        "Draft a weekend plan to build a fintech budgeting app for students.",
        "Suggest APIs and datasets for a sustainability hackathon project.",
      ],
    );
  }

  if (/health|med|wellness|fitness|mental/.test(q)) {
    push(
      "Health Habit Tracker with Wearables",
      "Aggregates wearable data and suggests micro-habits. Includes symptom checker and provider handoff.",
      ["Apple/Google Health Connect", "Zod for validations", "Sentry"],
      baseStack,
      ["Generate 5 features for a diabetes care hackathon in 36 hours."]
    );
  }

  if (/fintech|finance|bank|payment|crypto|web3|defi/.test(q)) {
    push(
      "Micro-Savings with Round-Ups",
      "Rounds up purchases into smart vaults, with explainable AI insights.",
      ["Plaid", "Stripe", "ethers.js / thirdweb (if web3)", "Zustand"],
      baseStack,
      ["Design a round-up savings MVP for Gen Z with 3 killer features."]
    );
  }

  if (/education|edtech|learn|student|campus/.test(q)) {
    push(
      "Campus Resource Copilot",
      "Searches all campus resources (docs, PDFs, events) with RAG and personalized roadmaps.",
      ["Supabase", "pgvector", "OpenAI"],
      baseStack,
      ["Outline onboarding for freshmen and key RAG sources."]
    );
  }

  if (/climate|sustainab|energy|green|carbon/.test(q)) {
    push(
      "Neighborhood Climate Scorecard",
      "Scrapes municipal data and crowdsources actions with gamified points.",
      ["Cheerio/Playwright", "Mapbox", "tRPC or REST"],
      baseStack,
      ["What public datasets help rank city blocks by climate resilience?"]
    );
  }

  if (/accessibility|a11y|inclusive|disab/.test(q)) {
    push(
      "Accessible Web Scanner",
      "Real-time accessibility checker with actionable fixes and Figma plugin integration.",
      ["axe-core", "Puppeteer", "Figma Plugin"],
      baseStack,
      ["Plan an MVP that audits a website and auto-fixes common a11y issues."]
    );
  }

  if (ideas.length === 0) {
    push(
      "Smart Project Assistant",
      "Suggests project angles, tools, and weekend roadmap tailored to your theme.",
      ["OpenAI (optional)", "Supabase", "Prisma", "Vercel/Netlify"],
      baseStack,
      ["I want to build something for social impact using maps and SMS."]
    );
  }

  return ideas;
}

async function ideasWithOpenAI(query: string): Promise<IdeaItem[]> {
  const prompt = `You are an expert hackathon mentor. Propose 3 winning project ideas tailored to: "${query}". For each idea, return JSON with keys: title, description, tools (array), stack (array), samplePrompts (array). Keep it actionable and weekend-scoped.`;
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    }),
  });
  if (!resp.ok) throw new Error("OpenAI request failed");
  const data = await resp.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";
  // Best-effort JSON extraction
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  try {
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    if (Array.isArray(parsed)) return parsed as IdeaItem[];
    if (parsed?.ideas && Array.isArray(parsed.ideas)) return parsed.ideas as IdeaItem[];
  } catch {
    // Fallback minimal parsing: split by lines
  }
  // Fallback: rules
  return ideasWithRules(query);
}
