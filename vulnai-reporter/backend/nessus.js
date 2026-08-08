export function parseTrivyJson(jsonContent) {
  let data;
  try {
    data = JSON.parse(jsonContent);
  } catch {
    throw new Error('Invalid JSON content');
  }

  // Trivy can output { Results: [...] } or a raw array
  const results = data.Results || (Array.isArray(data) ? data : [data]);
  const findings = [];
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  const targets = [];

  for (const result of results) {
    if (result.Target) targets.push(result.Target);
    const vulns = result.Vulnerabilities || [];

    for (const v of vulns) {
      const severity = (v.Severity || 'UNKNOWN').toLowerCase();
      if (!['critical', 'high', 'medium', 'low'].includes(severity)) continue;

      findings.push({
        id: v.VulnerabilityID,
        name: v.Title || v.VulnerabilityID,
        severity,
        cvss: v.CVSS?.nvd?.V3Score || v.CVSS?.redhat?.V3Score || 0,
        cve: v.VulnerabilityID?.startsWith('CVE-') ? v.VulnerabilityID : null,
        host: result.Target || 'container',
        package: v.PkgName,
        installedVersion: v.InstalledVersion,
        fixedVersion: v.FixedVersion || null,
        description: v.Description || '',
        references: v.References || [],
        publishedDate: v.PublishedDate || null,
      });

      counts[severity] = (counts[severity] || 0) + 1;
    }
  }

  const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  findings.sort((a, b) => (sevOrder[a.severity] ?? 4) - (sevOrder[b.severity] ?? 4));

  return {
    findings,
    summary: counts,
    targets: [...new Set(targets)],
    totalFindings: findings.length,
    hasExploitableVulns: findings.some((f) => f.severity === 'critical'),
  };
}
