'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';

export default function TelegramSetupPage() {
  const [botToken, setBotToken] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [webhookInfo, setWebhookInfo] = useState<any>(null);

  // Auto-generate webhook URL based on current domain
  const generateWebhookUrl = () => {
    const currentDomain = window.location.origin;
    const generatedUrl = `${currentDomain}/api/telegram/webhook`;
    setWebhookUrl(generatedUrl);
  };

  const setupWebhook = async () => {
    if (!botToken || !webhookUrl) {
      setResult({ success: false, error: 'Please provide both bot token and webhook URL' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/telegram/setup-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botToken,
          webhookUrl,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Failed to setup webhook' });
    } finally {
      setIsLoading(false);
    }
  };

  const getWebhookInfo = async () => {
    if (!botToken) {
      setResult({ success: false, error: 'Please provide bot token' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/telegram/setup-webhook?botToken=${encodeURIComponent(botToken)}`);
      const data = await response.json();
      setWebhookInfo(data.webhookInfo);
    } catch (error) {
      setResult({ success: false, error: 'Failed to get webhook info' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Telegram Bot Webhook Setup</h1>
        <p className="text-muted-foreground">
          Configure your Telegram bot webhook to start receiving messages
        </p>
      </div>

      <div className="grid gap-6">
        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📋</span> Setup Instructions
            </CardTitle>
            <CardDescription>
              Follow these steps to set up your Telegram bot webhook
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Create a Telegram Bot</h4>
              <p className="text-sm text-muted-foreground">
                Message <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">
                  @BotFather <ExternalLink className="w-3 h-3" />
                </a> on Telegram and use the <code>/newbot</code> command
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">2. Get Your Bot Token</h4>
              <p className="text-sm text-muted-foreground">
                BotFather will give you a token that looks like: <code>123456789:ABCdefGHIjklMNOpqrsTUVwxyz</code>
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">3. Configure Webhook URL</h4>
              <p className="text-sm text-muted-foreground">
                Use the auto-generated URL below or provide your own domain
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook Configuration</CardTitle>
            <CardDescription>
              Enter your bot token and webhook URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="botToken" className="text-sm font-medium">
                Bot Token
              </label>
              <Input
                id="botToken"
                type="password"
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="webhookUrl" className="text-sm font-medium">
                Webhook URL
              </label>
              <div className="flex gap-2">
                <Input
                  id="webhookUrl"
                  placeholder="https://your-domain.com/api/telegram/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateWebhookUrl}
                >
                  Auto-Generate
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={setupWebhook}
                disabled={isLoading || !botToken || !webhookUrl}
                className="flex-1"
              >
                {isLoading ? 'Setting up...' : 'Setup Webhook'}
              </Button>
              <Button
                variant="outline"
                onClick={getWebhookInfo}
                disabled={isLoading || !botToken}
              >
                Check Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                Setup Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant={result.success ? "default" : "destructive"}>
                <AlertDescription>
                  {result.success ? result.message : result.error}
                </AlertDescription>
              </Alert>
              {result.success && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Webhook URL:</p>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <code className="flex-1 text-sm">{result.webhookUrl}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(result.webhookUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Webhook Info */}
        {webhookInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Current Webhook Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">URL:</span>
                  <span className="text-sm">{webhookInfo.url || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Has Custom Certificate:</span>
                  <span className="text-sm">{webhookInfo.has_custom_certificate ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Pending Updates:</span>
                  <span className="text-sm">{webhookInfo.pending_update_count || 0}</span>
                </div>
                {webhookInfo.last_error_date && (
                  <div className="flex justify-between">
                    <span className="font-medium">Last Error:</span>
                    <span className="text-sm text-red-500">{webhookInfo.last_error_message}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>
              Add these to your .env.local file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-3 bg-muted rounded font-mono text-sm">
                <div>TELEGRAM_BOT_TOKEN={botToken || 'your_bot_token_here'}</div>
                <div>TELEGRAM_WEBHOOK_URL={webhookUrl || 'your_webhook_url_here'}</div>
                <div>TELEGRAM_WEBHOOK_TOKEN=your_verification_token_here</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(`TELEGRAM_BOT_TOKEN=${botToken}\nTELEGRAM_WEBHOOK_URL=${webhookUrl}\nTELEGRAM_WEBHOOK_TOKEN=your_verification_token_here`)}
                disabled={!botToken || !webhookUrl}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Environment Variables
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Your Bot</CardTitle>
            <CardDescription>
              Once webhook is set up, test your bot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                1. Find your bot on Telegram by searching for its username
              </p>
              <p className="text-sm">
                2. Send a message to your bot
              </p>
              <p className="text-sm">
                3. Check your application logs to see if the webhook is receiving messages
              </p>
              <p className="text-sm">
                4. Your bot should echo back any message you send (current behavior)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 