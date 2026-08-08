const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function analyzeVulnerabilities(scanText, reportType = 'executive', scanFormat = 'auto') {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scanText, reportType, scanFormat }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function parseScanFile(content, format = 'auto') {
  const res = await fetch(`${BASE_URL}/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, format }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Parse failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}
