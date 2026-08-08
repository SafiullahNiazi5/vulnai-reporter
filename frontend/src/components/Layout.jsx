import clsx from 'clsx';

const CLASSES = {
  critical: 'sev-badge sev-critical',
  high:     'sev-badge sev-high',
  medium:   'sev-badge sev-medium',
  low:      'sev-badge sev-low',
  info:     'sev-badge sev-info',
};

export default function SeverityBadge({ severity, className }) {
  const s = (severity || 'info').toLowerCase();
  return (
    <span className={clsx(CLASSES[s] || CLASSES.info, className)}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}
