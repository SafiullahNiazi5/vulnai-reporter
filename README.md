# VulnAI Reporter

AI-powered vulnerability report generator. Paste scan output from Nmap, Nessus, OpenVAS, Nikto, or Trivy — get executive summaries, technical deep-dives, and remediation plans powered by Claude.

## Architecture

```
┌─────────────────────────────────────┐
│         React Frontend              │
│  (Vite + TailwindCSS + Shadcn/ui)  │
│  Deployed: Vercel / S3 + CloudFront │
└────────────┬────────────────────────┘
             │ HTTPS (API Gateway URL)
┌────────────▼────────────────────────┐
│       AWS API Gateway               │
│  POST /analyze  POST /parse         │
└────────────┬────────────────────────┘
             │ Lambda Proxy Integration
┌────────────▼────────────────────────┐
│       AWS Lambda Functions          │
│  analyze.js — Claude API call       │
│  parse.js   — XML/JSON parser       │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│       Anthropic Claude API          │
│  claude-sonnet-4-6                  │
└─────────────────────────────────────┘
```

## Stack

| Layer      | Tech                                      |
|------------|-------------------------------------------|
| Frontend   | React 18, Vite, TailwindCSS, Shadcn/ui   |
| Backend    | AWS Lambda (Node 20), API Gateway HTTP    |
| AI         | Claude claude-sonnet-4-6 via Anthropic SDK        |
| Deploy     | Serverless Framework or SAM               |
| Secrets    | AWS SSM Parameter Store                   |

## Quick Start

### 1. Backend (AWS Lambda)

```bash
cd backend
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Deploy to AWS
npm run deploy

# Test locally
npm run dev   # starts local Lambda at http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_BASE_URL to your API Gateway URL

npm run dev   # http://localhost:5173
npm run build # production build
```

## Environment Variables

### Backend (Lambda — stored in AWS SSM)
```
ANTHROPIC_API_KEY=sk-ant-...
ALLOWED_ORIGIN=https://your-frontend.vercel.app
```

### Frontend
```
VITE_API_BASE_URL=https://xxxx.execute-api.us-east-1.amazonaws.com
```

## API Endpoints

### POST /analyze
Analyze raw scan text and return a formatted report.

**Request:**
```json
{
  "scanText": "Nmap scan report...",
  "reportType": "executive | technical | remediation | full",
  "scanFormat": "auto | nmap | nessus | nikto | cve | trivy"
}
```

**Response (streaming):**
```
data: {"chunk": "## Risk Overview\n\n"}
data: {"chunk": "Your environment shows..."}
data: [DONE]
```

### POST /parse
Parse structured scan files (Nessus XML, Trivy JSON) into normalized format.

**Request:**
```json
{
  "content": "<NessusClientData_v2>...",
  "format": "nessus | trivy | openvas"
}
```

**Response:**
```json
{
  "findings": [...],
  "summary": { "critical": 2, "high": 5, "medium": 8, "low": 3 },
  "targets": ["192.168.1.10"]
}
```

## Project Structure

```
vulnai-reporter/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Helpers, format parsers
│   ├── index.html
│   └── vite.config.js
├── backend/
│   ├── functions/
│   │   ├── analyze.js        # Main Claude API handler
│   │   └── parse.js          # File parser handler
│   ├── parsers/
│   │   ├── nessus.js         # Nessus XML → findings[]
│   │   ├── trivy.js          # Trivy JSON → findings[]
│   │   └── nmap.js           # Nmap → findings[]
│   └── serverless.yml        # Serverless Framework config
└── infrastructure/
    └── template.yaml         # AWS SAM template (alternative)
```
