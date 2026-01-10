import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MessageCircle, Calendar, Webhook, Key } from "lucide-react";

const integrations = [
  {
    id: "telegram",
    name: "Telegram Bot",
    description: "Add tasks via Telegram messages",
    icon: MessageCircle,
    connected: false,
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync scheduled tasks with your calendar",
    icon: Calendar,
    connected: false,
  },
  {
    id: "webhooks",
    name: "Webhooks",
    description: "Send notifications to external services",
    icon: Webhook,
    connected: false,
  },
  {
    id: "api",
    name: "REST API",
    description: "Access your tasks programmatically",
    icon: Key,
    connected: true,
  },
];

export default function IntegrationsPage() {
  return (
    <>
      <PageHeader
        title="Integrations"
        description="Connect external services"
      />
      <main className="flex-1 p-4">
        <div className="max-w-2xl space-y-4">
          {integrations.map((integration) => (
            <Card key={integration.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex gap-4">
                  <div className="rounded-lg bg-muted p-2">
                    <integration.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {integration.name}
                      {integration.connected && (
                        <Badge variant="secondary" className="text-xs">
                          Connected
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                </div>
                <Switch checked={integration.connected} />
              </CardHeader>
              {integration.connected && (
                <CardContent>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}

          {/* API Keys Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API Keys</CardTitle>
              <CardDescription>
                Manage your API keys for external access
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: API keys list and management */}
              <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                <p>No API keys created yet</p>
                <Button className="mt-2" size="sm">
                  Create API Key
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Webhooks Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Webhooks</CardTitle>
              <CardDescription>
                Configure webhooks for event notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Webhooks list and management */}
              <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                <p>No webhooks configured</p>
                <Button className="mt-2" size="sm">
                  Add Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
