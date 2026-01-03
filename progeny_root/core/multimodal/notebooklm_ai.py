"""NotebookLM AI Integration System.

Advanced notebook and document analysis capabilities:
- AI-powered notebook organization and management
- Document analysis and summarization
- Knowledge extraction and synthesis
- Cross-document relationship mapping
- Intelligent note-taking and organization
- Research assistance and citation management
- Study guide generation
- Concept mapping and visualization
- Question-answer generation from documents
- Collaborative notebook features

This enables Sallie to work with notebooks and documents with AI intelligence.
"""

import json
import logging
import time
import asyncio
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
from concurrent.futures import ThreadPoolExecutor

from utils import setup_logging
from limbic import LimbicSystem
from retrieval import MemorySystem
from llm_router import get_llm_router

logger = setup_logging("notebooklm_ai")

class NotebookType(str, Enum):
    """Types of notebooks."""
    RESEARCH = "research"
    STUDY = "study"
    PROJECT = "project"
    PERSONAL = "personal"
    MEETING = "meeting"
    LITERATURE = "literature"
    LAB = "lab"
    CREATIVE = "creative"

class DocumentType(str, Enum):
    """Types of documents."""
    PDF = "pdf"
    WORD = "word"
    TEXT = "text"
    MARKDOWN = "markdown"
    WEBPAGE = "webpage"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"

class NoteType(str, Enum):
    """Types of notes."""
    SUMMARY = "summary"
    EXTRACT = "extract"
    INSIGHT = "insight"
    QUESTION = "question"
    REFLECTION = "reflection"
    CITATION = "citation"
    CONCEPT = "concept"
    CONNECTION = "connection"

@dataclass
class NotebookDocument:
    """Document in a notebook."""
    id: str
    title: str
    content: str
    document_type: DocumentType
    source: str
    metadata: Dict[str, Any]
    tags: List[str]
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

@dataclass
class NotebookNote:
    """Note in a notebook."""
    id: str
    document_id: str
    content: str
    note_type: NoteType
    position: Dict[str, Any]
    confidence: float
    tags: List[str]
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class NotebookConnection:
    """Connection between documents or concepts."""
    id: str
    source_id: str
    target_id: str
    relationship_type: str
    strength: float
    description: str
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class NotebookLMNotebook:
    """Complete notebook with AI analysis."""
    id: str
    name: str
    description: str
    notebook_type: NotebookType
    documents: List[NotebookDocument]
    notes: List[NotebookNote]
    connections: List[NotebookConnection]
    summary: str
    key_concepts: List[str]
    questions: List[str]
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

class NotebookLMSystem:
    """
    NotebookLM AI Integration System - Advanced notebook capabilities.
    
    Enables Sallie to:
    - Analyze and organize documents intelligently
    - Extract key insights and connections
    - Generate study guides and summaries
    - Create concept maps and visualizations
    - Answer questions based on document content
    - Manage research and study materials
    """
    
    def __init__(self, limbic: LimbicSystem, memory: MemorySystem):
        """Initialize NotebookLM System."""
        try:
            self.limbic = limbic
            self.memory = memory
            self.router = None  # Lazy init
            
            # Notebook storage
            self.notebooks = {}
            self.documents = {}
            self.notes = {}
            self.connections = {}
            
            # AI models
            self.document_analyzer = None
            self.summarizer = None
            self.question_generator = None
            self.concept_mapper = None
            
            # Load existing data
            self._load_notebook_data()
            
            logger.info("[NotebookLM] NotebookLM system initialized")
            
        except Exception as e:
            logger.error(f"[NotebookLM] Failed to initialize: {e}")
            raise
    
    def _load_notebook_data(self):
        """Load existing notebook data."""
        try:
            # Load notebooks
            notebooks_file = Path("progeny_root/core/multimodal/notebooklm_notebooks.json")
            if notebooks_file.exists():
                with open(notebooks_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for notebook_id, notebook_data in data.items():
                        self.notebooks[notebook_id] = NotebookLMNotebook(**notebook_data)
            
            # Load documents
            documents_file = Path("progeny_root/core/multimodal/notebooklm_documents.json")
            if documents_file.exists():
                with open(documents_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for doc_id, doc_data in data.items():
                        self.documents[doc_id] = NotebookDocument(**doc_data)
            
            # Load notes
            notes_file = Path("progeny_root/core/multimodal/notebooklm_notes.json")
            if notes_file.exists():
                with open(notes_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for note_id, note_data in data.items():
                        self.notes[note_id] = NotebookNote(**note_data)
            
            # Load connections
            connections_file = Path("progeny_root/core/multimodal/notebooklm_connections.json")
            if connections_file.exists():
                with open(connections_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for conn_id, conn_data in data.items():
                        self.connections[conn_id] = NotebookConnection(**conn_data)
            
            logger.info(f"[NotebookLM] Loaded {len(self.notebooks)} notebooks, {len(self.documents)} documents")
            
        except Exception as e:
            logger.warning(f"[NotebookLM] Failed to load notebook data: {e}")
    
    async def create_notebook(self, 
                            name: str,
                            description: str,
                            notebook_type: NotebookType) -> NotebookLMNotebook:
        """
        Create a new notebook with AI capabilities.
        
        Args:
            name: Notebook name
            description: Notebook description
            notebook_type: Type of notebook
            
        Returns:
            Created notebook
        """
        try:
            notebook = NotebookLMNotebook(
                id=f"notebook_{int(time.time())}",
                name=name,
                description=description,
                notebook_type=notebook_type,
                documents=[],
                notes=[],
                connections=[],
                summary="",
                key_concepts=[],
                questions=[]
            )
            
            # Store notebook
            self.notebooks[notebook.id] = notebook
            await self._save_notebook(notebook)
            
            logger.info(f"[NotebookLM] Created notebook: {notebook.name}")
            return notebook
            
        except Exception as e:
            logger.error(f"[NotebookLM] Failed to create notebook: {e}")
            raise
    
    async def add_document(self, 
                         notebook_id: str,
                         title: str,
                         content: str,
                         document_type: DocumentType,
                         source: str = "") -> NotebookDocument:
        """
        Add a document to a notebook and analyze it.
        
        Args:
            notebook_id: Notebook ID
            title: Document title
            content: Document content
            document_type: Type of document
            source: Document source
            
        Returns:
            Added document
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            if notebook_id not in self.notebooks:
                raise Exception(f"Notebook {notebook_id} not found")
            
            # Create document
            document = NotebookDocument(
                id=f"doc_{int(time.time())}",
                title=title,
                content=content,
                document_type=document_type,
                source=source,
                metadata={},
                tags=[]
            )
            
            # Analyze document
            await self._analyze_document(document)
            
            # Store document
            self.documents[document.id] = document
            await self._save_document(document)
            
            # Add to notebook
            self.notebooks[notebook_id].documents.append(document.id)
            await self._update_notebook_summary(notebook_id)
            
            logger.info(f"[NotebookLM] Added document: {document.title}")
            return document
            
        except Exception as e:
            logger.error(f"[NotebookLM] Failed to add document: {e}")
            raise
    
    async def _analyze_document(self, document: NotebookDocument):
        """Analyze document and extract insights."""
        try:
            if not self.router:
                return
            
            # Extract key concepts
            concepts = await self._extract_concepts(document.content)
            document.metadata["key_concepts"] = concepts
            
            # Generate summary
            summary = await self._generate_summary(document.content)
            document.metadata["summary"] = summary
            
            # Extract entities
            entities = await self._extract_entities(document.content)
            document.metadata["entities"] = entities
            
            # Generate questions
            questions = await self._generate_questions(document.content)
            document.metadata["questions"] = questions
            
        except Exception as e:
            logger.error(f"[NotebookLM] Failed to analyze document: {e}")
    
    async def _extract_concepts(self, content: str) -> List[str]:
        """Extract key concepts from content."""
        try:
            prompt = f"""
            Extract the key concepts from this text:
            
            {content[:1000]}
            
            Return as a list of the most important concepts.
            """
            
            response = await self.router.generate_response(prompt)
            
            # Parse concepts
            concepts = [concept.strip() for concept in response.split("\n") if concept.strip()]
            return concepts[:10]  # Limit to top 10
            
        except Exception as e:
            logger.error(f"[NotebookLM] Failed to extract concepts: {e}")
            return []
    
    async def _generate_summary(self, content: str) -> str:
        """Generate summary of content."""
        try:
            prompt = f"""
            Summarize this text in 2-3 sentences:
            
            {content[:2000]}
            """
            
            return await self.router.generate_response(prompt)
            
        except Exception as e:
            logger.error(f"[NotebookLM] Failed to generate summary: {e}")
            return ""
    
    async def _extract_entities(self, content: str) -> List[Dict[str, Any]]:
        """Extract entities from content."""
        try:
            prompt = f"""
            Extract important entities (people, places, dates, organizations) from this text:
            
            {content[:1000]}
            
            Return as a list of entities with their types.
            """
            
            response = await self.router.generate_response(prompt)
            
            # Parse entities (simplified)
            return [{"name": entity, "type": "unknown"} for entity in response.split("\n") if entity.strip()]
            
        except Exception as e:
            logger.error(f"[NotebookLM] Failed to extract entities: {e}")
            return []
    
    async def _generate_questions(self, content: str) -> List[str]:
        """Generate questions from content."""
        try:
            prompt = f"""
            Generate 5 important questions that can be answered from this text:
            
            {content[:1000]}
            """
            
            response = await self.router.generate_response(prompt)
            
            # Parse questions
            questions = [q.strip() for q in response.split("\n") if q.strip() and "?" in q]
            return questions[:5]
            
        except Exception as e:
            logger.error(f"[NotebookLM] Failed to generate questions: {e}")
            return []
    
    async def ask_question(self, notebook_id: str, question: str) -> str:
        """
        Ask a question about the notebook content.
        
        Args:
            notebook_id: Notebook ID
            question: Question to ask
            
        Returns:
            Answer to the question
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            if notebook_id not in self.notebooks:
                raise Exception(f"Notebook {notebook_id} not found")
            
            notebook = self.notebooks[notebook_id]
            
            # Collect all document content
            all_content = ""
            for doc_id in notebook.documents:
                if doc_id in self.documents:
                    all_content += f"\n\n{self.documents[doc_id].content}"
            
            # Generate answer
            prompt = f"""
            Based on the following documents, answer this question:
            
            Question: {question}
            
            Documents:
            {all_content[:5000]}
            
            Provide a comprehensive answer based on the documents.
            """
            
            answer = await self.router.generate_response(prompt)
            
            logger.info(f"[NotebookLM] Answered question for notebook {notebook_id}")
            return answer
            
        except Exception as e:
            logger.error(f"[NotebookLM] Failed to answer question: {e}")
            raise
    
    async def generate_study_guide(self, notebook_id: str) -> Dict[str, Any]:
        """
        Generate a study guide for the notebook.
        
        Args:
            notebook_id: Notebook ID
            
        Returns:
            Study guide with summaries, questions, and key concepts
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            if notebook_id not in self.notebooks:
                raise Exception(f"Notebook {notebook_id} not found")
            
            notebook = self.notebooks[notebook_id]
            
            # Generate study guide sections
            study_guide = {
                "summary": notebook.summary,
                "key_concepts": notebook.key_concepts,
                "study_questions": notebook.questions,
                "document_summaries": [],
                "connections": []
            }
            
            # Add document summaries
            for doc_id in notebook.documents:
                if doc_id in self.documents:
                    doc = self.documents[doc_id]
                    study_guide["document_summaries"].append({
                        "title": doc.title,
                        "summary": doc.metadata.get("summary", ""),
                        "key_concepts": doc.metadata.get("key_concepts", [])
                    })
            
            # Add connections
            for conn_id in notebook.connections:
                if conn_id in self.connections:
                    conn = self.connections[conn_id]
                    study_guide["connections"].append({
                        "source": conn.source_id,
                        "target": conn.target_id,
                        "relationship": conn.relationship_type,
                        "description": conn.description
                    })
            
            logger.info(f"[NotebookLM] Generated study guide for notebook {notebook_id}")
            return study_guide
            
        except Exception as e:
            logger.error(f"[NotebookLM] Failed to generate study guide: {e}")
            raise
    
    async def create_concept_map(self, notebook_id: str) -> Dict[str, Any]:
        """
        Create a concept map for the notebook.
        
        Args:
            notebook_id: Notebook ID
            
        Returns:
            Concept map with nodes and connections
        """
        try:
            if notebook_id not in self.notebooks:
                raise Exception(f"Notebook {notebook_id} not found")
            
            notebook = self.notebooks[notebook_id]
            
            # Create concept map
            concept_map = {
                "nodes": [],
                "edges": []
            }
            
            # Add concept nodes
            for concept in notebook.key_concepts:
                concept_map["nodes"].append({
                    "id": concept,
                    "label": concept,
                    "type": "concept"
                })
            
            # Add document nodes
            for doc_id in notebook.documents:
                if doc_id in self.documents:
                    doc = self.documents[doc_id]
                    concept_map["nodes"].append({
                        "id": doc_id,
                        "label": doc.title,
                        "type": "document"
                    })
            
            # Add connections
            for conn_id in notebook.connections:
                if conn_id in self.connections:
                    conn = self.connections[conn_id]
                    concept_map["edges"].append({
                        "source": conn.source_id,
                        "target": conn.target_id,
                        "label": conn.relationship_type,
                        "strength": conn.strength
                    })
            
            logger.info(f"[NotebookLM] Created concept map for notebook {notebook_id}")
            return concept_map
            
        except Exception as e:
            logger.error(f"[NotebookLM] Failed to create concept map: {e}")
            raise
    
    async def _update_notebook_summary(self, notebook_id: str):
        """Update notebook summary and key concepts."""
        try:
            if not self.router:
                return
            
            if notebook_id not in self.notebooks:
                return
            
            notebook = self.notebooks[notebook_id]
            
            # Collect all concepts
            all_concepts = []
            for doc_id in notebook.documents:
                if doc_id in self.documents:
                    doc = self.documents[doc_id]
                    all_concepts.extend(doc.metadata.get("key_concepts", []))
            
            # Update key concepts (unique)
            notebook.key_concepts = list(set(all_concepts))
            
            # Generate overall summary
            all_summaries = []
            for doc_id in notebook.documents:
                if doc_id in self.documents:
                    doc = self.documents[doc_id]
                    summary = doc.metadata.get("summary", "")
                    if summary:
                        all_summaries.append(summary)
            
            if all_summaries:
                combined_summary = " ".join(all_summaries)
                notebook.summary = await self._generate_summary(combined_summary)
            
            # Collect all questions
            all_questions = []
            for doc_id in notebook.documents:
                if doc_id in self.documents:
                    doc = self.documents[doc_id]
                    all_questions.extend(doc.metadata.get("questions", []))
            
            notebook.questions = all_questions[:10]  # Limit to top 10
            
            # Save updated notebook
            await self._save_notebook(notebook)
            
        except Exception as e:
            logger.error(f"[NotebookLM] Failed to update notebook summary: {e}")
    
    def get_notebooks(self) -> Dict[str, NotebookLMNotebook]:
        """Get all notebooks."""
        return self.notebooks
    
    def get_notebook(self, notebook_id: str) -> Optional[NotebookLMNotebook]:
        """Get a specific notebook."""
        return self.notebooks.get(notebook_id)
    
    def get_documents(self, notebook_id: Optional[str] = None) -> Dict[str, NotebookDocument]:
        """Get documents, optionally filtered by notebook."""
        if notebook_id:
            if notebook_id not in self.notebooks:
                return {}
            doc_ids = self.notebooks[notebook_id].documents
            return {doc_id: doc for doc_id, doc in self.documents.items() if doc_id in doc_ids}
        return self.documents
    
    async def _save_notebook(self, notebook: NotebookLMNotebook):
        """Save notebook to file."""
        try:
            notebooks_file = Path("progeny_root/core/multimodal/notebooklm_notebooks.json")
            notebooks_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Load existing data
            data = {}
            if notebooks_file.exists():
                with open(notebooks_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
            
            # Update notebook data
            data[notebook.id] = {
                "id": notebook.id,
                "name": notebook.name,
                "description": notebook.description,
                "notebook_type": notebook.notebook_type.value,
                "documents": notebook.documents,
                "notes": notebook.notes,
                "connections": notebook.connections,
                "summary": notebook.summary,
                "key_concepts": notebook.key_concepts,
                "questions": notebook.questions,
                "created_at": notebook.created_at.isoformat(),
                "updated_at": notebook.updated_at.isoformat()
            }
            
            with open(notebooks_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
        except Exception as e:
            logger.error(f"[NotebookLM] Failed to save notebook: {e}")
    
    async def _save_document(self, document: NotebookDocument):
        """Save document to file."""
        try:
            documents_file = Path("progeny_root/core/multimodal/notebooklm_documents.json")
            documents_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Load existing data
            data = {}
            if documents_file.exists():
                with open(documents_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
            
            # Update document data
            data[document.id] = {
                "id": document.id,
                "title": document.title,
                "content": document.content,
                "document_type": document.document_type.value,
                "source": document.source,
                "metadata": document.metadata,
                "tags": document.tags,
                "created_at": document.created_at.isoformat(),
                "updated_at": document.updated_at.isoformat()
            }
            
            with open(documents_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
        except Exception as e:
            logger.error(f"[NotebookLM] Failed to save document: {e}")
    
    async def cleanup(self):
        """Cleanup resources."""
        try:
            logger.info("[NotebookLM] NotebookLM system cleaned up")
            
        except Exception as e:
            logger.error(f"[NotebookLM] Cleanup failed: {e}")

# Global instance
_notebooklm_system = None

def get_notebooklm_system() -> NotebookLMSystem:
    """Get the global NotebookLM system."""
    global _notebooklm_system
    if _notebooklm_system is None:
        from limbic import get_limbic_system
        from retrieval import get_memory_system
        _notebooklm_system = NotebookLMSystem(get_limbic_system(), get_memory_system())
    return _notebooklm_system
