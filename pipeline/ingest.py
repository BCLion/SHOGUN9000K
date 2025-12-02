# pipeline/ingest.py — APC9000: CANONICAL LOWERCASE EDITION 2025
import os, json, time, requests, psycopg2
from datetime import datetime, timezone
import google.generativeai as genai

# Secrets
SERPAPI_KEY = os.environ["SERPAPI_KEY"]
GEMINI_KEY = os.environ["GEMINI_API_KEY"]
POSTGRES_URL = os.environ["POSTGRES_URL"]

# Cities we're dominating
CITIES = [
    "Toronto, Ontario", "Vancouver, British Columbia", "Ottawa, Ontario",
    "Seattle, Washington", "San Francisco, California", "New York, New York",
    "Austin, Texas", "Boston, Massachusetts", "Portland, Oregon"
]

# Gemini setup
genai.configure(api_key=GEMINI_KEY)
model = genai.GenerativeModel(
    "gemini-2.5-flash-lite",
    generation_config={"response_mime_type": "application/json"}
)

# DB connection
conn = psycopg2.connect(POSTGRES_URL)
cur = conn.cursor()

# Create table
cur.execute("""
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title TEXT,
    company TEXT,
    location TEXT,
    url TEXT UNIQUE,
    salary_raw TEXT,
    description TEXT,
    city TEXT,
    insights JSONB,
    scraped_at TIMESTAMP DEFAULT NOW(),
    enriched_at TIMESTAMP
);
""")
conn.commit()

# === CANONICAL VIBE MAPPING (THE ONE TRUE SOURCE OF TRUTH) ===
VIBE_CANONICAL = {
    "faang-tier": "faang_tier",
    "faang_tier": "faang_tier",
    "faang": "faang_tier",
    "hidden gem": "hidden_gem",
    "hidden_gem": "hidden_gem",
    "startup chaos": "startup_chaos",
    "startup_chaos": "startup_chaos",
    "chaos": "startup_chaos",
    "corporate zombie": "corporate_zombie",
    "corporate_zombie": "corporate_zombie",
    "zombie": "corporate_zombie",
    "avoid": "avoid",
    "toxic": "avoid",
    "red flag": "avoid",
}

def normalize_vibe(raw: str) -> str:
    if not raw or not isinstance(raw, str):
        return "unknown"
    key = raw.strip().lower().replace(" ", "_").replace("-", "_")
    return VIBE_CANONICAL.get(key, "unknown")

def normalize_seniority(raw: str) -> str:
    if not raw or not isinstance(raw, str):
        return "unknown"
    key = raw.strip().lower()
    mapping = {
        "junior": "junior", "jr": "junior", "entry": "junior",
        "mid": "mid", "mid-level": "mid", "intermediate": "mid",
        "senior": "senior", "sr": "senior",
        "staff": "staff",
        "principal": "principal", "distinguished": "principal", "fellow": "principal"
    }
    return mapping.get(key, "unknown")

def scrape_jobs():
    jobs = []
    for city in CITIES:
        print(f"Scraping {city}...")
        params = {
            "engine": "google_jobs",
            "q": "software engineer OR data engineer OR ml engineer OR devops OR sre OR backend",
            "location": city,
            "hl": "en",
            "gl": "us" if "States" in city else "ca",
            "api_key": SERPAPI_KEY
        }
        data = requests.get("https://serpapi.com/search", params=params).json()
        for j in data.get("jobs_results", [])[:30]:
            jobs.append({
                "title": j.get("title"),
                "company": j.get("company_name"),
                "location": j.get("location"),
                "url": j.get("job_url"),
                "salary_raw": j.get("salary_snippet", "Not listed"),
                "description": (j.get("description") or "")[:1500],
                "city": city.split(",")[0]
            })
        time.sleep(2.7)
    return jobs

def enrich(job):
    if not job.get("company") or not job.get("description") or len(job["description"]) < 50:
        return {
            "summary": "Insufficient data",
            "skills": [],
            "red_flags": ["No description"],
            "green_flags": [],
            "vibe": "unknown",
            "seniority": "unknown",
            "match_score": 10
        }

    prompt = f'''You are a battle-hardened senior engineer. Return ONLY valid JSON. Never put city names, states, or locations in red_flags or green_flags. Those belong only in the location field.



{{
  "summary": "one sentence brutal verdict real talk only",
  "skills": ["Python", "TypeScript", "AWS", ...],
  "red_flags": ["on-call hell", "legacy Java", null],
  "green_flags": ["remote-first", "modern stack", null],
  "vibe": "FAANG-tier" | "Hidden Gem" | "Startup Chaos" | "Corporate Zombie" | "Avoid" | "Toxic",
  "seniority": "Junior" | "Mid" | "Senior" | "Staff" | "Principal",
  "match_score": 0-100
}}

Title: {job["title"]}
Company: {job["company"]}
Location: {job["location"]}
Salary: {job["salary_raw"]}
Description: {job["description"][:1400]}

Rules:
- Use "Toxic" when red flags heavily outweigh green flags and the culture sounds actively harmful.
- Never put city names, states, or salary info in red_flags/green_flags.
- Never hallucinate skills not explicitly mentioned.
'''

    for attempt in range(3):
        try:
            response = model.generate_content(prompt)
            text = response.text.strip().replace("```json", "").replace("```", "").strip()
            data = json.loads(text)

            # === CANONICAL NORMALIZATION: THE ONE TRUE FIX ===
            if "vibe" in data:
                data["vibe"] = normalize_vibe(data["vibe"])
            if "seniority" in data:
                data["seniority"] = normalize_seniority(data["seniority"])

            # Defaults
            data.setdefault("match_score", 45)
            data.setdefault("skills", [])
            return data
        except Exception as e:
            print(f"Gemini fail (attempt {attempt+1}): {e}")
            if attempt == 2:
                return {
                    "summary": "Analysis throttled",
                    "skills": ["Python", "AWS"],
                    "red_flags": None,
                    "green_flags": None,
                    "vibe": "unknown",
                    "seniority": "unknown",
                    "match_score": 60
                }
            time.sleep(10 * (attempt + 1))

# MAIN DOMINATION LOOP
if __name__ == "__main__":
    print("APC9000 CANONICAL EDITION STARTED —", datetime.now(timezone.utc))
    for i, job in enumerate(scrape_jobs()):
        insights = enrich(job)
        try:
            cur.execute("""
                INSERT INTO jobs (title,company,location,url,salary_raw,description,city,insights,enriched_at)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW())
                ON CONFLICT(url) DO UPDATE SET 
                    insights=EXCLUDED.insights, 
                    enriched_at=NOW()
            """, (
                job["title"], job["company"], job["location"], job["url"],
                job["salary_raw"], job["description"], job["city"], json.dumps(insights)
            ))
            conn.commit()
        except Exception as e:
            print("DB error:", e)
            conn.rollback()
        print(f"{i+1} → {job['title'][:60]} @ {job['company']} | vibe:{insights.get('vibe')} | level:{insights.get('seniority')}")
        time.sleep(3)
    conn.close()
    print("APC9000 COMPLETE — CANONICAL DOMINATION ACHIEVED")