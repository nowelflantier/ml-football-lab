#!/usr/bin/env python3
"""Download a reproducible StatsBomb Open Data match/event sample.

The web app never calls StatsBomb at runtime. This script is an offline data-prep
helper for curriculum development.

Example:
    python scripts/fetch-statsbomb-sample.py 9 281 --limit 3

This downloads the match index plus event JSON files under:
    data/raw/statsbomb/<competition_id>/<season_id>/
"""

from __future__ import annotations

import argparse
import json
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

BASE_URL = "https://raw.githubusercontent.com/hudl/open-data/master/data"
USER_AGENT = "ml-football-lab-data-prep/1.0"


def fetch_json(url: str, retries: int = 3) -> Any:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    last_error: Exception | None = None

    for attempt in range(retries):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
            last_error = error
            if attempt + 1 < retries:
                time.sleep(1.5 * (attempt + 1))

    raise RuntimeError(f"Unable to fetch {url}: {last_error}")


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("competition_id", type=int)
    parser.add_argument("season_id", type=int)
    parser.add_argument("--limit", type=int, help="Download only the first N matches for a smoke test.")
    parser.add_argument("--output-root", type=Path, default=Path("data/raw/statsbomb"))
    parser.add_argument("--force", action="store_true", help="Redownload event files that already exist.")
    args = parser.parse_args()

    destination = args.output_root / str(args.competition_id) / str(args.season_id)
    matches_url = f"{BASE_URL}/matches/{args.competition_id}/{args.season_id}.json"
    matches = fetch_json(matches_url)
    if not isinstance(matches, list):
        raise ValueError("Expected the StatsBomb match index to be a JSON array")

    selected_matches = matches[: args.limit] if args.limit else matches
    write_json(destination / "matches.json", matches)

    downloaded = 0
    reused = 0
    match_ids: list[int] = []

    for match in selected_matches:
        match_id = int(match["match_id"])
        match_ids.append(match_id)
        event_path = destination / "events" / f"{match_id}.json"

        if event_path.exists() and not args.force:
            reused += 1
            continue

        events_url = f"{BASE_URL}/events/{match_id}.json"
        events = fetch_json(events_url)
        if not isinstance(events, list):
            raise ValueError(f"Expected events for match {match_id} to be a JSON array")
        write_json(event_path, events)
        downloaded += 1

    summary = {
        "source": "StatsBomb Open Data",
        "source_repo": "https://github.com/hudl/open-data",
        "competition_id": args.competition_id,
        "season_id": args.season_id,
        "upstream_match_count": len(matches),
        "selected_match_count": len(selected_matches),
        "downloaded_event_files": downloaded,
        "reused_event_files": reused,
        "match_ids": match_ids,
        "output_directory": str(destination),
    }
    write_json(destination / "fetch-summary.json", summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
