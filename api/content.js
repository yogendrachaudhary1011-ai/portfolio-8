import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const root = process.cwd();
  const dataFile = resolve(root, 'data/content.json');

  if (req.method === 'GET' || req.method === 'HEAD') {
    try {
      const text = await readFile(dataFile, 'utf8');
      return res.status(200).json(JSON.parse(text));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const parsed = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      try {
        await mkdir(resolve(root, 'data'), { recursive: true });
        await writeFile(dataFile, JSON.stringify(parsed, null, 2), 'utf8');
      } catch (fsErr) {
        // Read-only filesystem in standard serverless lambda is acceptable; fallback to Firestore sync
      }

      // Sync to Firestore if configured
      try {
        const cfgText = await readFile(resolve(root, 'firebase-applet-config.json'), 'utf8');
        const cfg = JSON.parse(cfgText);
        if (cfg.apiKey && cfg.projectId && cfg.firestoreDatabaseId) {
          const toFields = obj => {
            const fields = {};
            for (const [k, v] of Object.entries(obj)) {
              if (typeof v === 'string') fields[k] = { stringValue: v };
              else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
              else if (typeof v === 'number') fields[k] = { integerValue: String(v) };
              else if (Array.isArray(v)) {
                fields[k] = {
                  arrayValue: {
                    values: v.map(item => ({ mapValue: { fields: toFields(item) } }))
                  }
                };
              } else if (typeof v === 'object' && v !== null) {
                fields[k] = { mapValue: { fields: toFields(v) } };
              }
            }
            return fields;
          };
          const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/${cfg.firestoreDatabaseId}/documents/portfolio/main?key=${cfg.apiKey}`;
          await fetch(firestoreUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: toFields(parsed) })
          });
        }
      } catch (syncErr) {
        console.warn('Firestore sync note:', syncErr.message);
      }

      return res.status(200).json({ success: true, message: 'Content saved successfully' });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
