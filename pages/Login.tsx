import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../components/ui/Common.tsx';
import { Mail, Twitter, ArrowRight, CheckCircle2, Wallet } from 'lucide-react';
import { useAuth } from '../App.tsx';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirect = searchParams.get('redirect') || '/dashboard';
  
  const [step, setStep] = useState<'methods' | 'email' | 'onboarding'>('methods');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Wagmi Hooks
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  // Handle Wallet Login Sequence
  useEffect(() => {
    const handleWalletAuth = async () => {
      if (isConnected && address && step === 'methods') {
        try {
          // Signature Request
          const message = `Login to LastPush: ${Math.floor(Math.random() * 1000000)}`;
          await signMessageAsync({ message });
          
          setStep('onboarding');
        } catch (error) {
          console.error("User rejected signature", error);
          disconnect();
        }
      }
    };

    handleWalletAuth();
  }, [isConnected, address, step, signMessageAsync, disconnect]);


  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (email === 'admin@admin.admin') {
      setLoading(false);
      setStep('onboarding');
      return;
    }

    setTimeout(() => {
       setLoading(false);
       alert(`Magic link sent to ${email}. Click OK to simulate clicking the link.`);
       setStep('onboarding');
    }, 1000);
  };

  const handleCompleteOnboarding = () => {
    login({ 
      id: address ? `eth_${address.slice(0,6)}` : 'usr_123', 
      email: email || undefined, 
      handle: email ? email.split('@')[0] : (address ? `0x${address.slice(2,8)}` : 'user'), 
      balance: 100,
      walletAddress: address
    });
    navigate(redirect);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900">
        <div className="text-center mb-8">
           <h2 className="text-2xl font-bold text-white mb-2">Welcome to LastPush</h2>
           <p className="text-zinc-500 text-sm">Sign in to manage your domains and deployments</p>
        </div>

        {step === 'methods' && (
          <div className="space-y-4">
            <div className="w-full">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                      authenticationStatus === 'authenticated');

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        'style': {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <Button 
                              variant="secondary" 
                              className="w-full h-12 justify-between px-6" 
                              onClick={openConnectModal}
                            >
                              <span className="flex items-center gap-3">
                                <Wallet className="w-5 h-5 text-indigo-400" /> 
                                Connect Wallet
                              </span>
                              <ArrowRight className="w-4 h-4 text-zinc-500" />
                            </Button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                             <Button variant="danger" className="w-full" onClick={openChainModal}>
                                Wrong network
                             </Button>
                          );
                        }

                        return (
                          <div className="text-center space-y-2">
                             <div className="text-zinc-400 text-sm">Wallet Connected</div>
                             <Button variant="outline" className="w-full font-mono" onClick={openAccountModal}>
                               {account.displayName}
                             </Button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
            
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink-0 mx-4 text-zinc-600 text-xs uppercase">Or</span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            <Button variant="secondary" className="w-full h-12 justify-between px-6" onClick={() => setStep('email')}>
              <span className="flex items-center gap-3"><Mail className="w-5 h-5 text-zinc-400" /> Continue with Email</span>
              <ArrowRight className="w-4 h-4 text-zinc-500" />
            </Button>

            <Button variant="secondary" className="w-full h-12 justify-between px-6">
              <span className="flex items-center gap-3"><Twitter className="w-5 h-5 text-blue-400" /> Continue with X</span>
              <ArrowRight className="w-4 h-4 text-zinc-500" />
            </Button>
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="dev@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <Button type="submit" className="w-full" isLoading={loading}>
              {loading ? 'Sending...' : 'Send Magic Link'}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setStep('methods')}>Back</Button>
          </form>
        )}

        {step === 'onboarding' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-white">
                {email === 'admin@admin.admin' ? 'Welcome Back, Admin' : 'Almost there'}
              </h3>
              <p className="text-zinc-500 text-sm">
                {address ? `Wallet ${address.slice(0,6)}...${address.slice(-4)} connected.` : 'Confirm your details to finish setup.'}
              </p>
            </div>
            <Input 
              label="Username" 
              defaultValue={
                email === 'admin@admin.admin' ? 'admin' :
                email ? email.split('@')[0] : 
                address ? `0x${address.slice(2,8)}` : 'anon_dev'
              } 
            />
            <Input label="Workspace Name (Optional)" placeholder="My Team" />
            <Button className="w-full" onClick={handleCompleteOnboarding}>Enter Dashboard</Button>
          </div>
        )}
      </Card>
    </div>
  );
};