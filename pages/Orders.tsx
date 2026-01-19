import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '../components/ui/Common.tsx';
import { api } from '../api.ts';
import { Order } from '../types.ts';

const statusLabel = (status?: Order['fulfillmentStatus']) => {
  switch (status) {
    case 'ONLINE':
      return { label: 'Online', variant: 'success' as const };
    case 'FAILED':
      return { label: 'Failed', variant: 'error' as const };
    case 'CLOUDFLARE_PENDING':
      return { label: 'Pending DNS', variant: 'warning' as const };
    case 'PURCHASED':
      return { label: 'Purchased', variant: 'warning' as const };
    case 'PURCHASING':
    default:
      return { label: 'Purchasing', variant: 'warning' as const };
  }
};

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get<{ items: Order[] }>('/orders')
      .then((res) => setOrders(res.items))
      .catch(() => null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-zinc-500">Track domain purchase and provisioning status.</p>
        </div>
        <Link to="/"><Button>Buy Domain</Button></Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
          <div className="text-lg font-medium text-white mb-2">No orders yet</div>
          <div className="text-sm text-zinc-500 mb-6">Search for a domain to place your first order.</div>
          <Link to="/"><Button>Find Domain</Button></Link>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-zinc-800">
            {orders.map((order) => {
              const status = statusLabel(order.fulfillmentStatus);
              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between p-4 hover:bg-zinc-900/40 transition-colors"
                >
                  <div>
                    <div className="text-sm text-zinc-500">Order #{order.id}</div>
                    <div className="text-white font-mono">{order.domain}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      ${order.amount.toFixed(2)} • {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
