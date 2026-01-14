import React from 'react';
import { Card, Badge, Button } from '../components/ui/Common.tsx';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { ExternalLink, GitCommit, Globe, Clock, CreditCard } from 'lucide-react';

const mockActivity = [
  { name: 'Mon', deploys: 4 },
  { name: 'Tue', deploys: 7 },
  { name: 'Wed', deploys: 3 },
  { name: 'Thu', deploys: 8 },
  { name: 'Fri', deploys: 12 },
  { name: 'Sat', deploys: 5 },
  { name: 'Sun', deploys: 2 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Active Sites">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-3xl font-bold text-white">3</div>
              <div className="text-sm text-zinc-500 mt-1">2 Live, 1 Building</div>
            </div>
            <Link to="/sites/new"><Button size="sm" variant="outline">Deploy</Button></Link>
          </div>
        </Card>
        <Card title="Domains">
          <div className="flex justify-between items-end">
             <div>
              <div className="text-3xl font-bold text-white">12</div>
              <div className="text-sm text-zinc-500 mt-1">1 Expiring soon</div>
            </div>
            <Link to="/domains/search"><Button size="sm" variant="outline">Buy</Button></Link>
          </div>
        </Card>
        <Card title="Current Balance">
          <div className="flex justify-between items-end">
             <div>
              <div className="text-3xl font-bold text-white">$42.50</div>
              <div className="text-sm text-zinc-500 mt-1">Auto-topup off</div>
            </div>
            <Link to="/billing"><Button size="sm" variant="outline">Add Funds</Button></Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <Card title="Deployment Activity (Last 7 Days)">
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockActivity}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#52525b" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      cursor={{fill: '#27272a'}}
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                    />
                    <Bar dataKey="deploys" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card title="Recent Events">
            <div className="space-y-4">
              {[
                { title: 'Project X Deployed', desc: 'main branch • 2m ago', icon: GitCommit, status: 'success' },
                { title: 'example.com Renewed', desc: 'Auto-renew • 4h ago', icon: Globe, status: 'info' },
                { title: 'Payment Failed', desc: 'Card ending 4242', icon: CreditCard, status: 'error' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
                  <div className={`mt-1 p-1.5 rounded-md bg-zinc-800 text-zinc-400`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-200">{item.title}</div>
                    <div className="text-xs text-zinc-500">{item.desc}</div>
                  </div>
                </div>
              ))}
              <Link to="/sites" className="block text-center text-xs text-zinc-500 hover:text-zinc-300 mt-4">View all activity</Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};