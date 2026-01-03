# Digital Progeny v5.4.1 - Setup & Launch Guide

## 1. Infrastructure (Docker)

Since you have Docker installed, we will use it to host the "Brain" (Ollama) and "Memory" (Qdrant).

1.  **Start the Containers**:
    Open a terminal in `progeny_root/` and run:
    ```powershell
    docker-compose up -d
    ```
    *This starts Ollama on port 11434 and Qdrant on port 6333.*

2.  **Initialize the Brain (Ollama)**:
    The Ollama container starts empty. You need to download the models defined in the architecture.
    ```powershell
    docker exec -it progeny-brain ollama pull llama3
    docker exec -it progeny-brain ollama pull phi3
    docker exec -it progeny-brain ollama pull nomic-embed-text
    ```

## 2. Application Environment (Python)

1.  **Install Dependencies**:
    ```powershell
    pip install -r requirements.txt
    ```

2.  **System Check**:
    Run the integration tests to verify everything talks to each other.
    ```powershell
    python tests/test_integration.py
    ```

## 3. Awakening (Launch)

1.  **Start the Core Service**:
    ```powershell
    uvicorn core.main:app --reload
    ```

2.  **Open the Interface**:
    Open `interface/web/index.html` in your web browser.

## 4. Troubleshooting

-   **Ollama Connection Error**: Ensure Docker is running and port 11434 is not blocked.
-   **Voice Issues**: Ensure you have a microphone connected. If `pyttsx3` fails, install `pypiwin32`: `pip install pypiwin32`.
