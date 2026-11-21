"""Live GitHub pulse for the portfolio: the public contribution calendar
and the latest push, fetched server-side (GitHub's calendar page has no
CORS) and cached so visitors never hit GitHub's rate limits."""

import json
import logging
import re
import threading
import time
import urllib.request
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException

log = logging.getLogger(__name__)
router = APIRouter()

GITHUB_USER = "pr7bh"
CACHE_SECONDS = 30 * 60
TIMEOUT = 8
HEADERS = {"User-Agent": "portfolio-github-pulse", "Accept": "text/html,application/json"}

_cache: dict = {"at": 0.0, "data": None}
_lock = threading.Lock()

_DAY = re.compile(r'<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"[^>]*data-level="(\d)"')
_TIP = re.compile(r'<tool-tip[^>]*for="([^"]+)"[^>]*>\s*(No|\d[\d,]*) contributions?')


def _get(url: str) -> str:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as res:  # noqa: S310 (fixed https URLs)
        return res.read().decode("utf-8", "replace")


def _calendar() -> list[dict]:
    html = _get(f"https://github.com/users/{GITHUB_USER}/contributions")
    counts = {cid: (0 if n == "No" else int(n.replace(",", ""))) for cid, n in _TIP.findall(html)}
    days = [
        {"date": date, "level": int(level), "count": counts.get(cid, 0)}
        for date, cid, level in _DAY.findall(html)
    ]
    days.sort(key=lambda d: d["date"])
    return days


def _last_push() -> dict | None:
    events = json.loads(_get(f"https://api.github.com/users/{GITHUB_USER}/events/public?per_page=30"))
    for ev in events:
        if ev.get("type") != "PushEvent":
            continue
        commits = ev.get("payload", {}).get("commits") or []
        message = commits[-1]["message"].splitlines()[0][:120] if commits else None
        return {
            "repo": ev["repo"]["name"].split("/", 1)[-1],
            "at": ev["created_at"],
            "message": message,
            "commits": len(commits),
        }
    return None


def _streak(days: list[dict]) -> int:
    """Current run of consecutive days with contributions (today may be empty yet)."""
    streak = 0
    for i, d in enumerate(reversed(days)):
        if d["count"] > 0:
            streak += 1
        elif i == 0:
            continue
        else:
            break
    return streak


def _build() -> dict:
    days = _calendar()
    try:
        push = _last_push()
    except Exception:  # the calendar alone is still worth showing
        log.warning("GitHub events unavailable", exc_info=True)
        push = None
    since = (datetime.now(timezone.utc) - timedelta(days=30)).date().isoformat()
    return {
        "user": GITHUB_USER,
        "total": sum(d["count"] for d in days),
        "last30": sum(d["count"] for d in days if d["date"] >= since),
        "streak": _streak(days),
        "days": days,
        "lastPush": push,
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/github")
def github_pulse():
    with _lock:
        fresh = _cache["data"] is not None and time.time() - _cache["at"] < CACHE_SECONDS
        if fresh:
            return _cache["data"]
    try:
        data = _build()
    except Exception:
        log.warning("GitHub pulse fetch failed", exc_info=True)
        if _cache["data"] is not None:
            return _cache["data"]  # stale beats nothing
        raise HTTPException(status_code=503, detail="GitHub data unavailable right now.")
    with _lock:
        _cache.update(at=time.time(), data=data)
    return data
