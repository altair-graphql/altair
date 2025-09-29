---
parent: Features
---

# Response Stats

Altair provides detailed statistics about your GraphQL query responses to help you monitor performance and understand API behavior.

## Available Statistics

### Response Time
- **Total Response Time**: Complete request-response time including network latency
- **Server Processing Time**: Time spent processing on the server (if provided by server)
- **Network Time**: Time spent in network transmission

### Response Size
- **Content Length**: Size of the response payload in bytes
- **Compressed Size**: Size after compression (if applicable)
- **Headers Size**: Size of response headers

### HTTP Status Information
- **Status Code**: HTTP response status (200, 400, 500, etc.)
- **Status Text**: Human-readable status description
- **HTTP Version**: Protocol version used

## Viewing Response Stats

Response statistics are displayed in the **Result pane** after sending a query:

1. Send a GraphQL query
2. Look at the bottom of the result pane
3. Stats appear below the response data

### Stats Display Format

```
Status: 200 OK | Time: 245ms | Size: 1.2KB
```

## Performance Monitoring

### Setting Performance Benchmarks

Use response stats to establish performance baselines:

```javascript
// Post-request script for performance monitoring
const responseTime = altair.data.response.responseTime;
const queryName = altair.data.query.operationName || 'Anonymous Query';

// Define performance thresholds
const FAST_THRESHOLD = 200; // ms
const SLOW_THRESHOLD = 1000; // ms

if (responseTime < FAST_THRESHOLD) {
  console.log(`✅ ${queryName}: Fast response (${responseTime}ms)`);
} else if (responseTime > SLOW_THRESHOLD) {
  console.warn(`🐌 ${queryName}: Slow response (${responseTime}ms)`);
} else {
  console.log(`⚠️ ${queryName}: Moderate response (${responseTime}ms)`);
}
```

### Tracking Performance Over Time

```javascript
// Post-request script for performance tracking
const stats = {
  queryName: altair.data.query.operationName,
  responseTime: altair.data.response.responseTime,
  responseSize: altair.data.response.headers['content-length'],
  timestamp: new Date().toISOString(),
  status: altair.data.response.status
};

// Store performance data
const performanceLog = JSON.parse(
  altair.helpers.getEnvironment('PERFORMANCE_LOG') || '[]'
);

performanceLog.push(stats);

// Keep only last 50 entries
if (performanceLog.length > 50) {
  performanceLog.shift();
}

altair.helpers.setEnvironment('PERFORMANCE_LOG', JSON.stringify(performanceLog));

// Calculate average response time
const avgResponseTime = performanceLog.reduce((sum, entry) => 
  sum + entry.responseTime, 0) / performanceLog.length;

console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
```

## Error Statistics

### HTTP Error Monitoring

Monitor error rates and types:

```javascript
// Post-request script for error tracking
const status = altair.data.response.status;
const hasGraphQLErrors = altair.data.response.body.errors && 
                         altair.data.response.body.errors.length > 0;

// Track error statistics
let errorCount = parseInt(altair.helpers.getEnvironment('ERROR_COUNT') || '0');
let totalCount = parseInt(altair.helpers.getEnvironment('TOTAL_COUNT') || '0');

if (status >= 400 || hasGraphQLErrors) {
  errorCount++;
  console.error(`Error detected - Status: ${status}, GraphQL Errors: ${hasGraphQLErrors}`);
}

totalCount++;

const errorRate = (errorCount / totalCount) * 100;

altair.helpers.setEnvironment('ERROR_COUNT', errorCount.toString());
altair.helpers.setEnvironment('TOTAL_COUNT', totalCount.toString());

console.log(`Error rate: ${errorRate.toFixed(2)}% (${errorCount}/${totalCount})`);
```

### GraphQL Error Analysis

```javascript
// Post-request script for GraphQL error analysis
const response = altair.data.response.body;

if (response.errors) {
  console.group('GraphQL Errors:');
  
  response.errors.forEach((error, index) => {
    console.log(`Error ${index + 1}:`);
    console.log(`  Message: ${error.message}`);
    console.log(`  Path: ${error.path ? error.path.join(' → ') : 'N/A'}`);
    
    if (error.extensions) {
      console.log(`  Code: ${error.extensions.code || 'N/A'}`);
      console.log(`  Classification: ${error.extensions.classification || 'N/A'}`);
    }
  });
  
  console.groupEnd();
}
```

## Advanced Statistics

### Custom Metrics Collection

```javascript
// Pre-request script - start timing
altair.helpers.setEnvironment('REQUEST_START_TIME', performance.now());

// Post-request script - collect custom metrics
const startTime = parseFloat(altair.helpers.getEnvironment('REQUEST_START_TIME'));
const endTime = performance.now();
const clientSideTime = endTime - startTime;
const serverResponseTime = altair.data.response.responseTime;

const metrics = {
  clientSideTime: clientSideTime,
  serverResponseTime: serverResponseTime,
  overhead: clientSideTime - serverResponseTime,
  responseSize: altair.data.response.headers['content-length'] || 0,
  compressionRatio: calculateCompressionRatio(),
  timestamp: Date.now()
};

console.log('Detailed Metrics:', metrics);

function calculateCompressionRatio() {
  const contentLength = parseInt(altair.data.response.headers['content-length'] || '0');
  const rawSize = JSON.stringify(altair.data.response.body).length;
  return rawSize > 0 ? (contentLength / rawSize) * 100 : 100;
}
```

### Performance Alerts

```javascript
// Post-request script for performance alerts
const responseTime = altair.data.response.responseTime;
const queryComplexity = estimateQueryComplexity(altair.helpers.getCurrentQuery());

// Define alert thresholds
const ALERT_THRESHOLDS = {
  responseTime: 2000, // 2 seconds
  complexity: 50,
  errorRate: 10 // 10%
};

// Response time alert
if (responseTime > ALERT_THRESHOLDS.responseTime) {
  console.warn(`🚨 SLOW QUERY ALERT: ${responseTime}ms (threshold: ${ALERT_THRESHOLDS.responseTime}ms)`);
}

// Complexity alert
if (queryComplexity > ALERT_THRESHOLDS.complexity) {
  console.warn(`🚨 COMPLEX QUERY ALERT: Complexity ${queryComplexity} (threshold: ${ALERT_THRESHOLDS.complexity})`);
}

function estimateQueryComplexity(query) {
  // Simple complexity estimation
  const fieldCount = (query.match(/\w+\s*(?:\([^)]*\))?\s*{/g) || []).length;
  const depthCount = (query.match(/{/g) || []).length;
  return fieldCount * Math.log2(depthCount + 1);
}
```

## Exporting Statistics

### CSV Export

```javascript
// Export performance data to CSV format
const performanceData = JSON.parse(
  altair.helpers.getEnvironment('PERFORMANCE_LOG') || '[]'
);

const csvHeader = 'Timestamp,Query Name,Response Time (ms),Status,Size (bytes)\n';
const csvRows = performanceData.map(entry => 
  `${entry.timestamp},${entry.queryName || 'Anonymous'},${entry.responseTime},${entry.status},${entry.responseSize || 0}`
).join('\n');

const csvContent = csvHeader + csvRows;
console.log('Performance Data CSV:');
console.log(csvContent);

// Copy to clipboard (desktop app)
if (typeof navigator !== 'undefined' && navigator.clipboard) {
  navigator.clipboard.writeText(csvContent);
  console.log('CSV data copied to clipboard');
}
```

## Integration with Monitoring Tools

### Sending Metrics to External Services

```javascript
// Post-request script to send metrics to monitoring service
const metrics = {
  query_name: altair.data.query.operationName,
  response_time: altair.data.response.responseTime,
  status_code: altair.data.response.status,
  timestamp: Date.now(),
  environment: altair.helpers.getEnvironment('ENVIRONMENT_NAME') || 'development'
};

// Example: Send to custom monitoring endpoint
try {
  const monitoringEndpoint = altair.helpers.getEnvironment('MONITORING_ENDPOINT');
  
  if (monitoringEndpoint) {
    await altair.helpers.request({
      url: monitoringEndpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${altair.helpers.getEnvironment('MONITORING_TOKEN')}`
      },
      body: JSON.stringify(metrics)
    });
    
    console.log('Metrics sent to monitoring service');
  }
} catch (error) {
  console.error('Failed to send metrics:', error.message);
}
```

## Best Practices

### Performance Monitoring
- Set realistic performance thresholds based on your API and network conditions
- Monitor trends over time rather than individual request statistics
- Consider both client-side and server-side timing
- Track error rates alongside response times

### Statistics Collection
- Don't collect too much data - it can slow down Altair
- Focus on actionable metrics that help optimize queries
- Regular cleanup of historical data
- Use environment variables to enable/disable detailed logging

### Team Sharing
- Share performance benchmarks with your team
- Document expected response times for different query types
- Use consistent measurement approaches across team members
- Include performance criteria in code review processes

Response statistics in Altair help you build faster, more reliable GraphQL applications by providing insights into query performance and API behavior.