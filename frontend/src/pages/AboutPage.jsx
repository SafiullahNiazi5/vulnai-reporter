import { Shield, Zap, Cloud, Code2 } from 'lucide-react';

const STACK = [
  { label: 'Frontend', value: 'React 18 + Vite + TailwindCSS', icon: Code2 },
  { label: 'AI model', value: 'Claude Sonnet (Anthropic)', icon: Zap },
  { label: 'Backend', value: 'AWS Lambda + API Gateway', icon: Cloud },
  { label: 'Parsers', value: 'Nessus XML, Trivy JSON, Nmap XML', icon: Shield },
];

export default function AboutPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-white">About VulnAI Reporter</h1>
        <p className="text-sm text-gray-500 mt-1">AI-powered vulnerability report generator.</p>
      </div>
      <div className="space-y-5">
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-4">Tech stack</h2>
          <div className="space-y-3">
            {STACK.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">{label}</p>
                  <p className="text-sm text-gray-300">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-3">Architecture</h2>
          <pre className="text-xs text-gray-500 font-mono leading-relaxed overflow-x-auto">{`React (Vite) → API Gateway → Lambda (analyze.js)
                                    ↓
                             Anthropic Claude API`}</pre>
        </div>
      </div>
    </div>
  );
}
