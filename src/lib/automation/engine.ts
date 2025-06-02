export interface AutomationTrigger {
  id: string;
  type: 'keyword' | 'welcome' | 'time' | 'event' | 'sequence';
  conditions: {
    keywords?: string[];
    timeDelay?: number; // in seconds
    eventType?: string;
    userSegment?: string;
    previousMessage?: string;
  };
  priority: number; // 1-10, higher = more priority
  active: boolean;
}

export interface AutomationAction {
  id: string;
  type: 'send_message' | 'add_tag' | 'update_segment' | 'trigger_flow' | 'ai_response';
  config: {
    message?: string;
    useAI?: boolean;
    aiPrompt?: string;
    tags?: string[];
    segment?: string;
    flowId?: string;
    delay?: number;
  };
}

export interface AutomationFlow {
  id: string;
  name: string;
  description: string;
  triggers: AutomationTrigger[];
  actions: AutomationAction[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    triggered: number;
    completed: number;
    lastTriggered?: Date;
  };
}

export interface UserContext {
  chatId: string;
  userId: string;
  name?: string;
  tags: string[];
  segment: string;
  lastMessage?: string;
  messageHistory: string[];
  joinedAt: Date;
  lastActive: Date;
  flowState?: {
    currentFlowId?: string;
    currentStep?: number;
    variables?: Record<string, any>;
  };
}

export interface AutomationResult {
  triggered: boolean;
  flowId?: string;
  actionsTaken: string[];
  nextActions?: AutomationAction[];
  userUpdated: boolean;
  error?: string;
}

export class AutomationEngine {
  private flows: Map<string, AutomationFlow> = new Map();
  private userContexts: Map<string, UserContext> = new Map();

  constructor() {
    this.initializeDefaultFlows();
  }

  private initializeDefaultFlows(): void {
    // Welcome flow for new users
    const welcomeFlow: AutomationFlow = {
      id: 'welcome-flow',
      name: 'Welcome New Users',
      description: 'Greet new users and introduce the platform',
      triggers: [{
        id: 'welcome-trigger',
        type: 'welcome',
        conditions: {},
        priority: 10,
        active: true
      }],
      actions: [{
        id: 'welcome-message',
        type: 'send_message',
        config: {
          message: '👋 Welcome to ClientPing! I\'m your AI assistant for business automation. How can I help you today?',
          delay: 1000
        }
      }, {
        id: 'add-new-user-tag',
        type: 'add_tag',
        config: {
          tags: ['new_user']
        }
      }],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: { triggered: 0, completed: 0 }
    };

    // Help flow for assistance requests
    const helpFlow: AutomationFlow = {
      id: 'help-flow',
      name: 'Help & Support',
      description: 'Provide help when users ask for assistance',
      triggers: [{
        id: 'help-trigger',
        type: 'keyword',
        conditions: {
          keywords: ['help', 'support', 'assist', 'how', 'what can you do']
        },
        priority: 8,
        active: true
      }],
      actions: [{
        id: 'help-response',
        type: 'ai_response',
        config: {
          useAI: true,
          aiPrompt: 'User is asking for help. Provide a helpful overview of ClientPing features and how you can assist them.'
        }
      }],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: { triggered: 0, completed: 0 }
    };

    // Features inquiry flow
    const featuresFlow: AutomationFlow = {
      id: 'features-flow',
      name: 'Features Information',
      description: 'Explain platform features when users inquire',
      triggers: [{
        id: 'features-trigger',
        type: 'keyword',
        conditions: {
          keywords: ['features', 'capabilities', 'what do you do', 'services']
        },
        priority: 7,
        active: true
      }],
      actions: [{
        id: 'features-response',
        type: 'send_message',
        config: {
          message: '🚀 ClientPing Features:\n\n• AI-powered messaging automation\n• Smart conversation flows\n• Business analytics & insights\n• Multi-platform integration\n• Custom brand voice\n\nWhat would you like to know more about?'
        }
      }],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: { triggered: 0, completed: 0 }
    };

    this.flows.set(welcomeFlow.id, welcomeFlow);
    this.flows.set(helpFlow.id, helpFlow);
    this.flows.set(featuresFlow.id, featuresFlow);
  }

  async processMessage(
    chatId: string, 
    message: string, 
    userId: string, 
    userName?: string
  ): Promise<AutomationResult> {
    try {
      // Get or create user context
      let userContext = this.getUserContext(chatId);
      if (!userContext) {
        userContext = this.createUserContext(chatId, userId, userName);
        // Trigger welcome flow for new users
        return await this.triggerWelcomeFlow(userContext);
      }

      // Update user context
      this.updateUserContext(userContext, message);

      // Find matching flows
      const matchingFlows = this.findMatchingFlows(message, userContext);
      
      if (matchingFlows.length === 0) {
        return {
          triggered: false,
          actionsTaken: [],
          userUpdated: true
        };
      }

      // Execute highest priority flow
      const flow = matchingFlows[0];
      return await this.executeFlow(flow, userContext, message);

    } catch (error) {
      console.error('❌ Automation engine error:', error);
      return {
        triggered: false,
        actionsTaken: [],
        userUpdated: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private getUserContext(chatId: string): UserContext | undefined {
    return this.userContexts.get(chatId);
  }

  private createUserContext(chatId: string, userId: string, userName?: string): UserContext {
    const context: UserContext = {
      chatId,
      userId,
      name: userName,
      tags: [],
      segment: 'new',
      messageHistory: [],
      joinedAt: new Date(),
      lastActive: new Date()
    };

    this.userContexts.set(chatId, context);
    return context;
  }

  private updateUserContext(context: UserContext, message: string): void {
    context.lastMessage = message;
    context.messageHistory.push(message);
    context.lastActive = new Date();

    // Keep only last 10 messages for performance
    if (context.messageHistory.length > 10) {
      context.messageHistory = context.messageHistory.slice(-10);
    }
  }

  private async triggerWelcomeFlow(userContext: UserContext): Promise<AutomationResult> {
    const welcomeFlow = this.flows.get('welcome-flow');
    if (!welcomeFlow) {
      return { triggered: false, actionsTaken: [], userUpdated: true };
    }

    return await this.executeFlow(welcomeFlow, userContext);
  }

  private findMatchingFlows(message: string, userContext: UserContext): AutomationFlow[] {
    const matchingFlows: AutomationFlow[] = [];
    const lowerMessage = message.toLowerCase();

    for (const flow of Array.from(this.flows.values())) {
      if (!flow.active) continue;

      for (const trigger of flow.triggers) {
        if (!trigger.active) continue;

        let matches = false;

        switch (trigger.type) {
          case 'keyword':
            if (trigger.conditions.keywords) {
              matches = trigger.conditions.keywords.some((keyword: string) => 
                lowerMessage.includes(keyword.toLowerCase())
              );
            }
            break;

          case 'welcome':
            // Welcome trigger is handled separately
            matches = false;
            break;

          case 'event':
            // Event triggers would be handled by external events
            matches = false;
            break;
        }

        if (matches) {
          matchingFlows.push(flow);
          break; // Only need one trigger to match per flow
        }
      }
    }

    // Sort by priority (highest first)
    return matchingFlows.sort((a, b) => {
      const aPriority = Math.max(...a.triggers.map(t => t.priority));
      const bPriority = Math.max(...b.triggers.map(t => t.priority));
      return bPriority - aPriority;
    });
  }

  private async executeFlow(
    flow: AutomationFlow, 
    userContext: UserContext, 
    triggerMessage?: string
  ): Promise<AutomationResult> {
    const actionsTaken: string[] = [];
    let userUpdated = false;

    try {
      // Update flow stats
      flow.stats.triggered++;
      flow.stats.lastTriggered = new Date();

      for (const action of flow.actions) {
        const result = await this.executeAction(action, userContext, triggerMessage);
        actionsTaken.push(`${action.type}:${action.id}`);
        
        if (result.userUpdated) {
          userUpdated = true;
        }

        // Add delay if specified
        if (action.config.delay) {
          await new Promise(resolve => setTimeout(resolve, action.config.delay));
        }
      }

      flow.stats.completed++;

      return {
        triggered: true,
        flowId: flow.id,
        actionsTaken,
        userUpdated
      };

    } catch (error) {
      console.error(`❌ Flow execution error (${flow.id}):`, error);
      return {
        triggered: true,
        flowId: flow.id,
        actionsTaken,
        userUpdated,
        error: error instanceof Error ? error.message : 'Flow execution failed'
      };
    }
  }

  private async executeAction(
    action: AutomationAction, 
    userContext: UserContext, 
    triggerMessage?: string
  ): Promise<{ userUpdated: boolean; response?: string }> {
    switch (action.type) {
      case 'send_message':
        // Message sending will be handled by the calling webhook
        return { userUpdated: false, response: action.config.message };

      case 'ai_response':
        // AI response generation will be handled by the calling webhook
        return { userUpdated: false, response: 'AI_RESPONSE_REQUESTED' };

      case 'add_tag':
        if (action.config.tags) {
          action.config.tags.forEach(tag => {
            if (!userContext.tags.includes(tag)) {
              userContext.tags.push(tag);
            }
          });
        }
        return { userUpdated: true };

      case 'update_segment':
        if (action.config.segment) {
          userContext.segment = action.config.segment;
        }
        return { userUpdated: true };

      default:
        console.warn(`Unknown action type: ${action.type}`);
        return { userUpdated: false };
    }
  }

  // Public methods for flow management
  addFlow(flow: AutomationFlow): void {
    this.flows.set(flow.id, flow);
  }

  getFlow(flowId: string): AutomationFlow | undefined {
    return this.flows.get(flowId);
  }

  getAllFlows(): AutomationFlow[] {
    return Array.from(this.flows.values());
  }

  updateFlow(flowId: string, updates: Partial<AutomationFlow>): boolean {
    const flow = this.flows.get(flowId);
    if (!flow) return false;

    Object.assign(flow, updates, { updatedAt: new Date() });
    return true;
  }

  deleteFlow(flowId: string): boolean {
    return this.flows.delete(flowId);
  }

  // User context management
  getUserStats(): { totalUsers: number; activeUsers: number; newUsers: number } {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    let activeUsers = 0;
    let newUsers = 0;

    for (const context of Array.from(this.userContexts.values())) {
      if (context.lastActive > oneDayAgo) {
        activeUsers++;
      }
      if (context.joinedAt > oneDayAgo) {
        newUsers++;
      }
    }

    return {
      totalUsers: this.userContexts.size,
      activeUsers,
      newUsers
    };
  }

  getFlowStats(): Array<{ flowId: string; name: string; triggered: number; completed: number; successRate: number }> {
    return Array.from(this.flows.values()).map(flow => ({
      flowId: flow.id,
      name: flow.name,
      triggered: flow.stats.triggered,
      completed: flow.stats.completed,
      successRate: flow.stats.triggered > 0 ? (flow.stats.completed / flow.stats.triggered) * 100 : 0
    }));
  }
}

// Export singleton instance
export const automationEngine = new AutomationEngine(); 