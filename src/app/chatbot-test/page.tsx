'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Bot, User, Loader2, RefreshCw, AlertCircle, CheckCircle, Settings } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  error?: boolean;
}

interface ChatbotConfig {
  id: string;
  name: string;
  industry: string;
  status: string;
  generated_config: {
    systemPrompt: string;
  };
}

interface SystemStatus {
  hasOpenAIKey: boolean;
  aiStatus: any;
  conversationStats: any;
}

export default function ChatbotTestPage() {
  const [chatbots, setChatbots] = useState<ChatbotConfig[]>([]);
  const [selectedChatbot, setSelectedChatbot] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChatbots, setIsLoadingChatbots] = useState(true);
  const [error, setError] = useState<string>('');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [showStatus, setShowStatus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load available chatbots
  useEffect(() => {
    loadChatbots();
    checkSystemStatus();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/ai/intelligent-test');
      const result = await response.json();
      if (result.success) {
        setSystemStatus({
          hasOpenAIKey: result.environmentCheck?.hasOpenAIKey || false,
          aiStatus: result.aiStatus,
          conversationStats: result.conversationStats
        });
      }
    } catch (error) {
      console.error('Failed to check system status:', error);
    }
  };

  const loadChatbots = async () => {
    try {
      setIsLoadingChatbots(true);
      setError('');
      const response = await fetch('/api/chatbot/requirements');
      const result = await response.json();
      
      if (result.success) {
        setChatbots(result.data);
        if (result.data.length > 0) {
          // Find the best chatbot to select automatically
          // Prefer chatbots with system prompts and more recent creation
          const bestChatbot = result.data.find((chatbot: ChatbotConfig) => 
            chatbot.generated_config?.systemPrompt && 
            chatbot.generated_config.systemPrompt.length > 500
          ) || result.data[0];
          
          setSelectedChatbot(bestChatbot.id);
          initializeChat(bestChatbot);
        }
      } else {
        setError(`Failed to load chatbots: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to load chatbots:', error);
      setError(`Failed to load chatbots: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setIsLoadingChatbots(false);
    }
  };

  const initializeChat = (chatbot: ChatbotConfig) => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Hello! I'm ${chatbot.name}, your AI assistant for ${chatbot.industry}. How can I help you today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    setError('');
  };

  const handleChatbotChange = async (chatbotId: string) => {
    setSelectedChatbot(chatbotId);
    const chatbot = chatbots.find(c => c.id === chatbotId);
    if (chatbot) {
      initializeChat(chatbot);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedChatbot || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      // Get the selected chatbot configuration
      const chatbot = chatbots.find(c => c.id === selectedChatbot);
      if (!chatbot) throw new Error('Chatbot not found');

      console.log('🤖 Sending message to chatbot:', {
        chatbotName: chatbot.name,
        industry: chatbot.industry,
        hasSystemPrompt: !!chatbot.generated_config?.systemPrompt,
        message: currentMessage
      });

      // Test the chatbot using its configuration
      const response = await fetch('/api/ai/intelligent-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test_chatbot',
          message: currentMessage,
          systemPrompt: chatbot.generated_config?.systemPrompt || '',
          chatbotName: chatbot.name,
          industry: chatbot.industry
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🤖 Chatbot response:', result);

      if (result.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(result.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for more details.`,
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    const chatbot = chatbots.find(c => c.id === selectedChatbot);
    if (chatbot) {
      initializeChat(chatbot);
    }
  };

  if (isLoadingChatbots) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <span className="ml-2 text-white">Loading chatbots...</span>
        </div>
      </div>
    );
  }

  if (chatbots.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">No Chatbots Found</CardTitle>
            <CardDescription className="text-gray-300">
              You need to create a chatbot configuration first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/chatbot-builder'}>
              Create Your First Chatbot
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentChatbot = chatbots.find(c => c.id === selectedChatbot);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          🧪 Chatbot Testing Interface
        </h1>
        <p className="text-gray-300">
          Test your created chatbot configurations in real-time
        </p>
      </div>

      {/* System Status */}
      {systemStatus && !systemStatus.hasOpenAIKey && (
        <Card className="mb-6 bg-yellow-900 border-yellow-700">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-300 mt-0.5" />
              <div className="text-yellow-200">
                <p className="font-medium mb-2">⚠️ OpenAI API Key Not Configured</p>
                <p className="text-sm mb-3">
                  The chatbot will work in fallback mode with basic responses. For full AI capabilities, add your OpenAI API key.
                </p>
                <div className="text-xs bg-yellow-800 p-2 rounded">
                  <p className="font-mono">Create a .env.local file in your project root:</p>
                  <p className="font-mono mt-1">OPENAI_API_KEY=your_api_key_here</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="mb-6 bg-red-900 border-red-700">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-200">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chatbot Selector */}
      <Card className="mb-6 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span>Select Chatbot to Test</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowStatus(!showStatus)}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Status
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={selectedChatbot} onValueChange={handleChatbotChange}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Choose a chatbot to test" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {chatbots.map(chatbot => {
                    const hasGoodPrompt = chatbot.generated_config?.systemPrompt && 
                                         chatbot.generated_config.systemPrompt.length > 500;
                    return (
                      <SelectItem key={chatbot.id} value={chatbot.id} className="text-white hover:bg-gray-600">
                        <div className="flex items-center space-x-2 w-full">
                          <span>{chatbot.name} ({chatbot.industry})</span>
                          {hasGoodPrompt ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={loadChatbots} className="border-gray-600 text-white hover:bg-gray-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {currentChatbot && (
            <div className="p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">
                    <strong>Testing:</strong> {currentChatbot.name} | 
                    <strong> Industry:</strong> {currentChatbot.industry} | 
                    <strong> Status:</strong> {currentChatbot.status}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {currentChatbot.generated_config?.systemPrompt && 
                   currentChatbot.generated_config.systemPrompt.length > 500 ? (
                    <div className="flex items-center space-x-1 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs">AI Enhanced</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs">Basic Mode</span>
                    </div>
                  )}
                </div>
              </div>
              {currentChatbot.generated_config?.systemPrompt && (
                <p className="text-xs text-gray-400 mt-1">
                  System prompt: {currentChatbot.generated_config.systemPrompt.length} characters
                </p>
              )}
            </div>
          )}

          {/* System Status Details */}
          {showStatus && systemStatus && (
            <div className="p-3 bg-gray-700 rounded-lg border border-gray-600">
              <h4 className="text-white font-medium mb-2">System Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  {systemStatus.hasOpenAIKey ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                  )}
                  <span className="text-gray-300">
                    OpenAI API Key: {systemStatus.hasOpenAIKey ? 'Configured' : 'Missing'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">
                    AI System: {systemStatus.aiStatus?.isReady ? 'Ready' : 'Initializing'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Chat with {currentChatbot?.name || 'Chatbot'}</span>
            </div>
            <Button variant="outline" size="sm" onClick={clearChat} className="border-gray-600 text-white hover:bg-gray-700">
              Clear Chat
            </Button>
          </CardTitle>
        </CardHeader>
        
        {/* Messages Area */}
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-900 rounded-lg">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.error
                      ? 'bg-red-800 border border-red-600 text-red-100'
                      : 'bg-gray-700 border border-gray-600 text-white'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <Bot className={`w-4 h-4 mt-1 ${message.error ? 'text-red-300' : 'text-gray-300'}`} />
                    )}
                    {message.role === 'user' && (
                      <User className="w-4 h-4 mt-1 text-blue-100" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-100' : 
                        message.error ? 'text-red-200' : 'text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 border border-gray-600 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-gray-300" />
                    <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                    <span className="text-sm text-gray-300">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading || !selectedChatbot}
              className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !inputMessage.trim() || !selectedChatbot}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Test Suggestions */}
      <Card className="mt-6 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">💡 Quick Test Ideas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 text-white">Customer Support Tests:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• "I need help with my order"</li>
                <li>• "What are your business hours?"</li>
                <li>• "How can I contact support?"</li>
                <li>• "I have a complaint"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-white">Lead Generation Tests:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• "Tell me about your services"</li>
                <li>• "I'm interested in your products"</li>
                <li>• "Can I get a quote?"</li>
                <li>• "How much does it cost?"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 