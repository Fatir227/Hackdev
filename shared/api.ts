/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Hackathon winners scraping types
export interface WinnerProject {
  title: string;
  url: string;
  source: string; // e.g., devpost, devfolio, hackster, article
  image?: string | null;
  publishedAt?: string | null;
  description?: string | null;
  tags?: string[];
}

export interface WinnersResponse {
  projects: WinnerProject[];
  fetchedAt: string; // ISO
  sources: string[];
}

// Idea generation types
export interface IdeaItem {
  title: string;
  description: string;
  tools: string[];
  stack: string[];
  samplePrompts: string[];
}

export interface IdeasRequest {
  query: string;
}

export interface IdeasResponse {
  ideas: IdeaItem[];
  provider: "rules" | "openai";
}

// Roadmap image generation
export interface RoadmapRequest {
  prompt: string;
  count?: number; // number of images
}

export interface RoadmapImage {
  dataUrl: string; // data:image/png;base64,...
}

export interface RoadmapResponse {
  images: RoadmapImage[];
  provider: "openai";
}
