import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.irn-os');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Ensure config directory exists
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

const defaultConfig = {
  providers: {
    gemini: [],
    anthropic: [],
    openai: [],
    ollama: [{ name: 'Default Local', url: 'http://localhost:11434', keys: ['local-ollama'] }]
  },
  settings: {
    activeProvider: 'gemini',
    defaultModel: 'gemini-1.5-pro',
    theme: 'dark',
    port: 4567
  },
  usage: {} // tracks dates, tokens, and counts
};

export function readConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    writeConfig(defaultConfig);
    return defaultConfig;
  }
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading config file:', err);
    return defaultConfig;
  }
}

export function writeConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing config file:', err);
  }
}

// Simple key rotation and balancing
export function getActiveKey(providerName) {
  const config = readConfig();
  const keys = config.providers[providerName] || [];
  if (keys.length === 0) {
    return null;
  }

  // Find a key that isn't rate-limited (e.g. rateLimitedUntil is in the past or unset)
  const now = Date.now();
  const availableKeys = keys.filter(k => !k.rateLimitedUntil || k.rateLimitedUntil < now);
  
  if (availableKeys.length === 0) {
    // If all are limited, return the one that will recover earliest, or the first one
    return keys.sort((a, b) => (a.rateLimitedUntil || 0) - (b.rateLimitedUntil || 0))[0];
  }

  // Round robin based on usage count or random
  const chosen = availableKeys[Math.floor(Math.random() * availableKeys.length)];
  return chosen;
}

export function markKeyRateLimited(providerName, keyName, durationMs = 60000) {
  const config = readConfig();
  const keys = config.providers[providerName] || [];
  const key = keys.find(k => k.name === keyName);
  if (key) {
    key.rateLimitedUntil = Date.now() + durationMs;
    writeConfig(config);
  }
}

export function logUsage(providerName, modelName, tokensUsed, keyName = 'default') {
  const config = readConfig();
  const dateStr = new Date().toISOString().split('T')[0];
  
  if (!config.usage[dateStr]) {
    config.usage[dateStr] = {};
  }
  if (!config.usage[dateStr][providerName]) {
    config.usage[dateStr][providerName] = { tokens: 0, requests: 0, keyUsage: {} };
  }
  if (!config.usage[dateStr][providerName].keyUsage) {
    config.usage[dateStr][providerName].keyUsage = {};
  }
  
  config.usage[dateStr][providerName].tokens += tokensUsed || 0;
  config.usage[dateStr][providerName].requests += 1;
  config.usage[dateStr][providerName].keyUsage[keyName] = (config.usage[dateStr][providerName].keyUsage[keyName] || 0) + 1;
  
  writeConfig(config);
}
