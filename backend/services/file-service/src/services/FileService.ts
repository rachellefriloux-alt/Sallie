import { Client } from 'minio';
import Redis from 'ioredis';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../utils/logger';

export interface FileMetadata {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  checksum: string;
  bucket: string;
  objectName: string;
  path: string;
  isPublic: boolean;
  downloadCount: number;
  lastAccessedAt?: Date;
  expiresAt?: Date;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileUploadOptions {
  bucket?: string;
  isPublic?: boolean;
  expiresAt?: Date;
  tags?: string[];
  metadata?: Record<string, any>;
  generatePresignedUrl?: boolean;
  expirySeconds?: number;
}

export interface FileQuery {
  userId?: string;
  bucket?: string;
  mimeType?: string;
  tags?: string[];
  isPublic?: boolean;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'size' | 'downloadCount' | 'filename';
  sortOrder?: 'asc' | 'desc';
}

export interface PresignedUrlOptions {
  action: 'upload' | 'download' | 'delete';
  expirySeconds?: number;
  contentType?: string;
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  storageUsed: number;
  storageQuota: number;
  filesByType: Record<string, number>;
  filesByBucket: Record<string, number>;
  uploadTrend: Array<{ date: string; count: number; size: number }>;
  downloadTrend: Array<{ date: string; count: number }>;
}

export class FileService {
  private minioClient: Client;
  private redis: Redis;
  private db: Knex;
  private defaultBucket: string;
  private maxFileSize: number;
  private allowedMimeTypes: Set<string>;

  constructor(minioClient: Client, redis: Redis, db: Knex) {
    this.minioClient = minioClient;
    this.redis = redis;
    this.db = db;
    this.defaultBucket = process.env.MINIO_BUCKET || 'sallie-studio';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '104857600'); // 100MB
    this.allowedMimeTypes = new Set([
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/ogg',
      'audio/mp3', 'audio/wav', 'audio/ogg',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript',
      'application/json', 'application/xml', 'application/zip', 'application/x-rar-compressed'
    ]);

    this.initializeBuckets();
  }

  private async initializeBuckets(): Promise<void> {
    try {
      const buckets = await this.minioClient.listBuckets();
      const bucketExists = buckets.some(bucket => bucket.name === this.defaultBucket);
      
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.defaultBucket, 'us-east-1');
        logger.info(`Created bucket: ${this.defaultBucket}`);
      }

      // Set bucket policy for public access if needed
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.defaultBucket}/public/*`]
          }
        ]
      };

      await this.minioClient.setBucketPolicy(this.defaultBucket, JSON.stringify(policy));
      logger.info('MinIO buckets initialized');
    } catch (error) {
      logger.error('Failed to initialize MinIO buckets', { error });
    }
  }

  async uploadFile(
    userId: string,
    file: Buffer | Express.Multer.File,
    options: FileUploadOptions = {}
  ): Promise<FileMetadata> {
    const buffer = file instanceof Buffer ? file : file.buffer;
    const originalName = file instanceof Buffer ? 'unknown' : file.originalname;
    const mimeType = file instanceof Buffer ? 'application/octet-stream' : file.mimetype;

    // Validate file
    this.validateFile(buffer, mimeType, originalName);

    const fileId = uuidv4();
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    const extension = path.extname(originalName);
    const objectName = `${userId}/${fileId}${extension}`;
    const bucket = options.bucket || this.defaultBucket;

    // Check for duplicates
    const existingFile = await this.db('files')
      .where('userId', userId)
      .where('checksum', checksum)
      .first();

    if (existingFile) {
      logger.info(`Duplicate file detected, returning existing`, { 
        fileId: existingFile.id, 
        userId 
      });
      return existingFile;
    }

    try {
      // Upload to MinIO
      await this.minioClient.putObject(bucket, objectName, buffer, buffer.length, mimeType);

      // Prepare metadata
      const fileMetadata: FileMetadata = {
        id: fileId,
        userId,
        filename: `${fileId}${extension}`,
        originalName,
        mimeType,
        size: buffer.length,
        checksum,
        bucket,
        objectName,
        path: `${bucket}/${objectName}`,
        isPublic: options.isPublic || false,
        downloadCount: 0,
        tags: options.tags || [],
        metadata: options.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: options.expiresAt
      };

      // Store in database
      await this.db('files').insert(fileMetadata);

      // Cache metadata
      await this.cacheFileMetadata(fileMetadata);

      logger.info(`File uploaded successfully`, {
        fileId,
        userId,
        filename: originalName,
        size: buffer.length
      });

      return fileMetadata;
    } catch (error) {
      logger.error('Failed to upload file', { error, userId, filename: originalName });
      
      // Clean up MinIO if database insert failed
      try {
        await this.minioClient.removeObject(bucket, objectName);
      } catch (cleanupError) {
        logger.error('Failed to cleanup MinIO object', { cleanupError });
      }
      
      throw error;
    }
  }

  async uploadFromUrl(
    userId: string,
    url: string,
    options: FileUploadOptions = {}
  ): Promise<FileMetadata> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const filename = path.basename(new URL(url).pathname) || 'download';
      
      return this.uploadFile(userId, buffer, {
        ...options,
        metadata: {
          ...options.metadata,
          sourceUrl: url,
          originalUrl: url
        }
      });
    } catch (error) {
      logger.error('Failed to upload file from URL', { error, url, userId });
      throw error;
    }
  }

  async getPresignedUrl(
    fileId: string,
    userId: string,
    options: PresignedUrlOptions
  ): Promise<string> {
    const file = await this.getFile(fileId, userId);
    if (!file) {
      throw new Error('File not found');
    }

    const expirySeconds = options.expirySeconds || 3600; // 1 hour default

    try {
      switch (options.action) {
        case 'upload':
          return await this.minioClient.presignedPutObject(
            file.bucket,
            file.objectName,
            expirySeconds
          );
        case 'download':
          return await this.minioClient.presignedGetObject(
            file.bucket,
            file.objectName,
            expirySeconds
          );
        case 'delete':
          return await this.minioClient.presignedUrl(
            'DELETE',
            file.bucket,
            file.objectName,
            expirySeconds
          );
        default:
          throw new Error(`Invalid action: ${options.action}`);
      }
    } catch (error) {
      logger.error('Failed to generate presigned URL', { error, fileId, action: options.action });
      throw error;
    }
  }

  async downloadFile(fileId: string, userId: string): Promise<{ stream: NodeJS.ReadableStream; metadata: FileMetadata }> {
    const file = await this.getFile(fileId, userId);
    if (!file) {
      throw new Error('File not found');
    }

    try {
      const stream = await this.minioClient.getObject(file.bucket, file.objectName);
      
      // Update download count and last accessed
      await this.db('files')
        .where('id', fileId)
        .update({
          downloadCount: file.downloadCount + 1,
          lastAccessedAt: new Date(),
          updatedAt: new Date()
        });

      // Update cache
      file.downloadCount += 1;
      file.lastAccessedAt = new Date();
      await this.cacheFileMetadata(file);

      logger.info(`File downloaded`, { fileId, userId, downloadCount: file.downloadCount + 1 });

      return { stream, metadata: file };
    } catch (error) {
      logger.error('Failed to download file', { error, fileId, userId });
      throw error;
    }
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.getFile(fileId, userId);
    if (!file) {
      throw new Error('File not found');
    }

    try {
      // Delete from MinIO
      await this.minioClient.removeObject(file.bucket, file.objectName);

      // Delete from database
      await this.db('files').where('id', fileId).del();

      // Remove from cache
      await this.redis.del(`file:${fileId}`);

      logger.info(`File deleted`, { fileId, userId });
    } catch (error) {
      logger.error('Failed to delete file', { error, fileId, userId });
      throw error;
    }
  }

  async updateFileMetadata(
    fileId: string,
    userId: string,
    updates: Partial<FileMetadata>
  ): Promise<FileMetadata> {
    const file = await this.getFile(fileId, userId);
    if (!file) {
      throw new Error('File not found');
    }

    const allowedUpdates = ['filename', 'isPublic', 'tags', 'metadata', 'expiresAt'];
    const filteredUpdates: any = {};

    for (const key of allowedUpdates) {
      if (updates[key as keyof FileMetadata] !== undefined) {
        filteredUpdates[key] = updates[key as keyof FileMetadata];
      }
    }

    filteredUpdates.updatedAt = new Date();

    await this.db('files')
      .where('id', fileId)
      .update(filteredUpdates);

    const updatedFile = { ...file, ...filteredUpdates };
    await this.cacheFileMetadata(updatedFile);

    logger.info(`File metadata updated`, { fileId, userId, updates: Object.keys(filteredUpdates) });
    return updatedFile;
  }

  async listFiles(query: FileQuery): Promise<{ files: FileMetadata[]; total: number }> {
    let dbQuery = this.db('files');

    // Apply filters
    if (query.userId) {
      dbQuery = dbQuery.where('userId', query.userId);
    }
    if (query.bucket) {
      dbQuery = dbQuery.where('bucket', query.bucket);
    }
    if (query.mimeType) {
      dbQuery = dbQuery.where('mimeType', 'like', `${query.mimeType}%`);
    }
    if (query.isPublic !== undefined) {
      dbQuery = dbQuery.where('isPublic', query.isPublic);
    }
    if (query.tags && query.tags.length > 0) {
      dbQuery = dbQuery.whereRaw('tags && ?', [query.tags]);
    }
    if (query.startDate) {
      dbQuery = dbQuery.where('createdAt', '>=', query.startDate);
    }
    if (query.endDate) {
      dbQuery = dbQuery.where('createdAt', '<=', query.endDate);
    }
    if (query.search) {
      dbQuery = dbQuery.where(function() {
        this.where('filename', 'ilike', `%${query.search}%`)
          .orWhere('originalName', 'ilike', `%${query.search}%`);
      });
    }

    // Get total count
    const total = await dbQuery.clone().count('* as count').first();
    const totalCount = parseInt(total.count);

    // Apply sorting and pagination
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    dbQuery = dbQuery.orderBy(sortBy, sortOrder);

    if (query.limit) {
      dbQuery = dbQuery.limit(query.limit);
    }
    if (query.offset) {
      dbQuery = dbQuery.offset(query.offset);
    }

    const files = await dbQuery.select();

    return { files, total: totalCount };
  }

  async getFileStats(userId?: string, timeRange?: { start: Date; end: Date }): Promise<FileStats> {
    let query = this.db('files');
    
    if (userId) {
      query = query.where('userId', userId);
    }
    
    if (timeRange) {
      query = query.where('createdAt', '>=', timeRange.start)
        .where('createdAt', '<=', timeRange.end);
    }

    const stats = await query
      .select(
        this.db.raw('COUNT(*) as total_files'),
        this.db.raw('SUM(size) as total_size'),
        this.db.raw('SUM(download_count) as total_downloads')
      )
      .first();

    const filesByType = await query
      .select('mimeType')
      .count('* as count')
      .groupBy('mimeType')
      .then(rows => rows.reduce((acc, row) => {
        acc[row.mimeType] = parseInt(row.count);
        return acc;
      }, {}));

    const filesByBucket = await query
      .select('bucket')
      .count('* as count')
      .groupBy('bucket')
      .then(rows => rows.reduce((acc, row) => {
        acc[row.bucket] = parseInt(row.count);
        return acc;
      }, {}));

    // Get upload trend (last 30 days)
    const uploadTrend = await this.getUploadTrend(userId, timeRange);
    const downloadTrend = await this.getDownloadTrend(userId, timeRange);

    return {
      totalFiles: parseInt(stats.total_files) || 0,
      totalSize: parseInt(stats.total_size) || 0,
      storageUsed: parseInt(stats.total_size) || 0,
      storageQuota: this.maxFileSize * 1000, // Example quota
      filesByType,
      filesByBucket,
      uploadTrend,
      downloadTrend
    };
  }

  async createFolder(userId: string, folderName: string, parentId?: string): Promise<any> {
    const folder = {
      id: uuidv4(),
      userId,
      name: folderName,
      parentId,
      type: 'folder',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.db('folders').insert(folder);
    logger.info(`Folder created`, { folderId: folder.id, userId, folderName });
    
    return folder;
  }

  async moveFile(fileId: string, userId: string, targetFolderId?: string): Promise<FileMetadata> {
    const file = await this.getFile(fileId, userId);
    if (!file) {
      throw new Error('File not found');
    }

    await this.db('files')
      .where('id', fileId)
      .update({
        folderId: targetFolderId,
        updatedAt: new Date()
      });

    const updatedFile = { ...file, folderId: targetFolderId };
    await this.cacheFileMetadata(updatedFile);

    logger.info(`File moved`, { fileId, userId, targetFolderId });
    return updatedFile;
  }

  private async getFile(fileId: string, userId?: string): Promise<FileMetadata | null> {
    // Try cache first
    const cached = await this.redis.get(`file:${fileId}`);
    if (cached) {
      const file = JSON.parse(cached);
      if (!userId || file.userId === userId) {
        return file;
      }
    }

    // Query database
    let query = this.db('files').where('id', fileId);
    if (userId) {
      query = query.where('userId', userId);
    }

    const file = await query.first();
    if (file) {
      await this.cacheFileMetadata(file);
    }

    return file;
  }

  private async cacheFileMetadata(file: FileMetadata): Promise<void> {
    await this.redis.setex(`file:${file.id}`, 3600, JSON.stringify(file));
  }

  private validateFile(buffer: Buffer, mimeType: string, filename: string): void {
    // Check file size
    if (buffer.length > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize} bytes`);
    }

    // Check MIME type
    if (!this.allowedMimeTypes.has(mimeType)) {
      throw new Error(`File type ${mimeType} is not allowed`);
    }

    // Check for malicious content (basic scan)
    const content = buffer.toString('utf8', 0, Math.min(1024, buffer.length));
    if (content.includes('<script') || content.includes('javascript:') || content.includes('vbscript:')) {
      throw new Error('File contains potentially malicious content');
    }
  }

  private async getUploadTrend(userId?: string, timeRange?: { start: Date; end: Date }): Promise<Array<{ date: string; count: number; size: number }>> {
    let query = this.db('files');
    
    if (userId) {
      query = query.where('userId', userId);
    }
    
    if (timeRange) {
      query = query.where('createdAt', '>=', timeRange.start)
        .where('createdAt', '<=', timeRange.end);
    }

    return query
      .select(
        this.db.raw('DATE(created_at) as date'),
        this.db.raw('COUNT(*) as count'),
        this.db.raw('SUM(size) as size')
      )
      .groupBy('date')
      .orderBy('date', 'asc')
      .then(rows => rows.map(row => ({
        date: row.date,
        count: parseInt(row.count),
        size: parseInt(row.size) || 0
      })));
  }

  private async getDownloadTrend(userId?: string, timeRange?: { start: Date; end: Date }): Promise<Array<{ date: string; count: number }>> {
    // This would require a separate downloads table for proper tracking
    // For now, return empty array
    return [];
  }
}
