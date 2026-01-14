import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UploadCloud, File, Globe, Clock, CheckCircle, XCircle, Loader2, ArrowRight, Play, Plus } from 'lucide-react';
import { Button, Input, Card, Badge } from '../components/ui/Common.tsx';
import { DeploymentStatus } from '../types.ts';

// --- Page: New Site ---
export const NewSite: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<DeploymentStatus>(DeploymentStatus.QUEUED);

  const handleDeploy = () => {
    if (!file) return;
    setDeploying(true);
    setStatus(DeploymentStatus.BUILDING);
    
    const steps = [
      'Uploading assets...',
      'Unpacking archive...',
      'Optimizing images...',
      'Verifying build...',
      'Deploying to edge network...',
      'Propagating DNS...',
      'Done!'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setStatus(DeploymentStatus.READY);
        setTimeout(() => navigate('/sites/site-xyz123'), 1000);
        return;
      }
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[currentStep]}`]);
      currentStep++;
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Deploy a new site</h1>
        <p className="text-zinc-400">Import your code or upload a static bundle.</p>
      </div>

      <Card>
        <div className="space-y-6">
          <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center hover:bg-zinc-800/30 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".zip,.tar.gz"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-400">
                {file ? <File className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
              </div>
              <div>
                <p className="font-medium text-zinc-200">{file ? file.name : "Drag & drop your Output folder"}</p>
                <p className="text-sm text-zinc-500 mt-1">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Support for .zip, .dist folder"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <Input label="Project Name" placeholder="my-awesome-project" />
             <div className="grid grid-cols-2 gap-4">
               <Input label="Root Directory" placeholder="./" defaultValue="./" />
               <Input label="Output Directory" placeholder="dist" defaultValue="dist" />
             </div>
          </div>

          {!deploying ? (
            <Button className="w-full h-12 text-base" disabled={!file} onClick={handleDeploy}>
              Deploy Now
            </Button>
          ) : (
            <div className="rounded-lg bg-zinc-950 p-4 font-mono text-xs space-y-1 h-48 overflow-y-auto border border-zinc-800">
              {logs.map((log, i) => (
                <div key={i} className="text-zinc-300">
                  <span className="text-zinc-600 mr-2">{'>'}</span>
                  {log}
                </div>
              ))}
              {status === DeploymentStatus.READY && (
                <div className="text-emerald-400 font-bold mt-2">Success! Redirecting...</div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// --- Page: Site List ---
export const SiteList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Sites</h1>
        <Link to="/sites/new"><Button><Plus className="w-4 h-4 mr-2" /> New Project</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Link key={i} to={`/sites/site-${i}`} className="group block">
            <Card className="h-full hover:border-zinc-600 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center font-bold text-indigo-400">
                    LP
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">Project Alpha</h3>
                    <p className="text-xs text-zinc-500">project-alpha.lastpush.dev</p>
                  </div>
                </div>
                <Badge variant="success">Live</Badge>
              </div>
              <div className="space-y-2 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>Deployed 2h ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  <span>main branch</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

// --- Page: Site Detail ---
export const SiteDetail: React.FC = () => {
  const { id } = useParams();
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-white flex items-center gap-3">
             Project Alpha 
             <a href="#" target="_blank" className="text-sm font-normal text-zinc-500 hover:text-indigo-400 flex items-center gap-1">
               <Globe className="w-3 h-3" /> project-alpha.lastpush.dev
             </a>
           </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Settings</Button>
          <Button>Create Deployment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-semibold text-zinc-100">Production Deployment</h3>
              <Badge variant="success">Ready</Badge>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-700">
                Preview Screenshot
              </div>
              <div className="mt-4 flex gap-4 text-sm text-zinc-400">
                <div>
                   <span className="block text-xs text-zinc-500 uppercase">Source</span>
                   <span className="flex items-center gap-1 text-white"><File className="w-3 h-3" /> bundle.zip</span>
                </div>
                <div>
                   <span className="block text-xs text-zinc-500 uppercase">Created</span>
                   <span className="text-white">2 hours ago</span>
                </div>
                 <div>
                   <span className="block text-xs text-zinc-500 uppercase">Size</span>
                   <span className="text-white">12.4 MB</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-4">Deployment History</h3>
            <div className="space-y-3">
               {[1, 2, 3, 4].map((dep, i) => (
                 <div key={dep} className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${i === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                         {i === 0 ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-200">Deployment #{100 - dep}</div>
                        <div className="text-xs text-zinc-500">{i === 0 ? 'Current Production' : `${dep} days ago`}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-zinc-500">7f3a21</span>
                      {i !== 0 && <Button size="sm" variant="ghost">Rollback</Button>}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <Card title="Domains">
             <div className="space-y-3">
               <div className="flex items-center justify-between text-sm">
                 <span className="text-zinc-300">project-alpha.lastpush.dev</span>
                 <Badge variant="neutral">Default</Badge>
               </div>
               <div className="flex items-center justify-between text-sm">
                 <span className="text-zinc-300">alpha.com</span>
                 <Badge variant="success">Primary</Badge>
               </div>
               <Button size="sm" variant="outline" className="w-full mt-2">Add Domain</Button>
             </div>
           </Card>
           
           <Card title="Quick Actions">
             <div className="space-y-2">
               <Button variant="ghost" className="w-full justify-start text-zinc-400">View Logs</Button>
               <Button variant="ghost" className="w-full justify-start text-zinc-400">Environment Variables</Button>
               <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-red-400">Delete Project</Button>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
};