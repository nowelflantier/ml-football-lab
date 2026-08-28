#!/usr/bin/env python3
"""Convert StatsBomb Open Data event JSON to ML Football Lab shot rows.

Usage:
    python scripts/prepare-shots.py path/to/events.json > shots.generated.json
    python scripts/prepare-shots.py path/to/events1.json path/to/events2.json -o shots.generated.json

This script is intentionally offline. The web app never fetches StatsBomb data at runtime.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any

PITCH_LENGTH_M = 105.0
PITCH_WIDTH_M = 68.0
STATSBOMB_LENGTH = 120.0
STATSBOMB_WIDTH = 80.0
GOAL_WIDTH_M = 7.32


def to_metric(location: list[float]) -> tuple[float, float]:
    x, y = float(location[0]), float(location[1])
    return x * PITCH_LENGTH_M / STATSBOMB_LENGTH, y * PITCH_WIDTH_M / STATSBOMB_WIDTH


def geometry(location: list[float]) -> tuple[float, float]:
    x_m, y_m = to_metric(location)
    goal_x = PITCH_LENGTH_M
    goal_center_y = PITCH_WIDTH_M / 2.0
    dx = goal_x - x_m
    dy = goal_center_y - y_m
    distance = math.hypot(dx, dy)

    post_low = goal_center_y - GOAL_WIDTH_M / 2.0
    post_high = goal_center_y + GOAL_WIDTH_M / 2.0
    angle_low = math.atan2(post_low - y_m, dx)
    angle_high = math.atan2(post_high - y_m, dx)
    angle = abs(math.degrees(angle_high - angle_low))
    if angle > 180:
        angle = 360 - angle

    return round(distance, 2), round(angle, 2)


def event_to_shot(event: dict[str, Any], source_file: Path) -> dict[str, Any] | None:
    if event.get("type", {}).get("name") != "Shot":
        return None
    location = event.get("location")
    if not isinstance(location, list) or len(location) < 2:
        return None

    distance, angle = geometry(location)
    outcome = event.get("shot", {}).get("outcome", {}).get("name")
    return {
        "id": str(event.get("id", "")),
        "x": round(float(location[0]), 2),
        "y": round(float(location[1]), 2),
        "distance": distance,
        "angle": angle,
        "goal": outcome == "Goal",
        "source": "statsbomb-open-data",
        "provenance": {
            "event_file": source_file.name,
            "minute": event.get("minute"),
            "team": event.get("team", {}).get("name"),
            "player": event.get("player", {}).get("name"),
            "outcome": outcome,
        },
    }


def load_events(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, list):
        raise ValueError(f"Expected a JSON event array in {path}")
    return data


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("event_files", nargs="+", type=Path)
    parser.add_argument("-o", "--output", type=Path)
    args = parser.parse_args()

    shots: list[dict[str, Any]] = []
    for path in args.event_files:
        for event in load_events(path):
            shot = event_to_shot(event, path)
            if shot:
                shots.append(shot)

    payload = {
        "metadata": {
            "source": "StatsBomb Open Data",
            "source_repo": "https://github.com/hudl/open-data",
            "shot_count": len(shots),
            "notes": "Derived distance/angle are approximate metric geometry for teaching use.",
        },
        "shots": shots,
    }
    rendered = json.dumps(payload, ensure_ascii=False, indent=2)
    if args.output:
        args.output.write_text(rendered + "\n", encoding="utf-8")
    else:
        print(rendered)


if __name__ == "__main__":
    main()
