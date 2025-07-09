import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';
import log from './logger';

interface PerformanceMetrics {
  timestamp: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  activeConnections: number;
  requestCount: number;
  averageResponseTime: number;
  socketConnections: number;
  socketEventsPerSecond: number;
}

class PerformanceMonitor extends EventEmitter {
  private metrics: PerformanceMetrics[] = [];
  private startTime: number;
  private requestCount: number = 0;
  private totalResponseTime: number = 0;
  private socketConnections: number = 0;
  private socketEvents: number = 0;
  private lastSocketEventCount: number = 0;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.startTime = performance.now();
  }

  startMonitoring(intervalMs: number = 5000) {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);

    log.info('Performance monitoring started');
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      log.info('Performance monitoring stopped');
    }
  }

  recordRequest(responseTime: number) {
    this.requestCount++;
    this.totalResponseTime += responseTime;
  }

  recordSocketConnection() {
    this.socketConnections++;
  }

  recordSocketDisconnection() {
    this.socketConnections = Math.max(0, this.socketConnections - 1);
  }

  recordSocketEvent() {
    this.socketEvents++;
  }

  private collectMetrics() {
    const now = performance.now();
    const uptime = now - this.startTime;
    
    const averageResponseTime = this.requestCount > 0 
      ? this.totalResponseTime / this.requestCount 
      : 0;

    const socketEventsPerSecond = this.socketEvents - this.lastSocketEventCount;
    this.lastSocketEventCount = this.socketEvents;

    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      activeConnections: this.socketConnections,
      requestCount: this.requestCount,
      averageResponseTime,
      socketConnections: this.socketConnections,
      socketEventsPerSecond
    };

    this.metrics.push(metrics);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    this.emit('metrics', metrics);
    this.logMetrics(metrics);
  }

  private logMetrics(metrics: PerformanceMetrics) {
    const memoryMB = Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024);
    const requestsPerMinute = (metrics.requestCount / (performance.now() - this.startTime)) * 60000;
    
    log.info('Performance Metrics', {
      memory: `${memoryMB}MB`,
      requestsPerMinute: Math.round(requestsPerMinute),
      avgResponseTime: `${Math.round(metrics.averageResponseTime)}ms`,
      socketConnections: metrics.socketConnections,
      socketEventsPerSecond: metrics.socketEventsPerSecond
    });

    // Check thresholds
    this.checkThresholds(metrics, requestsPerMinute);
  }

  private checkThresholds(metrics: PerformanceMetrics, requestsPerMinute: number) {
    const warnings = [];

    // Memory threshold (500MB)
    if (metrics.memoryUsage.heapUsed > 500 * 1024 * 1024) {
      warnings.push('High memory usage detected');
    }

    // Response time threshold (1000ms)
    if (metrics.averageResponseTime > 1000) {
      warnings.push('High response time detected');
    }

    // Socket connections threshold (1000)
    if (metrics.socketConnections > 1000) {
      warnings.push('High number of socket connections');
    }

    if (warnings.length > 0) {
      log.warn('Performance warnings:', warnings);
    }
  }

  getMetrics() {
    return this.metrics;
  }

  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  getAverageMetrics(durationMinutes: number = 5): Partial<PerformanceMetrics> {
    const cutoff = Date.now() - (durationMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff);
    
    if (recentMetrics.length === 0) return {};

    const avgMemory = recentMetrics.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / recentMetrics.length;
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / recentMetrics.length;
    const avgSocketConnections = recentMetrics.reduce((sum, m) => sum + m.socketConnections, 0) / recentMetrics.length;

    return {
      memoryUsage: { heapUsed: avgMemory } as NodeJS.MemoryUsage,
      averageResponseTime: avgResponseTime,
      socketConnections: avgSocketConnections
    };
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// Middleware for Express
export const performanceMiddleware = (req: any, res: any, next: any) => {
  const start = performance.now();
  
  res.on('finish', () => {
    const duration = performance.now() - start;
    performanceMonitor.recordRequest(duration);
  });
  
  next();
};

// Socket.IO middleware
export const socketPerformanceMiddleware = (socket: any, next: any) => {
  performanceMonitor.recordSocketConnection();
  
  socket.on('disconnect', () => {
    performanceMonitor.recordSocketDisconnection();
  });
  
  socket.onAny((eventName: string) => {
    performanceMonitor.recordSocketEvent();
  });
  
  next();
};

export default PerformanceMonitor; 