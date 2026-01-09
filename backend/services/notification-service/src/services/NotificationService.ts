import nodemailer from 'nodemailer';
import Redis from 'ioredis';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import { logger } from '../utils/logger';

export interface Notification {
  id: string;
  userId: string;
  type: 'email' | 'push' | 'sms' | 'in_app';
  channel: 'email' | 'push' | 'sms' | 'webhook' | 'slack';
  title: string;
  content: string;
  template?: string;
  data?: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  retryCount: number;
  maxRetries: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'push' | 'sms' | 'in_app';
  subject?: string;
  content: string;
  htmlContent?: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreference {
  userId: string;
  channel: string;
  isEnabled: boolean;
  rules: {
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
    quietHours?: { start: string; end: string };
    categories: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  method: 'POST' | 'PUT';
  headers: Record<string, string>;
  secret?: string;
  isActive: boolean;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationService {
  private emailTransporter: nodemailer.Transporter;
  private redis: Redis;
  private db: Knex;
  private pushService: any; // Web Push service
  private webhookQueue: Map<string, any> = new Map();

  constructor(redis: Redis, db: Knex) {
    this.redis = redis;
    this.db = db;
    this.initializeEmailTransporter();
    this.initializeScheduledTasks();
  }

  private initializeEmailTransporter(): void {
    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Verify email configuration
    this.emailTransporter.verify((error, success) => {
      if (error) {
        logger.error('Email transporter verification failed', { error });
      } else {
        logger.info('Email transporter ready');
      }
    });
  }

  private initializeScheduledTasks(): void {
    // Process pending notifications every minute
    cron.schedule('* * * * *', async () => {
      await this.processPendingNotifications();
    });

    // Clean up old notifications daily
    cron.schedule('0 0 * * *', async () => {
      await this.cleanupOldNotifications();
    });

    // Process retry queue every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      await this.processRetryQueue();
    });
  }

  async sendNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'retryCount'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      // Check user preferences
      const preferences = await this.getUserPreferences(newNotification.userId, newNotification.channel);
      if (!this.shouldSendNotification(newNotification, preferences)) {
        logger.info(`Notification skipped due to user preferences`, {
          notificationId: newNotification.id,
          userId: newNotification.userId,
          channel: newNotification.channel
        });
        return { ...newNotification, status: 'cancelled' };
      }

      // Store notification
      await this.db('notifications').insert(newNotification);

      // If scheduled for later, add to queue
      if (newNotification.scheduledAt && newNotification.scheduledAt > new Date()) {
        await this.scheduleNotification(newNotification);
        return newNotification;
      }

      // Send immediately
      await this.processNotification(newNotification);

      return newNotification;
    } catch (error) {
      logger.error('Failed to send notification', { error, notification });
      throw error;
    }
  }

  async sendBulkNotifications(notifications: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'retryCount'>[]): Promise<Notification[]> {
    const createdNotifications: Notification[] = [];

    for (const notification of notifications) {
      try {
        const created = await this.sendNotification(notification);
        createdNotifications.push(created);
      } catch (error) {
        logger.error('Failed to send bulk notification', { error, notification });
      }
    }

    return createdNotifications;
  }

  async sendEmailNotification(userId: string, templateId: string, data: Record<string, any>, options?: {
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    scheduledAt?: Date;
  }): Promise<Notification> {
    const template = await this.getTemplate(templateId);
    if (!template || template.type !== 'email') {
      throw new Error('Email template not found');
    }

    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { subject, content, htmlContent } = this.renderTemplate(template, data);

    return this.sendNotification({
      userId,
      type: 'email',
      channel: 'email',
      title: subject || 'Notification',
      content: htmlContent || content,
      template: templateId,
      data,
      priority: options?.priority || 'normal',
      status: 'pending',
      maxRetries: 3,
      scheduledAt: options?.scheduledAt
    });
  }

  async sendPushNotification(userId: string, title: string, body: string, data?: Record<string, any>, options?: {
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    scheduledAt?: Date;
    icon?: string;
    badge?: string;
    tag?: string;
  }): Promise<Notification> {
    return this.sendNotification({
      userId,
      type: 'push',
      channel: 'push',
      title,
      content: body,
      data: {
        ...data,
        icon: options?.icon,
        badge: options?.badge,
        tag: options?.tag
      },
      priority: options?.priority || 'normal',
      status: 'pending',
      maxRetries: 3,
      scheduledAt: options?.scheduledAt
    });
  }

  async sendWebhookNotification(webhookId: string, data: Record<string, any>): Promise<void> {
    const webhook = await this.getWebhook(webhookId);
    if (!webhook || !webhook.isActive) {
      throw new Error('Webhook not found or inactive');
    }

    try {
      const payload = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        data
      };

      const signature = webhook.secret ? this.generateSignature(payload, webhook.secret) : undefined;

      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers: {
          'Content-Type': 'application/json',
          ...webhook.headers,
          ...(signature && { 'X-Signature': signature })
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      logger.info(`Webhook sent successfully`, { webhookId: webhook.id, url: webhook.url });
    } catch (error) {
      logger.error('Failed to send webhook', { error, webhookId });
      
      // Add to retry queue
      await this.addToRetryQueue(webhookId, data, webhook.retryPolicy);
      throw error;
    }
  }

  async createTemplate(template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationTemplate> {
    const newTemplate: NotificationTemplate = {
      ...template,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.db('notification_templates').insert(newTemplate);
    logger.info(`Notification template created: ${newTemplate.name}`, { templateId: newTemplate.id });
    
    return newTemplate;
  }

  async updateTemplate(templateId: string, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    await this.db('notification_templates')
      .where('id', templateId)
      .update({
        ...updates,
        updatedAt: new Date()
      });

    const updated = await this.db('notification_templates').where('id', templateId).first();
    logger.info(`Notification template updated: ${updated.name}`, { templateId });
    
    return updated;
  }

  async setUserPreferences(userId: string, preferences: Omit<NotificationPreference, 'userId' | 'createdAt' | 'updatedAt'>): Promise<void> {
    await this.db('notification_preferences')
      .insert({
        userId,
        ...preferences,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .onConflict(['userId', 'channel'])
      .merge({
        ...preferences,
        updatedAt: new Date()
      });

    logger.info(`User notification preferences updated`, { userId, channel: preferences.channel });
  }

  async addPushSubscription(userId: string, subscription: Omit<PushSubscription, 'id' | 'userId' | 'isActive' | 'createdAt' | 'updatedAt'>): Promise<PushSubscription> {
    const newSubscription: PushSubscription = {
      ...subscription,
      userId,
      id: uuidv4(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.db('push_subscriptions').insert(newSubscription);
    logger.info(`Push subscription added`, { userId, subscriptionId: newSubscription.id });
    
    return newSubscription;
  }

  async removePushSubscription(subscriptionId: string): Promise<void> {
    await this.db('push_subscriptions')
      .where('id', subscriptionId)
      .update({ isActive: false, updatedAt: new Date() });

    logger.info(`Push subscription removed`, { subscriptionId });
  }

  async getNotificationHistory(userId: string, options?: {
    limit?: number;
    offset?: number;
    type?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Notification[]> {
    let query = this.db('notifications').where('userId', userId);

    if (options?.type) {
      query = query.where('type', options.type);
    }
    if (options?.status) {
      query = query.where('status', options.status);
    }
    if (options?.startDate) {
      query = query.where('createdAt', '>=', options.startDate);
    }
    if (options?.endDate) {
      query = query.where('createdAt', '<=', options.endDate);
    }

    return query
      .orderBy('createdAt', 'desc')
      .limit(options?.limit || 50)
      .offset(options?.offset || 0);
  }

  async getNotificationStats(timeRange: { start: Date; end: Date }): Promise<any> {
    const stats = await this.db('notifications')
      .where('createdAt', '>=', timeRange.start)
      .andWhere('createdAt', '<=', timeRange.end)
      .select(
        this.db.raw('COUNT(*) as total'),
        this.db.raw('SUM(CASE WHEN status = \'sent\' THEN 1 ELSE 0 END) as sent'),
        this.db.raw('SUM(CASE WHEN status = \'delivered\' THEN 1 ELSE 0 END) as delivered'),
        this.db.raw('SUM(CASE WHEN status = \'failed\' THEN 1 ELSE 0 END) as failed'),
        this.db.raw('AVG(EXTRACT(EPOCH FROM (delivered_at - created_at))) as avg_delivery_time')
      )
      .first();

    return {
      total: parseInt(stats.total),
      sent: parseInt(stats.sent),
      delivered: parseInt(stats.delivered),
      failed: parseInt(stats.failed),
      deliveryRate: stats.total > 0 ? (parseInt(stats.delivered) / parseInt(stats.total)) * 100 : 0,
      avgDeliveryTime: parseFloat(stats.avg_delivery_time) || 0
    };
  }

  private async processNotification(notification: Notification): Promise<void> {
    try {
      switch (notification.channel) {
        case 'email':
          await this.sendEmail(notification);
          break;
        case 'push':
          await this.sendPush(notification);
          break;
        case 'webhook':
          await this.sendWebhook(notification);
          break;
        default:
          throw new Error(`Unsupported notification channel: ${notification.channel}`);
      }

      // Update status
      await this.db('notifications')
        .where('id', notification.id)
        .update({
          status: 'sent',
          sentAt: new Date(),
          updatedAt: new Date()
        });

    } catch (error) {
      logger.error('Failed to process notification', { error, notificationId: notification.id });
      
      // Update status and increment retry count
      await this.db('notifications')
        .where('id', notification.id)
        .update({
          status: 'failed',
          retryCount: notification.retryCount + 1,
          updatedAt: new Date()
        });

      // Add to retry queue if max retries not reached
      if (notification.retryCount < notification.maxRetries) {
        await this.addToRetryQueue(notification.id, notification);
      }
    }
  }

  private async sendEmail(notification: Notification): Promise<void> {
    const mailOptions = {
      to: await this.getUserEmail(notification.userId),
      subject: notification.title,
      text: notification.content,
      html: notification.data?.htmlContent || notification.content
    };

    const result = await this.emailTransporter.sendMail(mailOptions);
    logger.info(`Email sent`, { messageId: result.messageId, notificationId: notification.id });
  }

  private async sendPush(notification: Notification): Promise<void> {
    const subscriptions = await this.db('push_subscriptions')
      .where('userId', notification.userId)
      .andWhere('isActive', true);

    for (const subscription of subscriptions) {
      try {
        // Use Web Push API to send notification
        const payload = JSON.stringify({
          title: notification.title,
          body: notification.content,
          data: notification.data,
          icon: notification.data?.icon,
          badge: notification.data?.badge,
          tag: notification.data?.tag
        });

        // This would integrate with a Web Push service
        logger.info(`Push notification sent`, { 
          subscriptionId: subscription.id, 
          notificationId: notification.id 
        });
      } catch (error) {
        logger.error('Failed to send push notification', { 
          error, 
          subscriptionId: subscription.id, 
          notificationId: notification.id 
        });
      }
    }
  }

  private async sendWebhook(notification: Notification): Promise<void> {
    const webhookId = notification.data?.webhookId;
    if (!webhookId) {
      throw new Error('Webhook ID not found in notification data');
    }

    await this.sendWebhookNotification(webhookId, {
      notificationId: notification.id,
      userId: notification.userId,
      title: notification.title,
      content: notification.content,
      data: notification.data
    });
  }

  private async processPendingNotifications(): Promise<void> {
    const pendingNotifications = await this.db('notifications')
      .where('status', 'pending')
      .andWhere(function() {
        this.where('scheduledAt', '<=', new Date())
          .orWhereNull('scheduledAt');
      })
      .limit(100);

    for (const notification of pendingNotifications) {
      await this.processNotification(notification);
    }
  }

  private async processRetryQueue(): Promise<void> {
    const retryKey = 'notification_retry_queue';
    const retryNotifications = await this.redis.zrange(retryKey, 0, -1, 'WITHSCORES');

    for (let i = 0; i < retryNotifications.length; i += 2) {
      const notificationId = retryNotifications[i];
      const retryTime = parseInt(retryNotifications[i + 1]);

      if (retryTime <= Date.now()) {
        const notification = await this.db('notifications').where('id', notificationId).first();
        if (notification && notification.retryCount < notification.maxRetries) {
          await this.processNotification(notification);
        }
        await this.redis.zrem(retryKey, notificationId);
      }
    }
  }

  private async cleanupOldNotifications(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    await this.db('notifications')
      .where('createdAt', '<', thirtyDaysAgo)
      .andWhere('status', 'in', ['delivered', 'failed', 'cancelled'])
      .del();

    logger.info('Cleaned up old notifications');
  }

  private async scheduleNotification(notification: Notification): Promise<void> {
    const scheduleKey = 'scheduled_notifications';
    await this.redis.zadd(
      scheduleKey,
      notification.scheduledAt!.getTime(),
      JSON.stringify(notification)
    );
  }

  private async addToRetryQueue(notificationId: string, notification: Notification): Promise<void> {
    const retryKey = 'notification_retry_queue';
    const retryDelay = Math.min(1000 * Math.pow(2, notification.retryCount), 300000); // Exponential backoff, max 5 minutes
    const retryTime = Date.now() + retryDelay;
    
    await this.redis.zadd(retryKey, retryTime, notificationId);
  }

  private async addToRetryQueue(webhookId: string, data: Record<string, any>, retryPolicy: any): Promise<void> {
    const retryKey = 'webhook_retry_queue';
    const retryTime = Date.now() + retryPolicy.backoffMs;
    
    await this.redis.zadd(
      retryKey,
      retryTime,
      JSON.stringify({ webhookId, data, retryCount: 0, maxRetries: retryPolicy.maxRetries })
    );
  }

  private async getUserPreferences(userId: string, channel: string): Promise<NotificationPreference | null> {
    return this.db('notification_preferences')
      .where('userId', userId)
      .andWhere('channel', channel)
      .first();
  }

  private shouldSendNotification(notification: Notification, preferences: NotificationPreference | null): boolean {
    if (!preferences) return true;
    if (!preferences.isEnabled) return false;
    
    // Check quiet hours
    if (preferences.rules.quietHours) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startHour, startMin] = preferences.rules.quietHours.start.split(':').map(Number);
      const [endHour, endMin] = preferences.rules.quietHours.end.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      
      if (currentTime >= startTime && currentTime <= endTime) {
        return false;
      }
    }
    
    return true;
  }

  private async getTemplate(templateId: string): Promise<NotificationTemplate | null> {
    return this.db('notification_templates').where('id', templateId).first();
  }

  private async getUser(userId: string): Promise<any> {
    // This would integrate with your user service
    return { id: userId, email: 'user@example.com' };
  }

  private async getUserEmail(userId: string): Promise<string> {
    const user = await this.getUser(userId);
    return user.email;
  }

  private async getWebhook(webhookId: string): Promise<WebhookConfig | null> {
    return this.db('webhook_configs').where('id', webhookId).first();
  }

  private renderTemplate(template: NotificationTemplate, data: Record<string, any>): {
    subject?: string;
    content: string;
    htmlContent?: string;
  } {
    // Simple template rendering - in production, use a proper template engine
    let content = template.content;
    let htmlContent = template.htmlContent;
    let subject = template.subject;

    for (const variable of template.variables) {
      const value = data[variable] || `{{${variable}}}`;
      content = content.replace(new RegExp(`{{${variable}}}`, 'g'), value);
      if (htmlContent) {
        htmlContent = htmlContent.replace(new RegExp(`{{${variable}}}`, 'g'), value);
      }
      if (subject) {
        subject = subject.replace(new RegExp(`{{${variable}}}`, 'g'), value);
      }
    }

    return { subject, content, htmlContent };
  }

  private generateSignature(payload: any, secret: string): string {
    // Generate HMAC signature for webhooks
    const crypto = require('crypto');
    return crypto.createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }
}
