# Running Digital Progeny v5.4.2

## Prerequisites

- Python 3.10+
- Ollama running on `localhost:11434`
- Qdrant running (Docker or local)

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Ensure Ollama is running
ollama serve

# Pull required models
ollama pull phi3:mini
ollama pull llama3
ollama pull nomic-embed-text

# Start Qdrant (Docker)
docker run -p 6333:6333 qdrant/qdrant

# Or use local Qdrant
# Qdrant will use local storage automatically if Docker unavailable
```

## Running

```bash
# Start the server
cd progeny_root
python -m uvicorn core.main:app --reload --host 0.0.0.0 --port 8000

# Or use the run script
python run.py
```

## Environment Variables

```bash
# Optional: Set custom paths
export PROGENY_ROOT=./progeny_root
export QDRANT_URL=http://localhost:6333
export OLLAMA_URL=http://localhost:11434
```

## Access

- **Web UI**: http://localhost:8000
- **API**: http://localhost:8000/docs (Swagger UI)

## First Run

1. Start the server
2. Open web UI
3. Complete the Great Convergence (15 questions)
4. Sallie will choose her avatar
5. Begin interacting!

## Troubleshooting

### Ollama Connection Issues

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

### Qdrant Connection Issues

```bash
# Check Qdrant is running
curl http://localhost:6333/collections

# System will fallback to local storage if Qdrant unavailable
```

### Port Already in Use

```bash
# Use different port
uvicorn core.main:app --port 8001
```

## Development

```bash
# Run tests
pytest progeny_root/tests/ -v

# Format code
black progeny_root/

# Lint code
ruff check progeny_root/
```

