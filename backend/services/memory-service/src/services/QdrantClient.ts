import { QdrantClient } from '@qdrant/client';
import { Memory, MemorySearchRequest, MemorySearchResult, MemoryFilter, MemoryCreateRequest, MemoryUpdateRequest, MemoryDeleteRequest, MemoryConfig } from '../models/Memory';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { OpenAI } from 'openai';
import * as tiktoken from 'tiktoken';

export class QdrantMemoryService {
  private client: QdrantClient;
  private openai: OpenAI;
  private config: MemoryConfig;
  private collectionName: string;

  constructor(config: MemoryConfig) {
    this.config = config;
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.collectionName = process.env.QDRANT_COLLECTION || 'sallie_memories';
  }

  async initialize(): Promise<void> {
    try {
      // Check if collection exists
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(c => c.name === this.collectionName);

      if (!exists) {
        logger.info(`Creating collection: ${this.collectionName}`);
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: this.config.embedding_dimension,
            distance: 'Cosine',
          },
          optimizers_config: {
            default_segment_number: 2,
          },
          replication_factor: 1,
          write_consistency_factor: 1,
        });
      }

      // Verify collection is ready
      const collectionInfo = await this.client.getCollection(this.collectionName);
      logger.info(`Collection ${this.collectionName} ready with ${collectionInfo.vectors_count} vectors`);

    } catch (error) {
      logger.error('Failed to initialize Qdrant client:', error);
      throw error;
    }
  }

  async createMemory(request: MemoryCreateRequest): Promise<Memory> {
    try {
      const embedding = request.generate_embedding !== false 
        ? await this.generateEmbedding(request.content)
        : [];

      const memory: Memory = {
        id: uuidv4(),
        content: request.content,
        embedding,
        metadata: request.metadata,
        created_at: Date.now(),
        updated_at: Date.now(),
        access_count: 0,
        last_accessed: Date.now(),
        salience: this.calculateInitialSalience(request.metadata),
        tags: request.tags || [],
        actor_id: request.actor_id,
      };

      // Store in Qdrant
      await this.client.upsert(this.collectionName, {
        points: [{
          id: memory.id,
          vector: memory.embedding,
          payload: {
            content: memory.content,
            metadata: memory.metadata,
            created_at: memory.created_at,
            updated_at: memory.updated_at,
            access_count: memory.access_count,
            last_accessed: memory.last_accessed,
            salience: memory.salience,
            tags: memory.tags,
            actor_id: memory.actor_id,
          },
        }],
      });

      logger.info(`Created memory: ${memory.id}`);
      return memory;

    } catch (error) {
      logger.error('Failed to create memory:', error);
      throw error;
    }
  }

  async searchMemories(request: MemorySearchRequest): Promise<MemorySearchResult> {
    const startTime = Date.now();

    try {
      const queryEmbedding = request.query_embedding || 
        await this.generateEmbedding(request.query);

      // Build filter
      const filter = this.buildQdrantFilter(request.filters);

      // Search with MMR (Maximal Marginal Relevance)
      const searchResult = await this.client.search(this.collectionName, {
        vector: queryEmbedding,
        limit: request.limit || this.config.search_limit_default,
        score_threshold: request.threshold || this.config.search_threshold_default,
        filter,
        with_payload: true,
        with_vector: false,
      });

      // Apply MMR re-ranking for diversity
      const diverseResults = this.applyMMRReRanking(
        searchResult,
        queryEmbedding,
        this.config.mrr_lambda
      );

      const memories: Memory[] = diverseResults.map(point => ({
        id: point.id as string,
        content: point.payload!.content as string,
        embedding: [], // Don't return embeddings by default
        metadata: point.payload!.metadata as any,
        created_at: point.payload!.created_at as number,
        updated_at: point.payload!.updated_at as number,
        access_count: point.payload!.access_count as number,
        last_accessed: point.payload!.last_accessed as number,
        salience: point.payload!.salience as number,
        tags: point.payload!.tags as string[],
        actor_id: point.payload!.actor_id as string,
      }));

      // Update access counts
      await this.updateAccessCounts(memories.map(m => m.id));

      const searchTime = Date.now() - startTime;

      logger.info(`Search completed: ${memories.length} results in ${searchTime}ms`);

      return {
        memories,
        total_count: memories.length,
        search_time_ms: searchTime,
        query_used: request.query,
        filters_applied: request.filters || {},
      };

    } catch (error) {
      logger.error('Failed to search memories:', error);
      throw error;
    }
  }

  async updateMemory(request: MemoryUpdateRequest): Promise<Memory> {
    try {
      // Get existing memory
      const existing = await this.client.retrieve(this.collectionName, {
        ids: [request.id],
        with_payload: true,
      });

      if (existing.length === 0) {
        throw new Error(`Memory not found: ${request.id}`);
      }

      const existingPayload = existing[0].payload!;
      const updatedMemory: Memory = {
        id: request.id,
        content: request.content || existingPayload.content as string,
        embedding: request.regenerate_embedding 
          ? await this.generateEmbedding(request.content || existingPayload.content as string)
          : [], // Keep existing embedding
        metadata: {
          ...existingPayload.metadata as any,
          ...request.metadata,
        },
        created_at: existingPayload.created_at as number,
        updated_at: Date.now(),
        access_count: existingPayload.access_count as number,
        last_accessed: existingPayload.last_accessed as number,
        salience: request.metadata ? this.calculateInitialSalience(request.metadata) : existingPayload.salience as number,
        tags: request.tags || existingPayload.tags as string[],
        actor_id: request.actor_id || existingPayload.actor_id as string,
      };

      // Update in Qdrant
      await this.client.upsert(this.collectionName, {
        points: [{
          id: updatedMemory.id,
          vector: updatedMemory.embedding,
          payload: {
            content: updatedMemory.content,
            metadata: updatedMemory.metadata,
            created_at: updatedMemory.created_at,
            updated_at: updatedMemory.updated_at,
            access_count: updatedMemory.access_count,
            last_accessed: updatedMemory.last_accessed,
            salience: updatedMemory.salience,
            tags: updatedMemory.tags,
            actor_id: updatedMemory.actor_id,
          },
        }],
      });

      logger.info(`Updated memory: ${updatedMemory.id}`);
      return updatedMemory;

    } catch (error) {
      logger.error('Failed to update memory:', error);
      throw error;
    }
  }

  async deleteMemory(request: MemoryDeleteRequest): Promise<void> {
    try {
      await this.client.delete(this.collectionName, {
        points: [request.id],
      });

      logger.info(`Deleted memory: ${request.id}`);

    } catch (error) {
      logger.error('Failed to delete memory:', error);
      throw error;
    }
  }

  async getMemoryById(id: string): Promise<Memory | null> {
    try {
      const result = await this.client.retrieve(this.collectionName, {
        ids: [id],
        with_payload: true,
        with_vector: true,
      });

      if (result.length === 0) {
        return null;
      }

      const point = result[0];
      const memory: Memory = {
        id: point.id as string,
        content: point.payload!.content as string,
        embedding: point.vector as number[],
        metadata: point.payload!.metadata as any,
        created_at: point.payload!.created_at as number,
        updated_at: point.payload!.updated_at as number,
        access_count: point.payload!.access_count as number,
        last_accessed: point.payload!.last_accessed as number,
        salience: point.payload!.salience as number,
        tags: point.payload!.tags as string[],
        actor_id: point.payload!.actor_id as string,
      };

      // Update access count
      await this.updateAccessCounts([id]);

      return memory;

    } catch (error) {
      logger.error('Failed to get memory by ID:', error);
      throw error;
    }
  }

  async getCollectionStats(): Promise<any> {
    try {
      const info = await this.client.getCollection(this.collectionName);
      return {
        vectors_count: info.vectors_count,
        indexed_vectors_count: info.indexed_vectors_count,
        points_count: info.points_count,
        segments_count: info.segments_count,
        disk_data_size: info.disk_data_size,
        ram_data_size: info.ram_data_size,
      };

    } catch (error) {
      logger.error('Failed to get collection stats:', error);
      throw error;
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Tokenize and truncate if necessary
      const encoding = tiktoken.encoding_for_model(this.config.embedding_model);
      const tokens = encoding.encode(text);
      
      // Truncate to model's context limit if needed
      const maxTokens = 8191; // For text-embedding-ada-002
      const truncatedTokens = tokens.slice(0, maxTokens);
      const truncatedText = encoding.decode(truncatedTokens);

      const response = await this.openai.embeddings.create({
        model: this.config.embedding_model,
        input: truncatedText,
      });

      return response.data[0].embedding;

    } catch (error) {
      logger.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  private calculateInitialSalience(metadata: any): number {
    let salience = 0.5; // Base salience

    // Adjust based on importance
    if (metadata.importance) {
      salience += metadata.importance * 0.3;
    }

    // Adjust based on emotional weight
    if (metadata.emotional_weight) {
      salience += metadata.emotional_weight * 0.2;
    }

    // Adjust based on heritage relevance
    if (metadata.heritage_relevance) {
      salience += metadata.heritage_relevance * 0.2;
    }

    // Adjust based on memory type
    const typeSalience = {
      conversation: 0.6,
      observation: 0.4,
      learning: 0.8,
      heritage: 1.0,
      hypothesis: 0.7,
      decision: 0.9,
      reflection: 0.7,
      insight: 0.9,
      pattern: 0.8,
      goal: 0.8,
      event: 0.5,
      fact: 0.3,
      question: 0.4,
      answer: 0.5,
    };

    if (metadata.type && typeSalience[metadata.type]) {
      salience = (salience + typeSalience[metadata.type]) / 2;
    }

    return Math.max(0, Math.min(1, salience));
  }

  private buildQdrantFilter(filters?: MemoryFilter): any {
    if (!filters) return undefined;

    const must: any[] = [];

    if (filters.type && filters.type.length > 0) {
      must.push({
        key: 'metadata.type',
        match: { any: filters.type },
      });
    }

    if (filters.source && filters.source.length > 0) {
      must.push({
        key: 'metadata.source',
        match: { any: filters.source },
      });
    }

    if (filters.tags && filters.tags.length > 0) {
      must.push({
        key: 'tags',
        match: { any: filters.tags },
      });
    }

    if (filters.date_range) {
      must.push({
        key: 'created_at',
        range: {
          gte: filters.date_range.start,
          lte: filters.date_range.end,
        },
      });
    }

    if (filters.salience_min) {
      must.push({
        key: 'salience',
        range: { gte: filters.salience_min },
      });
    }

    if (filters.importance_min) {
      must.push({
        key: 'metadata.importance',
        range: { gte: filters.importance_min },
      });
    }

    if (filters.creator_id) {
      must.push({
        key: 'metadata.creator_id',
        match: { value: filters.creator_id },
      });
    }

    if (filters.actor_id) {
      must.push({
        key: 'actor_id',
        match: { value: filters.actor_id },
      });
    }

    return must.length > 0 ? { must } : undefined;
  }

  private applyMMRReRanking(
    results: any[],
    queryEmbedding: number[],
    lambda: number
  ): any[] {
    if (results.length <= 1) return results;

    const selected: any[] = [results[0]];
    const remaining = results.slice(1);

    while (selected.length < Math.min(results.length, 10) && remaining.length > 0) {
      let bestIdx = 0;
      let bestScore = -Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];
        
        // Relevance score
        const relevance = candidate.score;
        
        // Maximum similarity to already selected items
        let maxSim = 0;
        for (const selectedPoint of selected) {
          const sim = this.cosineSimilarity(
            candidate.vector,
            selectedPoint.vector
          );
          maxSim = Math.max(maxSim, sim);
        }
        
        // MMR score: λ * relevance - (1-λ) * max_similarity
        const mmrScore = lambda * relevance - (1 - lambda) * maxSim;
        
        if (mmrScore > bestScore) {
          bestScore = mmrScore;
          bestIdx = i;
        }
      }

      selected.push(remaining[bestIdx]);
      remaining.splice(bestIdx, 1);
    }

    return selected;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async updateAccessCounts(memoryIds: string[]): Promise<void> {
    try {
      // This would typically be done in a batch operation
      // For now, we'll update them individually
      for (const id of memoryIds) {
        const existing = await this.client.retrieve(this.collectionName, {
          ids: [id],
          with_payload: true,
        });

        if (existing.length > 0) {
          const payload = existing[0].payload!;
          await this.client.setPayload(this.collectionName, {
            payload: {
              access_count: (payload.access_count as number) + 1,
              last_accessed: Date.now(),
            },
            points: [id],
          });
        }
      }
    } catch (error) {
      logger.error('Failed to update access counts:', error);
      // Don't throw error - this is non-critical
    }
  }
}
