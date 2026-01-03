"""Web Intelligence System for Sallie

Advanced web content analysis and understanding:
- Content extraction and summarization
- Semantic analysis and understanding
- Link analysis and graph building
- Form interaction and automation
- API integration and data extraction
- Real-time content monitoring
- Web scraping at scale
- Deep web content discovery
- Dark web intelligence gathering
"""

import asyncio
import json
import logging
import re
import hashlib
from typing import Dict, Any, List, Optional, Tuple, Set
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
from urllib.parse import urlparse, urljoin, parse_qs
import networkx as nx
import numpy as np
from collections import defaultdict, Counter
import math

from universal_web_access import get_universal_web_access, WebPage, WebRequest, ContentType, WebLayer

logger = logging.getLogger("web_intelligence")

class ContentCategory(str, Enum):
    """Categories of web content"""
    NEWS = "news"
    ACADEMIC = "academic"
    SOCIAL = "social"
    COMMERCIAL = "commercial"
    FORUM = "forum"
    BLOG = "blog"
    WIKI = "wiki"
    VIDEO = "video"
    IMAGE = "image"
    DOCUMENT = "document"
    API = "api"
    DATABASE = "database"
    GOVERNMENT = "government"
    EDUCATIONAL = "educational"
    ENTERTAINMENT = "entertainment"
    TECHNOLOGY = "technology"
    SCIENCE = "science"
    HEALTH = "health"
    FINANCE = "finance"
    LEGAL = "legal"
    DARK_WEB = "dark_web"

class ContentQuality(str, Enum):
    """Quality assessment of content"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    UNKNOWN = "unknown"

class ContentTypeAnalysis(str, Enum):
    """Types of content analysis"""
    SENTIMENT = "sentiment"
    TOPIC = "topic"
    ENTITY = "entity"
    KEYWORD = "keyword"
    STRUCTURE = "structure"
    RELATIONSHIP = "relationship"
    INTENT = "intent"
    AUTHORITY = "authority"
    FRESHNESS = "freshness"
    RELEVANCE = "relevance"

@dataclass
class ContentAnalysis:
    """Analysis result for web content"""
    url: str
    category: ContentCategory
    quality: ContentQuality
    sentiment: float  # -1 to 1
    topics: List[str]
    entities: List[Dict[str, Any]]
    keywords: List[str]
    summary: str
    authority_score: float  # 0 to 1
    freshness_score: float  # 0 to 1
    relevance_score: float  # 0 to 1
    structure: Dict[str, Any]
    relationships: List[Dict[str, Any]]
    intent: str
    metadata: Dict[str, Any]
    analyzed_at: datetime = field(default_factory=datetime.now)

@dataclass
class WebGraph:
    """Graph of web relationships"""
    nodes: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    edges: List[Dict[str, Any]] = field(default_factory=list)
    centrality: Dict[str, float] = field(default_factory=dict)
    clusters: List[Set[str]] = field(default_factory=list)
    
class WebIntelligence:
    """Advanced web intelligence system for Sallie"""
    
    def __init__(self):
        self.web_access = get_universal_web_access()
        self.content_cache: Dict[str, ContentAnalysis] = {}
        self.web_graph = WebGraph()
        self.knowledge_base: Dict[str, Any] = {}
        self.monitored_pages: Dict[str, datetime] = {}
        self.search_history: List[str] = []
        self.content_patterns: Dict[str, Any] = {}
        
        # Initialize analysis models
        self._initialize_patterns()
        self._initialize_knowledge_base()
    
    def _initialize_patterns(self):
        """Initialize content analysis patterns"""
        self.content_patterns = {
            'news_patterns': [
                r'\b\d{1,2}/\d{1,2}/\d{4}\b',  # Dates
                r'\b\d{1,2}:\d{2}\b',  # Times
                r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b',  # Names
                r'\b\$\d+(?:,\d{3})*(?:\.\d{2})?\b',  # Money
                r'\b\d+(?:,\d{3})*(?:\.\d+)?%\b',  # Percentages
            ],
            'academic_patterns': [
                r'\b(?:doi|ISBN|ISSN)\b',
                r'\b(?:abstract|introduction|methodology|results|conclusion)\b',
                r'\b(?:et al\.\s+\(\d{4}\)|\(\d{4}\))\b',  # Citations
                r'\b(?:university|college|institute|laboratory)\b',
            ],
            'social_patterns': [
                r'\b(?:like|share|comment|follow|retweet)\b',
                r'\b@[A-Za-z0-9_]+',  # Mentions
                r'#[A-Za-z0-9_]+',  # Hashtags
                r'\b(?:friends|followers|subscribers)\b',
            ],
            'commercial_patterns': [
                r'\b(?:buy|sell|price|discount|offer|deal)\b',
                r'\b\$\d+(?:,\d{3})*(?:\.\d{2})?\b',  # Money
                r'\b(?:shop|store|market|cart)\b',
                r'\b(?:free|shipping|delivery|warranty)\b',
            ],
            'forum_patterns': [
                r'\b(?:thread|post|reply|comment)\b',
                r'\b(?:moderator|admin|user|member)\b',
                r'\b(?:topic|category|tag)\b',
                r'\b(?:sticky|pinned|locked)\b',
            ],
            'dark_web_patterns': [
                r'\.onion\b',
                r'\b(?:bitcoin|monero|cryptocurrency)\b',
                r'\b(?:marketplace|forum|hidden)\b',
                r'\b(?:anonymous|encrypted|secure)\b',
            ]
        }
    
    def _initialize_knowledge_base(self):
        """Initialize knowledge base for content understanding"""
        self.knowledge_base = {
            'topic_keywords': {
                'technology': ['software', 'programming', 'AI', 'machine learning', 'computer', 'code', 'algorithm', 'data'],
                'science': ['research', 'study', 'experiment', 'theory', 'hypothesis', 'analysis', 'method', 'result'],
                'health': ['medical', 'health', 'disease', 'treatment', 'medicine', 'doctor', 'patient', 'symptom'],
                'finance': ['money', 'investment', 'stock', 'market', 'bank', 'loan', 'credit', 'financial'],
                'education': ['learning', 'teaching', 'student', 'school', 'university', 'course', 'degree', 'knowledge'],
                'entertainment': ['movie', 'music', 'game', 'show', 'video', 'play', 'fun', 'entertainment'],
                'politics': ['government', 'policy', 'election', 'vote', 'law', 'politician', 'party', 'campaign'],
                'sports': ['game', 'team', 'player', 'score', 'match', 'championship', 'league', 'sport'],
                'food': ['recipe', 'cook', 'ingredient', 'dish', 'restaurant', 'meal', 'cuisine', 'flavor'],
                'travel': ['destination', 'hotel', 'flight', 'vacation', 'trip', 'tour', 'travel', 'journey'],
            },
            'authority_domains': {
                'high': ['gov', 'edu', 'org'],
                'medium': ['com', 'net'],
                'low': ['info', 'biz', 'xyz']
            },
            'sentiment_words': {
                'positive': ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'happy', 'joy', 'success'],
                'negative': ['bad', 'terrible', 'awful', 'horrible', 'hate', 'angry', 'sad', 'failure', 'disaster', 'worst'],
                'neutral': ['okay', 'fine', 'average', 'normal', 'standard', 'typical', 'regular', 'common']
            }
        }
    
    async def analyze_content(self, page: WebPage) -> ContentAnalysis:
        """Analyze web content comprehensively"""
        try:
            # Check cache first
            if page.url in self.content_cache:
                cached = self.content_cache[page.url]
                # Update freshness if needed
                if self._should_refresh_analysis(cached):
                    return await self._perform_analysis(page)
                return cached
            
            # Perform full analysis
            analysis = await self._perform_analysis(page)
            
            # Cache result
            self.content_cache[page.url] = analysis
            
            # Update web graph
            await self._update_web_graph(page, analysis)
            
            return analysis
            
        except Exception as e:
            logger.error(f"[WebIntelligence] Error analyzing {page.url}: {e}")
            return self._create_error_analysis(page.url, str(e))
    
    async def _perform_analysis(self, page: WebPage) -> ContentAnalysis:
        """Perform comprehensive content analysis"""
        content = page.content.lower()
        
        # Category classification
        category = self._classify_category(content, page.url)
        
        # Quality assessment
        quality = self._assess_quality(page, content)
        
        # Sentiment analysis
        sentiment = self._analyze_sentiment(content)
        
        # Topic extraction
        topics = self._extract_topics(content)
        
        # Entity extraction
        entities = self._extract_entities(page.content)
        
        # Keyword extraction
        keywords = self._extract_keywords(content)
        
        # Summary generation
        summary = self._generate_summary(page.content)
        
        # Authority scoring
        authority_score = self._calculate_authority(page.url, page.metadata)
        
        # Freshness scoring
        freshness_score = self._calculate_freshness(page.metadata)
        
        # Structure analysis
        structure = self._analyze_structure(page.html)
        
        # Relationship analysis
        relationships = self._analyze_relationships(page.links, page.content)
        
        # Intent detection
        intent = self._detect_intent(content)
        
        return ContentAnalysis(
            url=page.url,
            category=category,
            quality=quality,
            sentiment=sentiment,
            topics=topics,
            entities=entities,
            keywords=keywords,
            summary=summary,
            authority_score=authority_score,
            freshness_score=freshness_score,
            relevance_score=0.0,  # Will be calculated based on context
            structure=structure,
            relationships=relationships,
            intent=intent,
            metadata=page.metadata
        )
    
    def _classify_category(self, content: str, url: str) -> ContentCategory:
        """Classify content category"""
        scores = {}
        
        # Check URL patterns
        url_lower = url.lower()
        if 'arxiv.org' in url_lower or 'scholar.google.com' in url_lower:
            return ContentCategory.ACADEMIC
        elif 'wikipedia.org' in url_lower:
            return ContentCategory.WIKI
        elif 'youtube.com' in url_lower or 'vimeo.com' in url_lower:
            return ContentCategory.VIDEO
        elif 'reddit.com' in url_lower or 'facebook.com' in url_lower:
            return ContentCategory.SOCIAL
        elif '.onion' in url_lower:
            return ContentCategory.DARK_WEB
        
        # Check content patterns
        for category, patterns in self.content_patterns.items():
            if category == 'dark_web_patterns':
                continue
                
            score = 0
            for pattern in patterns:
                matches = len(re.findall(pattern, content))
                score += matches
            
            scores[category.replace('_patterns', '')] = score
        
        # Determine category with highest score
        if scores:
            best_category = max(scores, key=scores.get)
            return ContentCategory(best_category)
        
        return ContentCategory.UNKNOWN
    
    def _assess_quality(self, page: WebPage, content: str) -> ContentQuality:
        """Assess content quality"""
        quality_score = 0.0
        
        # Length assessment
        content_length = len(content)
        if content_length > 1000:
            quality_score += 0.2
        elif content_length > 500:
            quality_score += 0.1
        
        # Structure assessment
        if len(page.links) > 5:
            quality_score += 0.1
        if len(page.images) > 3:
            quality_score += 0.1
        
        # Language assessment
        if self._has_proper_grammar(content):
            quality_score += 0.2
        
        # Authority assessment
        domain = urlparse(page.url).netloc
        if any(tld in domain for tld in self.knowledge_base['authority_domains']['high']):
            quality_score += 0.3
        elif any(tld in domain for tld in self.knowledge_base['authority_domains']['medium']):
            quality_score += 0.1
        
        # Content uniqueness (simplified)
        unique_words = len(set(content.split()))
        total_words = len(content.split())
        if total_words > 0:
            uniqueness = unique_words / total_words
            quality_score += uniqueness * 0.1
        
        # Convert to quality category
        if quality_score >= 0.7:
            return ContentQuality.HIGH
        elif quality_score >= 0.4:
            return ContentQuality.MEDIUM
        else:
            return ContentQuality.LOW
    
    def _analyze_sentiment(self, content: str) -> float:
        """Analyze sentiment of content"""
        positive_words = self.knowledge_base['sentiment_words']['positive']
        negative_words = self.knowledge_base['sentiment_words']['negative']
        
        words = content.split()
        positive_count = sum(1 for word in words if word in positive_words)
        negative_count = sum(1 for word in words if word in negative_words)
        
        total_sentiment_words = positive_count + negative_count
        if total_sentiment_words == 0:
            return 0.0
        
        # Calculate sentiment score (-1 to 1)
        sentiment = (positive_count - negative_count) / total_sentiment_words
        return sentiment
    
    def _extract_topics(self, content: str) -> List[str]:
        """Extract main topics from content"""
        topics = []
        content_lower = content.lower()
        
        for topic, keywords in self.knowledge_base['topic_keywords'].items():
            score = sum(1 for keyword in keywords if keyword in content_lower)
            if score >= 2:  # At least 2 keywords to qualify
                topics.append(topic)
        
        return topics
    
    def _extract_entities(self, content: str) -> List[Dict[str, Any]]:
        """Extract entities (people, places, organizations)"""
        entities = []
        
        # Simple entity extraction patterns
        patterns = {
            'person': r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b',
            'place': r'\b[A-Z][a-z]+,\s+[A-Z]{2}\b',
            'organization': r'\b[A-Z][a-z]+\s+(?:Inc|Corp|LLC|Ltd|Company)\b',
            'date': r'\b\d{1,2}/\d{1,2}/\d{4}\b',
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'\b\d{3}-\d{3}-\d{4}\b',
            'money': r'\b\$\d+(?:,\d{3})*(?:\.\d{2})?\b',
        }
        
        for entity_type, pattern in patterns.items():
            matches = re.findall(pattern, content)
            for match in matches:
                entities.append({
                    'type': entity_type,
                    'value': match,
                    'confidence': 0.8  # Simplified confidence
                })
        
        return entities
    
    def _extract_keywords(self, content: str) -> List[str]:
        """Extract important keywords"""
        # Remove common words
        common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how'}
        
        words = content.lower().split()
        word_freq = Counter(word for word in words if word not in common_words and len(word) > 2)
        
        # Get top keywords
        top_keywords = [word for word, freq in word_freq.most_common(10)]
        
        return top_keywords
    
    def _generate_summary(self, content: str) -> str:
        """Generate content summary"""
        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) <= 3:
            return ' '.join(sentences)
        
        # Simple extractive summarization
        # Score sentences based on length and keyword frequency
        scored_sentences = []
        for sentence in sentences:
            words = sentence.split()
            score = len(words)  # Prefer medium-length sentences
            
            # Add keyword score
            for keyword in self._extract_keywords(content):
                if keyword in sentence.lower():
                    score += 2
            
            scored_sentences.append((sentence, score))
        
        # Get top 3 sentences
        top_sentences = sorted(scored_sentences, key=lambda x: x[1], reverse=True)[:3]
        summary = '. '.join(s[0] for s in top_sentences)
        
        return summary
    
    def _calculate_authority(self, url: str, metadata: Dict[str, Any]) -> float:
        """Calculate authority score"""
        authority_score = 0.0
        
        # Domain authority
        domain = urlparse(url).netloc
        if any(tld in domain for tld in self.knowledge_base['authority_domains']['high']):
            authority_score += 0.4
        elif any(tld in domain for tld in self.knowledge_base['authority_domains']['medium']):
            authority_score += 0.2
        elif any(tld in domain for tld in self.knowledge_base['authority_domains']['low']):
            authority_score += 0.1
        
        # SSL/TLS
        if url.startswith('https://'):
            authority_score += 0.1
        
        # Content freshness (if available)
        if metadata.get('last-modified'):
            try:
                last_modified = datetime.fromisoformat(metadata['last-modified'])
                days_old = (datetime.now() - last_modified).days
                if days_old < 7:
                    authority_score += 0.2
                elif days_old < 30:
                    authority_score += 0.1
            except:
                pass
        
        # Content length
        if metadata.get('content-length'):
            content_length = int(metadata['content-length'])
            if content_length > 10000:
                authority_score += 0.1
            elif content_length > 5000:
                authority_score += 0.05
        
        return min(authority_score, 1.0)
    
    def _calculate_freshness(self, metadata: Dict[str, Any]) -> float:
        """Calculate freshness score"""
        freshness_score = 0.5  # Default score
        
        # Check for date metadata
        date_fields = ['date', 'last-modified', 'published', 'created']
        for field in date_fields:
            if field in metadata:
                try:
                    date_str = metadata[field]
                    if isinstance(date_str, str):
                        # Try different date formats
                        for fmt in ['%Y-%m-%d', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%d %H:%M:%S']:
                            try:
                                date = datetime.strptime(date_str, fmt)
                                days_old = (datetime.now() - date).days
                                
                                # Calculate freshness based on age
                                if days_old < 1:
                                    freshness_score = 1.0
                                elif days_old < 7:
                                    freshness_score = 0.8
                                elif days_old < 30:
                                    freshness_score = 0.6
                                elif days_old < 90:
                                    freshness_score = 0.4
                                elif days_old < 365:
                                    freshness_score = 0.2
                                else:
                                    freshness_score = 0.1
                                
                                break
                            except ValueError:
                                continue
                except:
                    pass
        
        return freshness_score
    
    def _analyze_structure(self, html: str) -> Dict[str, Any]:
        """Analyze HTML structure"""
        structure = {
            'has_title': bool(re.search(r'<title[^>]*>', html)),
            'has_headings': bool(re.search(r'<h[1-6][^>]*>', html)),
            'has_navigation': bool(re.search(r'<nav[^>]*>', html)),
            'has_forms': bool(re.search(r'<form[^>]*>', html)),
            'has_tables': bool(re.search(r'<table[^>]*>', html)),
            'has_images': bool(re.search(r'<img[^>]*>', html)),
            'has_videos': bool(re.search(r'<video[^>]*>', html)),
            'has_links': bool(re.search(r'<a[^>]*>', html)),
            'has_lists': bool(re.search(r'<[ou]l[^>]*>', html)),
            'has_meta': bool(re.search(r'<meta[^>]*>', html)),
            'has_css': bool(re.search(r'<style[^>]*>', html) or re.search(r'link[^>]*stylesheet[^>]*>', html)),
            'has_js': bool(re.search(r'<script[^>]*>', html)),
        }
        
        return structure
    
    def _analyze_relationships(self, links: List[str], content: str) -> List[Dict[str, Any]]:
        """Analyze relationships between pages"""
        relationships = []
        
        # Link analysis
        for link in links:
            try:
                link_domain = urlparse(link).netloc
                current_domain = urlparse(links[0] if links else '').netcol
                
                relationship = {
                    'type': 'link',
                    'target': link,
                    'target_domain': link_domain,
                    'is_external': link_domain != current_domain,
                    'anchor_text': self._extract_anchor_text(content, link),
                }
                
                relationships.append(relationship)
            except:
                continue
        
        return relationships
    
    def _extract_anchor_text(self, content: str, url: str) -> str:
        """Extract anchor text for a URL"""
        # Simple pattern to find anchor text
        pattern = rf'<a[^>]*href=["\']?{re.escape(url)}["\']?[^>]*>(.*?)</a>'
        match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
        return match.group(1).strip() if match else url
    
    def _detect_intent(self, content: str) -> str:
        """Detect primary intent of content"""
        intent_scores = {
            'informational': 0,
            'transactional': 0,
            'navigational': 0,
            'commercial': 0,
            'educational': 0,
            'entertainment': 0,
            'social': 0,
            'news': 0
        }
        
        # Informational indicators
        informational_words = ['how', 'what', 'why', 'when', 'where', 'guide', 'tutorial', 'learn', 'understand', 'explain']
        intent_scores['informational'] = sum(1 for word in informational_words if word in content.lower())
        
        # Transactional indicators
        transactional_words = ['buy', 'sell', 'purchase', 'order', 'cart', 'checkout', 'payment', 'price', 'deal']
        intent_scores['transactional'] = sum(1 for word in transactional_words if word in content.lower())
        
        # Navigational indicators
        navigational_words = ['home', 'menu', 'navigation', 'search', 'browse', 'explore', 'find']
        intent_scores['navigational'] = sum(1 for word in navigational_words if word in content.lower())
        
        # Commercial indicators
        commercial_words = ['shop', 'store', 'market', 'brand', 'product', 'service', 'discount', 'offer']
        intent_scores['commercial'] = sum(1 for word in commercial_words if word in content.lower())
        
        # Educational indicators
        educational_words = ['course', 'lesson', 'study', 'learn', 'education', 'school', 'university', 'teach']
        intent_scores['educational'] = sum(1 for word in educational_words if word in content.lower())
        
        # Entertainment indicators
        entertainment_words = ['fun', 'play', 'game', 'movie', 'music', 'entertainment', 'enjoy', 'relax']
        intent_scores['entertainment'] = sum(1 for word in entertainment_words if word in content.lower())
        
        # Social indicators
        social_words = ['share', 'like', 'comment', 'follow', 'friend', 'community', 'social', 'connect']
        intent_scores['social'] = sum(1 for word in social_words if word in content.lower())
        
        # News indicators
        news_words = ['news', 'report', 'breaking', 'update', 'article', 'journalist', 'media']
        intent_scores['news'] = sum(1 for word in news_words if word in content.lower())
        
        # Return intent with highest score
        if max(intent_scores.values()) > 0:
            return max(intent_scores, key=intent_scores.get)
        else:
            return 'informational'
    
    def _has_proper_grammar(self, content: str) -> bool:
        """Simple grammar check"""
        # Check for proper sentence structure
        sentences = re.split(r'[.!?]+', content)
        proper_sentences = 0
        
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and sentence[0].isupper() and sentence[-1] in '.!?':
                proper_sentences += 1
        
        if len(sentences) > 0:
            return proper_sentences / len(sentences) > 0.6
        
        return True
    
    def _should_refresh_analysis(self, analysis: ContentAnalysis) -> bool:
        """Check if analysis should be refreshed"""
        # Refresh if older than 24 hours
        return (datetime.now() - analysis.analyzed_at).hours > 24
    
    async def _update_web_graph(self, page: WebPage, analysis: ContentAnalysis):
        """Update web graph with new page and relationships"""
        try:
            # Add node
            self.web_graph.nodes[page.url] = {
                'title': page.title,
                'category': analysis.category.value,
                'quality': analysis.quality.value,
                'authority': analysis.authority_score,
                'topics': analysis.topics,
                'keywords': analysis.keywords,
                'last_accessed': datetime.now().isoformat()
            }
            
            # Add edges based on relationships
            for relationship in analysis.relationships:
                if relationship['type'] == 'link':
                    edge = {
                        'source': page.url,
                        'target': relationship['target'],
                        'type': 'link',
                        'weight': 1.0
                    }
                    self.web_graph.edges.append(edge)
            
            # Calculate centrality
            self._calculate_centrality()
            
            # Detect clusters
            self._detect_clusters()
            
        except Exception as e:
            logger.error(f"[WebIntelligence] Error updating web graph: {e}")
    
    def _calculate_centrality(self):
        """Calculate node centrality in web graph"""
        try:
            # Create NetworkX graph
            G = nx.DiGraph()
            
            # Add nodes
            for node_id, node_data in self.web_graph.nodes.items():
                G.add_node(node_id, **node_data)
            
            # Add edges
            for edge in self.web_graph.edges:
                G.add_edge(edge['source'], edge['target'], weight=edge['weight'])
            
            # Calculate centrality measures
            degree_centrality = nx.degree_centrality(G)
            betweenness_centrality = nx.betweenness_centrality(G)
            closeness_centrality = nx.closeness_centrality(G)
            
            # Combine centrality scores
            for node in G.nodes():
                combined_score = (
                    degree_centrality.get(node, 0) * 0.4 +
                    betweenness_centrality.get(node, 0) * 0.3 +
                    closeness_centrality.get(node, 0) * 0.3
                )
                self.web_graph.centrality[node] = combined_score
                
        except Exception as e:
            logger.error(f"[WebIntelligence] Error calculating centrality: {e}")
    
    def _detect_clusters(self):
        """Detect clusters in web graph"""
        try:
            # Create NetworkX graph
            G = nx.DiGraph()
            
            # Add nodes and edges
            for node_id, node_data in self.web_graph.nodes.items():
                G.add_node(node_id, category=node_data.get('category', 'unknown'))
            
            for edge in self.web_graph.edges:
                G.add_edge(edge['source'], edge['target'])
            
            # Detect communities using modularity
            communities = nx.community.greedy_modularity_communities(G)
            self.web_graph.clusters = [set(community) for community in communities]
            
        except Exception as e:
            logger.error(f"[WebIntelligence] Error detecting clusters: {e}")
    
    async def search_and_analyze(self, query: str, num_results: int = 10) -> List[ContentAnalysis]:
        """Search and analyze multiple pages"""
        try:
            # Search web
            pages = await self.web_access.search_google(query, num_results)
            
            # Analyze each page
            analyses = []
            for page in pages:
                analysis = await self.analyze_content(page)
                analyses.append(analysis)
            
            # Sort by relevance score
            analyses.sort(key=lambda x: x.relevance_score, reverse=True)
            
            return analyses
            
        except Exception as e:
            logger.error(f"[WebIntelligence] Error in search and analyze: {e}")
            return []
    
    async def monitor_page(self, url: str, interval_minutes: int = 60) -> bool:
        """Monitor a page for changes"""
        try:
            # Add to monitoring list
            self.monitored_pages[url] = datetime.now()
            
            # Check if monitoring is needed
            if url in self.monitored_pages:
                last_check = self.monitored_pages[url]
                if (datetime.now() - last_check).minutes < interval_minutes:
                    return False
            
            # Fetch and analyze page
            request = WebRequest(url=url, extract_content=[ContentType.TEXT, ContentType.METADATA])
            page = await self.web_access.access_web(request)
            analysis = await self.analyze_content(page)
            
            # Update monitoring time
            self.monitored_pages[url] = datetime.now()
            
            # Check for significant changes
            if url in self.content_cache:
                previous_analysis = self.content_cache[url]
                if self._has_significant_changes(previous_analysis, analysis):
                    logger.info(f"[WebIntelligence] Significant changes detected in {url}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"[WebIntelligence] Error monitoring page {url}: {e}")
            return False
    
    def _has_significant_changes(self, previous: ContentAnalysis, current: ContentAnalysis) -> bool:
        """Check if there are significant changes between analyses"""
        # Check content changes
        if previous.content != current.content:
            return True
        
        # Check title changes
        if previous.metadata.get('title') != current.metadata.get('title'):
            return True
        
        # Check topic changes
        if set(previous.topics) != set(current.topics):
            return True
        
        # Check sentiment changes
        if abs(previous.sentiment - current.sentiment) > 0.3:
            return True
        
        return False
    
    def _create_error_analysis(self, url: str, error: str) -> ContentAnalysis:
        """Create error analysis result"""
        return ContentAnalysis(
            url=url,
            category=ContentCategory.UNKNOWN,
            quality=ContentQuality.LOW,
            sentiment=0.0,
            topics=[],
            entities=[],
            keywords=[],
            summary=f"Error analyzing content: {error}",
            authority_score=0.0,
            freshness_score=0.0,
            relevance_score=0.0,
            structure={},
            relationships=[],
            intent='error',
            metadata={'error': error}
        )
    
    def get_knowledge_graph(self) -> Dict[str, Any]:
        """Get knowledge graph representation"""
        return {
            'nodes': self.web_graph.nodes,
            'edges': self.web_graph.edges,
            'centrality': self.web_graph.centrality,
            'clusters': [list(cluster) for cluster in self.web_graph.clusters],
            'statistics': {
                'total_nodes': len(self.web_graph.nodes),
                'total_edges': len(self.web_graph.edges),
                'num_clusters': len(self.web_graph.clusters),
                'average_centrality': sum(self.web_graph.centrality.values()) / len(self.web_graph.centrality) if self.web_graph.centrality else 0
            }
        }
    
    def get_insights(self) -> Dict[str, Any]:
        """Get insights from web intelligence"""
        return {
            'total_analyzed': len(self.content_cache),
            'category_distribution': self._get_category_distribution(),
            'quality_distribution': self._get_quality_distribution(),
            'top_topics': self._get_top_topics(),
            'most_authoritative': self._get_most_authoritative(),
            'search_trends': self.search_history[-10:] if self.search_history else [],
            'monitored_pages': len(self.monitored_pages),
            'knowledge_graph': self.get_knowledge_graph()
        }
    
    def _get_category_distribution(self) -> Dict[str, int]:
        """Get distribution of content categories"""
        distribution = Counter()
        for analysis in self.content_cache.values():
            distribution[analysis.category.value] += 1
        return dict(distribution)
    
    def _get_quality_distribution(self) -> Dict[str, int]:
        """Get distribution of content quality"""
        distribution = Counter()
        for analysis in self.content_cache.values():
            distribution[analysis.quality.value] += 1
        return dict(distribution)
    
    def _get_top_topics(self) -> List[str]:
        """Get most common topics"""
        topic_counter = Counter()
        for analysis in self.content_cache.values():
            for topic in analysis.topics:
                topic_counter[topic] += 1
        return [topic for topic, count in topic_counter.most_common(10)]
    
    def _get_most_authoritative(self) -> List[Dict[str, Any]]:
        """Get most authoritative pages"""
        sorted_pages = sorted(
            self.content_cache.values(),
            key=lambda x: x.authority_score,
            reverse=True
        )
        
        return [
            {
                'url': page.url,
                'title': page.metadata.get('title', ''),
                'authority_score': page.authority_score,
                'category': page.category.value
            }
            for page in sorted_pages[:10]
        ]

# Global instance
_web_intelligence = None

def get_web_intelligence() -> WebIntelligence:
    """Get global web intelligence instance"""
    global _web_intelligence
    if _web_intelligence is None:
        _web_intelligence = WebIntelligence()
    return _web_intelligence
