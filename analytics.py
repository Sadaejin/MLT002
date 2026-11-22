import json
import math
import statistics
from datetime import datetime, timezone
from pathlib import Path


def parse_price_value(price_str: str) -> float:
    """Extracts the base numeric USD value from tier strings like '$150.00' or '$1.99 – $4.99'."""
    cleaned = price_str.replace("$", "").replace("+", "").strip()
    parts = [p.strip() for p in cleaned.split("–") if p.strip()]
    numbers = []
    for part in parts:
        try:
            numbers.append(float(part))
        except ValueError:
            continue
    return statistics.mean(numbers) if numbers else 0.0


def analyze_portfolio(raw_json: str) -> str:
    """Analyzes Luminox.fx portfolio JSON and returns a formatted telemetry JSON string."""
    data = json.loads(raw_json)
    divisions = data.get("divisions", [])

    division_metrics = []
    all_prices = []

    for div in divisions:
        tiers = div.get("tiers", [])
        prices = [parse_price_value(t.get("price", "0")) for t in tiers]
        all_prices.extend(prices)

        avg_price = round(statistics.mean(prices), 2) if prices else 0.0
        division_metrics.append({
            "id": div.get("id"),
            "title": div.get("title"),
            "status": div.get("status"),
            "tier_count": len(tiers),
            "avg_tier_usd": avg_price
        })

    report = {
        "project": "MLT001 // Luminox.fx",
        "runtime": "Python 3 (CPython / Pyodide WASM)",
        "generated_utc": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "total_divisions": len(divisions),
        "open_divisions": sum(1 for d in divisions if d.get("status") == "OPEN"),
        "total_packages": len(all_prices),
        "studio_mean_price_usd": round(statistics.mean(all_prices), 2) if all_prices else 0.0,
        "price_std_dev_usd": round(statistics.pstdev(all_prices), 2) if len(all_prices) > 1 else 0.0,
        "divisions": division_metrics
    }
    return json.dumps(report, indent=2)


if __name__ == "__main__":
    portfolio_path = Path("portfolio.json")
    if portfolio_path.exists():
        result = analyze_portfolio(portfolio_path.read_text(encoding="utf-8"))
        Path("telemetry.json").write_text(result + "\n", encoding="utf-8")
        print(result)
    else:
        print("Error: portfolio.json not found in current directory.")