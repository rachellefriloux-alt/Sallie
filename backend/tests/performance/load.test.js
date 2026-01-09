import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 300 }, // Ramp up to 300 users
    { duration: '5m', target: 300 }, // Stay at 300 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate should be below 10%
    errors: ['rate<0.1'],              // Custom error rate below 10%
  },
};

const BASE_URL = 'http://localhost:8742';

// Test data
const users = [
  { email: 'user1@example.com', password: 'password123' },
  { email: 'user2@example.com', password: 'password123' },
  { email: 'user3@example.com', password: 'password123' },
  { email: 'user4@example.com', password: 'password123' },
  { email: 'user5@example.com', password: 'password123' },
];

export function setup() {
  // Setup: Create test users and get tokens
  const tokens = [];
  
  for (const user of users) {
    const response = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.status === 200) {
      tokens.push(JSON.parse(response.body).tokens.access);
    }
  }
  
  return { tokens };
}

export default function(data) {
  const user = users[Math.floor(Math.random() * users.length)];
  const token = data.tokens[Math.floor(Math.random() * data.tokens.length)];
  
  // Test 1: Authentication endpoint
  let response = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const authSuccess = check(response, {
    'auth status is 200': (r) => r.status === 200,
    'auth response time < 500ms': (r) => r.timings.duration < 500,
    'auth has user data': (r) => JSON.parse(r.body).user !== undefined,
  });
  
  errorRate.add(!authSuccess);
  
  if (response.status === 200) {
    const tokens = JSON.parse(response.body).tokens;
    
    // Test 2: Get user profile
    response = http.get(`${BASE_URL}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${tokens.access}` },
    });
    
    const profileSuccess = check(response, {
      'profile status is 200': (r) => r.status === 200,
      'profile response time < 300ms': (r) => r.timings.duration < 300,
      'profile has user data': (r) => JSON.parse(r.body).user !== undefined,
    });
    
    errorRate.add(!profileSuccess);
    
    // Test 3: Get chat messages
    response = http.get(`${BASE_URL}/api/chat/messages`, {
      headers: { 'Authorization': `Bearer ${tokens.access}` },
    });
    
    const chatSuccess = check(response, {
      'chat status is 200': (r) => r.status === 200,
      'chat response time < 400ms': (r) => r.timings.duration < 400,
      'chat has messages array': (r) => Array.isArray(JSON.parse(r.body).messages),
    });
    
    errorRate.add(!chatSuccess);
    
    // Test 4: Send chat message
    const messageData = {
      content: `Load test message at ${Date.now()}`,
      type: 'text',
    };
    
    response = http.post(`${BASE_URL}/api/chat/messages`, JSON.stringify(messageData), {
      headers: {
        'Authorization': `Bearer ${tokens.access}`,
        'Content-Type': 'application/json',
      },
    });
    
    const sendMessageSuccess = check(response, {
      'send message status is 201': (r) => r.status === 201,
      'send message response time < 600ms': (r) => r.timings.duration < 600,
      'send message has message data': (r) => JSON.parse(r.body).message !== undefined,
    });
    
    errorRate.add(!sendMessageSuccess);
    
    // Test 5: Get analytics data
    response = http.get(`${BASE_URL}/api/analytics/dashboard`, {
      headers: { 'Authorization': `Bearer ${tokens.access}` },
    });
    
    const analyticsSuccess = check(response, {
      'analytics status is 200': (r) => r.status === 200,
      'analytics response time < 800ms': (r) => r.timings.duration < 800,
      'analytics has dashboard data': (r) => JSON.parse(r.body).dashboard !== undefined,
    });
    
    errorRate.add(!analyticsSuccess);
    
    // Test 6: Get notifications
    response = http.get(`${BASE_URL}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${tokens.access}` },
    });
    
    const notificationsSuccess = check(response, {
      'notifications status is 200': (r) => r.status === 200,
      'notifications response time < 300ms': (r) => r.timings.duration < 300,
      'notifications has array': (r) => Array.isArray(JSON.parse(r.body).notifications),
    });
    
    errorRate.add(!notificationsSuccess);
  }
  
  // Small delay between iterations
  sleep(1);
}

export function teardown(data) {
  // Cleanup: Logout test users
  for (const token of data.tokens) {
    http.post(`${BASE_URL}/api/auth/logout`, null, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
  }
}

// Additional load test scenarios

export function handleSummary(data) {
  console.log('Load Test Summary:');
  console.log(`Total requests: ${data.metrics.http_reqs.count}`);
  console.log(`Failed requests: ${data.metrics.http_req_failed.count}`);
  console.log(`Average response time: ${data.metrics.http_req_duration.avg}ms`);
  console.log(`95th percentile response time: ${data.metrics.http_req_duration['p(95)']}ms`);
  console.log(`Error rate: ${(data.metrics.errors.rate * 100).toFixed(2)}%`);
}

// Stress test
export function stressTest() {
  const options = {
    stages: [
      { duration: '1m', target: 500 },  // Ramp up to 500 users
      { duration: '5m', target: 500 },  // Stay at 500 users
      { duration: '1m', target: 1000 }, // Ramp up to 1000 users
      { duration: '5m', target: 1000 }, // Stay at 1000 users
      { duration: '1m', target: 0 },   // Ramp down to 0 users
    ],
    thresholds: {
      http_req_duration: ['p(95)<1000'], // More lenient for stress test
      http_req_failed: ['rate<0.2'],     // Allow higher error rate
    },
  };
  
  return options;
}

// Spike test
export function spikeTest() {
  const options = {
    stages: [
      { duration: '2m', target: 50 },   // Normal load
      { duration: '30s', target: 500 }, // Spike to 500 users
      { duration: '2m', target: 50 },   // Back to normal
    ],
    thresholds: {
      http_req_duration: ['p(95)<800'],  // Slightly more lenient
      http_req_failed: ['rate<0.15'],   // Allow higher error rate during spike
    },
  };
  
  return options;
}

// Soak test (endurance)
export function soakTest() {
  const options = {
    stages: [
      { duration: '5m', target: 100 },  // Ramp up
      { duration: '2h', target: 100 },  // Sustained load
      { duration: '5m', target: 0 },    // Ramp down
    ],
    thresholds: {
      http_req_duration: ['p(95)<600'],  // Consistent performance
      http_req_failed: ['rate<0.05'],    // Low error rate for extended test
    },
  };
  
  return options;
}
