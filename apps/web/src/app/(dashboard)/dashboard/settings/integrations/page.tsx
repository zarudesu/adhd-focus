'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Copy, Trash2, Plus, Eye, EyeOff, MessageCircle, Calendar, Webhook } from "lucide-react";
import { toast } from "sonner";

interface ApiKeyInfo {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export default function IntegrationsPage() {
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/keys');
      if (res.ok) {
        setKeys(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to create key');
        return;
      }
      const data = await res.json();
      setCreatedKey(data.key);
      setShowKey(true);
      setNewKeyName('');
      fetchKeys();
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string, name: string) => {
    if (!confirm(`Revoke API key "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('API key revoked');
      fetchKeys();
    } else {
      toast.error('Failed to revoke key');
    }
  };

  const copyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <>
      <PageHeader
        title="Integrations"
        description="API keys and external services"
      />
      <main className="flex-1 p-4">
        <div className="max-w-2xl space-y-6">
          {/* API Keys Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Access your tasks programmatically via REST API
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => { setShowCreate(true); setCreatedKey(null); }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Key
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create Key Form */}
              {showCreate && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                  {createdKey ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-green-500">
                        API key created successfully
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded bg-background px-3 py-2 text-sm font-mono break-all">
                          {showKey ? createdKey : '•'.repeat(40)}
                        </code>
                        <Button variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
                          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={copyKey}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-destructive">
                        Copy this key now. You won&apos;t be able to see it again.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => { setShowCreate(false); setCreatedKey(null); }}>
                        Done
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="key-name">Key Name</Label>
                        <Input
                          id="key-name"
                          placeholder="e.g. My Script, CI/CD"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleCreate} disabled={creating || !newKeyName.trim()}>
                          {creating ? 'Creating...' : 'Create'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Keys List */}
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : keys.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                  <p className="text-sm">No API keys yet</p>
                  <p className="text-xs mt-1">Create a key to access the API programmatically</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {keys.map((k) => (
                    <div
                      key={k.id}
                      className="flex items-center justify-between rounded-lg border px-4 py-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{k.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <code>{k.keyPrefix}...</code>
                          <span>
                            Created {new Date(k.createdAt).toLocaleDateString()}
                          </span>
                          {k.lastUsedAt && (
                            <span>
                              Last used {new Date(k.lastUsedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRevoke(k.id, k.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Usage hint */}
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-2">Usage:</p>
                <code className="text-xs block">
                  curl -H &quot;Authorization: Bearer byr8_...&quot; {typeof window !== 'undefined' ? window.location.origin : 'https://beatyour8.com'}/api/tasks
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coming Soon</CardTitle>
              <CardDescription>
                More integrations are on the way
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { icon: MessageCircle, name: "Telegram Bot", desc: "Add tasks via Telegram messages" },
                  { icon: Calendar, name: "Google Calendar", desc: "Sync scheduled tasks with your calendar" },
                  { icon: Webhook, name: "Webhooks", desc: "Send notifications to external services" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3 text-muted-foreground opacity-60">
                    <item.icon className="h-5 w-5" />
                    <div>
                      <p className="text-sm">{item.name}</p>
                      <p className="text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
