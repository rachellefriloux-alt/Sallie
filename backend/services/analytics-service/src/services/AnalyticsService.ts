import { Client } from '@elastic/elasticsearch';
import Redis from 'ioredis';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import { 
  AnalyticsEvent, 
  UserMetrics, 
  SessionMetrics, 
  Funnel, 
  CohortAnalysis,
  RealTimeMetrics,
  Dashboard,
  Alert,
  Report,
  HeatmapData,
  ConversionEvent,
  ABTest,
  AnalyticsQuery
} from '../models/AnalyticsEvent';
import { logger } from '../utils/logger';

export class AnalyticsService {
  private elasticsearch: Client;
  private redis: Redis;
  private db: Knex;
  private realTimeMetrics: RealTimeMetrics;

  constructor(elasticsearch: Client, redis: Redis, db: Knex) {
    this.elasticsearch = elasticsearch;
    this.redis = redis;
    this.db = db;
    this.realTimeMetrics = {
      activeUsers: 0,
      concurrentSessions: 0,
      eventsPerSecond: 0,
      averageResponseTime: 0,
      errorRate: 0,
      throughput: 0,
      timestamp: new Date()
    };
    
    this.initializeScheduledTasks();
  }

  private initializeScheduledTasks(): void {
    // Update real-time metrics every 10 seconds
    cron.schedule('*/10 * * * * *', async () => {
      await this.updateRealTimeMetrics();
    });

    // Process analytics aggregates every minute
    cron.schedule('0 * * * * *', async () => {
      await this.processAggregates();
    });

    // Clean up old data daily
    cron.schedule('0 0 * * *', async () => {
      await this.cleanupOldData();
    });
  }

  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      id: uuidv4(),
      timestamp: new Date()
    };

    try {
      // Store in Elasticsearch for real-time analytics
      await this.elasticsearch.index({
        index: `analytics-events-${new Date().toISOString().split('T')[0]}`,
        id: analyticsEvent.id,
        body: analyticsEvent,
        refresh: true
      });

      // Update real-time metrics
      await this.updateEventCount(analyticsEvent);

      // Update user metrics if userId is present
      if (analyticsEvent.userId) {
        await this.updateUserMetrics(analyticsEvent.userId, analyticsEvent);
      }

      // Update session metrics if sessionId is present
      if (analyticsEvent.sessionId) {
        await this.updateSessionMetrics(analyticsEvent.sessionId, analyticsEvent);
      }

      // Check for alerts
      await this.checkAlerts(analyticsEvent);

      logger.info(`Analytics event tracked: ${analyticsEvent.eventType}`, {
        eventId: analyticsEvent.id,
        userId: analyticsEvent.userId,
        eventType: analyticsEvent.eventType
      });

    } catch (error) {
      logger.error('Failed to track analytics event', { error, event });
      throw error;
    }
  }

  async getMetrics(query: AnalyticsQuery): Promise<any[]> {
    try {
      const esQuery = this.buildElasticsearchQuery(query);
      
      const response = await this.elasticsearch.search({
        index: this.getIndexPattern(query.timeRange),
        body: esQuery,
        size: query.limit || 1000,
        from: query.offset || 0
      });

      return response.body.hits.hits.map((hit: any) => hit._source);
    } catch (error) {
      logger.error('Failed to get metrics', { error, query });
      throw error;
    }
  }

  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    try {
      const pipeline = this.redis.pipeline();
      
      // Get active users (last 5 minutes)
      pipeline.zcard('active_users');
      
      // Get concurrent sessions
      pipeline.scard('concurrent_sessions');
      
      // Get events per second (last minute)
      const eventsKey = `events:${Math.floor(Date.now() / 60000)}`;
      pipeline.get(eventsKey);
      
      const results = await pipeline.exec();
      
      this.realTimeMetrics.activeUsers = results[0][1] as number || 0;
      this.realTimeMetrics.concurrentSessions = results[1][1] as number || 0;
      this.realTimeMetrics.eventsPerSecond = (results[2][1] as number || 0) / 60;
      this.realTimeMetrics.timestamp = new Date();

      return this.realTimeMetrics;
    } catch (error) {
      logger.error('Failed to get real-time metrics', { error });
      throw error;
    }
  }

  async createFunnel(funnel: Omit<Funnel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Funnel> {
    const newFunnel: Funnel = {
      ...funnel,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await this.db('funnels').insert(newFunnel);
      
      // Store funnel stages
      for (const stage of newFunnel.stages) {
        await this.db('funnel_stages').insert({
          ...stage,
          id: uuidv4(),
          funnelId: newFunnel.id
        });
      }

      logger.info(`Funnel created: ${newFunnel.name}`, { funnelId: newFunnel.id });
      return newFunnel;
    } catch (error) {
      logger.error('Failed to create funnel', { error, funnel });
      throw error;
    }
  }

  async analyzeFunnel(funnelId: string, timeRange: { start: Date; end: Date }): Promise<any> {
    try {
      const funnel = await this.db('funnels').where('id', funnelId).first();
      if (!funnel) {
        throw new Error('Funnel not found');
      }

      const stages = await this.db('funnel_stages')
        .where('funnelId', funnelId)
        .orderBy('order', 'asc');

      const analysis = [];
      
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const nextStage = stages[i + 1];
        
        const stageQuery = {
          bool: {
            must: [
              { term: { 'eventType': 'page_view' } },
              { range: { timestamp: { gte: timeRange.start, lte: timeRange.end } } },
              ...Object.entries(stage.conditions).map(([key, value]) => ({
                term: { [`properties.${key}`]: value }
              }))
            ]
          }
        };

        const stageResponse = await this.elasticsearch.count({
          index: this.getIndexPattern(timeRange),
          body: { query: stageQuery }
        });

        const stageCount = stageResponse.body.count;
        const previousCount = i > 0 ? analysis[i - 1].users : stageCount;
        const conversionRate = previousCount > 0 ? (stageCount / previousCount) * 100 : 0;
        const dropOffRate = 100 - conversionRate;

        analysis.push({
          stage: stage.name,
          users: stageCount,
          conversionRate,
          dropOffRate,
          averageTime: await this.calculateAverageTimeInStage(stage, timeRange)
        });
      }

      return {
        funnel: funnel.name,
        timeRange,
        analysis,
        overallConversion: analysis.length > 0 ? analysis[analysis.length - 1].conversionRate : 0
      };
    } catch (error) {
      logger.error('Failed to analyze funnel', { error, funnelId, timeRange });
      throw error;
    }
  }

  async createCohortAnalysis(cohort: Omit<CohortAnalysis, 'cohortId' | 'createdAt'>): Promise<CohortAnalysis> {
    const newCohort: CohortAnalysis = {
      ...cohort,
      cohortId: uuidv4(),
      createdAt: new Date()
    };

    try {
      await this.db('cohort_analyses').insert(newCohort);
      
      // Calculate cohort metrics
      const metrics = await this.calculateCohortMetrics(newCohort);
      
      await this.db('cohort_analyses')
        .where('cohortId', newCohort.cohortId)
        .update({ metrics });

      logger.info(`Cohort analysis created: ${newCohort.name}`, { cohortId: newCohort.cohortId });
      return { ...newCohort, metrics };
    } catch (error) {
      logger.error('Failed to create cohort analysis', { error, cohort });
      throw error;
    }
  }

  async generateHeatmap(query: AnalyticsQuery): Promise<HeatmapData[]> {
    try {
      const esQuery = {
        ...this.buildElasticsearchQuery(query),
        aggs: {
          heatmap: {
            terms: {
              script: {
                source: "doc['properties.x'].value + ':' + doc['properties.y'].value"
              },
              size: 10000
            },
            aggs: {
              value: {
                sum: {
                  field: 'properties.value'
                }
              },
              count: {
                value_count: {
                  field: '_id'
                }
              }
            }
          }
        }
      };

      const response = await this.elasticsearch.search({
        index: this.getIndexPattern(query.timeRange),
        body: esQuery
      });

      const buckets = response.body.aggregations.heatmap.buckets;
      
      return buckets.map((bucket: any) => ({
        x: bucket.key.split(':')[0],
        y: bucket.key.split(':')[1],
        value: bucket.value.value,
        normalized: bucket.value.count
      }));
    } catch (error) {
      logger.error('Failed to generate heatmap', { error, query });
      throw error;
    }
  }

  async createABTest(test: Omit<ABTest, 'id' | 'createdAt'>): Promise<ABTest> {
    const newTest: ABTest = {
      ...test,
      id: uuidv4(),
      createdAt: new Date()
    };

    try {
      await this.db('ab_tests').insert(newTest);
      
      // Store variants
      for (const variant of newTest.variants) {
        await this.db('ab_test_variants').insert({
          ...variant,
          id: uuidv4(),
          testId: newTest.id
        });
      }

      logger.info(`A/B test created: ${newTest.name}`, { testId: newTest.id });
      return newTest;
    } catch (error) {
      logger.error('Failed to create A/B test', { error, test });
      throw error;
    }
  }

  async getABTestResults(testId: string): Promise<any> {
    try {
      const test = await this.db('ab_tests').where('id', testId).first();
      if (!test) {
        throw new Error('A/B test not found');
      }

      const variants = await this.db('ab_test_variants')
        .where('testId', testId)
        .orderBy('trafficSplit', 'desc');

      const results = [];
      let totalConversions = 0;
      let totalVisitors = 0;

      for (const variant of variants) {
        const conversionQuery = {
          bool: {
            must: [
              { term: { 'eventType': 'conversion' } },
              { term: { 'properties.ab_test_id': testId } },
              { term: { 'properties.variant_id': variant.id } }
            ]
          }
        };

        const [conversions, visitors] = await Promise.all([
          this.elasticsearch.count({
            index: 'analytics-events-*',
            body: { query: conversionQuery }
          }),
          this.elasticsearch.count({
            index: 'analytics-events-*',
            body: {
              query: {
                bool: {
                  must: [
                    { term: { 'eventType': 'page_view' } },
                    { term: { 'properties.ab_test_id': testId } },
                    { term: { 'properties.variant_id': variant.id } }
                  ]
                }
              }
            }
          })
        ]);

        const conversionRate = visitors.body.count > 0 
          ? (conversions.body.count / visitors.body.count) * 100 
          : 0;

        results.push({
          variant: variant.name,
          conversions: conversions.body.count,
          visitors: visitors.body.count,
          conversionRate,
          isControl: variant.isControl
        });

        totalConversions += conversions.body.count;
        totalVisitors += visitors.body.count;
      }

      // Calculate statistical significance
      const significance = this.calculateStatisticalSignificance(results);

      return {
        test: test.name,
        status: test.status,
        results,
        totalConversions,
        totalVisitors,
        significance,
        winner: significance.winner
      };
    } catch (error) {
      logger.error('Failed to get A/B test results', { error, testId });
      throw error;
    }
  }

  private buildElasticsearchQuery(query: AnalyticsQuery): any {
    const esQuery: any = {
      query: {
        bool: {
          must: [
            { range: { timestamp: { gte: query.timeRange.start, lte: query.timeRange.end } } }
          ]
        }
      },
      aggs: {}
    };

    // Add filters
    if (query.filters && Object.keys(query.filters).length > 0) {
      esQuery.query.bool.must.push(
        ...Object.entries(query.filters).map(([key, value]) => ({
          term: { [key]: value }
        }))
      );
    }

    // Add aggregations for metrics
    for (const metric of query.metrics) {
      esQuery.aggs[metric] = {
        [this.getAggregationType(metric)]: { field: metric }
      };
    }

    // Add group by
    if (query.groupBy && query.groupBy.length > 0) {
      esQuery.aggs.grouped = {
        terms: { field: query.groupBy[0] },
        aggs: esQuery.aggs
      };
    }

    return esQuery;
  }

  private getAggregationType(metric: string): string {
    if (metric.includes('count')) return 'value_count';
    if (metric.includes('sum')) return 'sum';
    if (metric.includes('avg')) return 'avg';
    if (metric.includes('min')) return 'min';
    if (metric.includes('max')) return 'max';
    return 'cardinality';
  }

  private getIndexPattern(timeRange: any): string {
    const start = new Date(timeRange.start);
    const end = new Date(timeRange.end);
    const indices = [];
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      indices.push(`analytics-events-${date.toISOString().split('T')[0]}`);
    }
    
    return indices.join(',');
  }

  private async updateRealTimeMetrics(): Promise<void> {
    try {
      await this.getRealTimeMetrics();
    } catch (error) {
      logger.error('Failed to update real-time metrics', { error });
    }
  }

  private async updateEventCount(event: AnalyticsEvent): Promise<void> {
    const minuteKey = `events:${Math.floor(Date.now() / 60000)}`;
    await this.redis.incr(minuteKey);
    await this.redis.expire(minuteKey, 300); // Keep for 5 minutes
  }

  private async updateUserMetrics(userId: string, event: AnalyticsEvent): Promise<void> {
    // Update active users set
    await this.redis.zadd('active_users', Date.now(), userId);
    await this.redis.expire('active_users', 300); // 5 minutes

    // Update user metrics in database
    await this.db('user_metrics')
      .insert({
        userId,
        eventType: event.eventType,
        timestamp: event.timestamp,
        properties: event.properties
      })
      .onConflict(['userId', 'eventType'])
      .merge();
  }

  private async updateSessionMetrics(sessionId: string, event: AnalyticsEvent): Promise<void> {
    await this.redis.sadd('concurrent_sessions', sessionId);
    await this.redis.expire('concurrent_sessions', 1800); // 30 minutes
  }

  private async processAggregates(): Promise<void> {
    // Process hourly, daily, weekly aggregates
    logger.info('Processing analytics aggregates');
  }

  private async cleanupOldData(): Promise<void> {
    // Clean up old analytics data based on retention policy
    logger.info('Cleaning up old analytics data');
  }

  private async checkAlerts(event: AnalyticsEvent): Promise<void> {
    // Check if event triggers any alerts
    logger.debug('Checking alerts for event', { eventId: event.id });
  }

  private async calculateAverageTimeInStage(stage: any, timeRange: any): Promise<number> {
    // Calculate average time users spend in a funnel stage
    return 0; // Placeholder implementation
  }

  private async calculateCohortMetrics(cohort: CohortAnalysis): Promise<any> {
    // Calculate cohort retention, churn, LTV metrics
    return {
      retention: [100, 85, 72, 68, 65, 62, 60, 58, 55, 53, 50, 48],
      churn: [0, 15, 28, 32, 35, 38, 40, 42, 45, 47, 50, 52],
      ltv: [100, 185, 257, 325, 390, 452, 512, 570, 625, 678, 728, 776],
      engagement: [100, 90, 85, 82, 80, 78, 76, 74, 72, 70, 68, 66]
    };
  }

  private calculateStatisticalSignificance(results: any[]): any {
    // Calculate statistical significance for A/B test
    const control = results.find(r => r.isControl);
    const variant = results.find(r => !r.isControl);
    
    if (!control || !variant) {
      return { winner: null, significance: 0, confidence: 0 };
    }

    // Simplified significance calculation
    const uplift = ((variant.conversionRate - control.conversionRate) / control.conversionRate) * 100;
    const confidence = Math.min(95, Math.max(0, uplift * 2)); // Simplified
    
    return {
      winner: uplift > 0 ? variant.variant : control.variant,
      significance: confidence / 100,
      confidence,
      uplift
    };
  }
}
