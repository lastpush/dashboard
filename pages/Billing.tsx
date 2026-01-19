import React, { useEffect, useState } from 'react';
import { Card, Button, Badge } from '../components/ui/Common.tsx';
import { CreditCard, Download } from 'lucide-react';
import { api } from '../api.ts';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage, useSwitchChain, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';

const erc20Abi = [
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
];

const chainOptions = [
  { id: 56, label: 'BSC' },
  { id: 137, label: 'POLYGON' },
  { id: 8453, label: 'BASE' },
];

export const Billing: React.FC = () => {
  const [topUpAmount, setTopUpAmount] = useState('10');
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [usage, setUsage] = useState({ bandwidthGB: 0, bandwidthLimitGB: 0, buildMinutes: 0, buildMinutesLimit: 0 });
  const [transactions, setTransactions] = useState<{ id: string; date: string; description: string; status: string; amount: number; invoiceUrl?: string }[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{ id: string; brand: string; last4: string; expiresAt: string }[]>([]);
  const [showTopUp, setShowTopUp] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{ paymentId: string; depositAddress: string; tokenAddress: string; decimals: number } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    api.get<{ balance: number }>('/billing/balance')
      .then((res) => setBalance(res.balance))
      .catch(() => null);
    api.get<{ bandwidthGB: number; bandwidthLimitGB: number; buildMinutes: number; buildMinutesLimit: number }>('/billing/usage')
      .then(setUsage)
      .catch(() => null);
    api.get<{ items: { id: string; date: string; description: string; status: string; amount: number; invoiceUrl?: string }[] }>('/billing/transactions')
      .then((res) => setTransactions(res.items))
      .catch(() => null);
    api.get<{ items: { id: string; brand: string; last4: string; expiresAt: string }[] }>('/billing/payment-methods')
      .then((res) => setPaymentMethods(res.items))
      .catch(() => null);
  }, []);

  const handleOpenTopUp = () => {
    setShowTopUp(true);
    setSelectedChainId(null);
    setPaymentInfo(null);
    setPaymentStatus(null);
  };

  const handleSelectChain = async (id: number) => {
    if (selectedChainId === id && paymentInfo) return;
    setSelectedChainId(id);
    setPaymentInfo(null);
    setPaymentStatus(null);
    if (isConnected && chainId !== id) {
      try {
        await switchChainAsync({ chainId: id });
      } catch {
        // ignore
      }
    }

    setLoadingPayment(true);
    setPaymentStatus(null);
    try {
      const res = await api.post<{ paymentId: string; depositAddress: string; tokenAddress: string; decimals: number }>(
        '/billing/top-up/crypto/init',
        {
          amount: Number(topUpAmount),
          chainId: id,
          token: 'USDT',
        }
      );
      setPaymentInfo(res);
    } catch (err) {
      setPaymentStatus((err as Error).message);
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleSendTransfer = async () => {
    if (!paymentInfo || !address || !selectedChainId) return;
    setIsProcessing(true);
    setPaymentStatus(null);
    try {
      if (chainId !== selectedChainId) {
        await switchChainAsync({ chainId: selectedChainId });
      }
      const amount = parseUnits(topUpAmount, paymentInfo.decimals);
      const txHash = await writeContractAsync({
        address: paymentInfo.tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [paymentInfo.depositAddress as `0x${string}`, amount],
      });

      const message = [
        'LastPush TopUp',
        `paymentId:${paymentInfo.paymentId}`,
        `chainId:${selectedChainId}`,
        `from:${address}`,
        `to:${paymentInfo.depositAddress}`,
        `token:${paymentInfo.tokenAddress}`,
        `amount:${topUpAmount}`,
        `txHash:${txHash}`,
      ].join('\n');

      const signature = await signMessageAsync({ message });

      await api.post('/billing/top-up/crypto/confirm', {
        paymentId: paymentInfo.paymentId,
        chainId: selectedChainId,
        from: address,
        to: paymentInfo.depositAddress,
        tokenAddress: paymentInfo.tokenAddress,
        amount: Number(topUpAmount),
        txHash,
        signature,
        message,
      });

      setPaymentStatus('Payment submitted.');
      setShowTopUp(false);
    } catch (err) {
      setPaymentStatus((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Billing & Usage</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-900/20 to-zinc-900 border-indigo-500/20">
          <div className="p-2">
             <h3 className="text-zinc-400 text-sm font-medium">Available Balance</h3>
             <div className="text-4xl font-bold text-white mt-2">${balance.toFixed(2)}</div>
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
               <Button className="w-full" onClick={handleOpenTopUp} isLoading={isProcessing}>Add Funds (${topUpAmount})</Button>
             </div>
          </div>
        </Card>

        <Card title="Current Usage (Month)">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Bandwidth</span>
                <span className="text-white">{usage.bandwidthGB} GB / {usage.bandwidthLimitGB} GB</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${usage.bandwidthLimitGB ? (usage.bandwidthGB / usage.bandwidthLimitGB) * 100 : 0}%` }}></div>
              </div>
            </div>
             <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Build Minutes</span>
                <span className="text-white">{usage.buildMinutes} / {usage.buildMinutesLimit}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${usage.buildMinutesLimit ? (usage.buildMinutes / usage.buildMinutesLimit) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Payment Method">
           {paymentMethods[0] ? (
             <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800 mb-4">
               <CreditCard className="w-8 h-8 text-zinc-500" />
               <div>
                 <div className="text-sm font-medium text-white">{paymentMethods[0].brand} •••• {paymentMethods[0].last4}</div>
                 <div className="text-xs text-zinc-500">Expires {paymentMethods[0].expiresAt}</div>
               </div>
             </div>
           ) : (
             <div className="text-xs text-zinc-500 mb-4">No payment method on file.</div>
           )}
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
              {transactions.map((tx, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">{tx.date}</td>
                  <td className="px-6 py-4 text-white">{tx.description}</td>
                  <td className="px-6 py-4">
                    {tx.status === 'PAID' ? <Badge variant="success">Paid</Badge> : <Badge variant="error">Failed</Badge>}
                  </td>
                  <td className={`px-6 py-4 text-right font-mono ${tx.amount > 0 ? 'text-emerald-400' : 'text-zinc-200'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {tx.invoiceUrl ? (
                      <a href={tx.invoiceUrl} target="_blank" className="text-zinc-500 hover:text-white">
                        <Download className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-zinc-700"><Download className="w-4 h-4" /></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showTopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add Funds via USDT</h3>
              <button
                className="text-zinc-500 hover:text-zinc-200"
                onClick={() => setShowTopUp(false)}
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-zinc-400 mb-2">Connect Wallet</div>
                <ConnectButton />
              </div>

              <div>
                <div className="text-xs font-medium text-zinc-400 mb-2">Select Chain</div>
                <div className="flex flex-wrap gap-2">
                  {chainOptions.map((chain) => (
                    <Button
                      key={chain.id}
                      size="sm"
                      variant={selectedChainId === chain.id ? 'primary' : 'outline'}
                      onClick={() => handleSelectChain(chain.id)}
                    >
                      {chain.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {loadingPayment && <span className="text-xs text-zinc-500">Loading payment address...</span>}
                {paymentInfo && (
                  <span className="text-xs text-zinc-500">Deposit: {paymentInfo.depositAddress}</span>
                )}
              </div>

              {paymentInfo && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-400 space-y-2">
                  <div>Token: USDT</div>
                  <div>Amount: ${topUpAmount}</div>
                  <div>Network: {chainOptions.find((c) => c.id === selectedChainId)?.label}</div>
                </div>
              )}

              {paymentStatus && (
                <div className="text-xs text-amber-400">{paymentStatus}</div>
              )}

              <div className="flex items-center gap-3">
                <Button
                  className="w-full"
                  disabled={!isConnected || !paymentInfo}
                  isLoading={isProcessing}
                  onClick={handleSendTransfer}
                >
                  Send USDT
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
