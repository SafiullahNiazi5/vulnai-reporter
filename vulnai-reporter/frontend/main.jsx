import { useState, useCallback } from 'react';
import { analyzeVulnerabilities, parseScanFile } from '../utils/api.js';

const HISTORY_KEY = 'vulnai_history';

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveToHistory(entry) {
  const history = loadHistory();
  history.unshift({ ...entry, id: Date.now(), createdAt: new Date().toISOString() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50))); // keep last 50
}

export function useReport() {
  const [state, setState] = useState({
    loading: false,
    error: null,
    report: null,
    metadata: null,
    parsedFindings: null,
  });

  const analyze = useCallback(async (scanText, reportType, scanFormat = 'auto') => {
    setState({ loading: true, error: null, report: null, metadata: null, parsedFindings: null });

    try {
      const result = await analyzeVulnerabilities(scanText, reportType, scanFormat);
      setState({ loading: false, error: null, report: result.report, metadata: result.metadata, parsedFindings: null });

      // Save to history
      saveToHistory({
        reportType,
        detectedFormat: result.metadata?.detectedFormat,
        reportPreview: result.report.substring(0, 200),
        inputLength: scanText.length,
      });

      return result;
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
      throw err;
    }
  }, []);

  const parseFile = useCallback(async (content, format = 'auto') => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await parseScanFile(content, format);
      setState((s) => ({ ...s, loading: false, parsedFindings: result }));
      return result;
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, report: null, metadata: null, parsedFindings: null });
  }, []);

  return { ...state, analyze, parseFile, reset };
}

export function useHistory() {
  const [history, setHistory] = useState(loadHistory);

  const refresh = useCallback(() => setHistory(loadHistory()), []);

  const remove = useCallback((id) => {
    const updated = loadHistory().filter((h) => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    setHistory(updated);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }, []);

  return { history, refresh, remove, clear };
}
