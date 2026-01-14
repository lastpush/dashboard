import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/ui/Common.tsx';
import { CreditCard, DollarSign, Download, Clock } from 'lucide-react';
import { useAuth } from '../App.tsx';

export const Billing: React.FC = () => {
  const { user } = useAuth();
  const [topUpAmount, setTopUpAmount] = useState('10');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTopUp = () => {
    setIsProcessing(true);
    // Simulate Payment State Machine
    // CREATED -> PENDING -> PAID
    setTimeout(() => {
      alert("Redirecting to Crypto Payment Gateway...");
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Billing & Usage</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-900/20 to-zinc-900 border-indigo-500/20">
          <div className="p-2">
             <h3 className="text-zinc-400 text-sm font-medium">Available Balance</h3>
             <div className="text-4xl font-bold text-white mt-2">${user?.balance.toFixed(2) || '0.00'}</div>
             <div className="mt-4 flex gap-2">
               {['10', '50', '100'].map(amt => (
                 <button 
                  key={amt}
                  onClick={() => setTopUpAmount(amt)}
                  className={`px-3 py-1 text-xs rounded-full border ${topUpAmount === amt ? 'bg-indigo-500 text-white border-indigo-500' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                 >
                   ${amt}
                 </button>
               ))}
             </div>
             <div className="mt-4 pt-4 border-t border-zinc-800/50">
               <Button className="w-full" onClick={handleTopUp} isLoading={isProcessing}>Add Funds (${topUpAmount})</Button>
             </div>
          </div>
        </Card>

        <Card title="Current Usage (Month)">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Bandwidth</span>
                <span className="text-white">45 GB / 100 GB</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[45%]"></div>
              </div>
            </div>
             <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Build Minutes</span>
                <span className="text-white">120 / 6000</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[2%]"></div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Payment Method">
           <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800 mb-4">
             <CreditCard className="w-8 h-8 text-zinc-500" />
             <div>
               <div className="text-sm font-medium text-white">•••• 4242</div>
               <div className="text-xs text-zinc-500">Expires 12/28</div>
             </div>
           </div>
           <Button variant="outline" size="sm" className="w-full">Manage Cards</Button>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-white mb-4">Transactions</h3>
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-900 text-zinc-200">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-900/30">
              {[
                { date: 'Oct 24, 2023', desc: 'Domain Renewal (example.com)', status: 'PAID', amount: -14.99 },
                { date: 'Oct 10, 2023', desc: 'Account Top-up (Crypto)', status: 'PAID', amount: 50.00 },
                { date: 'Sep 24, 2023', desc: 'Domain Registration', status: 'FAILED', amount: -9.99 },
              ].map((tx, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">{tx.date}</td>
                  <td className="px-6 py-4 text-white">{tx.desc}</td>
                  <td className="px-6 py-4">
                    {tx.status === 'PAID' ? <Badge variant="success">Paid</Badge> : <Badge variant="error">Failed</Badge>}
                  </td>
                  <td className={`px-6 py-4 text-right font-mono ${tx.amount > 0 ? 'text-emerald-400' : 'text-zinc-200'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-zinc-500 hover:text-white"><Download className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};