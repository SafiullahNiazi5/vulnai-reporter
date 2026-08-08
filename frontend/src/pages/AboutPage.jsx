@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-bg text-gray-100 font-sans antialiased;
    font-family: 'Inter', system-ui, sans-serif;
  }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { @apply bg-bg-border rounded-full; }
  ::-webkit-scrollbar-thumb:hover { @apply bg-gray-600; }
}

@layer components {
  .card {
    @apply bg-bg-card border border-bg-border rounded-xl p-5;
  }
  .card-elevated {
    @apply bg-bg-elevated border border-bg-border rounded-xl p-5;
  }
  .btn-primary {
    @apply flex items-center gap-2 px-4 py-2.5 bg-accent-red hover:bg-accent-red-dim
           text-white font-medium rounded-lg transition-colors text-sm;
  }
  .btn-secondary {
    @apply flex items-center gap-2 px-4 py-2.5 bg-bg-elevated hover:bg-bg-border
           text-gray-300 hover:text-white border border-bg-border font-medium rounded-lg
           transition-colors text-sm;
  }
  .sev-badge {
    @apply inline-flex items-center px-2 py-0.5 rounded text-xs font-medium;
  }
  .sev-critical { @apply bg-red-950 text-red-400 border border-red-900; }
  .sev-high     { @apply bg-orange-950 text-orange-400 border border-orange-900; }
  .sev-medium   { @apply bg-yellow-950 text-yellow-400 border border-yellow-900; }
  .sev-low      { @apply bg-green-950 text-green-400 border border-green-900; }
  .sev-info     { @apply bg-gray-800 text-gray-400 border border-gray-700; }
}

/* Markdown report output styling */
.report-content h2 {
  @apply text-lg font-semibold text-white mt-6 mb-3 pb-2 border-b border-bg-border;
}
.report-content h3 {
  @apply text-base font-medium text-gray-200 mt-4 mb-2;
}
.report-content p {
  @apply text-gray-300 leading-relaxed mb-3;
}
.report-content ul {
  @apply space-y-1 mb-4;
}
.report-content li {
  @apply text-gray-300 leading-relaxed pl-1;
}
.report-content strong {
  @apply text-white font-medium;
}
.report-content table {
  @apply w-full text-sm border-collapse mb-4;
}
.report-content th {
  @apply text-left text-gray-400 font-medium px-3 py-2 border-b border-bg-border;
}
.report-content td {
  @apply text-gray-300 px-3 py-2 border-b border-bg-border;
}
.report-content code {
  @apply bg-bg-elevated text-green-400 font-mono text-xs px-1.5 py-0.5 rounded;
}
.report-content pre {
  @apply bg-bg-elevated rounded-lg p-4 overflow-x-auto mb-4;
}
.report-content pre code {
  @apply bg-transparent p-0 text-sm;
}
