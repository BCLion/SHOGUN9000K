// src/routes/api/scrape/+server.ts //
import { json } from '@sveltejs/kit';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '$lib/db';
import { jobs } from '$lib/schema';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';

const CITIES = [
  "Toronto, Ontario", "Vancouver, British Columbia", "Ottawa, Ontario",
  "Seattle, Washington", "San Francisco, California", "New York, New York",
  "Austin, Texas", "Boston, Massachusetts", "Portland, Oregon"
];

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  generationConfig: { responseMimeType: "application/json" }
});

const VIBE_CANONICAL: Record<string, string> = {
  faang_tier: "faang_tier", faang: "faang_tier", faangtier: "faang_tier",
  hidden_gem: "hidden_gem", hiddengem: "hidden_gem",
  startup_chaos: "startup_chaos", chaos: "startup_chaos",
  corporate_zombie: "corporate_zombie", zombie: "corporate_zombie",
  avoid: "avoid", toxic: "avoid", "red flag": "avoid"
};

function normalizeVibe(raw: string | null): string {
  if (!raw) return "unknown";
  const key = raw.toLowerCase().replace(/[\s-]+/g, "_");
  return VIBE_CANONICAL[key] ?? "unknown";
}

const promptTemplate = (job: any) => `You are a battle-hardened senior engineer. Return ONLY valid JSON.

{
  "summary": "one sentence brutal verdict real talk only",
  "skills": ["Python", "TypeScript", "AWS", ...],
  "red_flags": ["on-call hell", "legacy Java", null],
  "green_flags": ["remote-first", "modern stack", null],
  "vibe": "FAANG-tier" | "Hidden Gem" | "Startup Chaos" | "Corporate Zombie" | "Avoid",
  "seniority": "Junior" | "Mid" | "Senior" | "Staff" | "Principal",
  "match_score": 0-100
}

Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Salary: ${job.salaryRaw}
Description: ${job.description}
`;

export async function GET(event: RequestEvent) {
  const { url } = event;
  const secret = url.searchParams.get('secret');

  if (secret !== (import.meta.env.VITE_REVALIDATE_SECRET || process.env.REVALIDATE_SECRET)) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  let scraped = 0, enriched = 0;

  for (const city of CITIES) {
    const params = {
      engine: "google_jobs",
      q: "software engineer OR data engineer OR ml engineer OR devops OR sre OR backend",
      location: city,
      hl: "en",
      gl: city.includes("United States") ? "us" : "ca",
      api_key: import.meta.env.VITE_SERPAPI_KEY || process.env.SERPAPI_KEY
    };

    try {
      const { data } = await axios.get("https://serpapi.com/search", { params, timeout: 30000 });

      for (const j of (data.jobs_results || []).slice(0, 30)) {
        const jobRecord = {
          title: j.title ?? "Unknown Title",
          company: j.company_name ?? "Unknown Company",
          location: j.location ?? city,
          url: j.job_url ?? j.apply_link ?? null,
          salaryRaw: j.salary_snippet ?? "Not listed",
          description: (j.description ?? "").slice(0, 1490),
          city: city.split(",")[0].trim()
        };

        if (!jobRecord.url) continue;

        // Upsert raw job
        await db.insert(jobs).values(jobRecord)
          .onConflictDoUpdate({
            target: jobs.url,
            set: jobRecord
          });

        scraped++;

        // Enrich with Gemini
        try {
          const result = await model.generateContent(promptTemplate(jobRecord));
          const text = result.response.text().replace(/```json\n?|```/g, '').trim();
          let insights = JSON.parse(text);

          insights.vibe = normalizeVibe(insights.vibe);
          insights.seniority = insights.seniority?.toLowerCase() === "mid-level" ? "mid" : insights.seniority?.toLowerCase();
          insights.match_score ??= 45;

          await db.update(jobs)
            .set({ insights: insights as any, enrichedAt: new Date() })
            .where(eq(jobs.url, jobRecord.url));

          enriched++;
        } catch (e) {
          console.error("Gemini failed:", jobRecord.url);
        }

        await new Promise(r => setTimeout(r, 3000)); // Stay safe
      }
    } catch (e) {
      console.error("SerpAPI failed for", city);
    }
  }

  return json({ 
    status: "DOMINATION COMPLETE", 
    scraped, 
    enriched, 
    timestamp: new Date().toISOString() 
  });
}