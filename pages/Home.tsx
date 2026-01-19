import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Loader2 } from 'lucide-react';
import { Button, Input } from '../components/ui/Common.tsx';
import { DomainStatus, DomainSearchResult } from '../types.ts';
import { api } from '../api.ts';
import { useAuth } from '../App.tsx';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<DomainSearchResult[] | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setSearching(true);
    try {
      const data = await api.get<{ results: DomainSearchResult[] }>(`/domains/search?q=${encodeURIComponent(query)}`);
      setResults(data.results);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSearching(false);
    }
  };

  const handleBuy = (domain: DomainSearchResult) => {
    const orderPath = `/orders/new?domain=${encodeURIComponent(domain.name)}&price=${encodeURIComponent(String(domain.price))}`;
    if (user) {
      navigate(orderPath);
      return;
    }
    navigate(`/login?redirect=${encodeURIComponent(orderPath)}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 pb-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
          Deploy frontend. <br/> Manage domains.
        </h1>
        <p className="text-lg text-zinc-400">
          The developer-first platform for modern web projects. 
          Purchase domains, configure DNS automatically, and push to deploy in seconds.
        </p>
      </div>

      <div className="w-full max-w-xl">
        <form onSubmit={handleSearch} className="relative">
          <Input 
            placeholder="Find your next domain (e.g., project-titan)" 
            className="h-14 pl-5 text-lg shadow-2xl shadow-indigo-500/10 border-zinc-700 bg-zinc-900"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="absolute right-2 top-2">
            <Button size="lg" disabled={searching} type="submit" className="h-10">
              {searching ? <Loader2 className="animate-spin" /> : 'Search'}
            </Button>
          </div>
        </form>

        {results && (
          <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">Search Results</h3>
            {results.map((res) => (
              <div key={res.name} className="group flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-3">
                   {res.status === DomainStatus.AVAILABLE ? (
                     <div className="p-2 bg-emerald-500/10 rounded-full"><Check className="w-4 h-4 text-emerald-500" /></div>
                   ) : res.status === DomainStatus.PREMIUM ? (
                     <div className="p-2 bg-amber-500/10 rounded-full"><Check className="w-4 h-4 text-amber-500" /></div>
                   ) : (
                     <div className="p-2 bg-zinc-800 rounded-full"><X className="w-4 h-4 text-zinc-500" /></div>
                   )}
                   <div>
                     <p className="font-mono text-lg font-medium text-zinc-200">{res.name}</p>
                     <p className="text-xs text-zinc-500">
                       {res.status === DomainStatus.AVAILABLE && `Renews at $${res.renewalPrice}/yr`}
                       {res.status === DomainStatus.REGISTERED && `Unavailable`}
                     </p>
                   </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {res.status !== DomainStatus.REGISTERED && (
                    <span className="font-medium text-zinc-100">${res.price}</span>
                  )}
                  {res.status !== DomainStatus.REGISTERED ? (
                    <Button size="sm" onClick={() => handleBuy(res)}>
                      Buy Now
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" disabled>Taken</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
