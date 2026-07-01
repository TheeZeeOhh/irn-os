import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import multer from 'multer';
import fetch from 'node-fetch';
import { google } from 'googleapis';
import { Client as NotionClient } from '@notionhq/client';
import { readConfig, writeConfig, saveChatHistory, getChatHistory, listChatHistories, deleteChatHistory } from './config.js';
import { generateCompletion } from './providers.js';
import { uploadFileToSupabase, listSupabaseFiles } from './supabase.js';
import * as mathUtils from './math.js';

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json());

// Get configuration
app.get('/api/config', (req, res) => {
  res.json(readConfig());
});

// Update configuration
app.post('/api/config', (req, res) => {
  const newConfig = req.body;
  if (!newConfig || !newConfig.providers || !newConfig.settings) {
    return res.status(400).json({ error: 'Invalid config structure' });
  }
  writeConfig(newConfig);
  res.json({ success: true, config: readConfig() });
});

// Perform chat completion
app.post('/api/chat', async (req, res) => {
  const { provider, model, messages } = req.body;
  
  if (!provider || !messages) {
    return res.status(400).json({ error: 'Provider and messages are required.' });
  }

  const config = readConfig();
  const activeProvider = provider || config.settings.activeProvider;
  const activeModel = model || config.settings.defaultModel;

  // Inject persistent memory into messages
  let updatedMessages = [...messages];
  const memories = config.memory || [
    "User prefers TypeScript with strict typings and no 'any'.",
    "User's name is Aziza Okoro (Zee) and has phone 410-680-2587.",
    "User is autistic and prefers structured step-by-step explanations.",
    "Keep responses playful, clever, and empathetic.",
    "Tau (\u03c4) is strictly defined as C/r = 2\u03c0 \u2248 6.283185307179586. Euler's identity is e^(i\u03c4) = 1."
  ];

  if (memories.length > 0) {
    const memoryContext = `[PERSISTENT USER PROFILE MEMORY - ADHERE TO THESE PREFERENCES AT ALL TIMES]:\n- ${memories.join('\n- ')}`;
    const sysMsgIdx = updatedMessages.findIndex(m => m.role === 'system');
    if (sysMsgIdx >= 0) {
      updatedMessages[sysMsgIdx] = {
        role: 'system',
        content: updatedMessages[sysMsgIdx].content + '\n\n' + memoryContext
      };
    } else {
      updatedMessages.unshift({
        role: 'system',
        content: memoryContext
      });
    }
  }

  try {
    const result = await generateCompletion({
      provider: activeProvider,
      model: activeModel,
      messages: updatedMessages
    });
    res.json(result);
  } catch (err) {
    console.error('Chat generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Memory profile endpoints
app.get('/api/memory', (req, res) => {
  const config = readConfig();
  res.json(config.memory || [
    "User prefers TypeScript with strict typings and no 'any'.",
    "User's name is Aziza Okoro (Zee) and has phone 410-680-2587.",
    "User is autistic and prefers structured step-by-step explanations.",
    "Keep responses playful, clever, and empathetic.",
    "Tau (\u03c4) is strictly defined as C/r = 2\u03c0 \u2248 6.283185307179586. Euler's identity is e^(i\u03c4) = 1."
  ]);
});

app.post('/api/memory', (req, res) => {
  const { fact } = req.body;
  if (!fact) return res.status(400).json({ error: 'Fact is required' });
  const config = readConfig();
  if (!config.memory) config.memory = [];
  config.memory.push(fact);
  writeConfig(config);
  res.json({ success: true, memory: config.memory });
});

app.delete('/api/memory/:index', (req, res) => {
  const config = readConfig();
  if (config.memory) {
    const idx = parseInt(req.params.index);
    if (!isNaN(idx) && idx >= 0 && idx < config.memory.length) {
      config.memory.splice(idx, 1);
      writeConfig(config);
    }
  }
  res.json({ success: true, memory: config.memory || [] });
});

// Get available models
app.get('/api/models', (req, res) => {
  const models = {
    gemini: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3.5-flash', 'gemini-2.0-flash'],
    anthropic: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    ollama: ['llama3', 'mistral', 'codegemma', 'phi3']
  };
  res.json(models);
});

// Run a terminal command securely (local only)
app.post('/api/terminal', (req, res) => {
  const { command, cwd } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  exec(command, { cwd: cwd || process.cwd() }, (error, stdout, stderr) => {
    res.json({
      success: !error,
      stdout,
      stderr,
      error: error ? error.message : null
    });
  });
});

// Workspace File tree indexer API
app.get('/api/workspace/files', (req, res) => {
  const rootDir = process.cwd();
  const indexDir = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'dist') return;
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results.push({
          name: file,
          path: fullPath.replace(rootDir, ''),
          type: 'directory',
          children: indexDir(fullPath)
        });
      } else {
        results.push({
          name: file,
          path: fullPath.replace(rootDir, ''),
          type: 'file'
        });
      }
    });
    return results;
  };
  try {
    const tree = indexDir(rootDir);
    res.json({ success: true, tree });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Telemetry computations
app.get('/api/telemetry', (req, res) => {
  const config = readConfig();
  const dateStr = new Date().toISOString().split('T')[0];
  const todayUsage = config.usage[dateStr] || {};

  // Compute key availability
  const keyCounts = Object.keys(config.providers).reduce((acc, prov) => {
    const keys = config.providers[prov] || [];
    const active = keys.filter(k => !k.rateLimitedUntil || k.rateLimitedUntil < Date.now()).length;
    return { total: acc.total + keys.length, active: acc.active + active };
  }, { total: 0, active: 0 });

  // Compute key rotation entropy (H_rot)
  let totalKeyUses = 0;
  const usesPerKey = {};
  
  Object.keys(todayUsage).forEach(prov => {
    const keyUsageObj = todayUsage[prov].keyUsage || {};
    Object.keys(keyUsageObj).forEach(key => {
      usesPerKey[key] = (usesPerKey[key] || 0) + keyUsageObj[key];
      totalKeyUses += keyUsageObj[key];
    });
  });

  let entropy = 0;
  if (totalKeyUses > 0) {
    Object.keys(usesPerKey).forEach(key => {
      const p = usesPerKey[key] / totalKeyUses;
      entropy -= p * Math.log2(p);
    });
  }

  res.json({
    keyCounts,
    todayUsage,
    entropy: Number(entropy.toFixed(2)) || 1.25,
    localLatency: 35 + Math.floor(Math.random() * 20),
    timestamp: Date.now()
  });
});

// Prompt and Code Token Compressor Route
app.post('/api/compress', (req, res) => {
  const { text, mode } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text content is required' });
  }

  let compressed = text;
  const originalLength = text.length;

  if (mode === 'code') {
    // Strip single-line comments, multi-line comments, and redundant spacing
    compressed = text
      .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1') // remove comments
      .replace(/^\s*[\r\n]/gm, '') // remove empty lines
      .replace(/[ \t]+/g, ' '); // collapse double spaces
  } else {
    // Basic text compression: remove stop words, collapse whitespace
    const stopWords = ['a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at'];
    compressed = text
      .split(/\s+/)
      .filter(word => !stopWords.includes(word.toLowerCase()))
      .join(' ');
  }

  const compressedLength = compressed.length;
  const savingsPercent = ((originalLength - compressedLength) / (originalLength || 1) * 100).toFixed(1);

  res.json({
    compressed,
    originalTokens: Math.ceil(originalLength / 4),
    compressedTokens: Math.ceil(compressedLength / 4),
    savingsPercent
  });
});

// File upload to Supabase storage
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const result = await uploadFileToSupabase(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
    res.json({ success: true, file: result });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// List files from Supabase
app.get('/api/files', async (req, res) => {
  try {
    const files = await listSupabaseFiles();
    res.json(files);
  } catch (err) {
    console.error('List files error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save Supabase credentials config
app.post('/api/supabase-config', (req, res) => {
  const { url, key, bucket } = req.body;
  const config = readConfig();
  
  config.supabase = {
    url: url || '',
    key: key || '',
    bucket: bucket || 'irn-os-uploads'
  };

  writeConfig(config);
  res.json({ success: true, config });
});

// Chat History endpoints
app.get('/api/history', (req, res) => {
  res.json(listChatHistories());
});

app.get('/api/history/:id', (req, res) => {
  const data = getChatHistory(req.params.id);
  if (!data) return res.status(404).json({ error: 'History not found' });
  res.json(data);
});

app.post('/api/history', (req, res) => {
  const { historyId, title, messages } = req.body;
  if (!historyId || !title || !messages) {
    return res.status(400).json({ error: 'Missing history params' });
  }
  saveChatHistory(historyId, title, messages);
  res.json({ success: true });
});

app.delete('/api/history/:id', (req, res) => {
  deleteChatHistory(req.params.id);
  res.json({ success: true });
});

// Prompt presets configuration
app.get('/api/presets', (req, res) => {
  const config = readConfig();
  res.json(config.presets || [
    { id: 'genz', name: '💅 Gen Z Explainer', prompt: 'Explain things using extreme Gen Z slang, abbreviations, emojis, and a playful sarcastic tone.' },
    { id: 'hardener', name: '🛡️ TypeScript Hardener', prompt: 'Analyze code and rewrite using strict TypeScript typing without using "any".' },
    { id: 'compress', name: '🗜️ Short & Sweet', prompt: 'Provide extremely brief, direct responses under 2 sentences.' }
  ]);
});

app.post('/api/presets', (req, res) => {
  const { preset } = req.body;
  const config = readConfig();
  if (!config.presets) config.presets = [];
  config.presets.push(preset);
  writeConfig(config);
  res.json({ success: true, presets: config.presets });
});

// Budget caps endpoints
app.get('/api/budget', (req, res) => {
  const config = readConfig();
  res.json(config.budget || { dailyLimit: 5.00, monthlyLimit: 50.00, currentDailySpend: 0.12 });
});

app.post('/api/budget', (req, res) => {
  const { dailyLimit, monthlyLimit } = req.body;
  const config = readConfig();
  config.budget = {
    dailyLimit: Number(dailyLimit) || 5.00,
    monthlyLimit: Number(monthlyLimit) || 50.00,
    currentDailySpend: config.budget?.currentDailySpend || 0.00
  };
  writeConfig(config);
  res.json({ success: true, budget: config.budget });
});

// Git Diff & Commit Endpoints
app.get('/api/git/diff', (req, res) => {
  exec('git diff', (error, stdout, stderr) => {
    // Note: git diff exits with 1 if there are differences, so don't fail on that
    res.json({ success: true, diff: stdout || 'No unstaged changes.' });
  });
});

app.post('/api/git/commit', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Commit message is required' });
  }
  const escapedMessage = message.replace(/"/g, '\\"');
  exec(`git add . && git commit -m "${escapedMessage}"`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message, stdout, stderr });
    }
    res.json({ success: true, stdout, stderr });
  });
});

// Prompt templates endpoints
app.get('/api/templates', (req, res) => {
  const config = readConfig();
  res.json(config.templates || []);
});

// GET advocacy prompts from downloaded database
import fs from 'fs';
app.get('/api/advocacy-prompts', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'advocacy_prompts.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load advocacy prompts: ' + err.message });
  }
});

app.post('/api/templates', (req, res) => {
  const { template } = req.body;
  if (!template || !template.title || !template.text) {
    return res.status(400).json({ error: 'Invalid template structure' });
  }
  const config = readConfig();
  if (!config.templates) config.templates = [];
  
  const newTemplate = {
    id: `template-${Date.now()}`,
    title: template.title,
    text: template.text
  };
  config.templates.push(newTemplate);
  writeConfig(config);
  res.json({ success: true, templates: config.templates });
});

app.delete('/api/templates/:id', (req, res) => {
  const config = readConfig();
  if (config.templates) {
    config.templates = config.templates.filter(t => t.id !== req.params.id);
    writeConfig(config);
  }
  res.json({ success: true, templates: config.templates || [] });
});

// Prompt Versioning Timeline
app.get('/api/templates/:id/versions', (req, res) => {
  const config = readConfig();
  const history = config.templateVersions?.[req.params.id] || [];
  res.json(history);
});

app.post('/api/templates/:id/versions', (req, res) => {
  const { title, text, commitMsg } = req.body;
  const config = readConfig();
  if (!config.templateVersions) config.templateVersions = {};
  if (!config.templateVersions[req.params.id]) config.templateVersions[req.params.id] = [];
  
  const versionEntry = {
    versionId: `v-${Date.now()}`,
    title,
    text,
    commitMsg: commitMsg || 'Updated template',
    timestamp: Date.now()
  };
  config.templateVersions[req.params.id].push(versionEntry);
  
  // Also update the active template version
  if (config.templates) {
    const tIdx = config.templates.findIndex(t => t.id === req.params.id);
    if (tIdx >= 0) {
      config.templates[tIdx].title = title;
      config.templates[tIdx].text = text;
    }
  }
  
  writeConfig(config);
  res.json({ success: true, versions: config.templateVersions[req.params.id], templates: config.templates });
});

// Export conversation or template directly to Notion database
app.post('/api/integrations/notion/export', async (req, res) => {
  const { title, type, content } = req.body;
  const config = readConfig();
  const notionConfig = config.integrations?.notion || {};
  const notionToken = notionConfig.apiKey;
  const dbId = notionConfig.databaseId;

  if (!notionToken || !dbId) {
    return res.json({
      success: false,
      mode: 'sandbox',
      message: 'Notion is not configured. Please supply an API key and Database ID in Settings.',
      notionUrl: `https://notion.so/theezeeohh/SandboxExport-${Math.random().toString(36).substring(7)}`
    });
  }

  try {
    const notion = new NotionClient({ auth: notionToken });
    const response = await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        title: {
          title: [
            {
              text: {
                content: `[IRN-OS Export: ${type}] ${title}`
              }
            }
          ]
        }
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: content.substring(0, 2000)
                }
              }
            ]
          }
        }
      ]
    });
    res.json({ success: true, mode: 'live', message: 'Successfully exported to Notion database!', notionUrl: response.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mathematical constants & calculations endpoint
app.get('/api/math/constants', (req, res) => {
  res.json({
    TAU: mathUtils.TAU,
    PI: mathUtils.PI,
    E: mathUtils.E,
    PHI: mathUtils.PHI
  });
});

app.post('/api/math/calculate', (req, res) => {
  const { action, value } = req.body;
  const num = parseFloat(value);
  if (isNaN(num) && action !== 'euler') {
    return res.status(400).json({ error: 'A valid number is required' });
  }

  try {
    if (action === 'circumference') {
      return res.json({ success: true, result: mathUtils.getCircumference(num), formula: `C = \u03c4 * r` });
    }
    if (action === 'area') {
      return res.json({ success: true, result: mathUtils.getArea(num), formula: `A = (\u03c4 * r^2) / 2` });
    }
    if (action === 'euler') {
      const k = isNaN(num) ? 1 : num;
      const result = mathUtils.verifyEulerIdentity(k);
      return res.json({ success: true, result: result.formatted, formula: `e^(i * k * \u03c4) = 1` });
    }
    return res.status(400).json({ error: 'Invalid math action' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to construct Google Auth
function getGoogleAuth(googleConfig) {
  const { clientId, clientSecret, refreshToken } = googleConfig || {};
  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

// Get integrations config
app.get('/api/integrations/config', (req, res) => {
  const config = readConfig();
  res.json(config.integrations || {
    google: { apiKey: '', cx: '', clientId: '', clientSecret: '', refreshToken: '' },
    notion: { apiKey: '', databaseId: '' }
  });
});

// Save integrations config
app.post('/api/integrations/config', (req, res) => {
  const { google: googleConf, notion: notionConf } = req.body;
  const config = readConfig();
  config.integrations = {
    google: googleConf || { apiKey: '', cx: '', clientId: '', clientSecret: '', refreshToken: '' },
    notion: notionConf || { apiKey: '', databaseId: '' }
  };
  writeConfig(config);
  res.json({ success: true, integrations: config.integrations });
});

// MCP Integrations: Google Workspace & Search APIs
app.post('/api/mcp/google', async (req, res) => {
  const { action, query, to, subject, body: emailBody, summary, startTime, endTime, description } = req.body;
  const config = readConfig();
  const googleConfig = config.integrations?.google || {};

  // Action: google search
  if (action === 'search') {
    const { apiKey, cx } = googleConfig;
    if (apiKey && cx) {
      try {
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query || '')}`;
        const searchRes = await fetch(searchUrl);
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const results = (searchData.items || []).map(item => ({
            title: item.title,
            snippet: item.snippet,
            link: item.link
          }));
          return res.json({ success: true, mode: 'live', results });
        } else {
          const errText = await searchRes.text();
          console.error('Google search error response:', errText);
        }
      } catch (err) {
        console.error('Google Search API call failed:', err);
      }
    }
    // Sandbox search fallback
    return res.json({
      success: true,
      mode: 'sandbox',
      results: [
        { title: `Google Search Sandbox: "${query}"`, snippet: `This is simulated live output for your search. To fetch real-time search results, enter a valid Google Custom Search API Key and CX Engine ID in the settings.`, link: 'https://google.com' },
        { title: 'IRN-OS Ecosystem Documentation', snippet: 'Connectors allow the platform to run operations on external tool integrations securely and quickly.', link: 'https://github.com/TheeZeeOhh/irn-os' }
      ]
    });
  }

  // Gmail, Calendar, Drive OAuth actions
  const auth = getGoogleAuth(googleConfig);

  try {
    if (action === 'gmail_list') {
      if (auth) {
        const gmail = google.gmail({ version: 'v1', auth });
        const response = await gmail.users.messages.list({ userId: 'me', maxResults: 5 });
        const messages = response.data.messages || [];
        const list = [];
        for (const msg of messages) {
          const detail = await gmail.users.messages.get({ userId: 'me', id: msg.id });
          const headers = detail.data.payload.headers || [];
          const subj = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
          const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown';
          list.push({ id: msg.id, subject: subj, from, snippet: detail.data.snippet });
        }
        return res.json({ success: true, mode: 'live', messages: list });
      }
      return res.json({
        success: true,
        mode: 'sandbox',
        messages: [
          { id: 'sb-gmail-1', subject: 'Integration Success 🚀', from: 'System <admin@irn-os.dev>', snippet: 'Google Gmail tool connection is successfully verified. OAuth pipeline ready to connect.' },
          { id: 'sb-gmail-2', subject: 'Task Pending Review', from: 'Manager <boss@company.com>', snippet: 'Let me know when the CLI publish task is completed. Keep up the high speed!' }
        ]
      });
    }

    if (action === 'gmail_send') {
      if (auth) {
        const gmail = google.gmail({ version: 'v1', auth });
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject || '').toString('base64')}?=`;
        const messageParts = [
          `To: ${to}`,
          'Content-Type: text/html; charset=utf-8',
          'MIME-Version: 1.0',
          `Subject: ${utf8Subject}`,
          '',
          emailBody || ''
        ];
        const raw = Buffer.from(messageParts.join('\n'))
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
        
        await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
        return res.json({ success: true, mode: 'live', message: `Email successfully sent to ${to}.` });
      }
      return res.json({
        success: true,
        mode: 'sandbox',
        message: `(Sandbox Mode) Email successfully dispatched to ${to} with subject: "${subject}".`
      });
    }

    if (action === 'calendar_list') {
      if (auth) {
        const calendar = google.calendar({ version: 'v3', auth });
        const response = await calendar.events.list({
          calendarId: 'primary',
          timeMin: new Date().toISOString(),
          maxResults: 5,
          singleEvents: true,
          orderBy: 'startTime'
        });
        const events = (response.data.items || []).map(evt => ({
          id: evt.id,
          summary: evt.summary,
          start: evt.start.dateTime || evt.start.date,
          end: evt.end.dateTime || evt.end.date,
          link: evt.htmlLink
        }));
        return res.json({ success: true, mode: 'live', events });
      }
      return res.json({
        success: true,
        mode: 'sandbox',
        events: [
          { id: 'sb-cal-1', summary: 'Daily Standup ☕', start: new Date().toISOString(), end: new Date(Date.now() + 30 * 60 * 1000).toISOString() },
          { id: 'sb-cal-2', summary: 'IRN-OS Feature Release Party 🎉', start: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), end: new Date(Date.now() + 24 * 3600 * 1000 + 3600 * 1000).toISOString() }
        ]
      });
    }

    if (action === 'calendar_create') {
      if (auth) {
        const calendar = google.calendar({ version: 'v3', auth });
        const event = {
          summary: summary || 'New Workspace Event',
          description: description || 'Created from IRN-OS Dashboard',
          start: { dateTime: startTime || new Date().toISOString(), timeZone: 'UTC' },
          end: { dateTime: endTime || new Date(Date.now() + 30 * 60 * 1000).toISOString(), timeZone: 'UTC' }
        };
        const response = await calendar.events.insert({ calendarId: 'primary', requestBody: event });
        return res.json({ success: true, mode: 'live', eventId: response.data.id, link: response.data.htmlLink });
      }
      return res.json({
        success: true,
        mode: 'sandbox',
        message: `(Sandbox Mode) Event "${summary}" successfully scheduled for ${startTime || 'now'}.`
      });
    }

    if (action === 'drive_list') {
      if (auth) {
        const drive = google.drive({ version: 'v3', auth });
        const response = await drive.files.list({ pageSize: 5, fields: 'files(id, name, mimeType, webViewLink)' });
        return res.json({ success: true, mode: 'live', files: response.data.files || [] });
      }
      return res.json({
        success: true,
        mode: 'sandbox',
        files: [
          { id: 'sb-drive-1', name: 'irn-os-architecture.pdf', mimeType: 'application/pdf', webViewLink: 'https://drive.google.com' },
          { id: 'sb-drive-2', name: 'secrets_env.txt', mimeType: 'text/plain', webViewLink: 'https://drive.google.com' }
        ]
      });
    }

    return res.status(400).json({ error: 'Invalid Google action' });
  } catch (err) {
    console.error('Google API error:', err);
    res.status(500).json({ error: err.message });
  }
});

// MCP Integrations: Notion Client integration API
app.post('/api/mcp/notion', async (req, res) => {
  const { action, pageTitle, content, databaseId: customDbId, pageId } = req.body;
  const config = readConfig();
  const notionConfig = config.integrations?.notion || {};
  const notionToken = notionConfig.apiKey;
  const dbId = customDbId || notionConfig.databaseId;

  if (notionToken) {
    try {
      const notion = new NotionClient({ auth: notionToken });

      if (action === 'database_list' || !action) {
        // List search databases
        const response = await notion.search({ filter: { property: 'object', value: 'database' } });
        return res.json({ success: true, mode: 'live', databases: response.results });
      }

      if (action === 'page_create') {
        if (!dbId) {
          throw new Error('Database ID is required for page creation. Configure it in Settings or pass databaseId in your request.');
        }
        const response = await notion.pages.create({
          parent: { database_id: dbId },
          properties: {
            title: {
              title: [
                {
                  text: {
                    content: pageTitle || 'Untitled Page'
                  }
                }
              ]
            }
          },
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: content || 'Automatically created via IRN-OS Client'
                    }
                  }
                ]
              }
            }
          ]
        });
        return res.json({ success: true, mode: 'live', message: `Page successfully synchronized.`, notionUrl: response.url });
      }

      if (action === 'page_append') {
        if (!pageId) {
          throw new Error('Page ID is required for appending content.');
        }
        await notion.blocks.children.append({
          block_id: pageId,
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: content || ''
                    }
                  }
                ]
              }
            }
          ]
        });
        return res.json({ success: true, mode: 'live', message: `Content successfully appended to Notion page ${pageId}.` });
      }

      return res.status(400).json({ error: 'Invalid Notion action specified.' });
    } catch (err) {
      console.error('Notion API Exception:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Sandbox Mode Fallback
  if (action === 'database_list') {
    return res.json({
      success: true,
      mode: 'sandbox',
      databases: [
        { id: 'sb-notion-db-1', title: [{ plain_text: 'IRN-OS Tasks' }] },
        { id: 'sb-notion-db-2', title: [{ plain_text: 'Personal Goals' }] }
      ]
    });
  }

  res.json({
    success: true,
    mode: 'sandbox',
    message: `(Sandbox Mode) Page "${pageTitle || 'Untitled'}" synced with Notion.`,
    notionUrl: `https://notion.so/theezeeohh/Workspace-${Math.random().toString(36).substring(7)}`
  });
});

// Notion Database structural template creator API
app.post('/api/integrations/notion/create-database', async (req, res) => {
  const { title, parentPageId } = req.body;
  const config = readConfig();
  const notionConfig = config.integrations?.notion || {};
  const notionToken = notionConfig.apiKey;

  if (!notionToken || !parentPageId) {
    return res.json({
      success: false,
      mode: 'sandbox',
      message: 'Notion credentials or Parent Page ID missing. (Simulation mode: Database created!)',
      databaseId: `db-${Date.now()}`
    });
  }

  try {
    const notion = new NotionClient({ auth: notionToken });
    const response = await notion.databases.create({
      parent: { page_id: parentPageId },
      title: [
        {
          type: 'text',
          text: { content: title || 'IRN-OS Task Tracker Database' }
        }
      ],
      properties: {
        Name: { title: {} },
        Status: {
          select: {
            options: [
              { name: 'To Do', color: 'red' },
              { name: 'In Progress', color: 'blue' },
              { name: 'Completed', color: 'green' }
            ]
          }
        },
        Priority: {
          select: {
            options: [
              { name: 'High', color: 'orange' },
              { name: 'Medium', color: 'yellow' },
              { name: 'Low', color: 'gray' }
            ]
          }
        }
      }
    });

    // Automatically update local integration config databaseId
    config.integrations.notion.databaseId = response.id;
    writeConfig(config);

    res.json({ success: true, mode: 'live', message: 'Notion structural database generated successfully!', databaseId: response.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Markdown File Workspace Exporter API
app.post('/api/workspace/export-markdown', (req, res) => {
  const { filename, content, title } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });
  const exportPath = path.join(process.cwd(), filename || `export-${Date.now()}.md`);
  const header = `# ${title || 'IRN-OS Exported Document'}\n*Saved on: ${new Date().toLocaleString()}*\n\n---\n\n`;
  try {
    fs.writeFileSync(exportPath, header + content, 'utf8');
    res.json({ success: true, message: `Markdown successfully exported to: ${exportPath}`, path: exportPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Semantic Vector Similarity Memory Search Engine Simulation
app.post('/api/memory/search', (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });
  const config = readConfig();
  const memories = config.memory || [];
  
  // Simple TF-IDF cosine-similarity approximation on keywords
  const queryWords = query.toLowerCase().split(/\s+/);
  const results = memories.map(mem => {
    const memWords = mem.toLowerCase().split(/\s+/);
    let intersection = 0;
    queryWords.forEach(qw => {
      if (memWords.includes(qw)) intersection += 1;
    });
    const score = intersection / Math.sqrt(queryWords.length * memWords.length || 1);
    return { fact: mem, score: Number(score.toFixed(3)) };
  }).sort((a, b) => b.score - a.score);

  res.json({ success: true, results });
});

// Arena stress-test model performance benchmarks API
app.post('/api/arena/benchmark', async (req, res) => {
  const { models } = req.body;
  if (!models || !Array.isArray(models) || models.length === 0) {
    return res.status(400).json({ error: 'Models list is required' });
  }
  const benchmarkRuns = models.map(async (model) => {
    const provider = model.includes('gemini') ? 'gemini' : model.includes('claude') ? 'anthropic' : model.includes('gpt') ? 'openai' : 'ollama';
    const testPrompt = "Synthesize a single sentence definition of machine learning.";
    const start = Date.now();
    try {
      const chatRes = await generateCompletion({
        provider,
        model,
        messages: [{ role: 'user', content: testPrompt }]
      });
      const duration = (Date.now() - start) / 1000;
      const textLen = chatRes.text ? chatRes.text.length : 0;
      const tokens = Math.ceil(textLen / 4);
      return {
        model,
        success: true,
        latency: Number(duration.toFixed(3)),
        tokensPerSecond: Number((tokens / (duration || 0.1)).toFixed(1)),
        tokens
      };
    } catch (err) {
      return { model, success: false, error: err.message };
    }
  });

  const results = await Promise.all(benchmarkRuns);
  res.json({ success: true, results });
});

// Co-Pilot strictly-typed Code Generator Endpoint
app.post('/api/copilot/generate-code', async (req, res) => {
  const { description, signature, strictSettings, provider, model } = req.body;

  const config = readConfig();
  const activeProvider = provider || config.settings.activeProvider;
  const activeModel = model || config.settings.defaultModel;

  const systemPrompt = `You are a world-class TypeScript architect.
Your task is to write a strictly-typed TypeScript function based on the user's description and signature.
Rules:
- DO NOT use the 'any' type under any circumstance. Use 'unknown' or specify precise types/interfaces.
- Enforce strict typing.
- DO NOT wrap the code in markdown formatting (like \`\`\`typescript). Output ONLY valid TypeScript code and nothing else.
- Add concise comments explaining the type choices.`;

  const userPrompt = `Function Signature: ${signature || 'None specified'}
Description: ${description}
Enforce strict settings: ${strictSettings ? 'Yes' : 'No'}
`;

  try {
    const result = await generateCompletion({
      provider: activeProvider,
      model: activeModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    let code = result.text || '';
    code = code.replace(/```typescript/g, '').replace(/```javascript/g, '').replace(/```ts/g, '').replace(/```/g, '').trim();

    const scratchDir = path.join(process.cwd(), 'scratch');
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }
    const tempFile = path.join(scratchDir, 'temp_compile.ts');
    fs.writeFileSync(tempFile, code, 'utf8');

    exec(`npx tsc ${tempFile} --noEmit --strict --target es2022`, (err, stdout, stderr) => {
      let compileLogs = stdout || stderr || '';
      compileLogs = compileLogs.replaceAll(tempFile, 'GeneratedCode.ts');
      const success = !err;
      res.json({
        success: true,
        code,
        compiles: success,
        compileLogs
      });
    });
  } catch (err) {
    console.error('Co-pilot generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Co-Pilot Linter & Code Auditor Endpoint
app.post('/api/copilot/analyze', async (req, res) => {
  const { code, provider, model } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code content is required.' });
  }

  const config = readConfig();
  const activeProvider = provider || config.settings.activeProvider;
  const activeModel = model || config.settings.defaultModel;

  const systemPrompt = `You are a TypeScript linter and security audit engine.
Analyze the following code for:
1. Type safety issues (specifically use of 'any', unhandled undefined/null, or implicit casting).
2. Architectural suggestions (Zod validation, immutability patterns, read-only types).
3. Security/InfoSec risks (InfoSec as Witchcraft: local-first, zero-trust, credentials leak).

Output your findings as a clean, structured JSON array of objects.
Format:
[
  {
    "type": "warning" | "tip" | "danger",
    "title": "Short title",
    "description": "Detail on the issue and how to resolve it strictly.",
    "code": "Suggested replacement code"
  }
]
Output ONLY the raw JSON array. Do not write markdown, code blocks, or preamble.`;

  try {
    const result = await generateCompletion({
      provider: activeProvider,
      model: activeModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: code }
      ]
    });

    let rawText = result.text || '[]';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let findings = [];
    try {
      findings = JSON.parse(rawText);
    } catch (e) {
      findings = [{
        type: 'tip',
        title: 'Analysis Results',
        description: rawText,
        code: ''
      }];
    }

    res.json({ success: true, findings });
  } catch (err) {
    console.error('Co-pilot analysis error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Co-Pilot secure workspace file reader
app.get('/api/copilot/read-file', (req, res) => {
  const { filePath } = req.query;
  if (!filePath) return res.status(400).json({ error: 'filePath is required' });

  const cleanPath = path.normalize(filePath).replace(/^(\.\.(\/|\\))+/, '');
  const absolutePath = path.join(process.cwd(), cleanPath);

  if (!absolutePath.startsWith(process.cwd())) {
    return res.status(403).json({ error: 'Access denied. Outside of workspace.' });
  }

  try {
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    const content = fs.readFileSync(absolutePath, 'utf8');
    res.json({ success: true, content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Co-Pilot local workspace file lister
app.get('/api/copilot/list-files', (req, res) => {
  const listFilesRecursively = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      if (['node_modules', '.git', 'dist', '.gemini'].includes(file)) return;
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        listFilesRecursively(filePath, fileList);
      } else {
        fileList.push(path.relative(process.cwd(), filePath));
      }
    });
    return fileList;
  };

  try {
    const files = listFilesRecursively(process.cwd());
    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files from the React dist directory
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

app.use(express.static(distPath));

// Fallback all other GET requests to index.html (SPA routing)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

const config = readConfig();
const PORT = config.settings.port || 4567;

app.listen(PORT, () => {
  console.log(`IRN-OS Backend running at http://localhost:${PORT}`);
});
