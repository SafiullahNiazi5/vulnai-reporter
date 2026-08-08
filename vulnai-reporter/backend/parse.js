export const handler = async () => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  },
  body: JSON.stringify({
    status: 'ok',
    service: 'vulnai-reporter',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    region: process.env.AWS_REGION || 'unknown',
  }),
});
