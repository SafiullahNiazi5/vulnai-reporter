import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const ACCEPTED = {
  'text/xml': ['.xml', '.nessus'],
  'application/xml': ['.xml'],
  'application/json': ['.json'],
  'text/plain': ['.txt', '.log', '.nmap'],
};

const SAMPLES = {
  nmap: {
    label: 'Nmap scan',
    icon: '🔍',
    text: `Nmap scan report for 192.168.1.10
Host is up (0.0023s latency).
PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 7.2p2 (protocol 2.0)
80/tcp   open  http       Apache httpd 2.4.18
443/tcp  open  https      Apache httpd 2.4.18
3306/tcp open  mysql      MySQL 5.5.62
3389/tcp open  rdp        Microsoft Terminal Services
5900/tcp open  vnc        VNC (protocol 3.8)
27017/tcp open mongodb    MongoDB 3.6.0`,
  },
  cve: {
    label: 'CVE list (Trivy)',
    icon: '📦',
    text: `Container: node:18-alpine
CRITICAL
  CVE-2021-44228 (Log4Shell) - log4j-core 2.14.1 - CVSS 10.0
  CVE-2022-0778 - openssl 1.1.1k - CVSS 7.5
  CVE-2021-3711 - openssl 1.1.1k - CVSS 9.8

HIGH
  CVE-2021-45046 - log4j-core 2.14.1 - CVSS 9.0
  CVE-2022-1292 - openssl 1.1.1n - CVSS 8.8

MEDIUM
  CVE-2022-25235 - expat 2.2.9 - CVSS 6.5
  CVE-2022-25236 - expat 2.2.9 - CVSS 6.5`,
  },
  web: {
    label: 'Nikto / web',
    icon: '🌐',
    text: `Nikto v2.1.6 scan: https://target.example.com
+ Server: Apache/2.4.18 (Ubuntu)
+ OSVDB-3092: /admin/ directory found
+ X-Frame-Options header not set
+ X-XSS-Protection header not set
+ Content-Security-Policy header not set
+ /phpinfo.php accessible
+ HTTP TRACE method enabled (XST risk)
+ Default credentials admin/admin - LOGIN SUCCESSFUL
+ Outdated PHP version: 5.6.40`,
  },
  nessus: {
    label: 'Nessus findings',
    icon: '🛡️',
    text: `Host: 10.0.0.5 | Policy: Full and Fast
Plugin 10758 (SSH Protocol v1) - CRITICAL
  SSH server supports v1 protocol, susceptible to MITM.
Plugin 65057 (SMBv1 Enabled) - HIGH
  EternalBlue exploit vector. MS17-010 not patched.
Plugin 51192 (SSL Certificate Expired) - MEDIUM
  Certificate expired 2021-06-01.
Plugin 57608 (SMB Signing Disabled) - LOW
  Relay attacks possible.`,
  },
};

export default function ScanInput({ value, onChange, onFileParsed, disabled }) {
  const [fileInfo, setFileInfo] = useState(null);
  const [fileError, setFileError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    setFileError(null);
    const file = acceptedFiles[0];
    if (!file) return;

    setFileInfo({ name: file.name, size: file.size });
    const text = await file.text();

    // If it looks like XML/JSON send to parse endpoint; otherwise use as raw text
    const isStructured = text.trim().startsWith('<') || text.trim().startsWith('{') || text.trim().startsWith('[');
    if (isStructured && onFileParsed) {
      try {
        await onFileParsed(text);
      } catch {
        setFileError('Could not parse this file. Using raw text mode.');
        onChange(text);
      }
    } else {
      onChange(text);
    }
  }, [onChange, onFileParsed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled,
  });

  function clearFile() {
    setFileInfo(null);
    setFileError(null);
    onChange('');
  }

  return (
    <div className="space-y-3">
      {/* Textarea */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Paste scan output here — Nmap, Nessus, Nikto, Trivy, CVE list..."
          rows={10}
          className="w-full bg-bg-card border border-bg-border rounded-xl px-4 py-3 text-sm
                     font-mono text-gray-300 placeholder-gray-600 resize-y
                     focus:outline-none focus:border-accent-blue transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {value && (
          <button
            onClick={clearFile}
            className="absolute top-3 right-3 p-1 rounded text-gray-600 hover:text-gray-400 transition-colors"
            title="Clear input"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={clsx(
          'border border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-accent-blue bg-blue-950/20 text-blue-400'
            : 'border-bg-border hover:border-gray-600 text-gray-600'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex items-center justify-center gap-2 text-sm">
          <Upload size={14} />
          {isDragActive
            ? 'Drop it here...'
            : fileInfo
            ? (
              <span className="flex items-center gap-2">
                <FileText size={14} />
                {fileInfo.name} ({(fileInfo.size / 1024).toFixed(1)} KB)
                <button
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="text-gray-500 hover:text-white"
                >
                  <X size={12} />
                </button>
              </span>
            )
            : 'Drop a Nessus .xml, Trivy .json, or Nmap .xml file here'}
        </div>
        {fileError && (
          <p className="mt-2 text-xs text-yellow-500 flex items-center justify-center gap-1">
            <AlertCircle size={12} /> {fileError}
          </p>
        )}
      </div>

      {/* Sample loaders */}
      <div>
        <p className="text-xs text-gray-600 mb-2">Load a sample:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SAMPLES).map(([key, { label, icon }]) => (
            <button
              key={key}
              onClick={() => { onChange(SAMPLES[key].text); setFileInfo(null); }}
              disabled={disabled}
              className="text-xs px-3 py-1.5 bg-bg-elevated border border-bg-border rounded-lg
                         text-gray-400 hover:text-white hover:border-gray-500 transition-colors
                         disabled:opacity-40"
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
