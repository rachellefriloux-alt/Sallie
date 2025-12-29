"""Progeny governance verifier.

This is intentionally lightweight and local-first:
- It does *not* modify files.
- It checks for safety defaults and basic project invariants.

Usage:
  python core/verify_governance.py

Exit codes:
  0 = pass
  1 = violations found
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Finding:
    level: str  # 'ERROR' | 'WARN'
    message: str


RE_PORT_MAPPING = re.compile(r"-\s*['\"](?P<mapping>[^'\"]+)['\"]\s*$")


def _load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _check_config(config_path: Path) -> list[Finding]:
    findings: list[Finding] = []

    if not config_path.exists():
        return [Finding("ERROR", f"Missing required file: {config_path}")]

    try:
        cfg = _load_json(config_path)
    except Exception as e:  # noqa: BLE001
        return [Finding("ERROR", f"Failed to parse {config_path}: {e}")]

    for key in ("version", "system", "paths", "models", "behavior"):
        if key not in cfg:
            findings.append(Finding("ERROR", f"{config_path}: missing top-level key '{key}'"))

    paths = cfg.get("paths") or {}
    whitelist = paths.get("whitelist")
    blacklist = paths.get("blacklist")

    if not isinstance(whitelist, list) or not whitelist:
        findings.append(Finding("WARN", f"{config_path}: paths.whitelist should be a non-empty list"))

    if not isinstance(blacklist, list) or not blacklist:
        findings.append(Finding("WARN", f"{config_path}: paths.blacklist should be a non-empty list"))

    models = cfg.get("models") or {}
    if not models.get("primary"):
        findings.append(Finding("WARN", f"{config_path}: models.primary is empty"))
    if not models.get("embedding"):
        findings.append(Finding("WARN", f"{config_path}: models.embedding is empty"))

    return findings


def _extract_compose_port_mappings(compose_text: str) -> list[str]:
    mappings: list[str] = []
    for line in compose_text.splitlines():
        m = RE_PORT_MAPPING.search(line.strip())
        if m:
            mappings.append(m.group("mapping"))
    return mappings


def _check_docker_compose(compose_path: Path) -> list[Finding]:
    findings: list[Finding] = []

    if not compose_path.exists():
        return [Finding("WARN", f"No docker-compose file found at {compose_path} (skipping container port checks)")]

    text = compose_path.read_text(encoding="utf-8", errors="replace")
    mappings = _extract_compose_port_mappings(text)

    if not mappings:
        findings.append(Finding("WARN", f"{compose_path}: no explicit port mappings found"))
        return findings

    for mapping in mappings:
        parts = mapping.split(":")

        if len(parts) == 2:
            findings.append(
                Finding(
                    "ERROR",
                    f"{compose_path}: port '{mapping}' is not IP-bound. For local-only, prefer '127.0.0.1:{mapping}'.",
                )
            )
        elif len(parts) >= 3:
            ip = parts[0]
            if ip not in ("127.0.0.1", "::1"):
                findings.append(
                    Finding(
                        "ERROR",
                        f"{compose_path}: port '{mapping}' binds to '{ip}'. For local-only, use 127.0.0.1 or ::1.",
                    )
                )

    return findings


def main() -> int:
    repo_root = Path(__file__).resolve().parents[1]

    findings: list[Finding] = []
    findings.extend(_check_config(repo_root / "core" / "config.json"))
    findings.extend(_check_docker_compose(repo_root / "docker-compose.yml"))

    errors = [f for f in findings if f.level == "ERROR"]
    warns = [f for f in findings if f.level == "WARN"]

    for f in errors + warns:
        print(f"[{f.level}] {f.message}")

    if errors:
        print(f"\nGovernance check failed: {len(errors)} error(s), {len(warns)} warning(s).")
        return 1

    print(f"\nGovernance check passed: {len(warns)} warning(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
