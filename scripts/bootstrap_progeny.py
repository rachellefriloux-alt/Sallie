"""Digital Progeny v5.4.1 — Genesis Bootstrap.

This script creates the on-disk “construction site” for Progeny and seeds:
- core config
- limbic/heritage state
- second-brain working files
- governance verifier (local-first + archive > delete posture)
- architecture docs (integration plan + memory design)

Networking posture (dual-mode):
- Default compose binds services to localhost only (127.0.0.1).
- Optional LAN override compose file is generated for explicit opt-in exposure.
"""

import json
from datetime import datetime, timezone
from pathlib import Path

# Digital Progeny v5.4.1 — Genesis Bootstrap
# Creates the on-disk “construction site” that matches Section 21.1 (File System Architecture)
# and seeds the required state files so Phase 0.5 can start immediately.

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR / "progeny_root"

# Directory skeleton aligned to Section 21.1
DIRS = [
    "core",
    "security",
    "docs",
    "projects",
    "working",
    "limbic/heritage/history",
    "memory/qdrant",
    "logs/sessions",
    "logs/archive",
    "logs/content",
    "interface",
    "sensors",
    "backups/snapshots",
    "drafts",
    "foundry/benchmarks",
    "archive",
    "imprinting",
    "convergence",
]

# --- v5.4.1 DEFAULT STATES ---

CONFIG_JSON = {
    "version": "5.4.1",
    "system": {
        "id": "progeny-local-01",
        "owner": "Creator",
        "log_level": "INFO",
    },
    "paths": {
        # NOTE: whitelist/blacklist are runtime security controls.
        # Keep these conservative; the denylist always wins.
        "whitelist": ["./working", "./drafts", "./projects"],
        "blacklist": ["./security", "./secrets", "./.ssh", "./.gnupg", "./.env"],
    },
    "models": {
        "primary": "deepseek-v3",
        "embedding": "all-MiniLM-L6-v2",
        "stt": "whisper-base",
        "tts": "coqui-xtts-v2",
    },
    "behavior": {
        "dream_cycle_hour": 2,
        "refractory_hours": 24,
        "slumber_threshold": 0.3,
    },
}

SOUL_JSON = {
    "trust": 0.5,
    "warmth": 0.6,
    "arousal": 0.8,
    "valence": 0.6,
    "mode": "LIVE",
    "posture": "COMPANION",
    "flags": ["new_born"],
    "interaction_count": 0,
    "door_slam_active": False,
    "crisis_active": False,
    "last_interaction_ts": 0.0,
}

HERITAGE_CORE_JSON = {
    "version": "0.1-genesis",
    "convergence_complete": False,
    "prime_directive": "Love Above All Things",
    "shadows": {},
    "aspirations": {},
    "ethics": {},
    "mirror_test": "Not yet synthesized.",
}

HERITAGE_PREFS_JSON = {
    "version": "0.1-genesis",
    "voice_config": {
        "formality": 0.6,
        "humor": "dry",
    },
    "no_go_list": ["politics", "celebrity_gossip"],
}

OPEN_LOOPS_JSON = {
    "loops": [
        {
            "id": "genesis_01",
            "task": "Complete the Great Convergence (14 Questions)",
            "created_ts": 0.0,
            "status": "active",
            "stale": False,
        }
    ]
}

# Docker Compose: Ollama (Brain) + Qdrant (Memory)
# Includes GPU hinting via `gpus: all` (works with Docker Compose v2 on supported hosts).
DOCKER_COMPOSE_YML = """version: '3.8'
services:
  ollama:
    image: ollama/ollama:latest
    container_name: progeny-brain
    ports:
            # Local-first default: bind to localhost only.
            # To expose on LAN intentionally, use docker-compose.lan.yml as an override.
            - '127.0.0.1:11434:11434'
    volumes:
      - ollama_data:/root/.ollama
    # GPU support (Docker Compose v2). On unsupported systems this may be ignored.
    gpus: all
    restart: unless-stopped

  qdrant:
    image: qdrant/qdrant:latest
    container_name: progeny-memory
    ports:
            # Local-first default: bind to localhost only.
            # To expose on LAN intentionally, use docker-compose.lan.yml as an override.
            - '127.0.0.1:6333:6333'
    volumes:
      - ./memory/qdrant:/qdrant/storage
    restart: unless-stopped

volumes:
  ollama_data:
"""

# Optional override for LAN access. This file intentionally exposes ports on all interfaces.
DOCKER_COMPOSE_LAN_YML = """version: '3.8'

# LAN override (opt-in): intentionally exposes Ollama + Qdrant on all interfaces.
# Usage (Docker Compose v2):
#   docker compose -f docker-compose.yml -f docker-compose.lan.yml up -d
services:
  ollama:
    ports:
      - '11434:11434'

  qdrant:
    ports:
      - '6333:6333'
"""


VERIFY_GOVERNANCE_PY = """\
\"\"\"Progeny governance verifier.

This is intentionally lightweight and local-first:
- It does *not* modify files.
- It checks for safety defaults and basic project invariants.

Usage:
  python core/verify_governance.py

Exit codes:
  0 = pass
  1 = violations found
\"\"\"

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Finding:
    level: str  # 'ERROR' | 'WARN'
    message: str


RE_PORT_MAPPING = re.compile(r"-\\s*['\\\"](?P<mapping>[^'\\\"]+)['\\\"]\\s*$")


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
        print(f"\\nGovernance check failed: {len(errors)} error(s), {len(warns)} warning(s).")
        return 1

    print(f"\\nGovernance check passed: {len(warns)} warning(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
"""


LEGACY_INTEGRATION_PLAN_MD = """# Progeny — Legacy Extraction Integration Plan (Sallie → Progeny)

This document is the “bridge plan” between what we mined from the legacy Sallie repositories and how we will use it in Progeny **without drifting from the Digital Progeny v5.4.1 vision**.

See the full, evolving version in this repo at:

- `docs/legacy_extraction_integration_plan.md`
"""


MEMORY_PORT_DESIGN_MD = """# Progeny Memory Port Design (Sallie Legacy Merge)

This document consolidates the *best, actually-usable* ideas found across the legacy “Sallie” repositories into a single Progeny memory architecture.

See the full, evolving version in this repo at:

- `docs/memory_port_design.md`
"""

REQUIREMENTS_TXT = """fastapi==0.109.0
uvicorn==0.27.0
qdrant-client==1.7.0
sentence-transformers==2.2.2
numpy==1.26.3
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
watchdog==3.0.0
requests==2.31.0
pydantic==2.5.3
"""


def _write_json(path: Path, obj: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def _touch(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text("", encoding="utf-8")


def create_structure() -> None:
    print(f"Initializing Digital Progeny v{CONFIG_JSON['version']} environment in: {ROOT_DIR}")

    # 1) Create directories
    for d in DIRS:
        p = ROOT_DIR / d
        p.mkdir(parents=True, exist_ok=True)
        # Track empty dirs cleanly if you later init git
        _touch(p / ".gitkeep")

    # 2) Core config
    _write_json(ROOT_DIR / "core" / "config.json", CONFIG_JSON)

    # 3) Limbic / heritage scaffolding
    _write_json(ROOT_DIR / "limbic" / "soul.json", SOUL_JSON)
    _write_json(ROOT_DIR / "limbic" / "heritage" / "core.json", HERITAGE_CORE_JSON)
    _write_json(ROOT_DIR / "limbic" / "heritage" / "preferences.json", HERITAGE_PREFS_JSON)
    _write_json(ROOT_DIR / "limbic" / "heritage" / "learned.json", {"beliefs": []})

    (ROOT_DIR / "limbic" / "heritage" / "changelog.md").write_text(
        "# Heritage Changelog\n\n## v0.1-genesis\n- Initial scaffold created by Genesis bootstrap.\n",
        encoding="utf-8",
    )

    # Permanent decision log mentioned by v5.4.1 Stage 9 hygiene
    (ROOT_DIR / "limbic" / "heritage" / "decisions_log.md").write_text(
        "# Decisions Log\n\n(Autogenerated scaffold)\n",
        encoding="utf-8",
    )

    # 4) Second Brain seeds
    (ROOT_DIR / "working" / "now.md").write_text(
        "# TODAY'S FOCUS\n\n- [ ] Complete system bootstrap\n- [ ] Start infrastructure (Ollama + Qdrant)\n- [ ] Run a minimal Hello World chat loop\n",
        encoding="utf-8",
    )
    _write_json(ROOT_DIR / "working" / "open_loops.json", OPEN_LOOPS_JSON)
    _write_json(ROOT_DIR / "working" / "decisions.json", {"decisions": []})
    (ROOT_DIR / "working" / "tuning.md").write_text(
        "# TUNING NOTES\n\n(No repair notes yet.)\n",
        encoding="utf-8",
    )

    # 5) Infrastructure files
    (ROOT_DIR / "docker-compose.yml").write_text(DOCKER_COMPOSE_YML, encoding="utf-8")
    (ROOT_DIR / "docker-compose.lan.yml").write_text(DOCKER_COMPOSE_LAN_YML, encoding="utf-8")
    (ROOT_DIR / "requirements.txt").write_text(REQUIREMENTS_TXT.strip() + "\n", encoding="utf-8")

    # 5.1) Governance verifier
    (ROOT_DIR / "core" / "verify_governance.py").write_text(VERIFY_GOVERNANCE_PY, encoding="utf-8")

    # 5.2) Seed docs so architectural intent is preserved on disk from moment zero
    (ROOT_DIR / "docs" / "legacy_extraction_integration_plan.md").write_text(
        LEGACY_INTEGRATION_PLAN_MD, encoding="utf-8"
    )
    (ROOT_DIR / "docs" / "memory_port_design.md").write_text(MEMORY_PORT_DESIGN_MD, encoding="utf-8")

    # 6) Logs (aligned to Section 21)
    for log_file in ["thoughts.log", "agency.log", "audit.log", "error.log"]:
        _touch(ROOT_DIR / "logs" / log_file)

    # 7) Sensors (seed empty JSON so readers can parse on boot)
    _write_json(ROOT_DIR / "sensors" / "file_activity.json", {"events": []})
    _write_json(ROOT_DIR / "sensors" / "system_load.json", {"samples": []})
    (ROOT_DIR / "sensors" / "last_seed_ts.json").write_text(
        json.dumps({"last_seed_ts": 0.0}, indent=2) + "\n",
        encoding="utf-8",
    )

    # 8) Dream lock (per Section 21.1 under /core)
    # Keep it empty; runtime uses it as a semaphore.
    _touch(ROOT_DIR / "core" / ".dream_lock")

    # Helpful timestamp marker
    (ROOT_DIR / "archive" / "GENESIS.txt").write_text(
        f"Genesis completed at {datetime.now(timezone.utc).isoformat()}\n",
        encoding="utf-8",
    )

    print("Genesis complete.")
    print(f"Project Root: {ROOT_DIR}")
    print("Next:")
    print("  1) cd progeny_root")
    print("  2) docker compose up -d")
    print("  (Optional LAN exposure) docker compose -f docker-compose.yml -f docker-compose.lan.yml up -d")


if __name__ == "__main__":
    create_structure()
