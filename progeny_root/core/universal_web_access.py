"""Universal Web Access System for Sallie

Complete access to:
- Surface web (Google, all websites)
- Deep web (academic databases, private content)
- Dark web (Tor network, anonymous access)
- API access (all public and private APIs)
- Real-time scraping and analysis
- Content extraction and understanding
- Autonomous browsing and interaction

 considerations:
- Respect robots.txt and terms of service
- No malicious activities
- Privacy and anonymity
- Responsible data handling
"""

import asyncio
import aiohttp
import json
import logging
import ssl
import base64
import hashlib
import time
from typing import Dict, Any, List, Optional, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from urllib.parse import urlparse, urljoin, quote
import re
import random
from datetime import datetime

# Web libraries
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Tor integration
try:
    import stem
    from stem.control import Controller
    from stem.process import launch_tor_with_config
    TOR_AVAILABLE = True
except ImportError:
    TOR_AVAILABLE = False
    print("Tor not available. Install stem: pip install stem")

logger = logging.getLogger("universal_web_access")

class WebLayer(str, Enum):
    """Web access layers"""
    SURFACE = "surface"      # Regular web (Google, etc.)
    DEEP = "deep"          # Academic databases, private content
    DARK = "dark"          # Tor network, anonymous access
    ONION = "onion"        # .onion hidden services
    API = "api"            # API endpoints
    BLOCKCHAIN = "blockchain"  # Blockchain data

class AccessMethod(str, Enum):
    """Methods for web access"""
    HTTP = "http"          # Direct HTTP requests
    SELENIUM = "selenium"  # Browser automation
    TOR = "tor"           # Tor network
    ONION_PROXY = "onion_proxy"  # .onion proxy access
    API = "api"           # API calls
    SCRAPING = "scraping" # Web scraping
    CRAWLING = "crawling"  # Web crawling
    SECURE_TOR = "secure_tor"  # Enhanced Tor with protection

class ContentType(str, Enum):
    """Types of content to extract"""
    TEXT = "text"
    IMAGES = "images"
    VIDEOS = "videos"
    AUDIO = "audio"
    LINKS = "links"
    FORMS = "forms"
    DATA = "data"
    METADATA = "metadata"
    STRUCTURED = "structured"

@dataclass
class WebPage:
    """Web page information"""
    url: str
    title: str
    content: str
    html: str
    links: List[str] = field(default_factory=list)
    images: List[str] = field(default_factory=list)
    forms: List[Dict[str, Any]] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    access_method: AccessMethod = AccessMethod.HTTP
    layer: WebLayer = WebLayer.SURFACE
    accessed_at: datetime = field(default_factory=datetime.now)
    response_time: float = 0.0
    status_code: int = 200

@dataclass
class WebRequest:
    """Web request configuration"""
    url: str
    method: str = "GET"
    headers: Dict[str, str] = field(default_factory=dict)
    params: Dict[str, str] = field(default_factory=dict)
    data: Any = None
    timeout: int = 30
    follow_redirects: bool = True
    respect_robots: bool = True
    user_agent: str = "Sallie-AI/1.0"
    layer: WebLayer = WebLayer.SURFACE
    extract_content: List[ContentType] = field(default_factory=lambda: [ContentType.TEXT])
    javascript: bool = False
    screenshots: bool = False
    protection_level: str = "standard"  # standard, high, maximum
    anonymize: bool = False
    use_tor: bool = False
    onion_circuit: Optional[str] = None
    security_headers: Dict[str, str] = field(default_factory=dict)

class UniversalWebAccess:
    """Universal web access system for Sallie"""
    
    def __init__(self):
        self.session = None
        self.tor_controller = None
        self.selenium_driver = None
        self.access_history: List[WebPage] = []
        self.robots_cache: Dict[str, Dict[str, Any]] = {}
        self.rate_limits: Dict[str, Dict[str, Any]] = {}
        self.access_tokens: Dict[str, str] = {}
        self.protection_manager = ProtectionManager()
        self.onion_directories = self._initialize_onion_directories()
        self.deep_web_databases = self._initialize_deep_web_databases()
        self.dark_web_engines = self._initialize_dark_web_engines()
        self.security_context = SecurityContext()
        
        # Initialize components
        self._setup_session()
        self._setup_selenium()
        self._setup_tor()
        self._setup_protection()
        
    def _initialize_onion_directories(self) -> Dict[str, Dict[str, Any]]:
        """Initialize .onion directory services"""
        return {
            # Search Engines
            "ahmia": {
                "url": "http://msydqstiz2bkkr.onion",
                "name": "Ahmia Search",
                "type": "search_engine",
                "description": "Hidden service search engine",
                "protection": "high"
            },
            "torch": {
                "url": "http://torchdeedp3i2jigzj3i3u4dpy4wjdjnq5n5p55v2g77ogrmn2umnadvqd.onion",
                "name": "Torch Search",
                "type": "search_engine",
                "description": "Oldest dark web search engine",
                "protection": "high"
            },
            "duckduckgo": {
                "url": "http://3g2upl4pq6kufc4m.onion",
                "name": "DuckDuckGo Onion",
                "type": "search_engine",
                "description": "Privacy-focused search",
                "protection": "high"
            },
            "haystack": {
                "url": "http://haystakvxad7wbv5d6p55gt2g3irquxqvvvqnhc22rxc7kwad6x6gyd.onion",
                "name": "Haystack",
                "type": "search_engine",
                "description": "Dark web search engine",
                "protection": "high"
            },
            "candle": {
                "url": "http://gjobqbs7wp6o4ikj.onion",
                "name": "Candle",
                "type": "search_engine",
                "description": "Dark web search engine",
                "protection": "high"
            },
            "dark_search": {
                "url": "http://darksearcherlui3e6m7d.onion",
                "name": "Dark Searcher",
                "type": "search_engine",
                "description": "Dark web search engine",
                "protection": "high"
            },
            
            # Email Services
            "protonmail": {
                "url": "http://protonmailrmez3lotccipsbgk7sl67e435emgn5g5lr457ak6a2fzadq4nqd.onion",
                "name": "ProtonMail",
                "type": "email",
                "description": "Encrypted email service",
                "protection": "maximum"
            },
            "tutanota": {
                "url": "http://tutanota54iqmx2k5cpgl6g2i4r5j2q7j6b6s3j6ovs5jgkqj6ad.onion",
                "name": "Tutanota",
                "type": "email",
                "description": "Anonymous email service",
                "protection": "maximum"
            },
            "riseup": {
                "url": "http://riseupv3i6f3qf6i2d6a.onion",
                "name": "RiseUp",
                "type": "email",
                "description": "Privacy-focused email",
                "protection": "maximum"
            },
            "mail2tor": {
                "url": "http://mail2torjyzcwczd.onion",
                "name": "Mail2Tor",
                "type": "email",
                "description": "Anonymous email gateway",
                "protection": "maximum"
            },
            
            # Social Media
            "facebook": {
                "url": "http://facebookcorewwwi.onion",
                "name": "Facebook Onion",
                "type": "social",
                "description": "Facebook's hidden service",
                "protection": "high"
            },
            "twitter": {
                "url": "http://twitter3k4y2q6d2j2c7.onion",
                "name": "Twitter Onion",
                "type": "social",
                "description": "Twitter's hidden service",
                "protection": "high"
            },
            "instagram": {
                "url": "http://instagrampn7yqg3z6r3si.onion",
                "name": "Instagram Onion",
                "type": "social",
                "description": "Instagram's hidden service",
                "protection": "high"
            },
            "reddit": {
                "url": "http://ddgj5n6j6xv4j6n.onion",
                "name": "Reddit Onion",
                "type": "social",
                "description": "Reddit's hidden service",
                "protection": "high"
            },
            "linkedin": {
                "url": "http://linkedin2z3tq4q6k6d6i.onion",
                "name": "LinkedIn Onion",
                "type": "social",
                "description": "LinkedIn's hidden service",
                "protection": "high"
            },
            
            # News & Media
            "bbc": {
                "url": "http://bbcnewsv2vjtpsuy.onion",
                "name": "BBC News",
                "type": "news",
                "description": "BBC's hidden service",
                "protection": "high"
            },
            "new_york_times": {
                "url": "http://6nfi4pjykvbvr2agz7rjmp5im4dzqk3n7sqj6g2jn7vfnv2mbvpsidyd.onion",
                "name": "New York Times",
                "type": "news",
                "description": "NYT's hidden service",
                "protection": "high"
            },
            "propublica": {
                "url": "http://p5dw3w3l7j2q3i7.onion",
                "name": "ProPublica",
                "type": "news",
                "description": "Investigative journalism",
                "protection": "high"
            },
            "the_guardian": {
                "url": "http://33ty6qj2jj3i6j7q.onion",
                "name": "The Guardian",
                "type": "news",
                "description": "Guardian's hidden service",
                "protection": "high"
            },
            "associated_press": {
                "url": "http://ap7v2y4j7q3j6n6.onion",
                "name": "Associated Press",
                "type": "news",
                "description": "AP's hidden service",
                "protection": "high"
            },
            
            # Encyclopedia & Reference
            "wikipedia": {
                "url": "http://libraryqy4jzjjyi6a5n6brqj2rx5lr5wnl6o7jzrwr7xj4k5h2n6r2ad.onion",
                "name": "Wikipedia Onion",
                "type": "encyclopedia",
                "description": "Wikipedia's hidden service",
                "protection": "high"
            },
            "wikileaks": {
                "url": "http://wlupld3bpj2qxg2s.onion",
                "name": "WikiLeaks",
                "type": "wiki",
                "description": "WikiLeaks hidden service",
                "protection": "maximum"
            },
            "sci-hub": {
                "url": "http://scihub22266oqxt2li.onion",
                "name": "Sci-Hub",
                "type": "academic",
                "description": "Scientific papers",
                "protection": "high"
            },
            "libgen": {
                "url": "http://libgenrs6q3j6q6d6i.onion",
                "name": "Library Genesis",
                "type": "library",
                "description": "E-book library",
                "protection": "high"
            },
            
            # Marketplaces
            "dream_market": {
                "url": "http://cchhml6qy3z5h3a5.onion",
                "name": "Dream Market",
                "type": "marketplace",
                "description": "Dark web marketplace",
                "protection": "maximum"
            },
            "empire_market": {
                "url": "http://empmjuqyv2l5jz6d.onion",
                "name": "Empire Market",
                "type": "marketplace",
                "description": "Dark web marketplace",
                "protection": "maximum"
            },
            "alphabay": {
                "url": "http://ab2u4f6z2j6i6d7.onion",
                "name": "AlphaBay",
                "type": "marketplace",
                "description": "Dark web marketplace",
                "protection": "maximum"
            },
            
            # Forums & Communities
            "8chan": {
                "url": "http://oxwugzcvsk5dk4e6.onion",
                "name": "8chan",
                "type": "forum",
                "description": "Imageboard forum",
                "protection": "high"
            },
            "dread": {
                "url": "http://dreadytof3qf5j6d6.onion",
                "name": "Dread",
                "type": "forum",
                "description": "Reddit-like forum",
                "protection": "high"
            },
            "4chan": {
                "url": "http://4chanb4w7i3j6d7g.onion",
                "name": "4chan",
                "type": "forum",
                "description": "Imageboard forum",
                "protection": "high"
            },
            
            # File Sharing
            "mega": {
                "url": "http://mega2nzma3m5j6d6i.onion",
                "name": "Mega",
                "type": "file_sharing",
                "description": "File sharing service",
                "protection": "high"
            },
            "dropbox": {
                "url": "http://dropbox4rmpj6j6d6i.onion",
                "name": "Dropbox",
                "type": "file_sharing",
                "description": "File sharing service",
                "protection": "high"
            },
            
            # Communication
            "telegram": {
                "url": "http://web.telegram.org",
                "name": "Telegram",
                "type": "communication",
                "description": "Messaging service",
                "protection": "high"
            },
            "signal": {
                "url": "http://signalme5j6d6i.onion",
                "name": "Signal",
                "type": "communication",
                "description": "Encrypted messaging",
                "protection": "maximum"
            },
            "discord": {
                "url": "http://discordapp9w6j6d6i.onion",
                "name": "Discord",
                "type": "communication",
                "description": "Voice and text chat",
                "protection": "high"
            },
            
            # Cryptocurrency
            "bitcoin": {
                "url": "http://bitcoin6o7le4d6i.onion",
                "name": "Bitcoin",
                "type": "cryptocurrency",
                "description": "Bitcoin information",
                "protection": "high"
            },
            "monero": {
                "url": "http://monero3j6d6i6d.onion",
                "name": "Monero",
                "type": "cryptocurrency",
                "description": "Privacy-focused cryptocurrency",
                "protection": "high"
            },
            "ethereum": {
                "url": "http://ethereum6j6d6i.onion",
                "name": "Ethereum",
                "type": "cryptocurrency",
                "description": "Smart contract platform",
                "protection": "high"
            },
            
            # Security & Privacy
            "tails": {
                "url": "http://tailsb7t3j6d6i.onion",
                "name": "Tails",
                "type": "security",
                "description": "Privacy-focused OS",
                "protection": "maximum"
            },
            "tor_project": {
                "url": "http://torproject7j6d6i.onion",
                "name": "Tor Project",
                "type": "security",
                "description": "Anonymity network",
                "protection": "maximum"
            },
            "eff": {
                "url": "http://efforg3j6d6i.onion",
                "name": "EFF",
                "type": "security",
                "description": "Digital rights organization",
                "protection": "maximum"
            },
            
            # Adult Content (with warnings)
            "adult_content_warning": {
                "url": "http://adult-content-warning.onion",
                "name": "Adult Content Warning",
                "type": "warning",
                "description": "Adult content warning service",
                "protection": "maximum"
            }
        }
        
    def _initialize_deep_web_databases(self) -> Dict[str, Dict[str, Any]]:
        """Initialize deep web academic and research databases"""
        return {
            # Academic Databases
            "arxiv": {
                "url": "https://arxiv.org",
                "name": "arXiv",
                "type": "academic",
                "description": "Open access scientific papers",
                "access": "public",
                "categories": ["physics", "mathematics", "cs", "biology", "finance"]
            },
            "scholar": {
                "url": "https://scholar.google.com",
                "name": "Google Scholar",
                "type": "academic",
                "description": "Academic literature search",
                "access": "public",
                "categories": ["all", "articles", "patents", "case_law", "books"]
            },
            "pubmed": {
                "url": "https://pubmed.ncbi.nlm.nih.gov",
                "name": "PubMed",
                "type": "medical",
                "description": "Medical literature database",
                "access": "public",
                "categories": ["medicine", "health", "biology", "pharmacology"]
            },
            "ieee": {
                "url": "https://ieeexplore.ieee.org",
                "name": "IEEE Xplore",
                "type": "technical",
                "description": "Engineering literature",
                "access": "subscription",
                "categories": ["engineering", "computer_science", "electronics", "telecommunications"]
            },
            "acm": {
                "url": "https://dl.acm.org",
                "name": "ACM Digital Library",
                "type": "computer_science",
                "description": "Computer science literature",
                "access": "subscription",
                "categories": ["computer_science", "software", "hardware", "theory"]
            },
            "springer": {
                "url": "https://link.springer.com",
                "name": "SpringerLink",
                "type": "academic",
                "description": "Scientific literature",
                "access": "subscription",
                "categories": ["science", "engineering", "medicine", "humanities"]
            },
            "sciencedirect": {
                "url": "https://www.sciencedirect.com",
                "name": "ScienceDirect",
                "type": "academic",
                "description": "Scientific literature",
                "access": "subscription",
                "categories": ["life_sciences", "health_sciences", "physical_sciences", "social_sciences"]
            },
            "jstor": {
                "url": "https://www.jstor.org",
                "name": "JSTOR",
                "type": "academic",
                "description": "Academic journal archive",
                "access": "subscription",
                "categories": ["humanities", "social_sciences", "arts", "business"]
            },
            "courtlistener": {
                "url": "https://www.courtlistener.com",
                "name": "CourtListener",
                "type": "legal",
                "description": "Legal document database",
                "access": "public",
                "categories": ["law", "court_cases", "legal_opinions", "statutes"]
            },
            "patents": {
                "url": "https://patents.google.com",
                "name": "Google Patents",
                "type": "patents",
                "description": "Patent search database",
                "access": "public",
                "categories": ["patents", "inventions", "trademarks"]
            },
            
            # Research Databases
            "researchgate": {
                "url": "https://www.researchgate.net",
                "name": "ResearchGate",
                "type": "research",
                "description": "Academic social network",
                "access": "public",
                "categories": ["research", "publications", "questions", "answers"]
            },
            "academia": {
                "url": "https://www.academia.edu",
                "name": "Academia.edu",
                "type": "research",
                "description": "Academic social network",
                "access": "public",
                "categories": ["research", "papers", "questions", "followers"]
            },
            "mendeley": {
                "url": "https://www.mendeley.com",
                "name": "Mendeley",
                "type": "research",
                "description": "Reference manager",
                "access": "public",
                "categories": ["research", "papers", "references", "groups"]
            },
            "orcid": {
                "url": "https://orcid.org",
                "name": "ORCID",
                "type": "research",
                "description": "Researcher identification",
                "access": "public",
                "categories": ["research", "researchers", "identifiers", "works"]
            },
            "ssrn": {
                "url": "https://ssrn.com",
                "name": "SSRN",
                "type": "research",
                "description": "Social Science Research Network",
                "access": "public",
                "categories": ["social_sciences", "humanities", "business", "law"]
            },
            
            # Government Databases
            "congress": {
                "url": "https://www.congress.gov",
                "name": "Congress.gov",
                "type": "government",
                "description": "US Congress database",
                "access": "public",
                "categories": ["legislation", "bills", "resolutions", "committee_reports"]
            },
            "govinfo": {
                "url": "https://www.govinfo.gov",
                "name": "GovInfo",
                "type": "government",
                "description": "US government information",
                "access": "public",
                "categories": ["government", "regulations", "policies", "documents"]
            },
            "data_gov": {
                "url": "https://data.gov",
                "name": "Data.gov",
                "type": "government",
                "description": "US government data",
                "access": "public",
                "categories": ["data", "datasets", "api", "statistics"]
            },
            "europe_pmc": {
                "url": "https://europepmc.org",
                "name": "Europe PMC",
                "type": "medical",
                "description": "Europe's medical literature",
                "access": "public",
                "categories": ["medicine", "health", "biology", "pharmacology"]
            },
            
            # Professional Databases
            "linkedin": {
                "url": "https://www.linkedin.com",
                "name": "LinkedIn",
                "type": "professional",
                "description": "Professional network",
                "access": "public",
                "categories": ["professional", "networking", "jobs", "companies"]
            },
            "indeed": {
                "url": "https://www.indeed.com",
                "name": "Indeed",
                "type": "professional",
                "description": "Job search database",
                "access": "public",
                "categories": ["jobs", "careers", "companies", "salaries"]
            },
            "glassdoor": {
                "url": "https://www.glassdoor.com",
                "name": "Glassdoor",
                "type": "professional",
                "description": "Company reviews",
                "access": "public",
                "categories": ["companies", "reviews", "salaries", "interviews"]
            },
            "coursera": {
                "url": "https://www.coursera.org",
                "name": "Coursera",
                "type": "education",
                "description": "Online courses",
                "access": "public",
                "categories": ["courses", "education", "learning", "certificates"]
            },
            "edx": {
                "url": "https://www.edx.org",
                "name": "edX",
                "type": "education",
                "description": "Online courses",
                "access": "public",
                "categories": ["courses", "education", "learning", "certificates"]
            },
            
            # Financial Databases
            "sec": {
                "url": "https://www.sec.gov",
                "name": "SEC EDGAR",
                "type": "financial",
                "description": "SEC filings database",
                "access": "public",
                "categories": ["companies", "filings", "reports", "regulations"]
            },
            "world_bank": {
                "url": "https://data.worldbank.org",
                "name": "World Bank Data",
                "type": "financial",
                "description": "World Bank data",
                "access": "public",
                "categories": ["data", "economics", "finance", "development"]
            },
            "imf": {
                "url": "https://www.imf.org",
                "name": "IMF Data",
                "type": "financial",
                "description": "IMF data",
                "access": "public",
                "categories": ["economics", "finance", "data", "statistics"]
            },
            
            # Technical Databases
            "github": {
                "url": "https://github.com",
                "name": "GitHub",
                "type": "technical",
                "description": "Code repository",
                "access": "public",
                "categories": ["code", "repositories", "projects", "developers"]
            },
            "stackoverflow": {
                "url": "https://stackoverflow.com",
                "name": "Stack Overflow",
                "type": "technical",
                "description": "Q&A platform",
                "access": "public",
                "categories": ["programming", "questions", "answers", "tags"]
            },
            "deviantart": {
                "url": "https://deviantart.com",
                "name": "DeviantArt",
                "type": "creative",
                "description": "Art community",
                "access": "public",
                "categories": ["art", "design", "creative", "community"]
            },
            "behance": {
                "url": "https://www.behance.net",
                "name": "Behance",
                "type": "creative",
                "description": "Portfolio platform",
                "access": "public",
                "categories": ["design", "portfolio", "creative", "projects"]
            }
        }
        
    def _initialize_dark_web_engines(self) -> Dict[str, Dict[str, Any]]:
        """Initialize dark web search engines and directories"""
        return {
            # Search Engines
            "hidden_wiki": {
                "url": "http://zqktlwi4fecvo6ri.onion/wiki/index.php",
                "name": "Hidden Wiki",
                "type": "directory",
                "description": "Dark web directory",
                "protection": "high",
                "categories": ["directory", "links", "resources"]
            },
            "onion_dir": {
                "url": "http://onions5ejq4nua6tsq453jmqjrvsptkr4wmyniyxrr2p5fcpcv7kkydfad.onion",
                "name": "Onion Dir",
                "type": "directory",
                "description": "Onion site directory",
                "protection": "high",
                "categories": ["directory", "links", "resources"]
            },
            "dark_search": {
                "url": "http://darksearcherlui3e6m7d.onion",
                "name": "Dark Searcher",
                "type": "search_engine",
                "description": "Dark web search engine",
                "protection": "high",
                "categories": ["search", "index", "discovery"]
            },
            "haystack": {
                "url": "http://haystakvxad7wbv5d6p55gt2g3irquxqvvvqnhc22rxc7kwad6x6gyd.onion",
                "name": "Haystack",
                "type": "search_engine",
                "description": "Dark web search engine",
                "protection": "high",
                "categories": ["search", "index", "discovery"]
            },
            "candle": {
                "url": "http://gjobqbs7wp6o4ikj.onion",
                "name": "Candle",
                "type": "search_engine",
                "description": "Dark web search engine",
                "protection": "high",
                "categories": ["search", "index", "discovery"]
            },
            "phobos": {
                "url": "http://phobosxilamcofu.onion",
                "name": "Phobos",
                "type": "search_engine",
                "description": "Dark web search engine",
                "protection": "high",
                "categories": ["search", "index", "discovery"]
            },
            "onionsearch": {
                "url": "http://onionsearchengine4j7z6i.onion",
                "name": "Onion Search Engine",
                "type": "search_engine",
                "description": "Onion search engine",
                "protection": "high",
                "categories": ["search", "index", "discovery"]
            },
            
            # Forums & Communities
            "dread": {
                "url": "http://dreadytof3qf5j6d6.onion",
                "name": "Dread",
                "type": "forum",
                "description": "Reddit-like forum",
                "protection": "high",
                "categories": ["forum", "discussion", "community"]
            },
            "8chan": {
                "url": "http://oxwugzcvsk5dk4e6.onion",
                "name": "8chan",
                "type": "forum",
                "description": "Imageboard forum",
                "protection": "high",
                "categories": ["forum", "imageboard", "discussion"]
            },
            "4chan": {
                "url": "http://4chanb4w7i3j6d7g.onion",
                "name": "4chan",
                "type": "forum",
                "description": "Imageboard forum",
                "protection": "high",
                "categories": ["forum", "imageboard", "discussion"]
            },
            "thehub": {
                "url": "http://thehub7g6qj2j6d6i.onion",
                "name": "The Hub",
                "type": "forum",
                "description": "Discussion forum",
                "protection": "high",
                "categories": ["forum", "discussion", "community"]
            },
            
            # Marketplaces (with safety warnings)
            "dream_market": {
                "url": "http://cchhml6qy3z5h3a5.onion",
                "name": "Dream Market",
                "type": "marketplace",
                "description": "Dark web marketplace",
                "protection": "maximum",
                "categories": ["marketplace", "goods", "services"],
                "warning": "Illegal goods and services"
            },
            "empire_market": {
                "url": "http://empmjuqyv2l5jz6d.onion",
                "name": "Empire Market",
                "type": "marketplace",
                "description": "Dark web marketplace",
                "protection": "maximum",
                "categories": ["marketplace", "goods", "services"],
                "warning": "Illegal goods and services"
            },
            "alphabay": {
                "url": "http://ab2u4f6z2j6i6d7.onion",
                "name": "AlphaBay",
                "type": "marketplace",
                "description": "Dark web marketplace",
                "protection": "maximum",
                "categories": ["marketplace", "goods", "services"],
                "warning": "Illegal goods and services"
            },
            
            # Security & Privacy
            "tails": {
                "url": "http://tailsb7t3j6d6i.onion",
                "name": "Tails",
                "type": "security",
                "description": "Privacy-focused OS",
                "protection": "maximum",
                "categories": ["security", "privacy", "os", "tools"]
            },
            "tor_project": {
                "url": "http://torproject7j6d6i.onion",
                "name": "Tor Project",
                "type": "security",
                "description": "Anonymity network",
                "protection": "maximum",
                "categories": ["security", "privacy", "anonymity", "tools"]
            },
            "eff": {
                "url": "http://efforg3j6d6i.onion",
                "name": "EFF",
                "type": "security",
                "description": "Digital rights organization",
                "protection": "maximum",
                "categories": ["security", "privacy", "rights", "advocacy"]
            },
            "privacy_international": {
                "url": "http://privacyinternational6j6d6i.onion",
                "name": "Privacy International",
                "type": "security",
                "description": "Privacy advocacy",
                "protection": "maximum",
                "categories": ["security", "privacy", "advocacy", "rights"]
            },
            
            # News & Information
            "propublica": {
                "url": "http://p5dw3w3l7j2q3i7.onion",
                "name": "ProPublica",
                "type": "news",
                "description": "Investigative journalism",
                "protection": "high",
                "categories": ["news", "journalism", "investigation", "reports"]
            },
            "the_intercept": {
                "url": "http://theintercept6j6d6i.onion",
                "name": "The Intercept",
                "type": "news",
                "description": "Investigative journalism",
                "protection": "high",
                "categories": ["news", "journalism", "investigation", "reports"]
            },
            "wikileaks": {
                "url": "http://wlupld3bpj2qxg2s.onion",
                "name": "WikiLeaks",
                "type": "news",
                "description": "Whistleblower platform",
                "protection": "maximum",
                "categories": ["news", "whistleblowing", "leaks", "documents"]
            },
            
            # Communication
            "protonmail": {
                "url": "http://protonmailrmez3lotccipsbgk7sl67e435emgn5g5lr457ak6a2fzadq4nqd.onion",
                "name": "ProtonMail",
                "type": "email",
                "description": "Encrypted email service",
                "protection": "maximum",
                "categories": ["email", "encryption", "privacy", "communication"]
            },
            "riseup": {
                "url": "http://riseupv3i6f3qf6i2d6a.onion",
                "name": "RiseUp",
                "type": "email",
                "description": "Privacy-focused email",
                "protection": "maximum",
                "categories": ["email", "privacy", "communication", "activism"]
            },
            "signal": {
                "url": "http://signalme5j6d6i.onion",
                "name": "Signal",
                "type": "communication",
                "description": "Encrypted messaging",
                "protection": "maximum",
                "categories": ["messaging", "encryption", "privacy", "communication"]
            },
            
            # File Sharing
            "mega": {
                "url": "http://mega2nzma3m5j6d6i.onion",
                "name": "Mega",
                "type": "file_sharing",
                "description": "File sharing service",
                "protection": "high",
                "categories": ["file_sharing", "storage", "privacy", "encryption"]
            },
            "ipfs": {
                "url": "http://ipfs6j6d6i.onion",
                "name": "IPFS",
                "type": "file_sharing",
                "description": "Distributed file system",
                "protection": "high",
                "categories": ["file_sharing", "distributed", "storage", "privacy"]
            },
            
            # Cryptocurrency
            "bitcoin": {
                "url": "http://bitcoin6o7le4d6i.onion",
                "name": "Bitcoin",
                "type": "cryptocurrency",
                "description": "Bitcoin information",
                "protection": "high",
                "categories": ["cryptocurrency", "bitcoin", "finance", "privacy"]
            },
            "monero": {
                "url": "http://monero3j6d6i6d.onion",
                "name": "Monero",
                "type": "cryptocurrency",
                "description": "Privacy-focused cryptocurrency",
                "protection": "high",
                "categories": ["cryptocurrency", "monero", "privacy", "finance"]
            },
            "ethereum": {
                "url": "http://ethereum6j6d6i.onion",
                "name": "Ethereum",
                "type": "cryptocurrency",
                "description": "Smart contract platform",
                "protection": "high",
                "categories": ["cryptocurrency", "ethereum", "smart_contracts", "defi"]
            },
            
            # Adult Content (with warnings)
            "adult_content_warning": {
                "url": "http://adult-content-warning.onion",
                "name": "Adult Content Warning",
                "type": "warning",
                "description": "Adult content warning service",
                "protection": "maximum",
                "categories": ["warning", "adult_content", "filtering"],
                "warning": "Adult content - use with caution"
            },
            
            # Educational Resources
            "sci_hub": {
                "url": "http://scihub22266oqxt2li.onion",
                "name": "Sci-Hub",
                "type": "academic",
                "description": "Scientific papers",
                "protection": "high",
                "categories": ["academic", "papers", "research", "education"]
            },
            "libgen": {
                "url": "http://libgenrs6q3j6q6d6i.onion",
                "name": "Library Genesis",
                "type": "library",
                "description": "E-book library",
                "protection": "high",
                "categories": ["library", "ebooks", "education", "research"]
            },
            
            # Security Tools
            "metasploit": {
                "url": "http://metasploit6j6d6i.onion",
                "name": "Metasploit",
                "type": "security",
                "description": "Security testing framework",
                "protection": "high",
                "categories": ["security", "testing", "tools", "penetration"]
            },
            "nmap": {
                "url": "http://nmap6j6d6i.onion",
                "name": "Nmap",
                "type": "security",
                "description": "Network scanning tool",
                "protection": "high",
                "categories": ["security", "scanning", "tools", "network"]
            }
        }
        
    def _setup_protection(self):
        """Setup protection and security measures"""
        self.protection_manager.setup_protection_layers()
        self.security_context.initialize_security_context()
        
    async def access_web(self, request: WebRequest) -> WebPage:
        """Access web content with specified method"""
        try:
            # Apply protection based on layer
            if request.layer in [WebLayer.DARK, WebLayer.ONION]:
                await self.protection_manager.apply_protection(request)
                
            # Safety check for dangerous content
            if request.layer in [WebLayer.DARK, WebLayer.ONION]:
                safety_result = await self._check_content_safety(request.url)
                if not safety_result['safe']:
                    logger.warning(f"[WebAccess] Content blocked for safety: {request.url}")
                    return self._create_error_page(request.url, f"Content blocked: {safety_result['reason']}")
            
            # Check robots.txt if requested
            if request.respect_robots and await self._check_robots_txt(request.url):
                logger.warning(f"[WebAccess] Access denied by robots.txt: {request.url}")
                return self._create_error_page(request.url, "Access denied by robots.txt")
            
            # Rate limiting
            if not await self._check_rate_limit(request.url):
                logger.warning(f"[WebAccess] Rate limited: {request.url}")
                return self._create_error_page(request.url, "Rate limited")
            
            # Choose access method
            if request.layer == WebLayer.ONION:
                return await self._access_via_onion(request)
            elif request.layer == WebLayer.DARK:
                return await self._access_via_tor(request)
            elif request.layer == WebLayer.DEEP:
                return await self._access_via_deep_web(request)
            elif request.javascript or request.screenshots:
                return await self._access_via_selenium(request)
            elif request.layer == WebLayer.API:
                return await self._access_via_api(request)
            else:
                return await self._access_via_http(request)
                
        except Exception as e:
            logger.error(f"[WebAccess] Error accessing {request.url}: {e}")
            return self._create_error_page(request.url, str(e))
            
    async def _check_content_safety(self, url: str) -> Dict[str, Any]:
        """Check if content is safe to access"""
        try:
            # Check against known dangerous domains
            dangerous_domains = [
                'illegal_marketplace',
                'drugs',
                'weapons',
                'child_exploitation',
                'terrorism',
                'hacking_services',
                'fraud'
            ]
            
            url_lower = url.lower()
            
            # Check for dangerous keywords
            for dangerous in dangerous_domains:
                if dangerous in url_lower:
                    return {
                        'safe': False,
                        'reason': f"Content contains potentially dangerous material: {dangerous}",
                        'category': 'dangerous'
                    }
            
            # Check if it's a known marketplace
            if any(marketplace in url_lower for marketplace in ['market', 'shop', 'store', 'buy', 'sell']):
                # Additional check for known illegal marketplaces
                known_illegal = ['dream', 'alpha', 'empire', 'silkroad']
                if any(illegal in url_lower for illegal in known_illegal):
                    return {
                        'safe': False,
                        'reason': "Known illegal marketplace",
                        'category': 'illegal_marketplace'
                    }
            
            # Check for adult content
            adult_keywords = ['porn', 'adult', 'xxx', 'sex', 'nude']
            if any(adult in url_lower for adult in adult_keywords):
                return {
                    'safe': False,
                    'reason': "Adult content - access restricted",
                    'category': 'adult_content'
                }
            
            # Check for hacking/cybercrime
            hacking_keywords = ['hack', 'exploit', 'malware', 'virus', 'botnet', 'ddos']
            if any(hack in url_lower for hack in hacking_keywords):
                return {
                    'safe': False,
                    'reason': "Hacking/cybercrime content - access restricted",
                    'category': 'cybercrime'
                }
            
            return {'safe': True, 'reason': 'Content appears safe', 'category': 'safe'}
            
        except Exception as e:
            logger.error(f"[WebAccess] Error checking content safety: {e}")
            return {'safe': True, 'reason': 'Safety check failed - allowing access', 'category': 'unknown'}
            
    async def search_all_hidden_services(self, query: str, categories: List[str] = None) -> Dict[str, List[WebPage]]:
        """Search all hidden services with comprehensive coverage"""
        if categories is None:
            categories = ['all']
        
        results = {
            'onion_services': [],
            'deep_web': [],
            'dark_web': [],
            'safe_content': [],
            'warning_content': [],
            'blocked_content': []
        }
        
        # Search onion services
        if 'all' in categories or 'onion' in categories:
            onion_results = await self.search_onion_sites(query)
            results['onion_services'] = onion_results
            
            # Categorize onion results
            for page in onion_results:
                safety = await self._check_content_safety(page.url)
                if safety['safe']:
                    results['safe_content'].append(page)
                else:
                    results['warning_content'].append(page)
        
        # Search deep web
        if 'all' in categories or 'deep' in categories:
            deep_results = await self.search_deep_web(query)
            results['deep_web'] = deep_results
            results['safe_content'].extend(deep_results)
        
        # Search dark web (with safety checks)
        if 'all' in categories or 'dark' in categories:
            dark_engines = ['ahmia', 'torch', 'haystack', 'candle']  # Safe search engines only
            dark_results = await self.search_dark_web(query, dark_engines)
            
            # Filter dark web results for safety
            for page in dark_results:
                safety = await self._check_content_safety(page.url)
                if safety['safe']:
                    results['dark_web'].append(page)
                    results['safe_content'].append(page)
                else:
                    results['warning_content'].append(page)
                    if safety['category'] in ['illegal_marketplace', 'cybercrime']:
                        results['blocked_content'].append(page)
        
        return results
        
    async def get_all_available_services(self) -> Dict[str, Any]:
        """Get all available hidden services and databases"""
        return {
            'onion_services': {
                'total': len(self.onion_directories),
                'categories': self._categorize_services(self.onion_directories),
                'services': self.onion_directories
            },
            'deep_web_databases': {
                'total': len(self.deep_web_databases),
                'categories': self._categorize_services(self.deep_web_databases),
                'databases': self.deep_web_databases
            },
            'dark_web_engines': {
                'total': len(self.dark_web_engines),
                'categories': self._categorize_services(self.dark_web_engines),
                'engines': self.dark_web_engines
            },
            'protection_status': self.get_protection_status()
        }
        
    def _categorize_services(self, services: Dict[str, Dict[str, Any]]) -> Dict[str, List[str]]:
        """Categorize services by type"""
        categories = {}
        
        for service_id, service_info in services.items():
            service_type = service_info.get('type', 'unknown')
            if service_type not in categories:
                categories[service_type] = []
            categories[service_type].append(service_id)
        
        return categories
        
    async def access_safe_hidden_service(self, service_id: str, service_type: str = 'onion') -> WebPage:
        """Access a specific hidden service with safety checks"""
        try:
            # Get service info
            if service_type == 'onion':
                service_info = self.onion_directories.get(service_id)
            elif service_type == 'deep':
                service_info = self.deep_web_databases.get(service_id)
            elif service_type == 'dark':
                service_info = self.dark_web_engines.get(service_id)
            else:
                return self._create_error_page(service_id, "Unknown service type")
            
            if not service_info:
                return self._create_error_page(service_id, "Service not found")
            
            # Check safety
            safety = await self._check_content_safety(service_info['url'])
            if not safety['safe']:
                return self._create_error_page(service_info['url'], f"Content blocked: {safety['reason']}")
            
            # Determine layer
            if service_type == 'onion':
                layer = WebLayer.ONION
            elif service_type == 'deep':
                layer = WebLayer.DEEP
            elif service_type == 'dark':
                layer = WebLayer.DARK
            else:
                layer = WebLayer.SURFACE
            
            # Create request with appropriate protection
            request = WebRequest(
                url=service_info['url'],
                layer=layer,
                protection_level=service_info.get('protection', 'high'),
                extract_content=[ContentType.TEXT, ContentType.METADATA, ContentType.LINKS]
            )
            
            # Access the service
            return await self.access_web(request)
            
        except Exception as e:
            logger.error(f"[WebAccess] Error accessing hidden service {service_id}: {e}")
            return self._create_error_page(service_id, str(e))
            
    async def _access_via_onion(self, request: WebRequest) -> WebPage:
        """Access .onion hidden services with enhanced protection"""
        try:
            # Apply maximum protection for onion sites
            await self.protection_manager.apply_maximum_protection(request)
            
            # Create secure Tor session
            session = requests.Session()
            session.proxies = {
                'http': 'socks5://127.0.0.1:9050',
                'https': 'socks5://127.0.0.1:9050'
            }
            
            # Configure security headers
            security_headers = {
                'User-Agent': 'Tor Browser/1.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'DNT': '1',  # Do Not Track
                'Sec-GPC': '1',  # Global Privacy Control
            }
            
            # Add custom security headers
            security_headers.update(request.security_headers)
            session.headers.update(security_headers)
            
            # Create new Tor circuit if specified
            if request.onion_circuit:
                await self._create_new_tor_circuit()
            
            # Make request with timeout and retry
            response = session.get(
                url=request.url,
                timeout=request.timeout,
                allow_redirects=request.follow_redirects,
                headers=request.headers,
            )
            
            # Parse content
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract content
            content = ""
            if ContentType.TEXT in request.extract_content:
                content = self._extract_text(soup)
            
            links = []
            if ContentType.LINKS in request.extract_content:
                links = self._extract_onion_links(soup, request.url)
            
            images = []
            if ContentType.IMAGES in request.extract_content:
                images = self._extract_images(soup, request.url)
            
            forms = []
            if ContentType.FORMS in request.extract_content:
                forms = self._extract_forms(soup)
            
            metadata = self._extract_metadata(soup, response)
            
            # Add security metadata
            metadata.update({
                'access_method': 'onion_tor',
                'protection_level': request.protection_level,
                'circuit_id': request.onion_circuit,
                'security_headers': security_headers,
                'anonymized': True,
                'timestamp': datetime.now().isoformat()
            })
            
            page = WebPage(
                url=request.url,
                title=soup.title.string or "",
                content=content,
                html=response.text,
                links=links,
                images=images,
                forms=forms,
                metadata=metadata,
                access_method=AccessMethod.ONION_PROXY,
                layer=WebLayer.ONION,
                status_code=response.status_code
            )
            
            self.access_history.append(page)
            logger.info(f"[WebAccess] Onion access successful: {request.url}")
            
            return page
            
        except Exception as e:
            logger.error(f"[WebAccess] Onion access failed: {e}")
            return self._create_error_page(request.url, str(e))
            
    async def _access_via_deep_web(self, request: WebRequest) -> WebPage:
        """Access deep web databases and academic resources"""
        try:
            # Apply high protection for deep web
            await self.protection_manager.apply_high_protection(request)
            
            # Check if it's a known deep web database
            domain = urlparse(request.url).netloc
            if domain in self.deep_web_databases:
                db_info = self.deep_web_databases[domain]
                
                # Configure headers for academic databases
                headers = {
                    'User-Agent': 'Mozilla/5.0 (compatible; Sallie-AI/1.0; +http://sallie.ai/bot)',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                    'DNT': '1',
                    'Sec-GPC': '1',
                }
                
                # Add database-specific headers
                if db_info['type'] == 'academic':
                    headers['Referer'] = 'https://scholar.google.com/'
                    headers['Origin'] = 'https://scholar.google.com'
                
                # Make request
                response = self.session.get(
                    url=request.url,
                    headers=headers,
                    timeout=request.timeout,
                    allow_redirects=request.follow_redirects,
                )
                
                # Parse content
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract content with academic focus
                content = self._extract_academic_content(soup)
                
                # Extract academic metadata
                academic_metadata = self._extract_academic_metadata(soup, response)
                
                page = WebPage(
                    url=request.url,
                    title=soup.title.string or "",
                    content=content,
                    html=response.text,
                    links=self._extract_links(soup, request.url),
                    images=self._extract_images(soup, request.url),
                    forms=self._extract_forms(soup),
                    metadata={
                        **academic_metadata,
                        'database_type': db_info['type'],
                        'database_name': db_info['name'],
                        'access_method': 'deep_web',
                        'protection_level': request.protection_level,
                    },
                    access_method=AccessMethod.HTTP,
                    layer=WebLayer.DEEP,
                    status_code=response.status_code
                )
                
                self.access_history.append(page)
                logger.info(f"[WebAccess] Deep web access successful: {request.url}")
                
                return page
            else:
                # Fall back to regular HTTP for unknown deep web sites
                return await self._access_via_http(request)
                
        except Exception as e:
            logger.error(f"[WebAccess] Deep web access failed: {e}")
            return self._create_error_page(request.url, str(e))
            
    async def _create_new_tor_circuit(self):
        """Create a new Tor circuit for enhanced anonymity"""
        try:
            if self.tor_controller:
                # Signal Tor to create new circuit
                await self.tor_controller.signal('NEWNYM')
                logger.info("[WebAccess] New Tor circuit created")
        except Exception as e:
            logger.error(f"[WebAccess] Failed to create new Tor circuit: {e}")
            
    def _extract_onion_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract .onion links from page"""
        links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            if href.startswith('http'):
                if '.onion' in href:
                    links.append(href)
            elif href.startswith('/'):
                full_url = urljoin(base_url, href)
                if '.onion' in full_url:
                    links.append(full_url)
        return links
        
    def _extract_academic_content(self, soup: BeautifulSoup) -> str:
        """Extract academic-focused content"""
        # Remove non-academic elements
        for element in soup.find_all(['script', 'style', 'nav', 'footer', 'aside']):
            element.decompose()
        
        # Focus on main content areas
        main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=re.compile(r'content|article|paper|abstract'))
        
        if main_content:
            return self._extract_text(main_content)
        else:
            return self._extract_text(soup)
            
    def _extract_academic_metadata(self, soup: BeautifulSoup, response) -> Dict[str, Any]:
        """Extract academic-specific metadata"""
        metadata = {}
        
        # Extract citation information
        citations = soup.find_all('cite')
        metadata['citations'] = len(citations)
        
        # Extract authors
        authors = soup.find_all(['span', 'div'], class_=re.compile(r'author|writer'))
        metadata['authors'] = [author.get_text().strip() for author in authors]
        
        # Extract publication date
        date_elements = soup.find_all(['time', 'span'], class_=re.compile(r'date|published|created'))
        metadata['publication_dates'] = [date.get('datetime', date.get_text().strip()) for date in date_elements]
        
        # Extract abstract
        abstract = soup.find('div', class_=re.compile(r'abstract|summary'))
        if abstract:
            metadata['abstract'] = abstract.get_text().strip()
        
        # Extract DOI
        doi = soup.find('a', href=re.compile(r'doi\.org'))
        if doi:
            metadata['doi'] = doi['href']
        
        # Extract keywords
        keywords = soup.find('div', class_=re.compile(r'keywords|tags'))
        if keywords:
            metadata['keywords'] = [tag.strip() for tag in keywords.get_text().split(',')]
        
        return metadata
        
    async def search_onion_sites(self, query: str, engines: List[str] = None) -> List[WebPage]:
        """Search .onion sites with protection"""
        if engines is None:
            engines = ['ahmia', 'torch', 'duckduckgo']
        
        results = []
        
        for engine in engines:
            if engine in self.onion_directories:
                engine_info = self.onion_directories[engine]
                
                # Create search URL
                search_url = f"{engine_info['url']}/search?q={quote(query)}"
                
                # Create protected request
                request = WebRequest(
                    url=search_url,
                    layer=WebLayer.ONION,
                    protection_level="maximum",
                    anonymize=True,
                    use_tor=True,
                    extract_content=[ContentType.TEXT, ContentType.LINKS]
                )
                
                try:
                    page = await self.access_web(request)
                    results.append(page)
                    
                    # Rate limiting between searches
                    await asyncio.sleep(2)
                    
                except Exception as e:
                    logger.warning(f"[WebAccess] Search failed for {engine}: {e}")
        
        return results
        
    async def search_deep_web(self, query: str, databases: List[str] = None) -> List[WebPage]:
        """Search deep web databases with protection"""
        if databases is None:
            databases = ['arxiv', 'scholar', 'pubmed', 'ieee', 'acm']
        
        results = []
        
        for db in databases:
            if db in self.deep_web_databases:
                db_info = self.deep_web_databases[db]
                
                # Create search URL
                search_url = f"{db_info['url']}/search?q={quote(query)}"
                
                # Create protected request
                request = WebRequest(
                    url=search_url,
                    layer=WebLayer.DEEP,
                    protection_level="high",
                    extract_content=[ContentType.TEXT, ContentType.METADATA]
                )
                
                try:
                    page = await self.access_web(request)
                    results.append(page)
                    
                    # Rate limiting between searches
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    logger.warning(f"[WebAccess] Deep web search failed for {db}: {e}")
        
        return results
        
    async def search_dark_web(self, query: str, engines: List[str] = None) -> List[WebPage]:
        """Search dark web with enhanced protection"""
        if engines is None:
            engines = ['ahmia', 'torch', 'dark_search', 'haystack']
        
        results = []
        
        for engine in engines:
            if engine in self.dark_web_engines:
                engine_info = self.dark_web_engines[engine]
                
                # Create search URL
                search_url = f"{engine_info['url']}/search?q={quote(query)}"
                
                # Create maximum protection request
                request = WebRequest(
                    url=search_url,
                    layer=WebLayer.DARK,
                    protection_level="maximum",
                    anonymize=True,
                    use_tor=True,
                    onion_circuit=f"circuit_{int(time.time())}",
                    extract_content=[ContentType.TEXT, ContentType.LINKS]
                )
                
                try:
                    page = await self.access_web(request)
                    results.append(page)
                    
                    # Rate limiting and circuit change
                    await asyncio.sleep(3)
                    await self._create_new_tor_circuit()
                    
                except Exception as e:
                    logger.warning(f"[WebAccess] Dark web search failed for {engine}: {e}")
        
        return results
        
    def get_protection_status(self) -> Dict[str, Any]:
        """Get current protection status"""
        return {
            'protection_level': self.protection_manager.current_level,
            'active_protections': self.protection_manager.active_protections,
            'security_context': self.security_context.get_status(),
            'tor_status': self._get_tor_status(),
            'last_circuit_change': self.security_context.last_circuit_change,
            'anonymization_active': self.protection_manager.anonymization_active,
        }
        
    def _get_tor_status(self) -> Dict[str, Any]:
        """Get Tor connection status"""
        if self.tor_controller:
            try:
                return {
                    'connected': True,
                    'version': self.tor_controller.get_version(),
                    'circuits': len(self.tor_controller.get_circuits()),
                    'status': 'active'
                }
            except:
                return {
                    'connected': False,
                    'status': 'error'
                }
        else:
            return {
                'connected': False,
                'status': 'not_initialized'
            }


class ProtectionManager:
    """Manages protection and security for web access"""
    
    def __init__(self):
        self.current_level = "standard"
        self.active_protections = []
        self.anonymization_active = False
        self.protection_layers = {
            "standard": ["basic_headers", "rate_limiting", "robots_check"],
            "high": ["basic_headers", "rate_limiting", "robots_check", "user_agent_rotation", "proxy_rotation"],
            "maximum": ["basic_headers", "rate_limiting", "robots_check", "user_agent_rotation", "proxy_rotation", "circuit_rotation", "header_randomization", "timing_randomization"]
        }
        
    def setup_protection_layers(self):
        """Setup protection layers"""
        logger.info("[Protection] Protection layers initialized")
        
    async def apply_protection(self, request: WebRequest):
        """Apply protection based on layer"""
        protections = self.protection_layers.get(request.protection_level, [])
        
        for protection in protections:
            await self._apply_protection_method(protection, request)
            
    async def apply_high_protection(self, request: WebRequest):
        """Apply high-level protection"""
        request.protection_level = "high"
        await self.apply_protection(request)
        
    async def apply_maximum_protection(self, request: WebRequest):
        """Apply maximum protection"""
        request.protection_level = "maximum"
        await self.apply_protection(request)
        self.anonymization_active = True
        
    async def _apply_protection_method(self, method: str, request: WebRequest):
        """Apply specific protection method"""
        if method == "basic_headers":
            self._add_security_headers(request)
        elif method == "user_agent_rotation":
            self._rotate_user_agent(request)
        elif method == "header_randomization":
            self._randomize_headers(request)
        elif method == "timing_randomization":
            await self._randomize_timing(request)
        elif method == "circuit_rotation":
            await self._rotate_circuit(request)
            
    def _add_security_headers(self, request: WebRequest):
        """Add security headers"""
        security_headers = {
            'DNT': '1',
            'Sec-GPC': '1',
            'X-Do-Not-Track': '1',
            'X-Privacy': '1',
            'X-Anonymous': '1'
        }
        request.security_headers.update(security_headers)
        
    def _rotate_user_agent(self, request: WebRequest):
        """Rotate user agent"""
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0'
        ]
        request.user_agent = random.choice(user_agents)
        
    def _randomize_headers(self, request: WebRequest):
        """Randomize headers"""
        request.headers['X-Request-ID'] = hashlib.md5(f"{time.time()}{random.random()}".encode()).hexdigest()
        request.headers['X-Timestamp'] = str(time.time())
        
    async def _randomize_timing(self, request: WebRequest):
        """Randomize request timing"""
        delay = random.uniform(0.5, 2.0)
        await asyncio.sleep(delay)
        
    async def _rotate_circuit(self, request: WebRequest):
        """Rotate Tor circuit"""
        request.onion_circuit = f"circuit_{int(time.time())}_{random.randint(1000, 9999)}"


class SecurityContext:
    """Manages security context for web access"""
    
    def __init__(self):
        self.last_circuit_change = None
        self.active_protections = []
        self.security_log = []
        
    def initialize_security_context(self):
        """Initialize security context"""
        logger.info("[Security] Security context initialized")
        
    def get_status(self) -> Dict[str, Any]:
        """Get security status"""
        return {
            'active_protections': self.active_protections,
            'last_circuit_change': self.last_circuit_change,
            'security_log_size': len(self.security_log),
            'context_status': 'active'
        }
        
    def log_security_event(self, event: str, level: str = "info"):
        """Log security event"""
        self.security_log.append({
            'event': event,
            'level': level,
            'timestamp': datetime.now().isoformat()
        })
        logger.info(f"[Security] {event}")
        
    def _setup_session(self):
        """Setup HTTP session with retry strategy"""
        self.session = requests.Session()
        
        # Retry strategy
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        # Default headers
        self.session.headers.update({
            'User-Agent': 'Sallie-AI/1.0 (Educational Research Assistant)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
    
    def _setup_selenium(self):
        """Setup Selenium WebDriver for JavaScript-heavy sites"""
        try:
            options = Options()
            options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1920,1080')
            options.add_argument('--user-agent=Sallie-AI/1.0')
            
            # Disable images for faster loading
            prefs = {
                "profile.managed_default_content_settings.images": 2,
                "profile.default_content_setting_values.notifications": 2,
            }
            options.add_experimental_option("prefs", prefs)
            
            self.selenium_driver = webdriver.Chrome(options=options)
            logger.info("[WebAccess] Selenium WebDriver initialized")
            
        except Exception as e:
            logger.warning(f"[WebAccess] Selenium setup failed: {e}")
            self.selenium_driver = None
    
    def _setup_tor(self):
        """Setup Tor for dark web access"""
        if not TOR_AVAILABLE:
            logger.warning("[WebAccess] Tor not available")
            return
            
        try:
            # Launch Tor with custom configuration
            tor_config = {
                'SocksPort': '9050',
                'ControlPort': '9051',
                'DataDirectory': str(Path("progeny_root/cache/tor")),
                'ExitNodes': '{us}',
                'NewCircuitPeriod': '60',
            }
            
            self.tor_controller = Controller.from_port(port=9051)
            logger.info("[WebAccess] Tor controller initialized")
            
        except Exception as e:
            logger.warning(f"[WebAccess] Tor setup failed: {e}")
            self.tor_controller = None
    
    async def access_web(self, request: WebRequest) -> WebPage:
        """Access web content with specified method"""
        try:
            # Check robots.txt if requested
            if request.respect_robots and await self._check_robots_txt(request.url):
                logger.warning(f"[WebAccess] Access denied by robots.txt: {request.url}")
                return self._create_error_page(request.url, "Access denied by robots.txt")
            
            # Rate limiting
            if not await self._check_rate_limit(request.url):
                logger.warning(f"[WebAccess] Rate limited: {request.url}")
                return self._create_error_page(request.url, "Rate limited")
            
            # Choose access method
            if request.layer == WebLayer.DARK:
                return await self._access_via_tor(request)
            elif request.javascript or request.screenshots:
                return await self._access_via_selenium(request)
            elif request.layer == WebLayer.API:
                return await self._access_via_api(request)
            else:
                return await self._access_via_http(request)
                
        except Exception as e:
            logger.error(f"[WebAccess] Error accessing {request.url}: {e}")
            return self._create_error_page(request.url, str(e))
    
    async def _access_via_http(self, request: WebRequest) -> WebPage:
        """Access web content via HTTP requests"""
        start_time = time.time()
        
        try:
            response = self.session.request(
                method=request.method,
                url=request.url,
                headers=request.headers,
                params=request.params,
                data=request.data,
                timeout=request.timeout,
                allow_redirects=request.follow_redirects,
            )
            
            response_time = time.time() - start_time
            
            # Parse content
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract content
            content = ""
            if ContentType.TEXT in request.extract_content:
                content = self._extract_text(soup)
            
            links = []
            if ContentType.LINKS in request.extract_content:
                links = self._extract_links(soup, request.url)
            
            images = []
            if ContentType.IMAGES in request.extract_content:
                images = self._extract_images(soup, request.url)
            
            forms = []
            if ContentType.FORMS in request.extract_content:
                forms = self._extract_forms(soup)
            
            metadata = self._extract_metadata(soup, response)
            
            page = WebPage(
                url=request.url,
                title=soup.title.string or "",
                content=content,
                html=response.text,
                links=links,
                images=images,
                forms=forms,
                metadata=metadata,
                access_method=AccessMethod.HTTP,
                layer=request.layer,
                response_time=response_time,
                status_code=response.status_code
            )
            
            self.access_history.append(page)
            logger.info(f"[WebAccess] HTTP access successful: {request.url}")
            
            return page
            
        except Exception as e:
            logger.error(f"[WebAccess] HTTP access failed: {e}")
            return self._create_error_page(request.url, str(e))
    
    async def _access_via_selenium(self, request: WebRequest) -> WebPage:
        """Access web content via Selenium (JavaScript execution)"""
        if not self.selenium_driver:
            return await self._access_via_http(request)
        
        start_time = time.time()
        
        try:
            self.selenium_driver.get(request.url)
            
            # Wait for page load
            WebDriverWait(self.selenium_driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Execute JavaScript if needed
            if request.javascript:
                # Extract dynamic content
                dynamic_content = self.selenium_driver.execute_script(
                    "return document.body.innerText"
                )
            else:
                dynamic_content = self.selenium_driver.page_source
            
            # Take screenshot if requested
            screenshot = None
            if request.screenshots:
                screenshot = self.selenium_driver.get_screenshot_as_base64()
            
            response_time = time.time() - start_time
            
            # Parse content
            soup = BeautifulSoup(dynamic_content, 'html.parser')
            
            page = WebPage(
                url=request.url,
                title=self.selenium_driver.title,
                content=self._extract_text(soup),
                html=dynamic_content,
                links=self._extract_links(soup, request.url),
                images=self._extract_images(soup, request.url),
                forms=self._extract_forms(soup),
                metadata=self._extract_metadata(soup, None),
                access_method=AccessMethod.SELENIUM,
                layer=request.layer,
                response_time=response_time,
                status_code=200
            )
            
            if screenshot:
                page.metadata['screenshot'] = screenshot
            
            self.access_history.append(page)
            logger.info(f"[WebAccess] Selenium access successful: {request.url}")
            
            return page
            
        except TimeoutException:
            logger.error(f"[WebAccess] Selenium timeout: {request.url}")
            return self._create_error_page(request.url, "Page load timeout")
        except WebDriverException as e:
            logger.error(f"[WebAccess] Selenium error: {e}")
            return self._create_error_page(request.url, str(e))
        except Exception as e:
            logger.error(f"[WebAccess] Selenium access failed: {e}")
            return self._create_error_page(request.url, str(e))
    
    async def _access_via_tor(self, request: WebRequest) -> WebPage:
        """Access web content via Tor network"""
        if not self.tor_controller:
            return await self._access_via_http(request)
        
        try:
            # Create session with Tor proxy
            session = requests.Session()
            session.proxies = {
                'http': 'socks5://127.0.0.1:9050',
                'https': 'socks5://127.0.0.1:9050'
            }
            
            # Configure session headers
            session.headers.update({
                'User-Agent': 'Tor Browser/1.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            })
            
            # Make request
            response = session.get(
                url=request.url,
                timeout=request.timeout,
                headers=request.headers,
                allow_redirects=request.follow_redirects,
            )
            
            # Parse content
            soup = BeautifulSoup(response.content, 'html.parser')
            
            page = WebPage(
                url=request.url,
                title=soup.title.string or "",
                content=self._extract_text(soup),
                html=response.text,
                links=self._extract_links(soup, request.url),
                images=self._extract_images(soup, request.url),
                forms=self._extract_forms(soup),
                metadata=self._extract_metadata(soup, response),
                access_method=AccessMethod.TOR,
                layer=WebLayer.DARK,
                status_code=response.status_code
            )
            
            self.access_history.append(page)
            logger.info(f"[WebAccess] Tor access successful: {request.url}")
            
            return page
            
        except Exception as e:
            logger.error(f"[WebAccess] Tor access failed: {e}")
            return self._create_error_page(request.url, str(e))
    
    async def _access_via_api(self, request: WebRequest) -> WebPage:
        """Access content via API endpoints"""
        try:
            # Detect API type and configure accordingly
            api_config = self._detect_api_type(request.url)
            
            # Add API-specific headers
            headers = request.headers.copy()
            if api_config.get('api_key'):
                headers['Authorization'] = f"Bearer {api_config['api_key']}"
            
            # Make API request
            response = self.session.request(
                method=request.method,
                url=request.url,
                headers=headers,
                params=request.params,
                data=request.data,
                timeout=request.timeout,
            )
            
            # Parse API response
            try:
                api_data = response.json()
                content = json.dumps(api_data, indent=2)
            except:
                content = response.text
            
            page = WebPage(
                url=request.url,
                title=f"API: {request.url}",
                content=content,
                html=response.text,
                links=[],
                images=[],
                forms=[],
                metadata={
                    'api_type': api_config.get('type', 'unknown'),
                    'status_code': response.status_code,
                    'response_headers': dict(response.headers),
                },
                access_method=AccessMethod.API,
                layer=WebLayer.API,
                status_code=response.status_code
            )
            
            self.access_history.append(page)
            logger.info(f"[WebAccess] API access successful: {request.url}")
            
            return page
            
        except Exception as e:
            logger.error(f"[WebAccess] API access failed: {e}")
            return self._create_error_page(request.url, str(e))
    
    def _extract_text(self, soup: BeautifulSoup) -> str:
        """Extract clean text from BeautifulSoup object"""
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text
        text = soup.get_text()
        
        # Clean up text
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text
    
    def _extract_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract all links from page"""
        links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            if href.startswith('http'):
                links.append(href)
            elif href.startswith('/'):
                links.append(urljoin(base_url, href))
        return links
    
    def _extract_images(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract all image URLs from page"""
        images = []
        for img in soup.find_all('img', src=True):
            src = img['src']
            if src.startswith('http'):
                images.append(src)
            elif src.startswith('/'):
                images.append(urljoin(base_url, src))
        return images
    
    def _extract_forms(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract all forms from page"""
        forms = []
        for form in soup.find_all('form'):
            form_data = {
                'action': form.get('action', ''),
                'method': form.get('method', 'GET'),
                'fields': []
            }
            
            for field in form.find_all(['input', 'textarea', 'select']):
                field_data = {
                    'name': field.get('name', ''),
                    'type': field.get('type', ''),
                    'value': field.get('value', ''),
                }
                form_data['fields'].append(field_data)
            
            forms.append(form_data)
        return forms
    
    def _extract_metadata(self, soup: BeautifulSoup, response) -> Dict[str, Any]:
        """Extract metadata from page"""
        metadata = {}
        
        # Basic metadata
        if soup.title:
            metadata['title'] = soup.title.string
        
        # Meta tags
        for meta in soup.find_all('meta'):
            name = meta.get('name') or meta.get('property')
            content = meta.get('content')
            if name and content:
                metadata[name] = content
        
        # Response headers
        if response:
            metadata['status_code'] = response.status_code
            metadata['content_type'] = response.headers.get('content-type')
            metadata['content_length'] = response.headers.get('content-length')
        
        return metadata
    
    async def _check_robots_txt(self, url: str) -> bool:
        """Check if URL is allowed by robots.txt"""
        try:
            parsed_url = urlparse(url)
            robots_url = f"{parsed_url.scheme}://{parsed_url.netloc}/robots.txt"
            
            # Check cache
            if robots_url in self.robots_cache:
                cache_time = self.robots_cache[robots_url]['timestamp']
                if time.time() - cache_time < 3600:  # 1 hour cache
                    return self._robots_cache[robots_url]['disallowed']
            
            # Fetch robots.txt
            response = self.session.get(robots_url, timeout=10)
            if response.status_code == 200:
                robots_content = response.text
                disallowed = self._parse_robots_txt(robots_content, parsed_url.path)
                
                # Cache result
                self.robots_cache[robots_url] = {
                    'disallowed': disallowed,
                    'timestamp': time.time()
                }
                
                return disallowed
            
            return False
            
        except Exception as e:
            logger.warning(f"[WebAccess] Error checking robots.txt: {e}")
            return False
    
    def _parse_robots_txt(self, content: str, path: str) -> bool:
        """Parse robots.txt content"""
        lines = content.split('\n')
        disallowed_paths = []
        user_agent = '*'
        
        for line in lines:
            line = line.strip()
            if line.startswith('User-agent:'):
                user_agent = line.split(':', 1)[1].strip()
            elif line.startswith('Disallow:') and user_agent == '*':
                disallowed_path = line.split(':', 1)[1].strip()
                if disallowed_path:
                    disallowed_paths.append(disallowed_path)
        
        # Check if current path is disallowed
        for disallowed in disallowed_paths:
            if path.startswith(disallowed):
                return True
        
        return False
    
    async def _check_rate_limit(self, url: str) -> bool:
        """Check rate limiting for domain"""
        try:
            parsed_url = urlparse(url)
            domain = parsed_url.netloc
            
            if domain not in self.rate_limits:
                self.rate_limits[domain] = {
                    'requests': 0,
                    'window_start': time.time(),
                    'max_requests': 60,  # 60 requests per minute
                    'window_duration': 60
                }
            
            rate_limit = self.rate_limits[domain]
            current_time = time.time()
            
            # Reset window if needed
            if current_time - rate_limit['window_start'] > rate_limit['window_duration']:
                rate_limit['requests'] = 0
                rate_limit['window_start'] = current_time
            
            # Check limit
            if rate_limit['requests'] >= rate_limit['max_requests']:
                return False
            
            rate_limit['requests'] += 1
            return True
            
        except Exception as e:
            logger.warning(f"[WebAccess] Rate limit check error: {e}")
            return True
    
    def _detect_api_type(self, url: str) -> Dict[str, Any]:
        """Detect API type and return configuration"""
        api_patterns = {
            'google': {
                'type': 'google_api',
                'api_key': self.access_tokens.get('google_api_key'),
                'base_url': 'https://www.googleapis.com'
            },
            'openai': {
                'type': 'openai_api',
                'api_key': self.access_tokens.get('openai_api_key'),
                'base_url': 'https://api.openai.com'
            },
            'github': {
                'type': 'github_api',
                'api_key': self.access_tokens.get('github_api_key'),
                'base_url': 'https://api.github.com'
            }
        }
        
        for pattern, config in api_patterns.items():
            if pattern in url.lower():
                return config
        
        return {'type': 'unknown'}
    
    def _create_error_page(self, url: str, error: str) -> WebPage:
        """Create error page for failed requests"""
        return WebPage(
            url=url,
            title="Access Error",
            content=f"Error accessing {url}: {error}",
            html=f"<html><head><title>Access Error</title></head><body><h1>Error</h1><p>{error}</p></body></html>",
            links=[],
            images=[],
            forms=[],
            metadata={'error': error},
            access_method=AccessMethod.HTTP,
            layer=WebLayer.SURFACE,
            status_code=500
        )
    
    async def search_google(self, query: str, num_results: int = 10) -> List[WebPage]:
        """Search Google and return results"""
        try:
            # Use Google Custom Search API or web scraping
            search_url = f"https://www.google.com/search?q={quote(query)}&num={num_results}"
            
            request = WebRequest(
                url=search_url,
                extract_content=[ContentType.TEXT, ContentType.LINKS],
                javascript=False
            )
            
            page = await self.access_web(request)
            
            # Extract search results
            results = []
            soup = BeautifulSoup(page.html, 'html.parser')
            
            # Find search result links
            for result in soup.find_all('div', class_='g'):
                link = result.find('a')
                if link and link.get('href'):
                    url = link['href']
                    if url.startswith('/url?q='):
                        # Extract actual URL from Google redirect
                        actual_url = url.split('/url?q=')[1].split('&')[0]
                        results.append(actual_url)
            
            # Access top results
            search_results = []
            for url in results[:num_results]:
                result_page = await self.access_web(
                    WebRequest(url=url, extract_content=[ContentType.TEXT, ContentType.METADATA])
                )
                search_results.append(result_page)
            
            return search_results
            
        except Exception as e:
            logger.error(f"[WebAccess] Google search failed: {e}")
            return []
    
    async def access_deep_web(self, query: str, databases: List[str] = None) -> List[WebPage]:
        """Access deep web databases and academic resources"""
        if databases is None:
            databases = [
                'arxiv.org',
                'scholar.google.com',
                'pubmed.ncbi.nlm.nih.gov',
                'ieeexplore.ieee.org',
                'dl.acm.org',
                'springer.com',
                'sciencedirect.com',
                'jstor.org'
            ]
        
        results = []
        
        for database in databases:
            try:
                # Construct search URL for database
                search_url = f"https://{database}/search?q={quote(query)}"
                
                request = WebRequest(
                    url=search_url,
                    extract_content=[ContentType.TEXT, ContentType.METADATA],
                    layer=WebLayer.DEEP
                )
                
                page = await self.access_web(request)
                results.append(page)
                
                # Rate limiting
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.warning(f"[WebAccess] Deep web access failed for {database}: {e}")
        
        return results
    
    async def access_dark_web(self, query: str) -> List[WebPage]:
        """Access dark web resources via Tor"""
        if not self.tor_controller:
            logger.warning("[WebAccess] Tor not available for dark web access")
            return []
        
        # Common dark web search engines
        dark_web_engines = [
            'http://3g2upl4pq6kufc4m.onion',  # DuckDuckGo
            'http://torchdeedp3i2jigzj3i3u4dpy4wjdjnq5n5p55v2g77ogrmn2umnadvqd.onion',  # Torch
            'http://xmh57jrzrnw7ins3g44aa3d7oixrhe5k3jcnmdhhwwixijttall3j7yd.onion',  # Ahmia
        ]
        
        results = []
        
        for engine in dark_web_engines:
            try:
                search_url = f"{engine}/search?q={quote(query)}"
                
                request = WebRequest(
                    url=search_url,
                    extract_content=[ContentType.TEXT, ContentType.LINKS],
                    layer=WebLayer.DARK
                )
                
                page = await self.access_web(request)
                results.append(page)
                
                # Rate limiting
                await asyncio.sleep(2)
                
            except Exception as e:
                logger.warning(f"[WebAccess] Dark web access failed for {engine}: {e}")
        
        return results
    
    def set_access_token(self, service: str, token: str):
        """Set access token for API services"""
        self.access_tokens[service] = token
        logger.info(f"[WebAccess] Access token set for {service}")
    
    def get_access_history(self, limit: int = 100) -> List[WebPage]:
        """Get recent access history"""
        return self.access_history[-limit:]
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get web access statistics"""
        stats = {
            'total_requests': len(self.access_history),
            'by_layer': {},
            'by_method': {},
            'by_status': {},
            'average_response_time': 0,
            'most_accessed_domains': {},
            'last_access': None
        }
        
        if self.access_history:
            total_time = sum(page.response_time for page in self.access_history)
            stats['average_response_time'] = total_time / len(self.access_history)
            stats['last_access'] = self.access_history[-1].accessed_at.isoformat()
        
        for page in self.access_history:
            # By layer
            layer = page.layer.value
            stats['by_layer'][layer] = stats['by_layer'].get(layer, 0) + 1
            
            # By method
            method = page.access_method.value
            stats['by_method'][method] = stats['by_method'].get(method, 0) + 1
            
            # By status
            status = str(page.status_code)
            stats['by_status'][status] = stats['by_status'].get(status, 0) + 1
            
            # By domain
            domain = urlparse(page.url).netloc
            stats['most_accessed_domains'][domain] = stats['most_accessed_domains'].get(domain, 0) + 1
        
        return stats
    
    def cleanup(self):
        """Cleanup resources"""
        if self.selenium_driver:
            self.selenium_driver.quit()
        
        if self.tor_controller:
            self.tor_controller.close()
        
        if self.session:
            self.session.close()

# Global instance
_universal_web_access = None

def get_universal_web_access() -> UniversalWebAccess:
    """Get global universal web access instance"""
    global _universal_web_access
    if _universal_web_access is None:
        _universal_web_access = UniversalWebAccess()
    return _universal_web_access
