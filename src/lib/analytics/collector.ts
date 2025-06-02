export interface MessageEvent {
  id: string;
  type: 'message_received' | 'message_sent' | 'automation_triggered' | 'ai_response_generated' | 'user_joined' | 'user_active';
  timestamp: Date;
  chatId: string;
  userId: string;
  platform: string;
  metadata: {
    messageId?: string;
    messageText?: string;
    responseTime?: number; // in milliseconds
    automationFlowId?: string;
    aiModel?: string;
    aiConfidence?: number;
    userSegment?: string;
    tags?: string[];
    errorCode?: string;
    errorMessage?: string;
  };
}

export interface AnalyticsMetrics {
  // Message metrics
  totalMessages: number;
  messagesReceived: number;
  messagesSent: number;
  averageResponseTime: number;
  
  // User metrics
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userRetention: number;
  
  // Automation metrics
  automationTriggers: number;
  automationSuccess: number;
  automationFailures: number;
  topFlows: Array<{ flowId: string; name: string; triggers: number }>;
  
  // AI metrics
  aiResponses: number;
  aiSuccessRate: number;
  averageAiConfidence: number;
  aiErrors: number;
  
  // Platform metrics
  platformBreakdown: Array<{ platform: string; messages: number; users: number }>;
  
  // Time-based metrics
  hourlyActivity: Array<{ hour: number; messages: number; users: number }>;
  dailyActivity: Array<{ date: string; messages: number; users: number; newUsers: number }>;
}

export interface AnalyticsFilter {
  startDate?: Date;
  endDate?: Date;
  platform?: string;
  userSegment?: string;
  automationFlow?: string;
  timeRange?: '1h' | '24h' | '7d' | '30d' | '90d';
}

export class AnalyticsCollector {
  private events: MessageEvent[] = [];
  private maxEvents = 10000; // Keep last 10k events in memory

  constructor() {
    // Initialize with current timestamp
    console.log('📊 Analytics Collector initialized');
  }

  // Event collection methods
  trackMessageReceived(chatId: string, userId: string, platform: string, messageText: string): void {
    this.addEvent({
      type: 'message_received',
      chatId,
      userId,
      platform,
      metadata: {
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        messageText: messageText.substring(0, 100) // Truncate for privacy
      }
    });
  }

  trackMessageSent(chatId: string, userId: string, platform: string, responseTime: number): void {
    this.addEvent({
      type: 'message_sent',
      chatId,
      userId,
      platform,
      metadata: {
        responseTime,
        messageId: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  }

  trackAutomationTriggered(chatId: string, userId: string, platform: string, flowId: string, success: boolean): void {
    this.addEvent({
      type: 'automation_triggered',
      chatId,
      userId,
      platform,
      metadata: {
        automationFlowId: flowId,
        errorCode: success ? undefined : 'AUTOMATION_FAILED'
      }
    });
  }

  trackAiResponse(chatId: string, userId: string, platform: string, model: string, confidence: number, responseTime: number, success: boolean): void {
    this.addEvent({
      type: 'ai_response_generated',
      chatId,
      userId,
      platform,
      metadata: {
        aiModel: model,
        aiConfidence: confidence,
        responseTime,
        errorCode: success ? undefined : 'AI_GENERATION_FAILED'
      }
    });
  }

  trackUserJoined(chatId: string, userId: string, platform: string, segment: string): void {
    this.addEvent({
      type: 'user_joined',
      chatId,
      userId,
      platform,
      metadata: {
        userSegment: segment
      }
    });
  }

  trackUserActivity(chatId: string, userId: string, platform: string, segment: string, tags: string[]): void {
    this.addEvent({
      type: 'user_active',
      chatId,
      userId,
      platform,
      metadata: {
        userSegment: segment,
        tags
      }
    });
  }

  private addEvent(eventData: Omit<MessageEvent, 'id' | 'timestamp'>): void {
    const event: MessageEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...eventData
    };

    this.events.push(event);

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    console.log(`📊 Analytics: ${event.type} tracked for user ${event.userId}`);
  }

  // Analytics calculation methods
  calculateMetrics(filter: AnalyticsFilter = {}): AnalyticsMetrics {
    const filteredEvents = this.filterEvents(filter);
    
    return {
      // Message metrics
      totalMessages: this.getTotalMessages(filteredEvents),
      messagesReceived: this.getMessagesReceived(filteredEvents),
      messagesSent: this.getMessagesSent(filteredEvents),
      averageResponseTime: this.getAverageResponseTime(filteredEvents),
      
      // User metrics
      totalUsers: this.getTotalUsers(filteredEvents),
      activeUsers: this.getActiveUsers(filteredEvents),
      newUsers: this.getNewUsers(filteredEvents),
      userRetention: this.getUserRetention(filteredEvents),
      
      // Automation metrics
      automationTriggers: this.getAutomationTriggers(filteredEvents),
      automationSuccess: this.getAutomationSuccess(filteredEvents),
      automationFailures: this.getAutomationFailures(filteredEvents),
      topFlows: this.getTopFlows(filteredEvents),
      
      // AI metrics
      aiResponses: this.getAiResponses(filteredEvents),
      aiSuccessRate: this.getAiSuccessRate(filteredEvents),
      averageAiConfidence: this.getAverageAiConfidence(filteredEvents),
      aiErrors: this.getAiErrors(filteredEvents),
      
      // Platform metrics
      platformBreakdown: this.getPlatformBreakdown(filteredEvents),
      
      // Time-based metrics
      hourlyActivity: this.getHourlyActivity(filteredEvents),
      dailyActivity: this.getDailyActivity(filteredEvents)
    };
  }

  private filterEvents(filter: AnalyticsFilter): MessageEvent[] {
    let filtered = [...this.events];

    // Apply time range filter
    if (filter.timeRange) {
      const now = new Date();
      let startDate: Date;

      switch (filter.timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      filtered = filtered.filter(event => event.timestamp >= startDate);
    }

    // Apply custom date range
    if (filter.startDate) {
      filtered = filtered.filter(event => event.timestamp >= filter.startDate!);
    }
    if (filter.endDate) {
      filtered = filtered.filter(event => event.timestamp <= filter.endDate!);
    }

    // Apply platform filter
    if (filter.platform) {
      filtered = filtered.filter(event => event.platform === filter.platform);
    }

    // Apply user segment filter
    if (filter.userSegment) {
      filtered = filtered.filter(event => event.metadata.userSegment === filter.userSegment);
    }

    // Apply automation flow filter
    if (filter.automationFlow) {
      filtered = filtered.filter(event => event.metadata.automationFlowId === filter.automationFlow);
    }

    return filtered;
  }

  // Metric calculation helpers
  private getTotalMessages(events: MessageEvent[]): number {
    return events.filter(e => e.type === 'message_received' || e.type === 'message_sent').length;
  }

  private getMessagesReceived(events: MessageEvent[]): number {
    return events.filter(e => e.type === 'message_received').length;
  }

  private getMessagesSent(events: MessageEvent[]): number {
    return events.filter(e => e.type === 'message_sent').length;
  }

  private getAverageResponseTime(events: MessageEvent[]): number {
    const responseTimes = events
      .filter(e => e.type === 'message_sent' && e.metadata.responseTime)
      .map(e => e.metadata.responseTime!);
    
    return responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;
  }

  private getTotalUsers(events: MessageEvent[]): number {
    const uniqueUsers = new Set(events.map(e => e.userId));
    return uniqueUsers.size;
  }

  private getActiveUsers(events: MessageEvent[]): number {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(e => e.timestamp >= oneDayAgo);
    const activeUsers = new Set(recentEvents.map(e => e.userId));
    return activeUsers.size;
  }

  private getNewUsers(events: MessageEvent[]): number {
    return events.filter(e => e.type === 'user_joined').length;
  }

  private getUserRetention(events: MessageEvent[]): number {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsers = events.filter(e => e.type === 'user_joined' && e.timestamp >= sevenDaysAgo);
    const activeUsers = events.filter(e => e.type === 'user_active' && e.timestamp >= sevenDaysAgo);
    
    const newUserIds = new Set(newUsers.map(e => e.userId));
    const activeUserIds = new Set(activeUsers.map(e => e.userId));
    
    const retainedUsers = Array.from(newUserIds).filter(id => activeUserIds.has(id));
    
    return newUserIds.size > 0 ? (retainedUsers.length / newUserIds.size) * 100 : 0;
  }

  private getAutomationTriggers(events: MessageEvent[]): number {
    return events.filter(e => e.type === 'automation_triggered').length;
  }

  private getAutomationSuccess(events: MessageEvent[]): number {
    return events.filter(e => e.type === 'automation_triggered' && !e.metadata.errorCode).length;
  }

  private getAutomationFailures(events: MessageEvent[]): number {
    return events.filter(e => e.type === 'automation_triggered' && e.metadata.errorCode).length;
  }

  private getTopFlows(events: MessageEvent[]): Array<{ flowId: string; name: string; triggers: number }> {
    const flowCounts = new Map<string, number>();
    
    events
      .filter(e => e.type === 'automation_triggered' && e.metadata.automationFlowId)
      .forEach(e => {
        const flowId = e.metadata.automationFlowId!;
        flowCounts.set(flowId, (flowCounts.get(flowId) || 0) + 1);
      });

    return Array.from(flowCounts.entries())
      .map(([flowId, triggers]) => ({
        flowId,
        name: this.getFlowName(flowId),
        triggers
      }))
      .sort((a, b) => b.triggers - a.triggers)
      .slice(0, 5);
  }

  private getFlowName(flowId: string): string {
    const flowNames: Record<string, string> = {
      'welcome-flow': 'Welcome New Users',
      'help-flow': 'Help & Support',
      'features-flow': 'Features Information'
    };
    return flowNames[flowId] || flowId;
  }

  private getAiResponses(events: MessageEvent[]): number {
    return events.filter(e => e.type === 'ai_response_generated').length;
  }

  private getAiSuccessRate(events: MessageEvent[]): number {
    const aiEvents = events.filter(e => e.type === 'ai_response_generated');
    const successfulAi = aiEvents.filter(e => !e.metadata.errorCode);
    
    return aiEvents.length > 0 ? (successfulAi.length / aiEvents.length) * 100 : 0;
  }

  private getAverageAiConfidence(events: MessageEvent[]): number {
    const confidenceScores = events
      .filter(e => e.type === 'ai_response_generated' && e.metadata.aiConfidence)
      .map(e => e.metadata.aiConfidence!);
    
    return confidenceScores.length > 0 
      ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length 
      : 0;
  }

  private getAiErrors(events: MessageEvent[]): number {
    return events.filter(e => e.type === 'ai_response_generated' && e.metadata.errorCode).length;
  }

  private getPlatformBreakdown(events: MessageEvent[]): Array<{ platform: string; messages: number; users: number }> {
    const platformData = new Map<string, { messages: number; users: Set<string> }>();
    
    events.forEach(event => {
      if (!platformData.has(event.platform)) {
        platformData.set(event.platform, { messages: 0, users: new Set() });
      }
      
      const data = platformData.get(event.platform)!;
      if (event.type === 'message_received' || event.type === 'message_sent') {
        data.messages++;
      }
      data.users.add(event.userId);
    });

    return Array.from(platformData.entries()).map(([platform, data]) => ({
      platform,
      messages: data.messages,
      users: data.users.size
    }));
  }

  private getHourlyActivity(events: MessageEvent[]): Array<{ hour: number; messages: number; users: number }> {
    const hourlyData = new Map<number, { messages: number; users: Set<string> }>();
    
    // Initialize all 24 hours
    for (let i = 0; i < 24; i++) {
      hourlyData.set(i, { messages: 0, users: new Set() });
    }
    
    events.forEach(event => {
      const hour = event.timestamp.getHours();
      const data = hourlyData.get(hour)!;
      
      if (event.type === 'message_received' || event.type === 'message_sent') {
        data.messages++;
      }
      data.users.add(event.userId);
    });

    return Array.from(hourlyData.entries()).map(([hour, data]) => ({
      hour,
      messages: data.messages,
      users: data.users.size
    }));
  }

  private getDailyActivity(events: MessageEvent[]): Array<{ date: string; messages: number; users: number; newUsers: number }> {
    const dailyData = new Map<string, { messages: number; users: Set<string>; newUsers: number }>();
    
    events.forEach(event => {
      const date = event.timestamp.toISOString().split('T')[0];
      
      if (!dailyData.has(date)) {
        dailyData.set(date, { messages: 0, users: new Set(), newUsers: 0 });
      }
      
      const data = dailyData.get(date)!;
      
      if (event.type === 'message_received' || event.type === 'message_sent') {
        data.messages++;
      }
      if (event.type === 'user_joined') {
        data.newUsers++;
      }
      data.users.add(event.userId);
    });

    return Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date,
        messages: data.messages,
        users: data.users.size,
        newUsers: data.newUsers
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Export methods
  exportEvents(filter: AnalyticsFilter = {}): MessageEvent[] {
    return this.filterEvents(filter);
  }

  getRealtimeStats(): { totalEvents: number; recentActivity: number; activeUsers: number } {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentEvents = this.events.filter(e => e.timestamp >= fiveMinutesAgo);
    const activeUsers = new Set(recentEvents.map(e => e.userId));

    return {
      totalEvents: this.events.length,
      recentActivity: recentEvents.length,
      activeUsers: activeUsers.size
    };
  }

  clearOldEvents(olderThanDays: number = 30): number {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const initialCount = this.events.length;
    this.events = this.events.filter(event => event.timestamp >= cutoffDate);
    const removedCount = initialCount - this.events.length;
    
    console.log(`📊 Analytics: Cleared ${removedCount} events older than ${olderThanDays} days`);
    return removedCount;
  }
}

// Export singleton instance
export const analyticsCollector = new AnalyticsCollector(); 