import { useState } from 'react';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useReport } from '../hooks/useReport.js';
import clsx from 'clsx';

const REPORT_TYPES = [
  { id: 'executive',   label: 'Executive summary',  desc: 'Plain-English overview for leadership' },
  { id: 'technical',   label: 'Technical deep-dive', desc: 'CVE analysis and attack vectors' },
  { id: 'remediation', label: 'Remediation plan',    desc: 'Prioritized fix steps with commands' },
  { id: 'full',        label: 'Full report',         desc: 'CISO-grade comprehensive output' },
];

const SAMPLES = {
  nmap: `Nmap scan report for 192.168.1.10\nPORT     STATE SERVICE    VERSION\n22/tcp   open  ssh        OpenSSH 7.2p2\n80/tcp   open  http       Apache httpd 2.4.18\n3306/tcp open  mysql      MySQL 5.5.62\n3389/tcp open  rdp        Microsoft Terminal Services`,
  cve: `Container: node:18-alpine\nCRITICAL\n  CVE-2021-44228 - log4j-core 2.14.1 - CVSS 10.0\n  CVE-2022-0778 - openssl 1.1.1k - CVSS 7.5\nHIGH\n  CVE-2021-45046 - log4j-core 2.14.1 - CVSS 9.0`,
  web: `Nikto v2.1.6 scan: https://target.example.com\n+ Server: Apache/2.4.18\n+ X-Frame-Options header not set\n+ /phpinfo.php accessible\n+ Default credentials admin/admin - LOGIN SUCCESSFUL`,
  nessus: `Host: 10.0.0.5\nPlugin 10758 (SSH Protocol v1) - CRITICAL\nPlugin 65057 (SMBv1 Enabled) - HIGH\nPlugin 51192 (SSL Certificate Expired) - MEDIUM`,
};

export default function GeneratePage() {
  const [scanText, setScanText] = useState('');
  const [reportType, setReportType] = useState('executive');
  const { loading, error, report, metadata, analyze, reset } = useReport();

  async function handleAnalyze() {
    if (!scanText.trim()) return;
    await analyze(scanText, reportType);
  }

  if (report) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-medium">Report generated</h2>
          <button onClick={reset} className="btn-secondary text-xs">New report</button>
        </div>
        <div className="card report-content overflow-auto max-h-[70vh] whitespace-pre-wrap text-sm text-gray-300 font-mono">
          {report}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Generate report</h1>
        <p className="text-sm text-gray-500 mt-1">Paste scan output and let Claude generate a structured security report.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Scan output</label>
          <textarea
            value={scanText}
            onChange={e => setScanText(e.target.value)}
            disabled={loading}
            placeholder="Paste Nmap, Nessus, Nikto, Trivy, or CVE list output here..."
            rows={10}
            className="w-full bg-bg-card border border-bg-border rounded-xl px-4 py-3 text-sm font-mono text-gray-300 placeholder-gray-600 resize-y focus:outline-none focus:border-accent-blue transition-colors disabled:opacity-50"
          />
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="text-xs text-gray-600">Samples:</span>
            {Object.entries(SAMPLES).map(([key, val]) => (
              <button key={key} onClick={() => setScanText(val)} disabled={loading}
                className="text-xs px-3 py-1 bg-bg-elevated border border-bg-border rounded-lg text-gray-400 hover:text-white transition-colors">
                {key}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Report type</label>
          <div className="grid grid-cols-2 gap-2">
            {REPORT_TYPES.map(rt => (
              <button key={rt.id} onClick={() => setReportType(rt.id)} disabled={loading}
                className={clsx('text-left px-4 py-3 rounded-xl border transition-colors',
                  reportType === rt.id
                    ? 'border-accent-red bg-red-950/20 text-white'
                    : 'border-bg-border bg-bg-card text-gray-400 hover:border-gray-600')}>
                <p className="text-sm font-medium">{rt.label}</p>
                <p className="text-xs text-gray-600 mt-0.5">{rt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 px-4 py-3 bg-red-950/30 border border-red-900/50 rounded-xl text-sm text-red-400">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Analysis failed</p>
              <p className="text-xs text-red-500/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <button onClick={handleAnalyze} disabled={loading || !scanText.trim()}
          className={clsx('w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-colors',
            loading || !scanText.trim() ? 'bg-bg-elevated text-gray-600 cursor-not-allowed' : 'bg-accent-red hover:bg-red-600 text-white')}>
          {loading
            ? <><Loader2 size={15} className="animate-spin" /> Analyzing with Claude...</>
            : <><Sparkles size={15} /> Analyze and generate report</>}
        </button>
      </div>
    </div>
  );
}
