# ingest.py
import os, json, time, requests, psycopg2
from datetime import datetime, timezone
import google.generativeai as genai

# Initialize clients
SERPAPI_KEY = os.environ["SERPAPI_KEY"]
GEMINI_KEY = os.environ["GEMINI_API_KEY"]
POSTGRES_URL = os.environ["POSTGRES_URL"]

# Gemini setup
genai.configure(api_key=GEMINI_KEY)
model = genai.GenerativeModel(
    "gemini-2.5-flash-lite",
    generation_config={"response_mime_type": "application/json"}
)

# Database connection
# DB connection
conn = psycopg2.connect(POSTGRES_URL)
cur = conn.cursor()

# Process job with LLM
def analyze_job(job):
    prompt = f'''You are a battle-hardened senior engineer. Return ONLY valid JSON.

{{
  "summary": "one sentence brutal verdict real talk only",
  "skills": ["Python", "TypeScript", "AWS", ...],
  "red_flags": ["on-call hell", "legacy Java", null],
  "green_flags": ["remote-first", "modern stack", null],
  "vibe": "FAANG-tier" | "Hidden Gem" | "Startup Chaos" | "Corporate Zombie" | "Avoid",
  "seniority": "Junior" | "Mid" | "Senior" | "Staff" | "Principal",
  "match_score": 0-100
}}

Title: {job["title"]}
Company: {job["company"]}
Location: {job["location"]}
Salary: {job["salary_raw"]}
Description: {job["description"][:1400]}
'''
    
    response = model.generate_content(prompt)
    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        print(f"Failed to parse JSON for job: {job['title']}")
        return None

# Main scraping function
def scrape_jobs():
    cities = [
    "Toronto, Ontario", "Vancouver, British Columbia", "Ottawa, Ontario",
    "Seattle, Washington", "San Francisco, California", "New York, New York",
    "Austin, Texas", "Boston, Massachusetts", "Portland, Oregon"
    ]  # Add more cities
    
    for city in cities:
        params = {
            "engine": "google_jobs",
            "q": f"software engineer {city}",
            "api_key": SERPAPI_KEY,
            "hl": "en",
            "gl": "us"
        }
        
        response = requests.get("https://serpapi.com/search", params=params)
        data = response.json()
        
        if "jobs_results" not in data:
            continue
            
        cconn = psycopg2.connect(POSTGRES_URL)
        cursor = conn.cursor()
        
        for job in data["jobs_results"]:
            # Check if job already exists
            cursor.execute(
                "SELECT id FROM jobs WHERE title = %s AND company = %s AND location = %s",
                (job.get("title"), job.get("company_name"), job.get("location"))
            )
            
            if cursor.fetchone():
                continue  # Skip if already in DB
                
            # Analyze with LLM
            analysis = analyze_job(job)
            if not analysis:
                continue
                
            # Insert into database
            cursor.execute("""
                INSERT INTO jobs (
                    title, company, location, salary_raw, description, 
                    summary, skills, red_flags, green_flags, 
                    vibe, seniority, match_score, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                job.get("title"),
                job.get("company_name"),
                job.get("location"),
                job.get("salary"),
                job.get("description", "")[:2000],
                analysis.get("summary"),
                json.dumps(analysis.get("skills", [])),
                json.dumps(analysis.get("red_flags", [])),
                json.dumps(analysis.get("green_flags", [])),
                analysis.get("vibe"),
                analysis.get("seniority"),
                analysis.get("match_score"),
                datetime.now()
            ))
            
        conn.commit()
        conn.close()

if __name__ == "__main__":
    scrape_jobs()