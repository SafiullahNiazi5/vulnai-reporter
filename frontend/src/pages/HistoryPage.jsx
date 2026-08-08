import { format } from 'date-fns';
import { Trash2, Clock } from 'lucide-react';
import { useHistory } from '../hooks/useReport.js';
import SeverityBadge from '../components/SeverityBadge.jsx';

const REPORT_LABELS = {
  executive: 'Executive Summary',
  technical: 'Technical Assessment',
  remediation: 'Remediation Plan',
  full: 'Full Report',
};

function detectSeverity(preview) {
  const t = (preview || '').toLowerCase();
  if (t.includes('critical')) return 'critical';
  if (t.includes('high')) return 'high';
  if (t.includes('medium')) return 'medium';
  return 'low';
}

export default function HistoryPage() {
  const { history, remove, clear } = useHistory();

  if (history.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-7">
          <h1 className="text-xl font-semibold text-white">History</h1>
          <p className="text-sm text-gray-500 mt-1">Your recent reports are stored locally.</p>
        </div>
        <div className="card text-center py-12">
          <Clock size={28} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No reports generated yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-xl font-semibold text-white">History</h1>
          <p className="text-sm text-gray-500 mt-1">{history.length} report(s) stored locally.</p>
        </div>
        <button onClick={clear} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-red-400 transition-colors">
          <Trash2 size={13} /> Clear all
        </button>
      </div>
      <div className="space-y-2">
        {history.map((item) => (
          <div key={item.id} className="card-elevated flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <p className="text-sm font-medium text-white">{REPORT_LABELS[item.reportType] || item.reportType}</p>
                <SeverityBadge severity={detectSeverity(item.reportPreview)} />
              </div>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{item.reportPreview}…</p>
              <p className="text-xs text-gray-700 mt-1.5">{format(new Date(item.createdAt), 'MMM d, yyyy · HH:mm')}</p>
            </div>
            <button onClick={() => remove(item.id)} className="p-1.5 text-gray-700 hover:text-red-400 transition-colors shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
