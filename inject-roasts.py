# inject-roasts.py — FINAL BATTLE-READY VERSION
import os
import json
import pandas as pd
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Use the exact env var name your app uses
POSTGRES_URL = os.environ.get("POSTGRES_URL")
if not POSTGRES_URL:
    raise EnvironmentError("POSTGRES_URL not found in environment variables!")

# CSV path — works locally AND in GitHub Actions
CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "roasts", "SHOGUN9000K_FINAL_PERFECT_ROAST.csv")

print(f"Loading roast CSV from: {CSV_PATH}")
df = pd.read_csv(CSV_PATH)

print(f"Injecting {len(df)} perfect 8B roasts into the empire...")

# Connect once
conn = psycopg2.connect(POSTGRES_URL)
cur = conn.cursor()

updated = 0
failed = 0

for _, row in df.iterrows():
    try:
        # Safely handle NaN / missing insights
        insights = row['insights']
        if pd.isna(insights):
            insights = None
        else:
            # If it's already a dict (from previous runs), keep it; else parse
            if not isinstance(insights, dict):
                insights = json.loads(insights) if isinstance(insights, str) else insights

        cur.execute(
            """
            UPDATE jobs 
            SET insights = %s::jsonb,
                enriched_at = NOW()
            WHERE id = %s
            RETURNING id
            """,
            (json.dumps(insights) if insights is not None else None, row['id'])
        )

        if cur.rowcount:
            updated += 1
        else:
            failed += 1
            print(f"Warning: No row found for id={row['id']} (title: {row.get('title', 'N/A')})")

    except Exception as e:
        print(f"Error on row id={row['id']}: {e}")
        failed += 1
        continue  # don't break the whole run

# COMMIT IS CRITICAL
conn.commit()
cur.close()
conn.close()

print("="*60)
print(f"VICTORY — {updated}/270 roasts injected successfully")
if failed:
    print(f"{failed} rows skipped or not found")
print("SHOGUN9000K GRID IS NOW ETERNAL")
print("Refresh https://shogun-9000-k.vercel.app")
print("="*60)