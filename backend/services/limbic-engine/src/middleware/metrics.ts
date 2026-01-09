import { Request, Response, NextFunction } from 'express';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

// Register default metrics
collectDefaultMetrics();

// Custom metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const limbicStateGauge = new Gauge({
  name: 'limbic_state',
  help: 'Current limbic state values',
  labelNames: ['metric']
});

const perceptionProcessingTime = new Histogram({
  name: 'perception_processing_time_seconds',
  help: 'Time taken to process perception input',
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2]
});

const trustTierGauge = new Gauge({
  name: 'trust_tier',
  help: 'Current trust tier level'
});

const emotionalDeltaCounter = new Counter({
  name: 'emotional_delta_total',
  help: 'Count of emotional delta changes',
  labelNames: ['emotion', 'direction']
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
  });

  next();
};

export const updateLimbicMetrics = (state: any): void => {
  limbicStateGauge.labels('trust').set(state.trust);
  limbicStateGauge.labels('warmth').set(state.warmth);
  limbicStateGauge.labels('arousal').set(state.arousal);
  limbicStateGauge.labels('valence').set(state.valence);
  limbicStateGauge.labels('empathy').set(state.empathy);
  limbicStateGauge.labels('intuition').set(state.intuition);
  limbicStateGauge.labels('creativity').set(state.creativity);
  limbicStateGauge.labels('wisdom').set(state.wisdom);
  limbicStateGauge.labels('humor').set(state.humor);
  limbicStateGauge.labels('interaction_count').set(state.interaction_count);
  
  trustTierGauge.set(state.trust * 4); // 0-1 scale to 0-4 tier scale
};

export const recordPerceptionProcessingTime = (duration: number): void => {
  perceptionProcessingTime.observe(duration);
};

export const recordEmotionalDelta = (emotion: string, delta: number): void => {
  const direction = delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral';
  emotionalDeltaCounter.labels(emotion, direction).inc();
};

export const getMetrics = (): string => {
  return register.metrics();
};
