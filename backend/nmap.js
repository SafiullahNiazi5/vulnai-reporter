import { XMLParser } from 'fast-xml-parser';

const SEVERITY_MAP = { 0: 'info', 1: 'low', 2: 'medium', 3: 'high', 4: 'critical' };

export function parseNessus(xmlContent) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (name) => ['ReportHost', 'ReportItem'].includes(name),
  });

  const parsed = parser.parse(xmlContent);
  const report = parsed?.NessusClientData_v2?.Report;

  if (!report) throw new Error('No Report element found in Nessus XML');

  const findings = [];
  const targets = [];
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };

  const hosts = Array.isArray(report.ReportHost) ? report.ReportHost : [report.ReportHost];

  for (const host of hosts) {
    const hostname = host['@_name'] || 'unknown';
    targets.push(hostname);

    const items = host.ReportItem || [];
    const itemArr = Array.isArray(items) ? items : [items];

    for (const item of itemArr) {
      const sev = parseInt(item['@_severity'] || '0', 10);
      const severity = SEVERITY_MAP[sev] || 'info';

      if (sev === 0) continue; // skip informational

      const finding = {
        id: item['@_pluginID'],
        name: item['@_pluginName'] || 'Unknown',
        severity,
        cvss: parseFloat(item.cvss3_base_score || item.cvss_base_score || '0'),
        cve: item.cve || null,
        host: hostname,
        port: item['@_port'] ? parseInt(item['@_port'], 10) : null,
        protocol: item['@_protocol'] || null,
        service: item['@_svc_name'] || null,
        description: item.description || '',
        solution: item.solution || '',
        pluginFamily: item['@_pluginFamily'] || '',
        riskFactor: item.risk_factor || severity,
        exploitAvailable: item.exploit_available === 'true',
        patchPublicationDate: item.patch_publication_date || null,
      };

      findings.push(finding);
      counts[severity] = (counts[severity] || 0) + 1;
    }
  }

  // Sort by severity (critical first)
  const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  findings.sort((a, b) => (sevOrder[a.severity] ?? 4) - (sevOrder[b.severity] ?? 4));

  return {
    findings,
    summary: counts,
    targets: [...new Set(targets)],
    totalFindings: findings.length,
    hasExploitableVulns: findings.some((f) => f.exploitAvailable),
  };
}
