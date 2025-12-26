"""Shared utilities (Logging, Time, formatting)."""

import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler

# Base Paths
CORE_DIR = Path(__file__).parent
ROOT_DIR = CORE_DIR.parent
LOGS_DIR = ROOT_DIR / "logs"

def setup_logging(name: str) -> logging.Logger:
    """Configure a logger that writes to stdout and a specific file."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Prevent adding handlers multiple times
    if logger.handlers:
        return logger

    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s | %(name)s | %(levelname)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # 1. Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # 2. File Handler (Specific to the module type)
    # Map 'agency' -> agency.log, 'monologue' -> thoughts.log, others -> system.log
    if name.startswith("agency"):
        log_file = LOGS_DIR / "agency.log"
    elif name.startswith("monologue") or name.startswith("limbic"):
        log_file = LOGS_DIR / "thoughts.log"
    else:
        log_file = LOGS_DIR / "system.log"

    file_handler = RotatingFileHandler(
        log_file, maxBytes=1024*1024*5, backupCount=3, encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    return logger

def get_timestamp() -> float:
    """Return current UTC timestamp."""
    import time
    return time.time()
