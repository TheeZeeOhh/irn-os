import fetch from 'node-fetch';
import { getActiveKey, markKeyRateLimited, logUsage } from './config.js';

export async function generateCompletion({ provider, model, messages, stream = false }) {
  const activeKeyObj = getActiveKey(provider);
  if (!activeKeyObj && provider !== 'ollama') {
    throw new Error(`No active keys found for provider: ${provider}. Add some keys in the Settings page or via the config.json file.`);
  }

  const keyVal = activeKeyObj ? activeKeyObj.key : '';
  const urlOverride = activeKeyObj ? activeKeyObj.url : '';
  const keyName = activeKeyObj ? activeKeyObj.name : 'default';

  switch (provider) {
    case 'gemini':
      return callGemini(model, messages, keyVal, keyName);
    case 'anthropic':
      return callAnthropic(model, messages, keyVal, keyName);
    case 'openai':
      return callOpenAI(model, messages, keyVal, keyName);
    case 'ollama':
      return callOllama(model, messages, urlOverride || 'http://localhost:11434', keyName);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

async function callGemini(model, messages, apiKey, keyName) {
  // Convert standard messages to Gemini style contents
  const contents = messages.map(m => {
    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    };
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      markKeyRateLimited('gemini', apiKey);
    }
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Approximate tokens (1 token ~ 4 chars for rough estimation)
  const inputChars = messages.reduce((acc, m) => acc + m.content.length, 0);
  const outputChars = text.length;
  const totalTokens = Math.ceil((inputChars + outputChars) / 4);
  
  logUsage('gemini', model, totalTokens, keyName);
  
  return { text, model };
}

async function callAnthropic(model, messages, apiKey, keyName) {
  const systemMessage = messages.find(m => m.role === 'system');
  const userAssistantMessages = messages.filter(m => m.role !== 'system');
  
  const body = {
    model,
    messages: userAssistantMessages.map(m => ({ role: m.role, content: m.content })),
    max_tokens: 4096
  };

  if (systemMessage) {
    body.system = systemMessage.content;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      markKeyRateLimited('anthropic', apiKey);
    }
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  const tokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
  
  logUsage('anthropic', model, tokens, keyName);

  return { text, model };
}

async function callOpenAI(model, messages, apiKey, keyName) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      markKeyRateLimited('openai', apiKey);
    }
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  const tokens = data.usage?.total_tokens || 0;

  logUsage('openai', model, tokens, keyName);

  return { text, model };
}

async function callOllama(model, messages, url, keyName) {
  const response = await fetch(`${url}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'llama3',
      messages,
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.message?.content || '';
  
  const totalTokens = Math.ceil((JSON.stringify(messages).length + text.length) / 4);
  logUsage('ollama', model, totalTokens, keyName);

  return { text, model };
}
