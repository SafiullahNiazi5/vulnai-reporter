import { useState } from 'react';
import { Copy, Download, Check, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import SeverityBadge from './SeverityBadge.jsx';

function detectOverallSeverity(report) {
  const text = report.toLowerCase();
  if (text.includes('critical')) return 'critical';
  if (text.includes('high')) return 'high';
  if (text.includes('medium')) return 'medium';
  return 'low';
}

const REPORT_LABELS = {
  executive: 'Executive Summary',
  technical: 'Technical Assessment',
  remediation: 'Remediation Plan',
  full: 'Full Report',
};

export default function ReportOutput({ report, metadata, onReset }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vulnai-report-${metadata?.reportType || 'report'}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const severity = detectOverallSeverity(report);
  const generatedAt = metadata?.generatedAt ? format(new Date(metadata.generatedAt), 'MMM d, yyyy HH:mm') : null;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-5 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <FileText size={16} className="text-gray-400" />
          <div>
            <p className="text-sm font-medium text-white">{REPORT_LABELS[metadata?.reportType] || 'AI Report'}</p>
            <div className="flex items-center gap-2 mt-1">
              <SeverityBadge severity={severity} />
              {generatedAt && <span className="flex items-center gap-1 text-xs text-gray-600"><Clock size={10} />{generatedAt}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="btn-secondary text-xs py-1.5">
            {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
          <button onClick={handleDownload} className="btn-secondary text-xs py-1.5">
            <Download size={12} /> .md
          </button>
          <button onClick={onReset} className="btn-secondary text-xs py-1.5">New report</button>
        </div>
      </div>
      <div className="report-content max-h-[600px] overflow-y-auto pr-2 whitespace-pre-wrap text-sm text-gray-300 font-mono">
        {report}
      </div>
    </div>
  );
}
