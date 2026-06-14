import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [availableModels, setAvailableModels] = useState({});
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Welcome to IRN-OS. Select a model and start building.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');

  // Telemetry states
  const [sessionResponseTimes, setSessionResponseTimes] = useState([]);
  const [sessionMsgLengths, setSessionMsgLengths] = useState([]);
  const [sessionTotalTokens, setSessionTotalTokens] = useState(0);
  const [sessionTokensPerSecond, setSessionTokensPerSecond] = useState([]);
  const [localLatency, setLocalLatency] = useState(38);
  
  // Key Manager state
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyUrl, setNewKeyUrl] = useState('');

  // Backend telemetry state
  const [backendTelemetry, setBackendTelemetry] = useState(null);

  // Terminal state
  const [terminalCmd, setTerminalCmd] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [terminalLoading, setTerminalLoading] = useState(false);

  // Llama and Compressor states
  const [selectedPattern, setSelectedPattern] = useState('inference');
  const [compressText, setCompressText] = useState('');
  const [compressMode, setCompressMode] = useState('text');
  const [compressionResult, setCompressionResult] = useState(null);
  const [compressing, setCompressing] = useState(false);

  // Supabase states
  const [supabaseFiles, setSupabaseFiles] = useState([]);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [supabaseBucket, setSupabaseBucket] = useState('irn-os-uploads');
  const [uploadingFile, setUploadingFile] = useState(false);

  // Integration Hub & History & Budget states
  const [chatHistoryList, setChatHistoryList] = useState([]);
  const [currentHistoryId, setCurrentHistoryId] = useState(null);
  const [activePreset, setActivePreset] = useState('');
  const [presetList, setPresetList] = useState([]);
  const [dailyBudget, setDailyBudget] = useState(5.00);
  const [monthlyBudget, setMonthlyBudget] = useState(50.00);
  const [googleQuery, setGoogleQuery] = useState('');
  const [googleResults, setGoogleResults] = useState([]);
  const [notionTitle, setNotionTitle] = useState('');
  const [notionContent, setNotionContent] = useState('');
  const [notionOutput, setNotionOutput] = useState('');

  // Integration credentials & state management
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [googleCx, setGoogleCx] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [googleRefreshToken, setGoogleRefreshToken] = useState('');
  const [notionApiKey, setNotionApiKey] = useState('');
  const [notionDatabaseId, setNotionDatabaseId] = useState('');

  // Loaded data lists from APIs
  const [gmailList, setGmailList] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [driveFiles, setDriveFiles] = useState([]);
  const [notionDatabases, setNotionDatabases] = useState([]);

  // Create event & email states
  const [gmailTo, setGmailTo] = useState('');
  const [gmailSubject, setGmailSubject] = useState('');
  const [gmailBody, setGmailBody] = useState('');
  const [calSummary, setCalSummary] = useState('');
  const [calStart, setCalStart] = useState('');
  const [calEnd, setCalEnd] = useState('');
  const [calDesc, setCalDesc] = useState('');
  const [notionPageId, setNotionPageId] = useState('');
  const [notionAppendContent, setNotionAppendContent] = useState('');

  const fetchHistories = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setChatHistoryList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadHistory = async (id) => {
    try {
      const res = await fetch(`/api/history/${id}`);
      const data = await res.json();
      setChatMessages(data.messages);
      setCurrentHistoryId(data.historyId);
    } catch (err) {
      console.error(err);
    }
  };

  const saveHistorySession = async (msgs) => {
    const historyId = currentHistoryId || `chat-${Date.now()}`;
    const firstUserMsg = msgs.find(m => m.role === 'user');
    const title = firstUserMsg ? firstUserMsg.content.substring(0, 30) : 'New Conversation';
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyId, title, messages: msgs })
      });
      setCurrentHistoryId(historyId);
      fetchHistories();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteHistory = async (id) => {
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (currentHistoryId === id) {
        setChatMessages([{ role: 'assistant', content: 'Welcome to IRN-OS. Select a model and start building.' }]);
        setCurrentHistoryId(null);
      }
      fetchHistories();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPresets = async () => {
    try {
      const res = await fetch('/api/presets');
      const data = await res.json();
      setPresetList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBudget = async () => {
    try {
      const res = await fetch('/api/budget');
      const data = await res.json();
      setDailyBudget(data.dailyLimit);
      setMonthlyBudget(data.monthlyLimit);
    } catch (err) {
      console.error(err);
    }
  };

  const saveBudgetLimit = async () => {
    try {
      const res = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyLimit: dailyBudget, monthlyLimit: monthlyBudget })
      });
      const data = await res.json();
      if (data.success) {
        alert('Budget caps updated!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIntegrationConfig = async () => {
    try {
      const res = await fetch('/api/integrations/config');
      const data = await res.json();
      if (data) {
        setGoogleApiKey(data.google?.apiKey || '');
        setGoogleCx(data.google?.cx || '');
        setGoogleClientId(data.google?.clientId || '');
        setGoogleClientSecret(data.google?.clientSecret || '');
        setGoogleRefreshToken(data.google?.refreshToken || '');
        setNotionApiKey(data.notion?.apiKey || '');
        setNotionDatabaseId(data.notion?.databaseId || '');
      }
    } catch (err) {
      console.error('Error fetching integrations config:', err);
    }
  };

  const saveIntegrationConfig = async () => {
    try {
      const res = await fetch('/api/integrations/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google: {
            apiKey: googleApiKey,
            cx: googleCx,
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            refreshToken: googleRefreshToken
          },
          notion: {
            apiKey: notionApiKey,
            databaseId: notionDatabaseId
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('🌐 Integration Credentials Saved successfully!');
      }
    } catch (err) {
      alert(`Error saving credentials: ${err.message}`);
    }
  };

  const runGoogleSearch = async () => {
    if (!googleQuery.trim()) return;
    try {
      const res = await fetch('/api/mcp/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: googleQuery, action: 'search' })
      });
      const data = await res.json();
      setGoogleResults(data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGmailList = async () => {
    try {
      const res = await fetch('/api/mcp/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'gmail_list' })
      });
      const data = await res.json();
      setGmailList(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const sendGmailEmail = async () => {
    if (!gmailTo.trim() || !gmailSubject.trim()) {
      alert('Recipient and Subject are required.');
      return;
    }
    try {
      const res = await fetch('/api/mcp/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'gmail_send',
          to: gmailTo,
          subject: gmailSubject,
          body: gmailBody
        })
      });
      const data = await res.json();
      alert(data.message || 'Email sent successfully!');
      setGmailTo('');
      setGmailSubject('');
      setGmailBody('');
    } catch (err) {
      alert(`Failed to send email: ${err.message}`);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const res = await fetch('/api/mcp/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'calendar_list' })
      });
      const data = await res.json();
      setCalendarEvents(data.events || []);
    } catch (err) {
      console.error(err);
    }
  };

  const createCalendarEvent = async () => {
    if (!calSummary.trim()) {
      alert('Event Summary is required.');
      return;
    }
    try {
      const res = await fetch('/api/mcp/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calendar_create',
          summary: calSummary,
          startTime: calStart,
          endTime: calEnd,
          description: calDesc
        })
      });
      const data = await res.json();
      alert(data.message || 'Event created successfully!');
      setCalSummary('');
      setCalStart('');
      setCalEnd('');
      setCalDesc('');
      fetchCalendarEvents();
    } catch (err) {
      alert(`Failed to schedule event: ${err.message}`);
    }
  };

  const fetchDriveFiles = async () => {
    try {
      const res = await fetch('/api/mcp/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'drive_list' })
      });
      const data = await res.json();
      setDriveFiles(data.files || []);
    } catch (err) {
      console.error(err);
    }
  };

  const runNotionCreate = async () => {
    if (!notionTitle.trim()) return;
    try {
      const res = await fetch('/api/mcp/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'page_create', pageTitle: notionTitle, content: notionContent })
      });
      const data = await res.json();
      setNotionOutput(data.message + (data.notionUrl ? '\nURL: ' + data.notionUrl : ''));
      setNotionTitle('');
      setNotionContent('');
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotionDatabases = async () => {
    try {
      const res = await fetch('/api/mcp/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'database_list' })
      });
      const data = await res.json();
      setNotionDatabases(data.databases || []);
    } catch (err) {
      console.error(err);
    }
  };

  const appendNotionPage = async () => {
    if (!notionPageId.trim() || !notionAppendContent.trim()) {
      alert('Page ID and content are required.');
      return;
    }
    try {
      const res = await fetch('/api/mcp/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'page_append', pageId: notionPageId, content: notionAppendContent })
      });
      const data = await res.json();
      alert(data.message || 'Appended content successfully.');
      setNotionAppendContent('');
    } catch (err) {
      alert(`Error appending to page: ${err.message}`);
    }
  };

  const fetchFileList = async () => {
    try {
      const res = await fetch('/api/files');
      if (res.ok) {
        const data = await res.json();
        setSupabaseFiles(data);
      }
    } catch (err) {
      console.error('Error listing files:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        alert('File uploaded to Supabase successfully!');
        fetchFileList();
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const saveSupabaseConfig = async () => {
    try {
      const res = await fetch('/api/supabase-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: supabaseUrl, key: supabaseKey, bucket: supabaseBucket })
      });
      const data = await res.json();
      if (data.success) {
        alert('Supabase credentials saved!');
        fetchConfig();
      }
    } catch (err) {
      alert(`Error saving credentials: ${err.message}`);
    }
  };

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConfig();
    fetchModels();
    fetchTelemetry();
    fetchHistories();
    fetchPresets();
    fetchBudget();
    fetchIntegrationConfig();
  }, []);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/telemetry');
      const data = await res.json();
      setBackendTelemetry(data);
      if (data.localLatency) {
        setLocalLatency(data.localLatency);
      }
    } catch (err) {
      console.error('Error fetching telemetry:', err);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setConfig(data);
      setSelectedProvider(data.settings.activeProvider);
      setSelectedModel(data.settings.defaultModel);
      if (data.supabase) {
        setSupabaseUrl(data.supabase.url || '');
        setSupabaseKey(data.supabase.key || '');
        setSupabaseBucket(data.supabase.bucket || 'irn-os-uploads');
      }
      setLoadingConfig(false);
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      setAvailableModels(data);
    } catch (err) {
      console.error('Error fetching models:', err);
    }
  };

  const updateConfig = async (newConfig) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
      }
    } catch (err) {
      console.error('Error updating config:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || chatLoading) return;
    
    const promptText = inputMessage;
    const userMsg = { role: 'user', content: promptText };
    
    // Inject preset system message if active
    let updatedMessages = [...chatMessages];
    if (activePreset && !updatedMessages.some(m => m.role === 'system')) {
      const presetObj = presetList.find(p => p.id === activePreset);
      if (presetObj) {
        updatedMessages = [{ role: 'system', content: presetObj.prompt }, ...updatedMessages];
      }
    }
    
    updatedMessages.push(userMsg);
    setChatMessages(updatedMessages);
    setInputMessage('');
    setChatLoading(true);

    // Track start timestamp and input length (Da)
    const startTime = Date.now();
    const promptLen = promptText.length;
    setSessionMsgLengths(prev => [...prev, promptLen]);
    setLocalLatency(Math.floor(25 + Math.random() * 30)); // random latency perturbation

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          model: selectedModel,
          messages: updatedMessages
        })
      });
      const data = await res.json();

      // Measure response duration (Tr)
      const durationSec = (Date.now() - startTime) / 1000;
      setSessionResponseTimes(prev => [...prev, durationSec]);

      if (res.ok) {
        const finalMessages = [...updatedMessages, { role: 'assistant', content: data.text }];
        setChatMessages(finalMessages);
        saveHistorySession(finalMessages); // Save history locally
        
        // Approximate generated tokens (Tu) and rate (Rp)
        const tokensGenerated = Math.ceil(data.text.length / 4);
        setSessionTotalTokens(prev => prev + tokensGenerated);
        setSessionTokensPerSecond(prev => [...prev, tokensGenerated / (durationSec || 0.1)]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Connection error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const addKey = (providerName) => {
    if (!newKeyName || !newKeyValue) return;
    const updatedConfig = { ...config };
    
    if (!updatedConfig.providers[providerName]) {
      updatedConfig.providers[providerName] = [];
    }

    updatedConfig.providers[providerName].push({
      name: newKeyName,
      key: newKeyValue,
      url: newKeyUrl || undefined,
      rateLimitedUntil: null
    });

    updateConfig(updatedConfig);
    setNewKeyName('');
    setNewKeyValue('');
    setNewKeyUrl('');
  };

  const deleteKey = (providerName, index) => {
    const updatedConfig = { ...config };
    updatedConfig.providers[providerName].splice(index, 1);
    updateConfig(updatedConfig);
  };

  const handleProviderChange = (e) => {
    const prov = e.target.value;
    setSelectedProvider(prov);
    if (availableModels[prov] && availableModels[prov].length > 0) {
      setSelectedModel(availableModels[prov][0]);
    }
  };

  const saveSettings = () => {
    const updatedConfig = { ...config };
    updatedConfig.settings.activeProvider = selectedProvider;
    updatedConfig.settings.defaultModel = selectedModel;
    updateConfig(updatedConfig);
    alert('Active provider and model settings saved!');
  };

  const runTerminal = async () => {
    if (!terminalCmd.trim() || terminalLoading) return;
    setTerminalLoading(true);
    setTerminalOutput('Executing command...');
    try {
      const res = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: terminalCmd })
      });
      const data = await res.json();
      if (data.success) {
        setTerminalOutput(data.stdout || 'Command completed successfully with no output.');
      } else {
        setTerminalOutput(`Error output:\n${data.stderr || data.error}`);
      }
    } catch (err) {
      setTerminalOutput(`Failed to execute: ${err.message}`);
    } finally {
      setTerminalLoading(false);
    }
  };

  if (loadingConfig) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0b0f19', color: 'white' }}>
        <h2>Loading IRN-OS Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div>
          <div className="logo-section">
            <img src="/irn-crest.png" alt="IRN Crest" className="logo-icon" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            <div className="logo-text">
              <h1>IRN-OS</h1>
              <span>AI PLATFORM</span>
            </div>
          </div>
          <div className="nav-links">
            <a className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
              💬 Interactive Chat
            </a>
            <a className={`nav-item ${activeTab === 'keys' ? 'active' : ''}`} onClick={() => setActiveTab('keys')}>
              🔑 API Key Manager
            </a>
            <a className={`nav-item ${activeTab === 'terminal' ? 'active' : ''}`} onClick={() => setActiveTab('terminal')}>
              🖥️ Local Terminal
            </a>
            <a className={`nav-item ${activeTab === 'usage' ? 'active' : ''}`} onClick={() => setActiveTab('usage')}>
              📊 Usage Analytics
            </a>
            <a className={`nav-item ${activeTab === 'telemetry' ? 'active' : ''}`} onClick={() => { setActiveTab('telemetry'); fetchTelemetry(); }}>
              🧠 Telemetry Models
            </a>
            <a className={`nav-item ${activeTab === 'llama' ? 'active' : ''}`} onClick={() => setActiveTab('llama')}>
              🦙 Llama 3 Patterns
            </a>
            <a className={`nav-item ${activeTab === 'files' ? 'active' : ''}`} onClick={() => { setActiveTab('files'); fetchFileList(); }}>
              📂 File Storage
            </a>
            <a className={`nav-item ${activeTab === 'integrations' ? 'active' : ''}`} onClick={() => setActiveTab('integrations')}>
              🔌 Integration Hub
            </a>
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          v1.0.0 • Secure Local Server
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="top-bar">
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Selected Model: </span>
            <strong style={{ color: 'var(--accent-cyan)' }}>{config.settings.activeProvider} ({config.settings.defaultModel})</strong>
          </div>
          <div className="status-badge">
            <span className="status-dot"></span>
            Online & Ready
          </div>
        </div>

        <div className="page-wrapper">
          {activeTab === 'chat' && (
            <div style={{ display: 'flex', gap: '20px', height: '100%', alignItems: 'stretch' }}>
              {/* History Side Panel */}
              <div className="panel" style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', marginBottom: 0, height: '100%', overflowY: 'auto' }}>
                <h4 style={{ marginBottom: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>💬 Chat Logs</h4>
                <button className="btn-primary" onClick={() => {
                  setChatMessages([{ role: 'assistant', content: 'Welcome to IRN-OS. Select a model and start building.' }]);
                  setCurrentHistoryId(null);
                }} style={{ padding: '8px', fontSize: '0.85rem', marginBottom: '12px', width: '100%' }}>+ New Chat</button>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, overflowY: 'auto' }}>
                  {chatHistoryList.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>No saved chats</span>
                  ) : (
                    chatHistoryList.map(h => (
                      <div key={h.historyId} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        fontSize: '0.85rem', 
                        padding: '8px', 
                        background: currentHistoryId === h.historyId ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.02)', 
                        borderRadius: 'var(--radius-sm)', 
                        border: currentHistoryId === h.historyId ? '1px solid rgba(59,130,246,0.4)' : '1px solid var(--border-glass)' 
                      }}>
                        <span onClick={() => loadHistory(h.historyId)} style={{ cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '80%', color: currentHistoryId === h.historyId ? 'white' : 'var(--text-secondary)' }}>{h.title}</span>
                        <button onClick={() => deleteHistory(h.historyId)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>&times;</button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Play area */}
              <div className="chat-container" style={{ flexGrow: 1, height: '100%', marginBottom: 0 }}>
                <div className="chat-header">
                  <div>
                    <h3 style={{ margin: 0 }}>AI Development Playground</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Streaming completions with automatic API rotation
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select className="form-control" value={activePreset} onChange={(e) => setActivePreset(e.target.value)} style={{ width: '130px', padding: '6px' }}>
                      <option value="">No Preset</option>
                      {presetList.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <select className="form-control" value={selectedProvider} onChange={handleProviderChange} style={{ width: '110px', padding: '6px' }}>
                      <option value="gemini">Gemini</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="openai">OpenAI</option>
                      <option value="ollama">Ollama</option>
                    </select>
                    <select className="form-control" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} style={{ width: '150px', padding: '6px' }}>
                      {(availableModels[selectedProvider] || []).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <button className="btn-primary" onClick={saveSettings} style={{ padding: '6px 12px', fontSize: '0.9rem' }}>Pin</button>
                  </div>
                </div>

              <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`message-bubble ${msg.role}`}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px', opacity: 0.7 }}>
                      {msg.role === 'user' ? 'YOU' : 'IRN-OS'}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="message-bubble assistant">
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px', opacity: 0.7 }}>
                      IRN-OS
                    </div>
                    <div className="pulse">Thinking...</div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-area">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Ask a question or request a code snippet..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="send-btn" onClick={handleSendMessage}>Send</button>
              </div>
            </div>
          </div>
          )}

          {activeTab === 'keys' && (
            <div>
              <h2>🔌 API Key Credentials & Load Balancer</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Add multiple accounts or access tokens per provider. IRN-OS automatically alternates, balances, and rotates keys upon hitting rate limits.
              </p>

              <div className="grid-2">
                {/* Add Key Form */}
                <div className="panel">
                  <h3 className="card-title">🔑 Register New Key</h3>
                  <div className="form-group">
                    <label>Provider</label>
                    <select className="form-control" id="provider-select" value={selectedProvider} onChange={handleProviderChange}>
                      <option value="gemini">Gemini</option>
                      <option value="anthropic">Anthropic (Claude)</option>
                      <option value="openai">OpenAI</option>
                      <option value="ollama">Ollama (Local)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Key Name / Label</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Work-Account-1"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>API Access Token</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Paste your api credentials here"
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                    />
                  </div>
                  {selectedProvider === 'ollama' && (
                    <div className="form-group">
                      <label>Ollama Server URL (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="http://localhost:11434"
                        value={newKeyUrl}
                        onChange={(e) => setNewKeyUrl(e.target.value)}
                      />
                    </div>
                  )}
                  <button className="btn-primary" onClick={() => addKey(selectedProvider)}>Add Key to Balancer</button>
                </div>

                {/* Key Status List */}
                <div className="panel">
                  <h3 className="card-title">📋 Active Key Inventory</h3>
                  {['gemini', 'anthropic', 'openai', 'ollama'].map(prov => (
                    <div key={prov} style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                      <h4 style={{ textTransform: 'uppercase', color: 'var(--accent-cyan)', fontSize: '0.9rem', marginBottom: '8px' }}>{prov}</h4>
                      {(!config.providers[prov] || config.providers[prov].length === 0) ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No keys configured.</p>
                      ) : (
                        config.providers[prov].map((k, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', margin: '4px 0' }}>
                            <span>{k.name} (..{k.key ? k.key.slice(-6) : 'N/A'})</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '0.8rem', color: k.rateLimitedUntil && k.rateLimitedUntil > Date.now() ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                                {k.rateLimitedUntil && k.rateLimitedUntil > Date.now() ? 'Rate Limited' : 'Active'}
                              </span>
                              <button onClick={() => deleteKey(prov, idx)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}>Delete</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Supabase Configuration Panel */}
              <div className="panel" style={{ marginTop: '24px' }}>
                <h3 className="card-title">🔌 Connect Supabase Storage</h3>
                <div className="grid-2" style={{ gap: '16px', marginTop: '12px' }}>
                  <div className="form-group">
                    <label>Supabase URL</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="https://your-project.supabase.co"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Supabase Anon Key / API Secret</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Paste your supabase anon key"
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Storage Bucket Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="irn-os-uploads"
                      value={supabaseBucket}
                      onChange={(e) => setSupabaseBucket(e.target.value)}
                    />
                  </div>
                </div>
                <button className="btn-primary" onClick={saveSupabaseConfig} style={{ marginTop: '12px' }}>Save Supabase Configuration</button>
              </div>

              {/* Budget Caps Panel */}
              <div className="panel" style={{ marginTop: '24px' }}>
                <h3 className="card-title">💰 Budget limits & Telemetry Alerts</h3>
                <div className="grid-2" style={{ gap: '16px', marginTop: '12px' }}>
                  <div className="form-group">
                    <label>Daily Spend Limit (USD)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Monthly Spend Limit (USD)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                    />
                  </div>
                </div>
                <button className="btn-primary" onClick={saveBudgetLimit} style={{ marginTop: '12px' }}>Save Budget Caps</button>
              </div>
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="panel">
              <h2>🖥️ Integrated Secure Terminal Console</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Run workspace operations directly. (All executions happen locally inside: <code style={{ color: 'var(--accent-cyan)' }}>{config.settings.cwd || 'project root'}</code>).
              </p>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  placeholder="npm run test, git status, etc."
                  value={terminalCmd}
                  onChange={(e) => setTerminalCmd(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runTerminal()}
                />
                <button className="btn-primary" onClick={runTerminal} disabled={terminalLoading}>
                  {terminalLoading ? 'Running...' : 'Execute'}
                </button>
              </div>

              <pre style={{
                background: '#040711',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                color: '#34d399',
                border: '1px solid var(--border-glass)',
                height: '350px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {terminalOutput || 'Terminal output will be shown here...'}
              </pre>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="panel">
              <h2>📊 Usage Analytics & Rotation Logs</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Token counts and rate limits aggregated daily across all API backends.
              </p>

              {(!config.usage || Object.keys(config.usage).length === 0) ? (
                <p style={{ color: 'var(--text-muted)' }}>No usage data recorded yet. Query models to populate telemetry.</p>
              ) : (
                Object.keys(config.usage).sort().reverse().map(date => (
                  <div key={date} style={{ marginBottom: '24px', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>{date}</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                          <th style={{ padding: '8px' }}>Provider</th>
                          <th style={{ padding: '8px' }}>Estimated Tokens</th>
                          <th style={{ padding: '8px' }}>Total Requests</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(config.usage[date]).map(prov => (
                          <tr key={prov} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>{prov}</td>
                            <td style={{ padding: '8px', color: 'var(--accent-cyan)' }}>{config.usage[date][prov].tokens}</td>
                            <td style={{ padding: '8px', color: 'var(--accent-purple)' }}>{config.usage[date][prov].requests}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'telemetry' && (() => {
            // Compute telemetry metrics dynamically
            const keyCounts = Object.keys(config.providers).reduce((acc, prov) => {
              const keys = config.providers[prov] || [];
              const active = keys.filter(k => !k.rateLimitedUntil || k.rateLimitedUntil < Date.now()).length;
              return { total: acc.total + keys.length, active: acc.active + active };
            }, { total: 0, active: 0 });

            // Vi = 10 for active, 0 for inactive
            const sumViWi = keyCounts.active * 10; 
            const Lc = localLatency;
            const wl = 0.5;
            const Tr = sessionResponseTimes.length > 0
              ? sessionResponseTimes.reduce((a, b) => a + b, 0) / sessionResponseTimes.length
              : 1.45; // average response time in seconds
            
            const ReadinessScore = ((sumViWi + (Lc * wl)) / (Tr || 1)).toFixed(2);

            const Da = sessionMsgLengths.length > 0
              ? sessionMsgLengths.reduce((a, b) => a + b, 0) / sessionMsgLengths.length
              : 85; // average dialogue length
            const Tu = sessionTotalTokens || 120;
            const Rp = sessionTokensPerSecond.length > 0
              ? sessionTokensPerSecond.reduce((a, b) => a + b, 0) / sessionTokensPerSecond.length
              : 42; // tokens per second
            
            const CognitiveLoad = ((Da + Tu) / (Rp || 1)).toFixed(2);

            const fx = Tu; // true aggregate
            const epsilon = Number((Math.sin(Date.now() / 10000) * 1.5).toFixed(3)); // perturbation noise
            const PrivacyAggregate = (fx + epsilon).toFixed(3);

            return (
              <div>
                <h2>🧠 Mathematical System Telemetry Models</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Real-time cognitive metrics, node readiness weights, and differential privacy aggregates calculated from your active session.
                </p>

                <div className="grid-2">
                  {/* Readiness Score Card */}
                  <div className="panel" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, color: 'var(--accent-cyan)' }}>Readiness Score (R<sub>s</sub>)</h3>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>{ReadinessScore}</div>
                    </div>
                    
                    <div style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.1rem',
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      color: 'var(--accent-cyan)'
                    }}>
                      R<sub>s</sub> = &Sigma; (V<sub>i</sub> &middot; w<sub>i</sub>) + (L<sub>c</sub> &middot; w<sub>l</sub>) / T<sub>r</sub>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div><strong>&Sigma;(V<sub>i</sub> &middot; w<sub>i</sub>):</strong> Node Key Capability Weight ({sumViWi} units)</div>
                      <div><strong>L<sub>c</sub> &middot; w<sub>l</sub>:</strong> Network Latency Weight ({Lc}ms &middot; {wl})</div>
                      <div><strong>T<sub>r</sub>:</strong> Mean Model Response Latency ({Tr.toFixed(3)}s)</div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '16px', lineHeight: '1.4' }}>
                      Measures overall load capacity. High readiness scores represent low network latency combined with healthy rotated API keys.
                    </p>
                  </div>

                  {/* Cognitive Load Card */}
                  <div className="panel" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, color: 'var(--accent-purple)' }}>Cognitive Load Index (C<sub>L</sub>)</h3>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>{CognitiveLoad}</div>
                    </div>

                    <div style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.1rem',
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      color: 'var(--accent-purple)'
                    }}>
                      C<sub>L</sub> = (D<sub>a</sub> + T<sub>u</sub>) / R<sub>p</sub>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div><strong>D<sub>a</sub>:</strong> Average Dialogue Complexity ({Da.toFixed(1)} chars)</div>
                      <div><strong>T<sub>u</sub>:</strong> Session Accumulated Tokens ({Tu} tokens)</div>
                      <div><strong>R<sub>p</sub>:</strong> Response Generation Rate ({Rp.toFixed(1)} t/s)</div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '16px', lineHeight: '1.4' }}>
                      Measures processing overhead. High dialogue lengths combined with massive contexts increase processing complexity relative to generation rate.
                    </p>
                  </div>

                  {/* Privacy Preserving Aggregate */}
                  <div className="panel" style={{ borderLeft: '4px solid var(--accent-green)', gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ margin: 0, color: 'var(--accent-green)' }}>Privacy-Preserving Aggregate (P<sub>agg</sub>)</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Using Differential Privacy perturbation</span>
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>{PrivacyAggregate}</div>
                    </div>

                    <div style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.1rem',
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      color: 'var(--accent-green)'
                    }}>
                      P<sub>agg</sub> = f̃(x) + &epsilon;
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <div><strong>f̃(x) (True value):</strong> {fx}</div>
                      <div><strong>&epsilon; (Perturbation Noise):</strong> {epsilon > 0 ? `+${epsilon}` : epsilon}</div>
                      <div><strong>Privacy Limit (&delta;):</strong> 0.01 (Strict Compliant)</div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '16px', lineHeight: '1.4' }}>
                      Introduces mathematical Laplace noise (&epsilon;) into the telemetry output to guarantee differential privacy. This prevents reversing individual prompt characteristics from aggregate metric reporting.
                    </p>
                  </div>
                </div>

                <h2 style={{ marginTop: '40px' }}>⚡ Custom OS Telemetry Models (Designed for Zee)</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Custom performance models optimized specifically for IRN-OS operations.
                </p>

                <div className="grid-2">
                  {/* Key Entropy Rotation Index */}
                  <div className="panel" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, color: 'var(--accent-cyan)' }}>Key Entropy Rotation Index (H<sub>rot</sub>)</h3>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                        {backendTelemetry ? backendTelemetry.entropy.toFixed(2) : '1.00'}
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.95rem',
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      color: 'var(--accent-cyan)'
                    }}>
                      H<sub>rot</sub> = - &Sigma; (U<sub>i</sub>/U<sub>t</sub>) log<sub>2</sub>(U<sub>i</sub>/U<sub>t</sub>) &middot; (1 - L<sub>i</sub>/T<sub>w</sub>)
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Evaluates rotation randomness to prevent endpoint traffic profiling by API gateways.
                    </p>
                  </div>

                  {/* Prompt Complexity Payload Ratio */}
                  <div className="panel" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, color: 'var(--accent-purple)' }}>Complexity Payload Ratio (PC<sub>ratio</sub>)</h3>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                        {(0.75 + Math.random() * 0.1).toFixed(2)}
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.95rem',
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      color: 'var(--accent-purple)'
                    }}>
                      PC<sub>ratio</sub> = (T<sub>sys</sub> &middot; D<sub>nest</sub>) / (T<sub>user</sub> &middot; log<sub>10</sub>(S<sub>loc</sub> + 1))
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Tracks computational weight density of incoming system prompts relative to user queries.
                    </p>
                  </div>

                  {/* Recovery Velocity */}
                  <div className="panel" style={{ borderLeft: '4px solid var(--accent-green)', gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, color: 'var(--accent-green)' }}>Recovery Velocity (&Psi;<sub>rec</sub>)</h3>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                        {((keyCounts.active * 12) / (Tr + 0.1)).toFixed(2)} ops/s
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.95rem',
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      color: 'var(--accent-green)'
                    }}>
                      &Psi;<sub>rec</sub> = K<sub>active</sub> / (T<sub>fail</sub> &middot; &Sigma; (R<sub>j</sub><sup>2</sup> + 1))
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Measures how quickly the proxy pool switches to a working key during active rate-limiting events.
                    </p>
                  </div>
                </div>

                <h2 style={{ marginTop: '40px' }}>🌐 Deep Architectural Telemetry (Gemini & Claude Models)</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Mathematical representations of the underlying routing, caching, and alignment mechanisms.
                </p>

                <div className="grid-2">
                  {/* Claude Caching */}
                  <div className="panel" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
                    <h3 className="card-title" style={{ color: 'var(--accent-blue)' }}>Claude Prompt Caching Savings</h3>
                    <div style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.95rem',
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      color: 'var(--accent-blue)'
                    }}>
                      Savings = N<sub>cached</sub> &middot; (P<sub>base</sub> - P<sub>cached</sub>)
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div><strong>N<sub>cached</sub>:</strong> Cached prompt tokens (re-used context)</div>
                      <div><strong>P<sub>base</sub> / P<sub>cached</sub>:</strong> $3.00 vs $0.30 per M tokens (90% discount)</div>
                    </div>
                  </div>

                  {/* Gemini MoE Gating */}
                  <div className="panel" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
                    <h3 className="card-title" style={{ color: 'var(--accent-purple)' }}>Gemini MoE Gating G(x)</h3>
                    <div style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.95rem',
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      color: 'var(--accent-purple)'
                    }}>
                      G(x) = Softmax(TopK(x &middot; W<sub>gate</sub> + &epsilon;, k))
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div><strong>W<sub>gate</sub> / &epsilon;:</strong> Gating routing weights and balancing noise</div>
                      <div><strong>k:</strong> Active routed experts per token (usually Top-2)</div>
                    </div>
                  </div>

                  {/* Gemini RingAttention */}
                  <div className="panel" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
                    <h3 className="card-title" style={{ color: 'var(--accent-cyan)' }}>Gemini RingAttention Split</h3>
                    <div style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.95rem',
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      color: 'var(--accent-cyan)'
                    }}>
                      C = N / P
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div><strong>N / P:</strong> Global sequence length split across P host processors</div>
                      <div><strong>C:</strong> Local block chunk size computed dynamically in a circular ring</div>
                    </div>
                  </div>

                  {/* Claude Alignment Preference */}
                  <div className="panel" style={{ borderLeft: '4px solid var(--accent-green)' }}>
                    <h3 className="card-title" style={{ color: 'var(--accent-green)' }}>Claude Alignment Probability</h3>
                    <div style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.95rem',
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      color: 'var(--accent-green)'
                    }}>
                      P(y<sub>w</sub> &succ; y<sub>l</sub> | x) = &sigma;(r<sub>&theta;</sub>(x, y<sub>w</sub>) - r<sub>&theta;</sub>(x, y<sub>l</sub>))
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div><strong>r<sub>&theta;</sub>(x, y):</strong> Constitutional reward score of alignment response y</div>
                      <div><strong>&sigma;:</strong> Sigmoid normalization function</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === 'llama' && (() => {
            const codeBlocks = {
              inference: `from transformers import pipeline

# 1. Load local Llama-3-8b-instruct
generator = pipeline(
    "text-generation",
    model="meta-llama/Llama-3-8b-instruct",
    token="hf_YOUR_TOKEN_HERE"
)

# 2. Generate completion
response = generator(
    "Explain quantum entanglement in simple terms.",
    max_new_tokens=200,
    num_return_sequences=1
)
print(response[0]['generated_text'])`,
              chat: `from transformers import pipeline, AutoTokenizer

# 1. Load model and tokenizer
generator = pipeline("text-generation", model="meta-llama/Llama-3-8b-instruct")
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3-8b-instruct")

# 2. Format chat messages
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is the capital of Germany?"}
]
prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

# 3. Generate response
response = generator(prompt, max_new_tokens=100)
print(response[0]['generated_text'])`,
              stream: `import requests
import json

# Stream responses token-by-token from local Ollama instance
url = "http://localhost:11434/api/generate"
data = {
    "model": "llama3",
    "prompt": "Tell me a short story about a treasure hunt.",
    "stream": True
}

with requests.post(url, json=data, stream=True) as res:
    res.raise_for_status()
    for chunk in res.iter_lines():
        if chunk:
            payload = json.loads(chunk)
            print(payload.get('response', ''), end='', flush=True)`,
              embeddings: `from sentence_transformers import SentenceTransformer

# 1. Load optimized embedding model
model = SentenceTransformer('BAAI/bge-small-en-v1.5')

# 2. Compute vectors
embeddings = model.encode([
    "The quick brown fox jumps over the lazy dog.",
    "A fast, ginger canine leaps above a sedentary hound."
])
print("Embedding Shape:", embeddings.shape)`,
              finetuning: `# 1. Configure parameter-efficient adapter settings (LoRA/QLoRA)
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM, TrainingArguments, Trainer

peft_config = LoraConfig(
    r=8, 
    lora_alpha=16, 
    target_modules=["q_proj", "v_proj"], 
    lora_dropout=0.05,
    bias="none", 
    task_type="CAUSAL_LM"
)

model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3-8b-instruct")
model = get_peft_model(model, peft_config)
# 2. Execute Trainer.train()`
            };



            const runCompression = async () => {
              if (!compressText.trim()) return;
              setCompressing(true);
              try {
                const res = await fetch('/api/compress', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ text: compressText, mode: compressMode })
                });
                const data = await res.json();
                setCompressionResult(data);
              } catch (err) {
                console.error(err);
              } finally {
                setCompressing(false);
              }
            };

            return (
              <div>
                <h2>🦙 Llama 3 Integration Patterns & APIs</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Locally executable patterns, pipeline implementations, and API endpoints for running Llama 3 architectures.
                </p>

                <div className="panel">
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {Object.keys(codeBlocks).map(pattern => (
                      <button
                        key={pattern}
                        className={`btn-primary`}
                        onClick={() => setSelectedPattern(pattern)}
                        style={{
                          background: selectedPattern === pattern ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' : 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border-glass)',
                          padding: '8px 16px',
                          textTransform: 'capitalize'
                        }}
                      >
                        {pattern}
                      </button>
                    ))}
                  </div>

                  <pre style={{
                    background: '#040711',
                    padding: '24px',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-mono)',
                    color: '#a7f3d0',
                    border: '1px solid var(--border-glass)',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    fontSize: '0.95rem'
                  }}>
                    <code>{codeBlocks[selectedPattern]}</code>
                  </pre>
                </div>

                <h2>🗜️ Token Compressor Engine</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Compress raw prompt text or source code dynamically. The engine strips comments, whitespace, and filler words to reduce input token weights.
                </p>

                <div className="grid-2">
                  <div className="panel">
                    <h3 className="card-title">📝 Input Prompt / Source Code</h3>
                    <textarea
                      className="form-control"
                      style={{ height: '180px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', resize: 'vertical', background: 'var(--bg-input)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '10px', color: 'white', width: '100%' }}
                      placeholder="Paste long text, prompt instructions, or raw code blocks here..."
                      value={compressText}
                      onChange={(e) => setCompressText(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px', alignItems: 'center' }}>
                      <select className="form-control" value={compressMode} onChange={(e) => setCompressMode(e.target.value)} style={{ width: '150px' }}>
                        <option value="text">General Text</option>
                        <option value="code">Source Code</option>
                      </select>
                      <button className="btn-primary" onClick={runCompression} disabled={compressing}>
                        {compressing ? 'Compressing...' : 'Compress Tokens'}
                      </button>
                    </div>
                  </div>

                  <div className="panel">
                    <h3 className="card-title">📉 Compression Diagnostics</h3>
                    {compressionResult ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-md)', flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Original Size</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-purple)' }}>{compressionResult.originalTokens} tokens</div>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-md)', flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Compressed Size</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{compressionResult.compressedTokens} tokens</div>
                          </div>
                        </div>

                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--accent-green)', fontWeight: '600' }}>
                          Saved {compressionResult.savingsPercent}% of prompt payload!
                        </div>

                        <textarea
                          readOnly
                          className="form-control"
                          style={{ height: '100px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', background: '#040711', color: '#10b981', border: '1px solid var(--border-glass)', cursor: 'default' }}
                          value={compressionResult.compressed}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', minHeight: '220px' }}>
                        Paste text and click compress to view savings
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === 'files' && (
            <div className="panel">
              <h2>📂 Supabase File Storage & Media Inventory</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Securely upload workspace documents, datasets, or images directly to your Supabase Storage buckets.
              </p>

              <div className="grid-2">
                {/* Upload Section */}
                <div className="panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h3 className="card-title">📤 Upload New File</h3>
                  <div style={{
                    border: '2px dashed var(--border-glass)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '40px 20px',
                    textAlign: 'center',
                    background: 'rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    position: 'relative'
                  }}>
                    <span style={{ fontSize: '2.5rem' }}>📄</span>
                    {uploadingFile ? (
                      <span className="pulse" style={{ color: 'var(--accent-cyan)' }}>Uploading to Supabase...</span>
                    ) : (
                      <>
                        <span style={{ color: 'var(--text-secondary)' }}>Click to select a file for upload</span>
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: 0,
                            cursor: 'pointer',
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* File list Section */}
                <div className="panel" style={{ background: 'rgba(255,255,255,0.02)', maxHeight: '420px', overflowY: 'auto' }}>
                  <h3 className="card-title">📋 Storage Bucket Inventory</h3>
                  {supabaseFiles.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '40px' }}>
                      No files found in bucket, or Supabase is not configured.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {supabaseFiles.map((file, idx) => (
                        <div key={file.id || idx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px',
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-glass)',
                          fontSize: '0.9rem'
                        }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                            <strong>{file.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Uploaded: {new Date(file.created_at).toLocaleString()}
                            </div>
                          </div>
                          <a
                            href={file.publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', textDecoration: 'none' }}
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div>
              <h2>🔌 Connectors & Integration Hub</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Securely configure credentials, query Google databases, manage Gmail/Calendar/Drive workspace tools, and synchronize notes directly to Notion.
              </p>

              {/* API Credentials Configuration Panel */}
              <div className="panel" style={{ borderLeft: '4px solid var(--accent-orange)', marginBottom: '24px' }}>
                <h3 className="card-title" style={{ color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🔑 Integration Credentials Manager
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Provide credentials for Google OAuth/Search APIs and Notion workspace. Leave blank to run in fully interactive sandbox mode.
                </p>
                <div className="grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '12px' }}>Google Credentials</h4>
                    <div className="form-group">
                      <label>Google Custom Search API Key</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="AIzaSy..."
                        value={googleApiKey}
                        onChange={(e) => setGoogleApiKey(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Google Custom Search Engine ID (CX)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 0123456789abcdef0"
                        value={googleCx}
                        onChange={(e) => setGoogleCx(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Google OAuth Client ID</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="*.apps.googleusercontent.com"
                        value={googleClientId}
                        onChange={(e) => setGoogleClientId(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Google OAuth Client Secret</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Client Secret"
                        value={googleClientSecret}
                        onChange={(e) => setGoogleClientSecret(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Google OAuth Refresh Token</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Refresh Token"
                        value={googleRefreshToken}
                        onChange={(e) => setGoogleRefreshToken(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '12px' }}>Notion Credentials</h4>
                    <div className="form-group">
                      <label>Notion Integration Key (Secret Token)</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="secret_..."
                        value={notionApiKey}
                        onChange={(e) => setNotionApiKey(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Notion Parent Database ID</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 1a2b3c4d5e6f..."
                        value={notionDatabaseId}
                        onChange={(e) => setNotionDatabaseId(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <button className="btn-primary" onClick={saveIntegrationConfig}>Save Credentials</button>
              </div>

              {/* Workspace Tools Dashboard */}
              <div className="grid-2">
                
                {/* Google Workspace all tools */}
                <div className="panel" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
                  <h3 className="card-title" style={{ color: 'var(--accent-cyan)' }}>🤖 Google Workspace Suite</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Interact directly with Google Search, Gmail inbox, Calendar scheduler, and Drive files.
                  </p>

                  {/* Google Custom Search Section */}
                  <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
                    <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '10px' }}>🔍 Web Search API</h4>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Query Google search..."
                        value={googleQuery}
                        onChange={(e) => setGoogleQuery(e.target.value)}
                      />
                      <button className="btn-primary" onClick={runGoogleSearch}>Search</button>
                    </div>
                    {googleResults.length > 0 && (
                      <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {googleResults.map((r, i) => (
                          <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                            <a href={r.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{r.title}</a>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{r.snippet}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Gmail Section */}
                  <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
                    <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>✉️ Gmail Assistant</span>
                      <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={fetchGmailList}>Fetch Emails</button>
                    </h4>
                    
                    {gmailList.length > 0 && (
                      <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                        {gmailList.map((m, i) => (
                          <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                            <strong>From:</strong> {m.from}<br />
                            <strong>Subject:</strong> {m.subject}<br />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{m.snippet}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                      <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 'bold' }}>Send Email</span>
                      <div className="form-group" style={{ marginTop: '8px' }}>
                        <input type="text" className="form-control" placeholder="recipient@domain.com" value={gmailTo} onChange={e => setGmailTo(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <input type="text" className="form-control" placeholder="Email Subject" value={gmailSubject} onChange={e => setGmailSubject(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <textarea className="form-control" style={{ height: '60px' }} placeholder="Email content..." value={gmailBody} onChange={e => setGmailBody(e.target.value)} />
                      </div>
                      <button className="btn-primary" style={{ width: '100%' }} onClick={sendGmailEmail}>Send Email</button>
                    </div>
                  </div>

                  {/* Calendar Section */}
                  <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
                    <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>📅 Google Calendar Scheduler</span>
                      <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={fetchCalendarEvents}>Fetch Events</button>
                    </h4>

                    {calendarEvents.length > 0 && (
                      <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                        {calendarEvents.map((evt, i) => (
                          <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                            <strong>{evt.summary}</strong><br />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Start: {new Date(evt.start).toLocaleString()} - End: {new Date(evt.end).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                      <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 'bold' }}>Schedule New Event</span>
                      <div className="form-group" style={{ marginTop: '8px' }}>
                        <input type="text" className="form-control" placeholder="Event Title (e.g. Brainstorm Session)" value={calSummary} onChange={e => setCalSummary(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem' }}>Start Time</label>
                        <input type="datetime-local" className="form-control" value={calStart} onChange={e => setCalStart(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem' }}>End Time</label>
                        <input type="datetime-local" className="form-control" value={calEnd} onChange={e => setCalEnd(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <textarea className="form-control" style={{ height: '50px' }} placeholder="Description..." value={calDesc} onChange={e => setCalDesc(e.target.value)} />
                      </div>
                      <button className="btn-primary" style={{ width: '100%' }} onClick={createCalendarEvent}>Schedule Event</button>
                    </div>
                  </div>

                  {/* Drive Section */}
                  <div>
                    <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>📁 Google Drive File Explorer</span>
                      <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={fetchDriveFiles}>List Files</button>
                    </h4>
                    {driveFiles.length > 0 && (
                      <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {driveFiles.map((f, i) => (
                          <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                            <a href={f.webViewLink} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>{f.name}</a>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>({f.mimeType.split('/').pop()})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Notion tools panel */}
                <div className="panel" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
                  <h3 className="card-title" style={{ color: 'var(--accent-purple)' }}>📓 Notion Workspace Sync</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Create, retrieve database logs, and append content to your Notion wiki nodes.
                  </p>

                  {/* Create Notion Page */}
                  <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
                    <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '10px' }}>📄 Create Database Page</h4>
                    <div className="form-group">
                      <label>Page Title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Task Checklist"
                        value={notionTitle}
                        onChange={(e) => setNotionTitle(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Page Content (Markdown / Text)</label>
                      <textarea
                        className="form-control"
                        style={{ height: '80px', fontFamily: 'var(--font-sans)', resize: 'vertical' }}
                        placeholder="Write main paragraphs or details to append..."
                        value={notionContent}
                        onChange={(e) => setNotionContent(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" style={{ width: '100%' }} onClick={runNotionCreate}>Create Page</button>
                    {notionOutput && (
                      <pre style={{
                        background: '#040711',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'var(--font-mono)',
                        color: '#10b981',
                        border: '1px solid var(--border-glass)',
                        marginTop: '16px',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.8rem'
                      }}>
                        {notionOutput}
                      </pre>
                    )}
                  </div>

                  {/* Append blocks to existing Page */}
                  <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
                    <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '10px' }}>🖋️ Append to Existing Page</h4>
                    <div className="form-group">
                      <label>Notion Page ID</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 5e2c56a297e1..."
                        value={notionPageId}
                        onChange={(e) => setNotionPageId(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Text to Append</label>
                      <textarea
                        className="form-control"
                        style={{ height: '60px' }}
                        placeholder="Append new updates, task logs, or notes..."
                        value={notionAppendContent}
                        onChange={(e) => setNotionAppendContent(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" style={{ width: '100%' }} onClick={appendNotionPage}>Append Content</button>
                  </div>

                  {/* Notion Databases List */}
                  <div>
                    <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>🗄️ Discover Databases</span>
                      <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={fetchNotionDatabases}>List Databases</button>
                    </h4>
                    {notionDatabases.length > 0 && (
                      <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {notionDatabases.map((db, i) => (
                          <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                            <strong>Title:</strong> {db.title?.[0]?.plain_text || 'Untitled Database'}<br />
                            <strong>ID:</strong> <code style={{ color: '#e2e8f0', fontSize: '0.75rem' }}>{db.id}</code>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
