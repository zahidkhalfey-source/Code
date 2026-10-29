#!/usr/bin/env python3
"""Bundle index.html and its CSS/JS into one standalone, double-clickable HTML file.

Usage: python3 scripts/build_single.py
Writes dist/Hearing_Aid_Upgrade_Comparison.html
"""
import re
import subprocess
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "dist" / "Hearing_Aid_Upgrade_Comparison.html"


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def main():
    html = read("index.html")
    html = re.sub(
        r'<link rel="stylesheet" href="([^"]+)">',
        lambda m: "<style>\n" + read(m.group(1)) + "</style>",
        html,
    )
    html = re.sub(
        r'<script src="([^"]+)"></script>',
        # Guard against "</script" inside inlined code ending the tag early.
        lambda m: "<script>\n" + read(m.group(1)).replace("</script", "<\\/script") + "</script>",
        html,
    )
    try:
        rev = subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        rev = "nogit"
    html = html.replace("__BUILD__", f"{date.today().strftime('%d %b %Y')} ({rev})")
    assert 'src="' not in html and 'href="assets' not in html, "unbundled reference left"
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
