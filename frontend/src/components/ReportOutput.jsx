import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import SeverityBadge from './SeverityBadge.jsx';

export default function FindingsTable({ findings, summary }) {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');

  const severities = ['critical', 'high', 'medium', 'low'];
  const filtered = filter === 'all' ? findings : findings.filter((f) => f.severity === filter);

  return (
    <div className="card">
      {/* Summary counts */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {severities.map((sev) => (
          <button
            key={sev}
            onClick={() => setFilter(filter === sev ? 'all' : sev)}
            className={`p-3 rounded-lg border text-center transition-colors ${
              filter === sev ? 'border-current' : 'border-bg-border hover:border-gray-600'
            }`}
          >
            <p className={`text-xl font-semibold ${
              sev === 'critical' ? 'text-red-400' :
              sev === 'high' ? 'text-orange-400' :
              sev === 'medium' ? 'text-yellow-400' : 'text-green-400'
            }`}>{summary?.[sev] || 0}</p>
            <p className="text-xs text-gray-500 capitalize mt-0.5">{sev}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="space-y-1">
        {filtered.length === 0 && (
          <p className="text-center text-gray-600 text-sm py-6">No findings for this filter.</p>
        )}
        {filtered.map((f, i) => (
          <div key={f.id || i} className="border border-bg-border rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 bg-bg-elevated hover:bg-bg-border
                         text-left transition-colors"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              {expanded === i ? <ChevronDown size={14} className="text-gray-500 shrink-0" /> : <ChevronRight size={14} className="text-gray-500 shrink-0" />}
              <SeverityBadge severity={f.severity} />
              <span className="text-sm text-white font-medium flex-1 truncate">{f.name}</span>
              <span className="text-xs text-gray-500 font-mono shrink-0">{f.host}</span>
              {f.cvss > 0 && (
                <span className="text-xs text-gray-500 shrink-0">CVSS {f.cvss.toFixed(1)}</span>
              )}
            </button>

            {expanded === i && (
              <div className="px-4 py-3 bg-bg-card border-t border-bg-border text-sm space-y-2">
                {f.cve && (
                  <p className="text-gray-400">
                    <span className="text-gray-600">CVE: </span>
                    <span className="font-mono text-blue-400">{f.cve}</span>
                  </p>
                )}
                {f.port && (
                  <p className="text-gray-400">
                    <span className="text-gray-600">Port: </span>
                    <span className="font-mono">{f.port}/{f.protocol}</span>
                    {f.service && <span className="text-gray-600"> ({f.service})</span>}
                  </p>
                )}
                {f.package && (
                  <p className="text-gray-400">
                    <span className="text-gray-600">Package: </span>
                    <span className="font-mono">{f.package} {f.installedVersion}</span>
                    {f.fixedVersion && <span className="text-green-500"> → {f.fixedVersion}</span>}
                  </p>
                )}
                {f.description && (
                  <p className="text-gray-400 leading-relaxed">{f.description}</p>
                )}
                {f.solution && (
                  <div className="mt-2 p-3 bg-green-950/20 border border-green-900/30 rounded-lg">
                    <p className="text-xs text-green-600 font-medium mb-1">Recommended fix</p>
                    <p className="text-gray-400 text-xs leading-relaxed">{f.solution}</p>
                  </div>
                )}
                {f.exploitAvailable && (
                  <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-950/30 border border-red-900/30 px-2 py-1 rounded">
                    ⚠ Public exploit available
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
