import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/ui/Common.tsx';
import { useAuth } from '../App.tsx';
import { ShieldCheck, Bell, KeyRound, Trash2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, login } = useAuth();
  const [handle, setHandle] = useState(user?.handle || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    deploys: true,
    billing: true,
    security: false,
  });

  const handleSaveProfile = () => {
    if (!user) return;
    setSaving(true);
    setTimeout(() => {
      login({
        ...user,
        handle: handle.trim() || user.handle,
        email: email.trim() || user.email,
      });
      setSaving(false);
      alert('Profile updated');
    }, 600);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-500">Manage your account, security, and notifications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Profile">
          <div className="space-y-4">
            <Input label="Display Name" value={handle} onChange={(e) => setHandle(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Wallet login enabled {user?.walletAddress ? `(${user.walletAddress.slice(0, 6)}...)` : ''}
            </div>
            <Button onClick={handleSaveProfile} isLoading={saving}>Save Changes</Button>
          </div>
        </Card>

        <Card title="Plan & Usage">
          <div className="space-y-4 text-sm text-zinc-400">
            <div className="flex items-center justify-between">
              <span>Current Plan</span>
              <Badge variant="info">Starter</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Projects</span>
              <span className="text-white">3 / 10</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Domains</span>
              <span className="text-white">12 / 20</span>
            </div>
            <Button variant="outline" size="sm" className="w-full">Upgrade Plan</Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Notifications">
          <div className="space-y-3">
            {[
              { key: 'deploys', label: 'Deployment status updates' },
              { key: 'billing', label: 'Billing receipts and failed payments' },
              { key: 'security', label: 'Security alerts and sign-in notices' },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
                <span className="text-sm text-zinc-300 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-zinc-500" />
                  {item.label}
                </span>
                <input
                  type="checkbox"
                  className="accent-indigo-500"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={() =>
                    setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))
                  }
                />
              </label>
            ))}
          </div>
        </Card>

        <Card title="API Keys">
          <div className="space-y-4 text-sm text-zinc-400">
            <div className="flex items-center justify-between">
              <span>Primary key</span>
              <span className="font-mono text-zinc-200">lp_••••••••</span>
            </div>
            <Button variant="outline" size="sm" className="w-full"><KeyRound className="w-4 h-4 mr-2" />Rotate Key</Button>
            <Button variant="ghost" size="sm" className="w-full text-zinc-500">Create new key</Button>
          </div>
        </Card>
      </div>

      <Card title="Danger Zone" className="border-red-500/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm text-zinc-400">Delete workspace</div>
            <div className="text-xs text-zinc-600">This action is irreversible and will remove all sites and domains.</div>
          </div>
          <Button variant="danger"><Trash2 className="w-4 h-4 mr-2" />Delete Workspace</Button>
        </div>
      </Card>
    </div>
  );
};
