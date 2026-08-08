import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
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
    <div className="card animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 pb-4 border-b border-bg-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-bg-elevated flex items-center justify-center">
            <FileText size={16} className="text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {REPORT_LABELS[metadata?.reportType] || 'AI Report'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <SeverityBadge severity={severity} />
              {metadata?.detectedFormat && (
                <span className="text-xs text-gray-600 bg-bg-elevated px-2 py-0.5 rounded font-mono">
                  {metadata.detectedFormat}
                </span>
              )}
              {generatedAt && (
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <Clock size={10} /> {generatedAt}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="btn-secondary text-xs py-1.5">
            {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
          <button onClick={handleDownload} className="btn-secondary text-xs py-1.5">
            <Download size={12} /> Download .md
          </button>
          <button onClick={onReset} className="btn-secondary text-xs py-1.5">
            New report
          </button>
        </div>
      </div>

      {/* Report markdown */}
      <div className="report-content max-h-[600px] overflow-y-auto pr-2">
        <ReactMarkdown>{report}</ReactMarkdown>
      </div>
    </div>
  );
}
