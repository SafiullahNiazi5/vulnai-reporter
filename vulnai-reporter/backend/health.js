import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// CORS headers applied to every response
const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
});

// System prompts per report type
const SYSTEM_PROMPTS = {
  executive: `You are a senior cybersecurity analyst presenting to a board of directors. 
Analyze the vulnerability scan output and produce a clear executive summary.

Structure your response with these exact sections:
## Risk Overview
One paragraph on overall risk posture. Start with a single risk rating: CRITICAL / HIGH / MEDIUM / LOW.

## Key Findings
3-5 bullet points on the most critical issues. Plain English, no jargon. Each bullet on its own line starting with •.

## Business Impact  
What could happen if these vulnerabilities are exploited? Think data breach, downtime, compliance fines, reputation.

## Recommended Actions
Numbered priority list. What to do first, second, third. Time-bound where possible.

Keep language clear and concise. No CVE numbers, no commands, no technical jargon.`,

  technical: `You are a senior penetration tester writing for a technical security team.
Analyze the vulnerability scan output and produce a technical assessment.

Structure your response with these exact sections:
## Vulnerability Inventory
Table or list of every finding: Name | CVE | CVSS | Component | Severity

## Attack Vectors
For each Critical and High finding: describe the full exploitation scenario. Include prerequisites, steps, and likely outcome.

## Risk Scoring
CVSS-weighted overall score. Explain the calculation.

## Technical Evidence
What in the scan output confirms each finding. Reference specific ports, versions, plugin IDs.

## Proof-of-Concept References
Known public exploits or PoC tools for the critical findings (reference only, no exploit code).

Be precise. Use CVE numbers. Reference CVSS v3 scores. Reference MITRE ATT&CK tactics where applicable.`,

  remediation: `You are a DevSecOps engineer writing a remediation runbook.
Analyze the vulnerability scan output and produce a prioritized fix plan.

Structure your response with these exact sections:
## Immediate Actions (0-24 hours)
Critical vulnerabilities requiring emergency response. For each:
- Issue: what is vulnerable
- Fix: exact command or config change
- Verify: how to confirm it worked

## Short-Term Fixes (1-7 days)  
High severity items. Same format as above.

## Medium-Term Hardening (7-30 days)
Medium/low items and security hygiene improvements. Same format.

## Verification Checklist
A checklist the team can tick off as they complete each remediation.

Provide exact shell commands, package versions, and config snippets where applicable. Assume a Linux/Ubuntu environment unless the scan suggests otherwise.`,

  full: `You are a CISO writing a formal security assessment report.
Analyze the vulnerability scan output and produce a comprehensive report.

Structure your response with these exact sections:
## Executive Summary
2-3 sentences. Overall risk level. Recommended immediate action.

## Assessment Scope
What assets and services were scanned based on the output.

## Findings Detail
For every finding:
**[SEV] Finding Name**
- CVE: CVE-XXXX-XXXX (if applicable)
- CVSS: X.X (Critical/High/Medium/Low)
- Asset: affected host/service
- Description: what the vulnerability is
- Exploitation Risk: realistic attack scenario
- Remediation: specific fix

Group by severity: Critical → High → Medium → Low.

## Risk Summary Matrix
| Severity | Count | % of Total |
|----------|-------|------------|
| Critical | X | X% |
...

## Remediation Roadmap
Phase 1 (emergency), Phase 2 (short-term), Phase 3 (hardening) with timelines.

## Conclusion
Overall posture, risk acceptance recommendation, suggested re-scan timeline.`,
};

// Detect scan format from content
function detectFormat(scanText) {
  if (scanText.includes('NessusClientData') || scanText.includes('Plugin ID')) return 'nessus';
  if (scanText.includes('Nmap scan report') || scanText.match(/\d+\/tcp/)) return 'nmap';
  if (scanText.includes('Nikto') || scanText.includes('OSVDB')) return 'nikto';
  if (scanText.includes('CVE-') && scanText.includes('CVSS')) return 'cve-list';
  if (scanText.includes('"Vulnerabilities"') || scanText.includes('"Results"')) return 'trivy';
  return 'generic';
}

export const handler = async (event) => {
  // Handle OPTIONS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { scanText, reportType = 'executive', scanFormat = 'auto' } = body;

  if (!scanText || typeof scanText !== 'string' || scanText.trim().length < 10) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'scanText is required and must be at least 10 characters' }),
    };
  }

  if (!SYSTEM_PROMPTS[reportType]) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Invalid reportType. Must be one of: ${Object.keys(SYSTEM_PROMPTS).join(', ')}` }),
    };
  }

  const detectedFormat = scanFormat === 'auto' ? detectFormat(scanText) : scanFormat;
  const systemPrompt = SYSTEM_PROMPTS[reportType];

  const userMessage = `Analyze the following ${detectedFormat} vulnerability scan output and generate the requested report.

<scan_output>
${scanText.substring(0, 8000)} 
</scan_output>

Generate a thorough ${reportType} report based on the findings above.`;

  // Collect full response (Lambda doesn't support true HTTP streaming)
  // For streaming, use Lambda Function URLs with RESPONSE_STREAM
  let fullText = '';
  try {
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
        fullText += chunk.delta.text;
      }
    }
  } catch (err) {
    console.error('Claude API error:', err);
    return {
      statusCode: 502,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to generate report', detail: err.message }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json',
      'X-Report-Type': reportType,
      'X-Scan-Format': detectedFormat,
    },
    body: JSON.stringify({
      report: fullText,
      metadata: {
        reportType,
        detectedFormat,
        generatedAt: new Date().toISOString(),
        inputLength: scanText.length,
      },
    }),
  };
};
