import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2, Globe, RefreshCcw, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { Button, Input, Card, Badge } from '../components/ui/Common.tsx';
import { Domain, DNSRecord } from '../types.ts';

// Mock Data
const MOCK_DOMAIN: Domain = {
  name: 'example-project.com',
  registrarStatus: 'Ok',
  autoRenew: true,
  expiresAt: '2025-11-24',
  dnsMode: 'MANUAL',
  sslStatus: 'ACTIVE',
  records: [
    { id: '1', type: 'A', name: '@', content: '76.76.21.21', ttl: 60, proxied: true },
    { id: '2', type: 'CNAME', name: 'www', content: 'cname.lastpush.dev', ttl: 3600, proxied: true },
    { id: '3', type: 'MX', name: '@', content: 'mail.protonmail.ch', ttl: 3600, proxied: false },
  ]
};

// --- Sub-component: DNS Editor ---
const DNSEditor: React.FC<{ initialRecords: DNSRecord[] }> = ({ initialRecords }) => {
  const [records, setRecords] = useState(initialRecords);
  const [pendingChanges, setPendingChanges] = useState(false);

  const handleDelete = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
    setPendingChanges(true);
  };

  const handleAdd = () => {
    const newRecord: DNSRecord = {
      id: Math.random().toString(),
      type: 'A',
      name: '@',
      content: '1.1.1.1',
      ttl: 3600,
      proxied: false
    };
    setRecords([...records, newRecord]);
    setPendingChanges(true);
  };

  const handleSave = () => {
    // API Call
    setTimeout(() => {
      setPendingChanges(false);
      alert("DNS Records Published Successfully!");
    }, 500);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">DNS Management</h3>
        <Button size="sm" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Add Record</Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900 text-zinc-200 uppercase text-xs font-semibold">
            <tr>
              <th className="px-4 py-3 w-24">Type</th>
              <th className="px-4 py-3 w-48">Name</th>
              <th className="px-4 py-3">Content</th>
              <th className="px-4 py-3 w-24">TTL</th>
              <th className="px-4 py-3 w-24">Proxy</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-900/30">
            {records.map((rec) => (
              <tr key={rec.id} className="hover:bg-zinc-900/50">
                <td className="px-4 py-3 font-mono text-indigo-400 font-bold">{rec.type}</td>
                <td className="px-4 py-3 font-mono text-zinc-300">{rec.name}</td>
                <td className="px-4 py-3 font-mono text-zinc-300 truncate max-w-xs">{rec.content}</td>
                <td className="px-4 py-3">{rec.ttl}</td>
                <td className="px-4 py-3">
                  {rec.proxied ? <Badge variant="warning">Proxied</Badge> : <Badge variant="neutral">DNS Only</Badge>}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(rec.id)} className="text-zinc-600 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && <div className="p-8 text-center text-zinc-500">No records found.</div>}
      </div>

      {pendingChanges && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-zinc-900 border border-zinc-700 shadow-2xl p-4 rounded-xl flex items-center gap-4">
             <div className="flex items-center gap-2 text-amber-400">
               <AlertCircle className="w-5 h-5" />
               <span className="font-medium text-sm">Unsaved changes</span>
             </div>
             <div className="flex gap-2">
               <Button size="sm" variant="ghost" onClick={() => setPendingChanges(false)}>Reset</Button>
               <Button size="sm" onClick={handleSave}>Publish Changes</Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Page: Domain Detail ---
export const DomainDetail: React.FC = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'dns'>('overview');

  if (!name) return <div>Invalid domain</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/domains')} className="-ml-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white font-mono">{name}</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500">
            <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck className="w-3 h-3" /> Active</span>
            <span>•</span>
            <span>Expires in 345 days</span>
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-800 flex gap-6 text-sm font-medium">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-3 ${activeTab === 'overview' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-white'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('dns')}
          className={`pb-3 ${activeTab === 'dns' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-white'}`}
        >
          DNS Records
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Registration" className="h-full">
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-zinc-800/50">
                <span className="text-zinc-500">Auto-renew</span>
                <span className="text-white font-medium">On</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800/50">
                <span className="text-zinc-500">Registrar Lock</span>
                <span className="text-white font-medium">Enabled</span>
              </div>
               <div className="flex justify-between py-2 border-b border-zinc-800/50">
                <span className="text-zinc-500">Privacy Protection</span>
                <span className="text-white font-medium">Enabled (Free)</span>
              </div>
              <div className="pt-2">
                 <Button variant="outline" className="w-full">Manage Subscription</Button>
              </div>
            </div>
          </Card>
          <Card title="SSL / HTTPS" className="h-full">
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
               <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                 <ShieldCheck className="w-8 h-8 text-emerald-500" />
               </div>
               <h3 className="text-white font-medium">Universal SSL Active</h3>
               <p className="text-zinc-500 text-center text-sm px-8">Your domain is automatically secured with a wildcard certificate.</p>
            </div>
          </Card>
        </div>
      ) : (
        <DNSEditor initialRecords={MOCK_DOMAIN.records} />
      )}
    </div>
  );
};

// --- Page: Domain List ---
export const DomainList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Domains</h1>
        <div className="flex gap-2">
          <Link to="/domains/search">
            <Button><Plus className="w-4 h-4 mr-2" /> Buy Domain</Button>
          </Link>
          <Button variant="outline">Connect Existing</Button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-zinc-800 bg-zinc-900/30">
          {['example-project.com', 'my-startup.io', 'personal-blog.dev'].map(domain => (
            <Link key={domain} to={`/domains/${domain}`} className="p-4 hover:bg-zinc-900/50 transition-colors flex items-center justify-between group">
               <div className="flex items-center gap-4">
                 <div className="p-2 bg-zinc-800 rounded-lg"><Globe className="w-5 h-5 text-zinc-400" /></div>
                 <div>
                   <div className="font-mono font-medium text-zinc-200">{domain}</div>
                   <div className="text-xs text-zinc-500">Auto-renews Nov 2025</div>
                 </div>
               </div>
               <div className="flex items-center gap-4">
                 <Badge variant="success">Active</Badge>
                 <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
               </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};