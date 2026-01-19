import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, Button, Badge } from '../components/ui/Common.tsx';
import { api } from '../api.ts';
import { useAuth } from '../App.tsx';

export const OrderNew: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const domain = searchParams.get('domain') || '';
  const priceParam = searchParams.get('price') || '';
  const price = useMemo(() => {
    const parsed = Number(priceParam);
    return Number.isFinite(parsed) ? parsed : null;
  }, [priceParam]);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingBalance(true);
    api.get<{ balance: number }>('/billing/balance')
      .then((res) => setBalance(res.balance))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoadingBalance(false));
  }, []);

  const handlePurchase = async () => {
    if (!domain || price === null) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post<{ orderId: string }>('/domains', {
        name: domain,
        years: 1,
        autoRenew: true,
        privacyProtection: true,
      });
      navigate(`/orders/${res.orderId}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto">
        <Card title="Sign in required">
          <div className="text-sm text-zinc-400">Please sign in to place a domain order.</div>
        </Card>
      </div>
    );
  }

  if (!domain || price === null) {
    return (
      <div className="max-w-xl mx-auto">
        <Card title="Invalid order">
          <div className="text-sm text-zinc-400">Missing domain or price details.</div>
          <div className="mt-4">
            <Link to="/"><Button>Back to Search</Button></Link>
          </div>
        </Card>
      </div>
    );
  }

  const hasBalance = balance !== null && balance >= price;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Confirm Purchase</h1>
        <p className="text-sm text-zinc-500">Orders are paid from your wallet balance.</p>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Domain</span>
            <span className="text-white font-mono">{domain}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Price (1 year)</span>
            <span className="text-white font-medium">${price.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Balance</span>
            <span className="text-white font-medium">
              {loadingBalance ? 'Loading...' : balance !== null ? `$${balance.toFixed(2)}` : '--'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Badge variant="info">Balance</Badge>
            <span>Default payment method</span>
          </div>
        </div>
      </Card>

      {!hasBalance && balance !== null && (
        <Card className="border-amber-500/30">
          <div className="text-sm text-amber-400">Insufficient balance. Please top up to continue.</div>
          <div className="mt-4">
            <Button variant="outline" onClick={() => navigate('/billing?topup=1')}>
              Go to Top Up
            </Button>
          </div>
        </Card>
      )}

      {error && (
        <div className="text-sm text-amber-400">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <Button
          className="h-11"
          disabled={!hasBalance || submitting || loadingBalance}
          isLoading={submitting}
          onClick={handlePurchase}
        >
          Pay with Balance
        </Button>
        <Button variant="ghost" onClick={() => navigate('/')}>Cancel</Button>
      </div>
    </div>
  );
};
