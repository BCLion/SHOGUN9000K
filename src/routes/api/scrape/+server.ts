// src/routes/api/scrape/+server.ts
// FINAL CANONICAL APC9000 — DIRECT PORT OF ingest.py (2025 VERIFIED WORKING)

import { json } from '@sveltejs/kit';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { jobs } from '$lib/schema';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';
import { getDb } from '$lib/db';
const db = await getDb();

const CITIES = [
  "Toronto, Ontario", "Vancouver, British Columbia", "Ottawa, Ontario",
  "Seattle, Washington", "San Francisco, California", "New York, New York",
  "Austin, Texas", "Boston, Massachusetts", "Portland, Oregon"
];

const SERPAPI_KEY = process.env.SERPAPI_KEY!;
const GEMINI_KEY = process.env.GEMINI_API_KEY!;

if (!SERPAPI_KEY || !GEMINI_KEY) {
  throw new Error("Missing SERPAPI_KEY or GEMINI_API_KEY");
}

const genai = new GoogleGenerativeAI(GEMINI_KEY);
const model = genai.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" }
});

const VIBE_CANONICAL: Record<string, string> = {
  "faang-tier": "faang_tier", "faang_tier": "faang_tier", "faang": "faang_tier",
  "hidden gem": "hidden_gem", "hidden_gem": "hidden_gem",
  "startup chaos": "startup_chaos", "startup_chaos": "startup_chaos", "chaos": "startup_chaos",
  "corporate zombie": "corporate_zombie", "corporate_zombie": "corporate_zombie", "zombie": "corporate_zombie",
  "avoid": "avoid", "toxic": "avoid", "red flag": "avoid",
};

function normalize_vibe(raw: string): string {
  if (!raw) return "unknown";
  const key = raw.toLowerCase().trim().replace(/[\s-]+/g, "_");
  return VIBE_CANONICAL[key] || "unknown";
}

export async function GET(event: RequestEvent)  {
  const { url } = event;
  const secret = url.searchParams.get('secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return json({ error: "go away" }, { status: 401 });
  }

  let scraped = 0;
  let enriched = 0;

  for (const city of CITIES) {
    console.log(`Scraping ${city}...`);

    const params = {
      engine: "google_jobs",
      q: "software engineer OR data engineer OR ml engineer OR devops OR sre OR backend",
      location: city,
      hl: "en",
      gl: city.includes("States") ? "us" : "ca",
      api_key: SERPAPI_KEY
    };

    try {
      const { data } = await axios.get("https://serpapi.com/search", { params, timeout: 30000 });

      for (const j of (data.jobs_results || []).slice(0, 30)) {
        const job = {
          title: j.title ?? "Unknown",
          company: j.company_name ?? "Unknown",
          location: j.location ?? city,
          url: j.job_url ?? j.related_links?.[0]?.link ?? null,
          salary_raw: j.salary_snippet ?? "Not listed",
          description: (j.description || "").slice(0, 1500),
          city: city.split(",")[0].trim()
        };

        if (!job.url) continue;

        // Upsert raw job
        await db.insert(jobs).values(job)
          .onConflictDoUpdate({ target: jobs.url, set: job });

        scraped++;

        // Enrich with Gemini — EXACT same prompt as ingest.py
        const prompt = `You are a battle-hardened senior engineer. Return ONLY valid JSON.

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
Salary: ${job.salary_raw}
Description: ${job.description.slice(0, 1400)}
`;

        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/g, "").trim();
            const insights = JSON.parse(text);

            insights.vibe = normalize_vibe(insights.vibe);
            insights.match_score ??= 45;
            insights.skills ??= [];

            await db.update(jobs)
              .set({ insights: insights as any, enrichedAt: new Date() })
              .where(eq(jobs.url, job.url));

            enriched++;
            console.log(`ENRICHED → ${job.title.substring(0,50)} @ ${job.company} | ${insights.vibe}`);
            break;
          } catch (e) {
            console.error(`Gemini fail (attempt ${attempt + 1})`);
            if (attempt === 2) {
              await db.update(jobs).set({
                insights: { summary: "Gemini throttled", vibe: "unknown", match_score: 30 },
                enrichedAt: new Date()
              }).where(eq(jobs.url, job.url));
            } else {
              await new Promise(r => setTimeout(r, 10000 * (attempt + 1)));
            }
          }
        }

        // Exact same delays as original APC9000
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch (e) {
      console.error(`SerpAPI failed for ${city}:`, e);
    }

    // City cooldown
    await new Promise(r => setTimeout(r, 2700));
  }

  return json({
    status: "DOMINATION COMPLETE — APC9000 FULLY RESTORED",
    scraped,
    enriched,
    timestamp: new Date().toISOString(),
    cities: CITIES.length
  });
}