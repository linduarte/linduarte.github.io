import json
import sys

files = [
    ("reports/landing-lighthouse.report.json", "landing"),
    ("reports/login-lighthouse.report.json", "login"),
    ("reports/prefacio-lighthouse.report.json", "prefacio"),
]

out = {}
for path, name in files:
    try:
        with open(path, "r", encoding="utf-8") as fh:
            j = json.load(fh)
    except Exception as e:
        print(f"ERROR reading {path}: {e}", file=sys.stderr)
        continue
    cats = {
        k: (
            int(round(v["score"] * 100))
            if isinstance(v, dict) and "score" in v and v["score"] is not None
            else None
        )
        for k, v in j.get("categories", {}).items()
    }
    audits = j.get("audits", {})
    metrics = {}
    for key in [
        "largest-contentful-paint",
        "first-contentful-paint",
        "cumulative-layout-shift",
        "total-blocking-time",
        "interactive",
        "speed-index",
    ]:
        a = audits.get(key)
        if a and "numericValue" in a:
            metrics[key] = a["numericValue"]
    # pick top failing audits (score < 0.5) and top opportunities by numericValue savings
    failing = []
    opportunities = []
    for k, a in audits.items():
        if not isinstance(a, dict):
            continue
        score = a.get("score")
        if score is not None and score < 0.5:
            failing.append(
                {
                    "id": k,
                    "title": a.get("title"),
                    "score": score,
                    "description": a.get("description"),
                }
            )
        # opportunities have numericValue and 'numericValue' larger savings or 'scoreDisplayMode' == 'numeric'
        if a.get("scoreDisplayMode") == "numeric" and "numericValue" in a:
            opportunities.append(
                {
                    "id": k,
                    "title": a.get("title"),
                    "numericValue": a.get("numericValue"),
                    "description": a.get("description"),
                }
            )
    failing = sorted(failing, key=lambda x: x["score"])[:8]
    opportunities = sorted(opportunities, key=lambda x: x["numericValue"])[:8]
    out[name] = {
        "scores": cats,
        "metrics": metrics,
        "failing": failing,
        "opportunities": opportunities,
    }

print(json.dumps(out, indent=2))
