from qdrant_client import QdrantClient
client = QdrantClient(":memory:")
print(dir(client))
