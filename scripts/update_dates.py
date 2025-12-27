#!/usr/bin/env python3
"""Update date placeholders in documentation files."""

import re
from pathlib import Path
from datetime import datetime

# Get current date
current_date = datetime.now().strftime('%Y-%m-%d')
current_date_short = datetime.now().strftime('%Y%m%d')

# Patterns to replace
replacements = {
    '2025-01-XX': current_date,
    'YYYYMMDD': current_date_short,
    '202501XX': current_date_short,
}

def update_file(file_path: Path):
    """Update date placeholders in a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for old, new in replacements.items():
            content = content.replace(old, new)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {file_path}")
            return True
        return False
    except Exception as e:
        print(f"Error updating {file_path}: {e}")
        return False

def main():
    """Update all markdown files in sallie directory."""
    sallie_dir = Path("sallie")
    if not sallie_dir.exists():
        print(f"Directory {sallie_dir} does not exist")
        return
    
    updated_count = 0
    for md_file in sallie_dir.rglob("*.md"):
        if update_file(md_file):
            updated_count += 1
    
    print(f"\nUpdated {updated_count} files with date {current_date} / {current_date_short}")

if __name__ == "__main__":
    main()

