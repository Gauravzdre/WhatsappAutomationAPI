interface AuditEvent {
  id: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  event: string;
  category: 'auth' | 'api' | 'security' | 'data' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  success: boolean;
  metadata?: Record<string, any>;
}

interface SecurityMetrics {
  totalEvents: number;
  authFailures: number;
  rateLimitHits: number;
  suspiciousActivities: number;
  lastUpdated: number;
}

export class SecurityAuditLogger {
  private events: AuditEvent[] = [];
  private maxEvents: number = 10000; // Keep last 10k events in memory
  private metrics: SecurityMetrics = {
    totalEvents: 0,
    authFailures: 0,
    rateLimitHits: 0,
    suspiciousActivities: 0,
    lastUpdated: Date.now()
  };

  /**
   * Log a security event
   * @param event - Security event to log
   */
  logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      ...event
    };

    // Add to events array
    this.events.push(auditEvent);

    // Maintain max events limit
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Update metrics
    this.updateMetrics(auditEvent);

    // Log to console for development/debugging
    this.logToConsole(auditEvent);

    // In production, you would also send to external logging service
    // this.sendToExternalLogger(auditEvent);
  }

  /**
   * Log authentication attempt
   */
  logAuthAttempt(userId: string | null, success: boolean, details: Record<string, any>, metadata?: Record<string, any>): void {
    this.logEvent({
      userId: userId || undefined,
      event: success ? 'auth_success' : 'auth_failure',
      category: 'auth',
      severity: success ? 'low' : 'medium',
      details: {
        ...details,
        authMethod: details.authMethod || 'unknown'
      },
      success,
      metadata
    });
  }

  /**
   * Log API access
   */
  logApiAccess(userId: string | undefined, endpoint: string, method: string, success: boolean, details: Record<string, any>): void {
    this.logEvent({
      userId,
      event: 'api_access',
      category: 'api',
      severity: 'low',
      details: {
        endpoint,
        method,
        ...details
      },
      success
    });
  }

  /**
   * Log rate limit hit
   */
  logRateLimitHit(identifier: string, endpoint: string, details: Record<string, any>): void {
    this.logEvent({
      userId: details.userId,
      event: 'rate_limit_exceeded',
      category: 'security',
      severity: 'medium',
      details: {
        identifier,
        endpoint,
        ...details
      },
      success: false
    });
  }

  /**
   * Log suspicious activity
   */
  logSuspiciousActivity(userId: string | undefined, activity: string, details: Record<string, any>): void {
    this.logEvent({
      userId,
      event: 'suspicious_activity',
      category: 'security',
      severity: 'high',
      details: {
        activity,
        ...details
      },
      success: false
    });
  }

  /**
   * Log data access
   */
  logDataAccess(userId: string, dataType: string, operation: string, success: boolean, details: Record<string, any>): void {
    this.logEvent({
      userId,
      event: 'data_access',
      category: 'data',
      severity: 'low',
      details: {
        dataType,
        operation,
        ...details
      },
      success
    });
  }

  /**
   * Log security configuration change
   */
  logSecurityConfigChange(userId: string, configType: string, details: Record<string, any>): void {
    this.logEvent({
      userId,
      event: 'security_config_change',
      category: 'security',
      severity: 'high',
      details: {
        configType,
        ...details
      },
      success: true
    });
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit: number = 100, category?: string, severity?: string): AuditEvent[] {
    let filteredEvents = this.events;

    if (category) {
      filteredEvents = filteredEvents.filter(event => event.category === category);
    }

    if (severity) {
      filteredEvents = filteredEvents.filter(event => event.severity === severity);
    }

    return filteredEvents
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  /**
   * Get events by user
   */
  getEventsByUser(userId: string, limit: number = 50): AuditEvent[] {
    return this.events
      .filter(event => event.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get failed authentication attempts
   */
  getFailedAuthAttempts(timeWindow: number = 3600000): AuditEvent[] {
    const cutoff = Date.now() - timeWindow;
    return this.events.filter(event => 
      event.event === 'auth_failure' && 
      event.timestamp > cutoff
    );
  }

  /**
   * Detect potential security threats
   */
  detectThreats(): Array<{ type: string; severity: string; description: string; count: number }> {
    const threats: Array<{ type: string; severity: string; description: string; count: number }> = [];
    const oneHourAgo = Date.now() - 3600000;
    const recentEvents = this.events.filter(event => event.timestamp > oneHourAgo);

    // Multiple failed auth attempts
    const failedAuths = recentEvents.filter(event => event.event === 'auth_failure');
    if (failedAuths.length > 10) {
      threats.push({
        type: 'brute_force',
        severity: 'high',
        description: `${failedAuths.length} failed authentication attempts in the last hour`,
        count: failedAuths.length
      });
    }

    // Excessive rate limiting
    const rateLimitHits = recentEvents.filter(event => event.event === 'rate_limit_exceeded');
    if (rateLimitHits.length > 20) {
      threats.push({
        type: 'rate_limit_abuse',
        severity: 'medium',
        description: `${rateLimitHits.length} rate limit violations in the last hour`,
        count: rateLimitHits.length
      });
    }

    // Suspicious activities
    const suspiciousEvents = recentEvents.filter(event => event.event === 'suspicious_activity');
    if (suspiciousEvents.length > 5) {
      threats.push({
        type: 'suspicious_behavior',
        severity: 'high',
        description: `${suspiciousEvents.length} suspicious activities detected in the last hour`,
        count: suspiciousEvents.length
      });
    }

    return threats;
  }

  /**
   * Export events for external analysis
   */
  exportEvents(startTime?: number, endTime?: number): AuditEvent[] {
    let events = this.events;

    if (startTime) {
      events = events.filter(event => event.timestamp >= startTime);
    }

    if (endTime) {
      events = events.filter(event => event.timestamp <= endTime);
    }

    return events.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Clear old events (for maintenance)
   */
  clearOldEvents(olderThan: number): number {
    const initialCount = this.events.length;
    this.events = this.events.filter(event => event.timestamp > olderThan);
    return initialCount - this.events.length;
  }

  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateMetrics(event: AuditEvent): void {
    this.metrics.totalEvents++;
    this.metrics.lastUpdated = Date.now();

    switch (event.event) {
      case 'auth_failure':
        this.metrics.authFailures++;
        break;
      case 'rate_limit_exceeded':
        this.metrics.rateLimitHits++;
        break;
      case 'suspicious_activity':
        this.metrics.suspiciousActivities++;
        break;
    }
  }

  private logToConsole(event: AuditEvent): void {
    const emoji = this.getEventEmoji(event);
    const timestamp = new Date(event.timestamp).toISOString();
    
    console.log(`${emoji} [AUDIT] ${timestamp} - ${event.event}`, {
      category: event.category,
      severity: event.severity,
      userId: event.userId,
      success: event.success,
      details: event.details
    });
  }

  private getEventEmoji(event: AuditEvent): string {
    if (event.severity === 'critical') return '🚨';
    if (event.severity === 'high') return '⚠️';
    if (event.severity === 'medium') return '🔶';
    if (!event.success) return '❌';
    return '✅';
  }
}

// Singleton instance
export const securityAuditLogger = new SecurityAuditLogger(); 