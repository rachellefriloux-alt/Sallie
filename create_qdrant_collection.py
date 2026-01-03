#!/usr/bin/env python3
"""
Create Qdrant collection for Sallie's memory system
"""

import requests
import json
import sys

def create_collection():
    """Create the progeny_memory collection in Qdrant"""
    
    # Qdrant configuration
    QDRANT_URL = "http://localhost:6333"
    COLLECTION_NAME = "progeny_memory"
    VECTOR_SIZE = 768
    
    print(f"Creating collection '{COLLECTION_NAME}' in Qdrant...")
    
    # Check if collection already exists
    try:
        response = requests.get(f"{QDRANT_URL}/collections/{COLLECTION_NAME}")
        if response.status_code == 200:
            print(f"✅ Collection '{COLLECTION_NAME}' already exists")
            return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Error checking collection: {e}")
        return False
    
    # Create collection
    collection_config = {
        "vectors": {
            "size": VECTOR_SIZE,
            "distance": "Cosine"
        },
        "optimizers_config": {
            "default_segment_number": 2
        }
    }
    
    try:
        response = requests.put(
            f"{QDRANT_URL}/collections/{COLLECTION_NAME}",
            json=collection_config
        )
        
        if response.status_code == 200:
            print(f"✅ Successfully created collection '{COLLECTION_NAME}'")
            print(f"   - Vector size: {VECTOR_SIZE}")
            print(f"   - Distance: Cosine")
            print(f"   - Quantization: Scalar (quantile: 0.99)")
            return True
        else:
            print(f"❌ Failed to create collection: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error creating collection: {e}")
        return False

def verify_collection():
    """Verify the collection was created successfully"""
    
    QDRANT_URL = "http://localhost:6333"
    COLLECTION_NAME = "progeny_memory"
    
    try:
        response = requests.get(f"{QDRANT_URL}/collections/{COLLECTION_NAME}")
        if response.status_code == 200:
            collection_info = response.json()
            print(f"✅ Collection verification successful:")
            print(f"   - Name: {collection_info['result']['config']['params']['vectors']['size']} dimensions")
            print(f"   - Status: {collection_info['result']['status']}")
            vectors_count = collection_info['result'].get('vectors_count', 0)
            print(f"   - Vectors: {vectors_count}")
            return True
        else:
            print(f"❌ Collection verification failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error verifying collection: {e}")
        return False

if __name__ == "__main__":
    print("🧠 Sallie Memory System - Qdrant Collection Setup")
    print("=" * 50)
    
    # Check Qdrant is running
    try:
        response = requests.get("http://localhost:6333")
        if response.status_code != 200:
            print("❌ Qdrant is not running. Please start Docker first.")
            sys.exit(1)
    except requests.exceptions.RequestException:
        print("❌ Cannot connect to Qdrant. Please start Docker first.")
        sys.exit(1)
    
    print("✅ Qdrant is running")
    
    # Create collection
    if create_collection():
        # Verify creation
        if verify_collection():
            print("\n🎉 Qdrant collection setup complete!")
            print("   Sallie's memory system is ready to use.")
        else:
            print("\n⚠️ Collection created but verification failed")
            sys.exit(1)
    else:
        print("\n❌ Failed to create collection")
        sys.exit(1)
