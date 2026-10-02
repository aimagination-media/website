#!/usr/bin/env python3
"""Rebuild the public catalog and push it when the vault changed.

Safe to run on a timer. A bulk upload still becomes one commit, and a run
with nothing new exits without touching git.
"""
from __future__ import annotations

import fcntl
import os
import subprocess
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCK = Path("/tmp/aimagination-website-publish.lock")
PUBLISHED = ("assets/data/content.json", "assets/data/playlist_cache.json")


def _run(args: list[str], check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, cwd=ROOT, check=check, text=True, capture_output=True)


def _notify(text: str) -> None:
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    chat = os.environ.get("TELEGRAM_CHAT_ID", "").strip()
    if not token or not chat:
        print("telegram is not configured; failure stays in the journal", file=sys.stderr)
        return
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    body = urllib.parse.urlencode({"chat_id": chat, "text": text[:3500]}).encode()
    try:
        urllib.request.urlopen(url, data=body, timeout=20).read()
    except Exception as exc:  # the publish failure is the one that must surface
        print(f"telegram notice failed: {exc}", file=sys.stderr)


def publish() -> int:
    branch = _run(["git", "rev-parse", "--abbrev-ref", "HEAD"]).stdout.strip()
    if branch != "main":
        raise RuntimeError(f"website repo is on {branch}, not main")

    generated = subprocess.run(
        [sys.executable, "scripts/generate_content.py"],
        cwd=ROOT,
        check=False,
        text=True,
    )
    if generated.returncode != 0:
        raise RuntimeError("content generation failed")

    dirty = _run(["git", "diff", "--quiet", "--", *PUBLISHED], check=False)
    if dirty.returncode == 0:
        print("catalog unchanged")
        return 0
    if dirty.returncode != 1:
        raise RuntimeError(dirty.stderr.strip() or "git diff failed")

    _run(["git", "add", "--", *PUBLISHED])
    committed = _run(
        ["git", "commit", "-m", "Update content"],
        check=False,
    )
    if committed.returncode != 0:
        raise RuntimeError(committed.stderr.strip() or committed.stdout.strip() or "git commit failed")
    pushed = _run(["git", "push", "origin", "HEAD"], check=False)
    if pushed.returncode != 0:
        raise RuntimeError(pushed.stderr.strip() or "git push failed")
    print("pushed website catalog")
    return 0


def main() -> int:
    LOCK.touch(exist_ok=True)
    with LOCK.open("a+") as handle:
        try:
            fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print("another publish is already running")
            return 0
        try:
            return publish()
        except Exception as exc:
            message = f"Website catalog publish failed: {exc}"
            print(message, file=sys.stderr)
            _notify(message)
            return 1


if __name__ == "__main__":
    raise SystemExit(main())
