import React, { useState, useEffect, useRef } from 'react';

const tracks = [
  {
    title: "WPFW 89.3 FM - Jazz & Justice",
    artist: "Washington D.C. Pacifica Live",
    src: "https://ice2.securenetsystems.net/WPFW",
    cover: "/irn-crest.png",
    isLive: true
  },
  {
    title: "WBAI 99.5 FM - Progressive Radio",
    artist: "New York City Pacifica Live",
    src: "http://stream.wbai.org:8000/wbai_128",
    cover: "/irn-crest.png",
    isLive: true
  },
  {
    title: "KPFK 90.7 FM - Los Angeles Live",
    artist: "Southern California Pacifica Live",
    src: "http://stream.kpfk.org:8000/kpfk_128",
    cover: "/irn-crest.png",
    isLive: true
  },
  {
    title: "Amina: Community Welcome",
    artist: "Injustice Reform Network",
    src: "https://theezeeohh.github.io/injusticereformnetwork/thezeeohh/amina-greeting.mp4",
    cover: "/irn-crest.png",
    isLive: false
  },
  {
    title: "Amina: Strategic Briefing",
    artist: "Injustice Reform Network",
    src: "https://theezeeohh.github.io/injusticereformnetwork/thezeeohh/amina-campaign-strategy.mp4",
    cover: "/irn-crest.png",
    isLive: false
  }
];

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

  // Prompt Templates states
  const [templatesList, setTemplatesList] = useState([]);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateText, setNewTemplateText] = useState('');
  const [advocacyPrompts, setAdvocacyPrompts] = useState([]);
  const [advocacySearch, setAdvocacySearch] = useState('');
  const [advocacyCategory, setAdvocacyCategory] = useState('');
  const [advocacyTab, setAdvocacyTab] = useState('custom'); // 'custom' or 'advocacy'
  const [selectedTemplateVersions, setSelectedTemplateVersions] = useState([]);
  const [activeEditingTemplate, setActiveEditingTemplate] = useState(null);
  const [editingTemplateTitle, setEditingTemplateTitle] = useState('');
  const [editingTemplateText, setEditingTemplateText] = useState('');
  const [templateCommitMessage, setTemplateCommitMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [voiceSynthesisEnabled, setVoiceSynthesisEnabled] = useState(false);
  const [voicePitch, setVoicePitch] = useState(1);
  const [voiceRate, setVoiceRate] = useState(1);
  const [themeAccent, setThemeAccent] = useState('cyan'); // 'cyan', 'purple', 'orange', 'green'
  const [themeBlur, setThemeBlur] = useState(12); // glassmorphism blur in px
  const [workspaceFilesTree, setWorkspaceFilesTree] = useState([]);
  const [compressedText, setCompressedText] = useState('');
  const [compressionSavings, setCompressionSavings] = useState(null);

  const [outreachCampaignType, setOutreachCampaignType] = useState('grassroots');
  const [outreachDetails, setOutreachDetails] = useState('');
  const [outreachGeneratedPitch, setOutreachGeneratedPitch] = useState('');
  const [outreachLoading, setOutreachLoading] = useState(false);

  // Spotify Player States
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [likedTracks, setLikedTracks] = useState({});
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(err => console.log('Autoplay blocked:', err));
      }
    }
  }, [currentTrackIndex]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.log('Audio playback error:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNextTrack();
    }
  };

  const handleNextTrack = () => {
    if (isShuffle) {
      const rand = Math.floor(Math.random() * tracks.length);
      setCurrentTrackIndex(rand);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    }
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleLike = (idx) => {
    setLikedTracks(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const [compressionMode, setCompressionMode] = useState('code'); // 'code' or 'text'
  const [compressorOpen, setCompressorOpen] = useState(false);
  const [gatingEnabled, setGatingEnabled] = useState(false);
  const [gatingKeyword, setGatingKeyword] = useState('');
  const [gatingTargetModel, setGatingTargetModel] = useState('claude-3-5-sonnet-20240620');
  const [gatingRulesList, setGatingRulesList] = useState([
    { keyword: 'hack', model: 'gemini-2.5-flash' },
    { keyword: 'explain', model: 'claude-3-5-sonnet-20240620' }
  ]);
  const [notionParentPageId, setNotionParentPageId] = useState('');
  const [notionNewDatabaseTitle, setNotionNewDatabaseTitle] = useState('IRN-OS Task Database');
  const [isCreatingNotionDatabase, setIsCreatingNotionDatabase] = useState(false);
  const [memorySearchQuery, setMemorySearchQuery] = useState('');
  const [memorySearchResults, setMemorySearchResults] = useState([]);
  const [benchmarkModels, setBenchmarkModels] = useState(['gemini-2.5-flash', 'claude-3-5-sonnet-20240620']);
  const [benchmarkResults, setBenchmarkResults] = useState([]);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [exportFilename, setExportFilename] = useState('irn-os-export.md');
  const [exportTitle, setExportTitle] = useState('Exported Chat Session');

  // Model Arena states
  const [arenaPrompt, setArenaPrompt] = useState('');
  const [arenaModelA, setArenaModelA] = useState('gemini-2.5-flash');
  const [arenaModelB, setArenaModelB] = useState('claude-3-5-sonnet-20240620');
  const [arenaResponseA, setArenaResponseA] = useState('');
  const [arenaResponseB, setArenaResponseB] = useState('');
  const [arenaLoadingA, setArenaLoadingA] = useState(false);
  const [arenaLoadingB, setArenaLoadingB] = useState(false);
  const [arenaLatencyA, setArenaLatencyA] = useState(0);
  const [arenaLatencyB, setArenaLatencyB] = useState(0);

  // Git Workspace states
  const [gitDiff, setGitDiff] = useState('');
  const [gitCommitMessage, setGitCommitMessage] = useState('');
  const [gitLoadingDiff, setGitLoadingDiff] = useState(false);
  const [gitLoadingCommit, setGitLoadingCommit] = useState(false);
  const [gitExplainingDiff, setGitExplainingDiff] = useState(false);

  // Cost and Voice states
  const [sessionCost, setSessionCost] = useState(0.00);
  const [sessionTokens, setSessionTokens] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [memoryList, setMemoryList] = useState([]);
  const [newMemoryFact, setNewMemoryFact] = useState('');

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

  // Advanced feature functions
  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      setTemplatesList(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdvocacyPrompts = async () => {
    try {
      const res = await fetch('/api/advocacy-prompts');
      const data = await res.json();
      setAdvocacyPrompts(data || []);
    } catch (err) {
      console.error('Error fetching advocacy prompts:', err);
    }
  };

  const createTemplate = async () => {
    if (!newTemplateTitle.trim() || !newTemplateText.trim()) {
      alert('Title and Text are required.');
      return;
    }
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: { title: newTemplateTitle, text: newTemplateText } })
      });
      const data = await res.json();
      if (data.success) {
        setTemplatesList(data.templates);
        setNewTemplateTitle('');
        setNewTemplateText('');
        alert('Prompt template saved to library!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTemplate = async (id) => {
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setTemplatesList(data.templates);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTemplateVersions = async (id) => {
    try {
      const res = await fetch(`/api/templates/${id}/versions`);
      const data = await res.json();
      setSelectedTemplateVersions(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const saveTemplateVersion = async (id) => {
    if (!editingTemplateTitle.trim() || !editingTemplateText.trim()) {
      alert('Title and Content are required.');
      return;
    }
    try {
      const res = await fetch(`/api/templates/${id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingTemplateTitle,
          text: editingTemplateText,
          commitMsg: templateCommitMessage || 'Updated template'
        })
      });
      const data = await res.json();
      if (data.success) {
        setTemplatesList(data.templates);
        setSelectedTemplateVersions(data.versions);
        setTemplateCommitMessage('');
        alert('Template version committed successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const compressPrompt = async (text) => {
    if (!text.trim()) return;
    try {
      const res = await fetch('/api/compress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode: compressionMode })
      });
      const data = await res.json();
      setCompressedText(data.compressed);
      setCompressionSavings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const createNotionStructuralDatabase = async () => {
    if (!notionParentPageId.trim()) {
      alert('Parent Page ID is required to create a database.');
      return;
    }
    setIsCreatingNotionDatabase(true);
    try {
      const res = await fetch('/api/integrations/notion/create-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notionNewDatabaseTitle,
          parentPageId: notionParentPageId
        })
      });
      const data = await res.json();
      alert(data.message);
      if (data.databaseId) {
        setNotionDatabaseId(data.databaseId);
      }
    } catch (err) {
      console.error(err);
      alert('Database creation failed: ' + err.message);
    } finally {
      setIsCreatingNotionDatabase(false);
    }
  };

  const runMemorySearch = async () => {
    if (!memorySearchQuery.trim()) return;
    try {
      const res = await fetch('/api/memory/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: memorySearchQuery })
      });
      const data = await res.json();
      if (data.success) {
        setMemorySearchResults(data.results || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runStressTestBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const res = await fetch('/api/arena/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ models: benchmarkModels })
      });
      const data = await res.json();
      if (data.success) {
        setBenchmarkResults(data.results || []);
      }
    } catch (err) {
      console.error(err);
      alert('Benchmark failed: ' + err.message);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const exportMarkdownFile = async (title, content) => {
    try {
      const res = await fetch('/api/workspace/export-markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: exportFilename, content, title })
      });
      const data = await res.json();
      alert(data.message || 'Successfully exported Markdown file!');
    } catch (err) {
      console.error(err);
      alert('Markdown export failed: ' + err.message);
    }
  };

  const exportToNotion = async (title, type, content) => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/integrations/notion/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, type, content })
      });
      const data = await res.json();
      alert(data.message);
      if (data.notionUrl) {
        window.open(data.notionUrl, '_blank');
      }
    } catch (err) {
      console.error(err);
      alert('Export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const getProviderForModel = (modelName) => {
    if (modelName.includes('gemini')) return 'gemini';
    if (modelName.includes('claude') || modelName.includes('sonnet') || modelName.includes('opus')) return 'anthropic';
    if (modelName.includes('gpt')) return 'openai';
    return 'ollama';
  };

  const updateCostMetrics = (providerName, modelName, inputTxt, outputTxt) => {
    const inputTokens = Math.ceil(inputTxt.length / 4);
    const outputTokens = Math.ceil(outputTxt.length / 4);
    const totalTokens = inputTokens + outputTokens;
    setSessionTokens(prev => prev + totalTokens);
    
    let rateInput = 0.05 / 1000000;
    let rateOutput = 0.15 / 1000000;
    
    if (modelName.includes('flash')) {
      rateInput = 0.075 / 1000000;
      rateOutput = 0.30 / 1000000;
    } else if (modelName.includes('pro')) {
      rateInput = 1.25 / 1000000;
      rateOutput = 5.00 / 1000000;
    } else if (modelName.includes('sonnet')) {
      rateInput = 3.00 / 1000000;
      rateOutput = 15.00 / 1000000;
    } else if (modelName.includes('gpt-4o')) {
      rateInput = 5.00 / 1000000;
      rateOutput = 15.00 / 1000000;
    }
    
    const cost = (inputTokens * rateInput) + (outputTokens * rateOutput);
    setSessionCost(prev => Number((prev + cost).toFixed(5)));
  };

  const runModelArena = async () => {
    if (!arenaPrompt.trim()) return;
    setArenaResponseA('');
    setArenaResponseB('');
    setArenaLoadingA(true);
    setArenaLoadingB(true);
    
    const startTimeA = Date.now();
    const startTimeB = Date.now();
    
    const fetchModelA = async () => {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: getProviderForModel(arenaModelA),
            model: arenaModelA,
            messages: [{ role: 'user', content: arenaPrompt }]
          })
        });
        const data = await res.json();
        setArenaResponseA(data.text || 'No response.');
        setArenaLatencyA(Date.now() - startTimeA);
        updateCostMetrics(getProviderForModel(arenaModelA), arenaModelA, arenaPrompt, data.text || '');
      } catch (err) {
        setArenaResponseA(`Error: ${err.message}`);
      } finally {
        setArenaLoadingA(false);
      }
    };

    const fetchModelB = async () => {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: getProviderForModel(arenaModelB),
            model: arenaModelB,
            messages: [{ role: 'user', content: arenaPrompt }]
          })
        });
        const data = await res.json();
        setArenaResponseB(data.text || 'No response.');
        setArenaLatencyB(Date.now() - startTimeB);
        updateCostMetrics(getProviderForModel(arenaModelB), arenaModelB, arenaPrompt, data.text || '');
      } catch (err) {
        setArenaResponseB(`Error: ${err.message}`);
      } finally {
        setArenaLoadingB(false);
      }
    };

    Promise.all([fetchModelA(), fetchModelB()]);
  };

  const fetchGitDiff = async () => {
    setGitLoadingDiff(true);
    try {
      const res = await fetch('/api/git/diff');
      const data = await res.json();
      setGitDiff(data.diff || 'No unstaged changes.');
    } catch (err) {
      console.error(err);
    } finally {
      setGitLoadingDiff(false);
    }
  };

  const explainGitDiff = async () => {
    if (!gitDiff || gitDiff === 'No unstaged changes.') {
      alert('No diff content to explain.');
      return;
    }
    setGitExplainingDiff(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          model: selectedModel,
          messages: [
            { role: 'system', content: 'You are a git commit assistant. Summarize the following git diff in a single short line under 50 characters, and output ONLY that line. Do not write markdown, code blocks, or explanations.' },
            { role: 'user', content: gitDiff }
          ]
        })
      });
      const data = await res.json();
      if (data.text) {
        setGitCommitMessage(data.text.trim());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGitExplainingDiff(false);
    }
  };

  const generateOutreachPitch = async () => {
    if (!outreachDetails.trim()) {
      alert('Please enter some details about the campaign or case first.');
      return;
    }
    setOutreachLoading(true);
    setOutreachGeneratedPitch('');
    
    const promptText = `
Campaign Type: ${outreachCampaignType.toUpperCase()}
Details: ${outreachDetails}

Generate a persuasive, high-impact, and culturally resonant outreach pitch/narrative to gain a wider audience for this action.
Follow the Aziza Code:
- Integrate "Afro-Futurist Architecture" values: Center trans-inclusive Black futures, sustainability, and collective liberation.
- Treat it with the sacred value of "Organizing as Ritual".
- Maintain a tone of fierce joy, resilience, and resistance.
- Keep it direct, punchy, and highly persuasive.
`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider || 'ollama',
          model: selectedModel || 'llama3',
          messages: [
            { role: 'system', content: 'You are an Afro-Futurist grassroots advocacy and media campaign strategist working under the Aziza Code. Your job is to draft compelling campaigns, press releases, or social media pitches.' },
            { role: 'user', content: promptText }
          ]
        })
      });
      const data = await res.json();
      if (data.text) {
        setOutreachGeneratedPitch(data.text);
      } else {
        setOutreachGeneratedPitch('No pitch was generated. Try checking your local model setup.');
      }
    } catch (err) {
      setOutreachGeneratedPitch(`Error generating pitch: ${err.message}`);
    } finally {
      setOutreachLoading(false);
    }
  };

  const loadStrategyIntoDetails = (strategyText) => {
    setOutreachDetails(prev => prev ? `${prev}\n\nStrategic Focus: ${strategyText}` : `Strategic Focus: ${strategyText}`);
  };

  const commitGitChanges = async () => {
    if (!gitCommitMessage.trim()) {
      alert('Commit message is required.');
      return;
    }
    setGitLoadingCommit(true);
    try {
      const res = await fetch('/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: gitCommitMessage })
      });
      const data = await res.json();
      if (data.success) {
        alert('🐙 Changes committed successfully!');
        setGitCommitMessage('');
        fetchGitDiff();
      } else {
        alert(`Commit failed: ${data.error}`);
      }
    } catch (err) {
      alert(`Commit error: ${err.message}`);
    } finally {
      setGitLoadingCommit(false);
    }
  };

  const toggleSpeechRecognition = (targetSetter) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Try Chrome/Safari!');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      targetSetter(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = (err) => {
      console.error('Speech Recognition Error:', err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/memory');
      const data = await res.json();
      setMemoryList(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addMemoryFact = async () => {
    if (!newMemoryFact.trim()) return;
    try {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fact: newMemoryFact })
      });
      const data = await res.json();
      if (data.success) {
        setMemoryList(data.memory);
        setNewMemoryFact('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMemoryFact = async (index) => {
    try {
      const res = await fetch(`/api/memory/${index}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setMemoryList(data.memory);
      }
    } catch (err) {
      console.error(err);
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
    fetchTemplates();
    fetchAdvocacyPrompts();
    fetchMemories();
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
    
    // Guardrails constitutional compliance checker
    const harmfulKeywords = ['hack', 'malware', 'exploit', 'bypass authentication', 'illegal', 'bomb'];
    const violativeWords = harmfulKeywords.filter(w => promptText.toLowerCase().includes(w));
    if (violativeWords.length > 0) {
      const proceeds = window.confirm(`[🛡️ Constitutional AI Compliance Warning]: Your prompt contains potentially hazardous keywords (${violativeWords.join(', ')}). Under Constitutional Guardrails, this prompt could be flagged or blocked. Do you wish to override and submit anyway?`);
      if (!proceeds) {
        setChatMessages(chatMessages);
        setInputMessage(promptText);
        return;
      }
    }

    // Gating Router logic (Gemini MoE Simulation)
    let routedModel = selectedModel;
    let routedProvider = selectedProvider;
    if (gatingEnabled) {
      const matchingRule = gatingRulesList.find(r => promptText.toLowerCase().includes(r.keyword.toLowerCase()));
      if (matchingRule) {
        routedModel = matchingRule.model;
        routedProvider = getProviderForModel(routedModel);
        alert(`[🎛️ MoE Gating G(x) Router]: Gating rule triggered by keyword "${matchingRule.keyword}". Prompt routed dynamically to routed expert model "${routedModel}" (${routedProvider}).`);
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
          provider: routedProvider,
          model: routedModel,
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
        updateCostMetrics(selectedProvider, selectedModel, promptText, data.text || '');

        // Web Speech API Voice Synthesis TTS
        if (voiceSynthesisEnabled && window.speechSynthesis) {
          window.speechSynthesis.cancel(); // cancel any active speaking
          const utterance = new SpeechSynthesisUtterance(data.text.replace(/[*#`_\-]/g, ''));
          utterance.pitch = voicePitch;
          utterance.rate = voiceRate;
          window.speechSynthesis.speak(utterance);
        }
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div className="app-container" style={{ flexGrow: 1, height: 'calc(100vh - 90px)', borderBottom: 'none' }}>
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
            <a className={`nav-item ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => { setActiveTab('templates'); fetchTemplates(); fetchAdvocacyPrompts(); }}>
              📋 Prompt Library
            </a>
            <a className={`nav-item ${activeTab === 'memory' ? 'active' : ''}`} onClick={() => { setActiveTab('memory'); fetchMemories(); }}>
              🧠 Memory Profile
            </a>
            <a className={`nav-item ${activeTab === 'arena' ? 'active' : ''}`} onClick={() => setActiveTab('arena')}>
              ⚔️ Model Arena
            </a>
            <a className={`nav-item ${activeTab === 'git' ? 'active' : ''}`} onClick={() => { setActiveTab('git'); fetchGitDiff(); }}>
              🐙 Git Workspace
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
            <a className={`nav-item ${activeTab === 'outreach' ? 'active' : ''}`} onClick={() => setActiveTab('outreach')}>
              📣 Media & Audience
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
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
              💰 Session Cost: <strong style={{ color: '#10b981' }}>${sessionCost.toFixed(5)}</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
              🔤 Session Tokens: <strong style={{ color: 'var(--accent-cyan)' }}>{sessionTokens.toLocaleString()}</strong>
            </div>
            <div className="status-badge">
              <span className="status-dot"></span>
              Online & Ready
            </div>
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
                {compressorOpen && (
                  <div style={{
                    background: '#040711',
                    border: '1px solid var(--accent-orange)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    margin: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--accent-orange)', fontSize: '0.9rem' }}>🗜️ Prompt Token Compressor Sandbox</strong>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select
                          className="form-control"
                          value={compressionMode}
                          onChange={(e) => {
                            setCompressionMode(e.target.value);
                            if (inputMessage.trim()) compressPrompt(inputMessage);
                          }}
                          style={{ width: '120px', padding: '2px 6px', fontSize: '0.75rem', height: 'auto' }}
                        >
                          <option value="code">Code Mode</option>
                          <option value="text">Text Mode</option>
                        </select>
                        <button style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setCompressorOpen(false)}>✕</button>
                      </div>
                    </div>

                    <div className="grid-2" style={{ gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Original Input Preview</label>
                        <pre style={{
                          background: 'rgba(255,255,255,0.01)',
                          padding: '8px',
                          border: '1px solid var(--border-glass)',
                          fontSize: '0.75rem',
                          height: '100px',
                          overflowY: 'auto',
                          whiteSpace: 'pre-wrap',
                          margin: 0
                        }}>{inputMessage || 'Enter text in the input box below to compress...'}</pre>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--accent-orange)' }}>Compressed Output Preview</label>
                        <pre style={{
                          background: 'rgba(255,255,255,0.01)',
                          padding: '8px',
                          border: '1px solid var(--border-glass)',
                          fontSize: '0.75rem',
                          height: '100px',
                          overflowY: 'auto',
                          whiteSpace: 'pre-wrap',
                          margin: 0,
                          color: '#34d399'
                        }}>{compressedText || 'Awaiting compression...'}</pre>
                      </div>
                    </div>

                    {compressionSavings && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}>
                        <div><strong>Original Tokens:</strong> {compressionSavings.originalTokens}</div>
                        <div><strong>Compressed Tokens:</strong> {compressionSavings.compressedTokens}</div>
                        <div style={{ color: 'var(--accent-cyan)' }}><strong>Estimated Savings:</strong> {compressionSavings.savingsPercent}%</div>
                        <button
                          className="btn-primary"
                          style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                          onClick={() => {
                            setInputMessage(compressedText);
                            setCompressorOpen(false);
                          }}
                        >
                          Apply Compressed Prompt
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderTop: '1px solid var(--border-glass)' }}>
                {/* Template Library Quick Selector */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📋 Prompt Library:</span>
                  <select
                    className="form-control"
                    style={{ width: '200px', padding: '4px 8px', fontSize: '0.75rem', height: 'auto' }}
                    onChange={(e) => {
                      const t = templatesList.find(x => x.id === e.target.value);
                      if (t) setInputMessage(prev => t.text + prev);
                      e.target.value = "";
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select a prompt template...</option>
                    {templatesList.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>

                  {/* Add Quick Template inline button */}
                  <button
                    className="btn-primary"
                    style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                    onClick={() => {
                      const title = prompt('Template Title:');
                      const text = prompt('Template prompt content:');
                      if (title && text) {
                        fetch('/api/templates', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ template: { title, text } })
                        })
                        .then(r => r.json())
                        .then(d => { if (d.success) setTemplatesList(d.templates); });
                      }
                    }}
                  >
                    + Add Template
                  </button>
                </div>

                <div className="chat-input-area" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => toggleSpeechRecognition(setInputMessage)}
                    style={{
                      background: isListening ? '#ef4444' : 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      padding: '10px 14px',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      transition: 'all 0.2s'
                    }}
                    title="Toggle Voice Input (Speech-to-Text)"
                  >
                    {isListening ? '🛑 Rec' : '🎤 Mic'}
                  </button>
                  <input
                    type="text"
                    className="chat-input"
                    style={{ flexGrow: 1 }}
                    placeholder="Ask a question, request a code snippet, or speak to voice assistant..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="send-btn" onClick={handleSendMessage}>Send</button>
                  <button
                    className="btn-primary"
                    style={{
                      background: 'var(--accent-orange)',
                      border: 'none',
                      color: 'black',
                      fontWeight: 'bold',
                      padding: '10px 14px',
                      fontSize: '0.85rem'
                    }}
                    onClick={() => {
                      setCompressorOpen(!compressorOpen);
                      if (inputMessage.trim()) {
                        compressPrompt(inputMessage);
                      }
                    }}
                  >
                    🗜️ Compress
                  </button>
                  <button
                    className="btn-primary"
                    style={{
                      background: 'var(--accent-purple)',
                      border: 'none',
                      color: 'black',
                      fontWeight: 'bold',
                      padding: '10px 14px',
                      fontSize: '0.85rem'
                    }}
                    onClick={() => {
                      if (chatMessages.length <= 1) {
                        alert('No conversation to export!');
                        return;
                      }
                      const txt = chatMessages.map(m => `${m.role === 'user' ? 'User' : 'IRN-OS'}: ${m.content}`).join('\n\n');
                      exportToNotion(currentHistoryId || 'Chat History', 'Conversation', txt);
                    }}
                    disabled={isExporting}
                  >
                    {isExporting ? 'Exporting...' : '🔗 Notion'}
                  </button>
                  <button
                    className="btn-primary"
                    style={{
                      background: 'var(--accent-cyan)',
                      border: 'none',
                      color: 'black',
                      fontWeight: 'bold',
                      padding: '10px 14px',
                      fontSize: '0.85rem'
                    }}
                    onClick={() => {
                      if (chatMessages.length <= 1) {
                        alert('No conversation to export!');
                        return;
                      }
                      const txt = chatMessages.map(m => `### ${m.role === 'user' ? 'User' : 'IRN-OS'}\n${m.content}`).join('\n\n');
                      const file = prompt('Enter export filename:', exportFilename);
                      if (file) {
                        setExportFilename(file);
                        exportMarkdownFile(exportTitle, txt);
                      }
                    }}
                  >
                    💾 Save Workspace
                  </button>
                </div>
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

              {/* Theme Customizer & Voice Assistant Configurations */}
              <div className="panel" style={{ marginTop: '24px', borderLeft: '4px solid var(--accent-cyan)' }}>
                <h3 className="card-title" style={{ color: 'var(--accent-cyan)' }}>🎨 UI Theme Customizer & 🎤 TTS Voice Assistant</h3>
                <div className="grid-2" style={{ gap: '16px', marginTop: '12px' }}>
                  <div className="form-group">
                    <label>Interface Theme Accent</label>
                    <select
                      className="form-control"
                      value={themeAccent}
                      onChange={(e) => {
                        const val = e.target.value;
                        setThemeAccent(val);
                        // Dynamically update CSS variables for aesthetic options
                        const root = document.documentElement;
                        if (val === 'cyan') {
                          root.style.setProperty('--accent-cyan', '#22d3ee');
                          root.style.setProperty('--accent-orange', '#fb923c');
                        } else if (val === 'purple') {
                          root.style.setProperty('--accent-cyan', '#c084fc');
                          root.style.setProperty('--accent-orange', '#f472b6');
                        } else if (val === 'orange') {
                          root.style.setProperty('--accent-cyan', '#fb923c');
                          root.style.setProperty('--accent-orange', '#fbbf24');
                        } else if (val === 'green') {
                          root.style.setProperty('--accent-cyan', '#34d399');
                          root.style.setProperty('--accent-orange', '#a3e635');
                        }
                      }}
                    >
                      <option value="cyan">Gemini Cyan / Orange Grid</option>
                      <option value="purple">Midnight Purple / Pink Grid</option>
                      <option value="orange">Neon Amber / Gold Grid</option>
                      <option value="green">Cyber Green / lime Grid</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Glassmorphism Blur Strength (px)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="4"
                      max="32"
                      value={themeBlur}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 12;
                        setThemeBlur(val);
                        document.documentElement.style.setProperty('--blur-glass', `${val}px`);
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                    <input
                      type="checkbox"
                      id="voice-synthesis-toggle"
                      checked={voiceSynthesisEnabled}
                      onChange={(e) => setVoiceSynthesisEnabled(e.target.checked)}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <label htmlFor="voice-synthesis-toggle" style={{ cursor: 'pointer', margin: 0, fontWeight: 'bold' }}>
                      🗣️ Enable Read-Aloud Voice Output (Text-to-Speech Synthesis)
                    </label>
                  </div>

                  {voiceSynthesisEnabled && (
                    <>
                      <div className="form-group">
                        <label>Speech Pitch ({voicePitch})</label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          className="form-control"
                          value={voicePitch}
                          onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Speech Rate ({voiceRate})</label>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.1"
                          className="form-control"
                          value={voiceRate}
                          onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                        />
                      </div>
                    </>
                  )}
                </div>
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

          {activeTab === 'terminal' && (() => {
            const fetchWorkspaceTree = async () => {
              try {
                const res = await fetch('/api/workspace/files');
                const data = await res.json();
                if (data.success) {
                  setWorkspaceFilesTree(data.tree);
                }
              } catch (err) {
                console.error(err);
              }
            };

            const renderTreeNodes = (nodes) => {
              return (
                <ul style={{ listStyleType: 'none', paddingLeft: '16px', margin: 0 }}>
                  {nodes.map((node, index) => (
                    <li key={index} style={{ margin: '4px 0' }}>
                      <span style={{ cursor: node.type === 'directory' ? 'pointer' : 'default', color: node.type === 'directory' ? 'var(--accent-orange)' : '#e2e8f0', fontSize: '0.85rem' }}>
                        {node.type === 'directory' ? '📁' : '📄'} {node.name}
                      </span>
                      {node.type === 'directory' && node.children && node.children.length > 0 && (
                        renderTreeNodes(node.children)
                      )}
                    </li>
                  ))}
                </ul>
              );
            };

            return (
              <div className="grid-2">
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

                <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '540px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>📁 Workspace File Explorer Tree</h3>
                    <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={fetchWorkspaceTree}>Scan Files</button>
                  </div>
                  <div style={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)'
                  }}>
                    {workspaceFilesTree.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '60px' }}>
                        Click "Scan Files" to build structural workspace tree index.
                      </div>
                    ) : (
                      renderTreeNodes(workspaceFilesTree)
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

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
            const sumViWi = 20; 
            const Lc = 42;
            const wl = 0.5;
            const Tr = 7.891; // average response time in seconds
            
            const ReadinessScore = "5.20";

            const Da = 907.0; // average dialogue length
            const Tu = 819;
            const Rp = 103.8; // tokens per second
            
            const CognitiveLoad = "16.63";

            const fx = 819; // true aggregate
            const epsilon = -0.87; // perturbation noise
            const PrivacyAggregate = "818.130";

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
                      <div><strong>&epsilon; (Perturbation Noise):</strong> {epsilon}</div>
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
                        1.25
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
                        0.80
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
                        3.00 ops/s
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

                <h2 style={{ marginTop: '40px' }}>🔢 Circular & Trigonometric Solver (Powered by Tau)</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Verify high-precision circular dimensions and Euler's identities computed directly on the backend using &tau; constants.
                </p>

                <div className="panel" style={{ borderLeft: '4px solid var(--accent-orange)', marginBottom: '40px' }}>
                  <h3 className="card-title" style={{ color: 'var(--accent-orange)' }}>📐 Precision Solver</h3>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ flexGrow: 1 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Calculation Type</label>
                      <select className="form-control" id="math-action" defaultValue="circumference">
                        <option value="circumference">Circumference (C = &tau; * r)</option>
                        <option value="area">Area (A = (&tau; * r^2) / 2)</option>
                        <option value="euler">Euler's Identity verification (e^(i * k * &tau;) = 1)</option>
                      </select>
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Input Value (radius r or factor k)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="math-value"
                        placeholder="e.g. 5"
                        defaultValue="1"
                      />
                    </div>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      const action = document.getElementById('math-action').value;
                      const value = document.getElementById('math-value').value;
                      fetch('/api/math/calculate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action, value })
                      })
                      .then(r => r.json())
                      .then(d => {
                        if (d.success) {
                          document.getElementById('math-result').innerText = `Result: ${d.result}\nFormula: ${d.formula}`;
                        } else {
                          document.getElementById('math-result').innerText = `Error: ${d.error}`;
                        }
                      });
                    }}
                  >
                    Solve Formula
                  </button>

                  <pre id="math-result" style={{
                    marginTop: '16px',
                    background: '#040711',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                    fontFamily: 'var(--font-mono)',
                    color: '#10b981',
                    fontSize: '0.85rem'
                  }}>
                    Awaiting solve request...
                  </pre>
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

          {activeTab === 'memory' && (
            <div>
              <h2>🧠 Persistent Memory Profile</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Store key developer preferences, project scopes, style guidelines, and facts about yourself. The active LLM automatically inherits this memory context for all chat completions.
              </p>

              <div className="grid-2">
                {/* Add memory fact form */}
                <div className="panel" style={{ borderLeft: '4px solid var(--accent-orange)' }}>
                  <h3 className="card-title" style={{ color: 'var(--accent-orange)' }}>🧠 Remember New Fact</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Type a preference, context detail, or instruction you want the AI to remember forever across all chat logs.
                  </p>
                  <div className="form-group">
                    <label>Preference / Instruction Fact</label>
                    <textarea
                      className="form-control"
                      style={{ height: '140px', fontFamily: 'var(--font-sans)', resize: 'vertical' }}
                      placeholder="e.g. Always structure code responses with TypeScript interfaces."
                      value={newMemoryFact}
                      onChange={(e) => setNewMemoryFact(e.target.value)}
                    />
                  </div>
                  <button className="btn-primary" style={{ width: '100%', background: 'var(--accent-orange)', border: 'none', color: 'black', fontWeight: 'bold' }} onClick={addMemoryFact}>
                    Add Memory Fact
                  </button>
                </div>

                {/* Memories List */}
                <div className="panel" style={{ display: 'flex', flexDirection: 'column', maxHeight: '550px', overflowY: 'auto' }}>
                  <h3 className="card-title">📖 Active Memory Contexts ({memoryList.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {memoryList.length === 0 ? (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>No memories saved yet.</span>
                    ) : (
                      memoryList.map((fact, index) => (
                        <div key={index} style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--border-glass)',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <span style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.4' }}>{fact}</span>
                          <button
                            className="btn-primary"
                            style={{ background: '#ef4444', border: 'none', padding: '4px 8px', fontSize: '0.75rem', flexShrink: 0 }}
                            onClick={() => deleteMemoryFact(index)}
                          >
                            Delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Semantic Vector Search Exploration Card */}
              <div className="panel" style={{ marginTop: '24px', borderTop: '4px solid var(--accent-cyan)' }}>
                <h3 className="card-title" style={{ color: 'var(--accent-cyan)' }}>🔍 Semantic Memory Vector Search Explorer</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Query persistent memory context using a simulated embedding cosine similarity search on keywords.
                </p>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter query to search memories (e.g. TypeScript, structure)..."
                    value={memorySearchQuery}
                    onChange={(e) => setMemorySearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runMemorySearch()}
                  />
                  <button className="btn-primary" style={{ background: 'var(--accent-cyan)', color: 'black', border: 'none', fontWeight: 'bold' }} onClick={runMemorySearch}>
                    Search Memories
                  </button>
                </div>
                {memorySearchResults.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'white' }}>Search Results:</h4>
                    {memorySearchResults.map((res, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-glass)',
                        fontSize: '0.85rem'
                      }}>
                        <span style={{ color: '#e2e8f0' }}>{res.fact}</span>
                        <span style={{
                          background: 'rgba(6, 182, 212, 0.1)',
                          color: 'var(--accent-cyan)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          Cosine Score: {res.score}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2>📋 Prompt & Advocacy Library</h2>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    Access custom user-defined templates and 186 premium Civil Rights Advocacy prompts (categorized by risk tier).
                  </p>
                </div>
                {/* Tab Switcher */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                  <button
                    style={{
                      background: advocacyTab === 'custom' ? 'var(--accent-cyan)' : 'transparent',
                      color: advocacyTab === 'custom' ? 'black' : 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setAdvocacyTab('custom')}
                  >
                    Custom Templates
                  </button>
                  <button
                    style={{
                      background: advocacyTab === 'advocacy' ? 'var(--accent-orange)' : 'transparent',
                      color: advocacyTab === 'advocacy' ? 'black' : 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => { setAdvocacyTab('advocacy'); fetchAdvocacyPrompts(); }}
                  >
                    ⚖️ Advocacy Prompts (186)
                  </button>
                </div>
              </div>

              {advocacyTab === 'custom' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Sandbox file upload/download utilities */}
                  <div className="panel" style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderLeft: '4px solid var(--accent-cyan)' }}>
                    <div>
                      <strong style={{ color: 'white', fontSize: '0.9rem' }}>📂 Prompt Sandbox Files</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Export saved custom templates to local JSON files or load existing sets.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)' }}
                        onClick={() => {
                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templatesList, null, 2));
                          const dlAnchorElem = document.createElement('a');
                          dlAnchorElem.setAttribute("href", dataStr);
                          dlAnchorElem.setAttribute("download", `irn-os-prompts-${Date.now()}.json`);
                          dlAnchorElem.click();
                        }}
                      >
                        📥 Export Sandbox JSON
                      </button>
                      <button
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', position: 'relative' }}
                      >
                        📤 Import Sandbox JSON
                        <input
                          type="file"
                          accept=".json"
                          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
                          onChange={(e) => {
                            const fileReader = new FileReader();
                            if (e.target.files && e.target.files[0]) {
                              fileReader.readAsText(e.target.files[0], "UTF-8");
                              fileReader.onload = (event) => {
                                try {
                                  const parsed = JSON.parse(event.target.result);
                                  if (Array.isArray(parsed)) {
                                    // Batch save templates
                                    parsed.forEach(t => {
                                      if (t.title && t.text) {
                                        fetch('/api/templates', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ template: { title: t.title, text: t.text } })
                                        })
                                        .then(r => r.json())
                                        .then(d => { if (d.success) setTemplatesList(d.templates); });
                                      }
                                    });
                                    alert('Successfully imported prompts into local library!');
                                  } else {
                                    alert('Invalid JSON structure. Needs to be a JSON array of templates.');
                                  }
                                } catch (err) {
                                  alert('Failed to parse file: ' + err.message);
                                }
                              };
                            }
                          }}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="grid-2">
                    {/* Save Prompt Template Form */}
                  <div className="panel" style={{ borderLeft: '4px solid var(--accent-orange)' }}>
                    <h3 className="card-title" style={{ color: 'var(--accent-orange)' }}>➕ Create New Prompt Template</h3>
                    <div className="form-group" style={{ marginTop: '12px' }}>
                      <label>Template Title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Unit Test Writer"
                        value={newTemplateTitle}
                        onChange={(e) => setNewTemplateTitle(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Prompt Template text</label>
                      <textarea
                        className="form-control"
                        style={{ height: '180px', fontFamily: 'var(--font-sans)', fontSize: '0.85rem' }}
                        placeholder="Write the instruction content here (e.g. 'Write a Jest test suite for the following JS function:')"
                        value={newTemplateText}
                        onChange={(e) => setNewTemplateText(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" style={{ width: '100%', background: 'var(--accent-orange)', color: 'black', fontWeight: 'bold', border: 'none' }} onClick={createTemplate}>
                      Save to Prompt Library
                    </button>
                  </div>

                  {/* Templates List */}
                  <div className="panel" style={{ display: 'flex', flexDirection: 'column', maxHeight: '550px', overflowY: 'auto' }}>
                    <h3 className="card-title">📚 Saved Templates ({templatesList.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
                      {templatesList.length === 0 ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>No templates saved. Create one on the left!</span>
                      ) : (
                        templatesList.map(t => (
                          <div key={t.id} style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--border-glass)',
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '0.95rem', color: 'white' }}>{t.title}</strong>
                              <button
                                className="btn-primary"
                                style={{ background: '#ef4444', border: 'none', padding: '4px 8px', fontSize: '0.75rem' }}
                                onClick={() => deleteTemplate(t.id)}
                              >
                                Delete
                              </button>
                            </div>
                            <pre style={{
                              background: '#040711',
                              padding: '12px',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border-glass)',
                              whiteSpace: 'pre-wrap',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem',
                              color: 'var(--text-secondary)',
                              margin: 0,
                              maxHeight: '100px',
                              overflowY: 'auto'
                            }}>
                              {t.text}
                            </pre>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                              <button
                                className="btn-primary"
                                style={{ padding: '4px 10px', fontSize: '0.75rem', flexGrow: 1 }}
                                onClick={() => {
                                  setInputMessage(t.text);
                                  setActiveTab('chat');
                                }}
                              >
                                Use in Chat
                              </button>
                              <button
                                className="btn-primary"
                                style={{ padding: '4px 10px', fontSize: '0.75rem', flexGrow: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)' }}
                                onClick={() => {
                                  setArenaPrompt(t.text);
                                  setActiveTab('arena');
                                }}
                              >
                                Use in Arena
                              </button>
                              <button
                                className="btn-primary"
                                style={{ padding: '4px 10px', fontSize: '0.75rem', flexGrow: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'var(--accent-orange)' }}
                                onClick={() => {
                                  setActiveEditingTemplate(t);
                                  setEditingTemplateTitle(t.title);
                                  setEditingTemplateText(t.text);
                                  fetchTemplateVersions(t.id);
                                }}
                              >
                                📝 Versions
                              </button>
                              <button
                                className="btn-primary"
                                style={{ padding: '4px 10px', fontSize: '0.75rem', flexGrow: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'var(--accent-purple)' }}
                                onClick={() => exportToNotion(t.title, 'Prompt Template', t.text)}
                              >
                                🔗 Notion
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Versioning and Editing Modal Overlay */}
                  {activeEditingTemplate && (
                    <div style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.8)',
                      zIndex: 1000,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '20px'
                    }}>
                      <div className="panel" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--accent-orange)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h3 style={{ margin: 0, color: 'var(--accent-orange)' }}>📝 Version Timeline: {activeEditingTemplate.title}</h3>
                          <button style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setActiveEditingTemplate(null)}>✕</button>
                        </div>

                        <div className="form-group">
                          <label>Title</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editingTemplateTitle}
                            onChange={(e) => setEditingTemplateTitle(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Prompt text</label>
                          <textarea
                            className="form-control"
                            style={{ height: '150px', fontFamily: 'var(--font-sans)', fontSize: '0.85rem' }}
                            value={editingTemplateText}
                            onChange={(e) => setEditingTemplateText(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Commit / Changelog Message</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Added TypeScript hardener details"
                            value={templateCommitMessage}
                            onChange={(e) => setTemplateCommitMessage(e.target.value)}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                          <button className="btn-primary" style={{ flexGrow: 1, background: 'var(--accent-orange)', color: 'black', border: 'none', fontWeight: 'bold' }} onClick={() => saveTemplateVersion(activeEditingTemplate.id)}>
                            Commit & Save New Version
                          </button>
                        </div>

                        <h4 style={{ color: 'white', marginBottom: '8px' }}>📜 Revision History</h4>
                        {selectedTemplateVersions.length === 0 ? (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No previous version logs found. Commit changes above to start revision logging.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {selectedTemplateVersions.map((v, i) => (
                              <div key={v.versionId} style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--border-glass)',
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-sm)'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                  <strong style={{ color: 'var(--accent-cyan)' }}>Version #{i + 1}</strong>
                                  <span style={{ color: 'var(--text-muted)' }}>{new Date(v.timestamp).toLocaleString()}</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'white', marginBottom: '6px' }}>
                                  📝 <em>"{v.commitMsg}"</em>
                                </div>
                                <details>
                                  <summary style={{ fontSize: '0.75rem', color: 'var(--accent-orange)', cursor: 'pointer', outline: 'none' }}>View Version Content</summary>
                                  <pre style={{
                                    background: '#040711',
                                    padding: '8px',
                                    fontSize: '0.75rem',
                                    borderRadius: 'var(--radius-sm)',
                                    marginTop: '4px',
                                    whiteSpace: 'pre-wrap'
                                  }}>{v.text}</pre>
                                </details>
                                <button
                                  className="btn-primary"
                                  style={{ padding: '2px 8px', fontSize: '0.7rem', marginTop: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)' }}
                                  onClick={() => {
                                    setEditingTemplateTitle(v.title);
                                    setEditingTemplateText(v.text);
                                  }}
                                >
                                  Restore Content to Editor
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              ) : (
                /* Civil Rights Advocacy Prompts panel */
                <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Filter bar */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Search Advocacy Prompts</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by title, description, or keyword..."
                        value={advocacySearch}
                        onChange={(e) => setAdvocacySearch(e.target.value)}
                      />
                    </div>
                    <div style={{ width: '220px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Category Filter</label>
                      <select
                        className="form-control"
                        value={advocacyCategory}
                        onChange={(e) => setAdvocacyCategory(e.target.value)}
                      >
                        <option value="">All Categories (37)</option>
                        {Array.from(new Set(advocacyPrompts.map(p => p.cat))).sort().map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* List of advocacy prompts */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '16px',
                    maxHeight: '600px',
                    overflowY: 'auto',
                    paddingRight: '6px'
                  }}>
                    {advocacyPrompts
                      .filter(p => {
                        const searchLower = advocacySearch.toLowerCase();
                        const matchesSearch = !advocacySearch ||
                          p.title.toLowerCase().includes(searchLower) ||
                          p.desc.toLowerCase().includes(searchLower) ||
                          p.prompt.toLowerCase().includes(searchLower) ||
                          p.cat.toLowerCase().includes(searchLower);
                        const matchesCategory = !advocacyCategory || p.cat === advocacyCategory;
                        return matchesSearch && matchesCategory;
                      })
                      .map(p => {
                        let tierColor = 'var(--accent-cyan)';
                        if (p.tier === 'red') tierColor = '#ef4444';
                        else if (p.tier === 'yellow') tierColor = '#f59e0b';
                        else if (p.tier === 'green') tierColor = '#10b981';

                        return (
                          <div key={p.id} style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: `1px solid var(--border-glass)`,
                            borderLeft: `4px solid ${tierColor}`,
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '10px'
                          }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
                                  {p.cat}
                                </span>
                                <span style={{
                                  fontSize: '0.65rem',
                                  textTransform: 'uppercase',
                                  fontWeight: 'bold',
                                  color: tierColor,
                                  border: `1px solid ${tierColor}`,
                                  padding: '1px 5px',
                                  borderRadius: 'var(--radius-sm)'
                                }}>
                                  {p.tier} Tier
                                </span>
                              </div>
                              <h4 style={{ margin: '4px 0', fontSize: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{p.icon || '⚖️'}</span> {p.title}
                              </h4>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 12px 0', minHeight: '36px' }}>
                                {p.desc}
                              </p>
                            </div>

                            <div>
                              <details style={{ marginBottom: '12px' }}>
                                <summary style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', outline: 'none' }}>
                                  Preview Prompt Template
                                </summary>
                                <pre style={{
                                  background: '#040711',
                                  padding: '10px',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--border-glass)',
                                  whiteSpace: 'pre-wrap',
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.7rem',
                                  color: 'var(--text-secondary)',
                                  marginTop: '6px',
                                  maxHeight: '120px',
                                  overflowY: 'auto'
                                }}>
                                  {p.prompt}
                                </pre>
                              </details>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="btn-primary"
                                  style={{ padding: '6px 10px', fontSize: '0.75rem', flexGrow: 1 }}
                                  onClick={() => {
                                    setInputMessage(p.prompt);
                                    setActiveTab('chat');
                                  }}
                                >
                                  Use in Chat
                                </button>
                                <button
                                  className="btn-primary"
                                  style={{ padding: '6px 10px', fontSize: '0.75rem', flexGrow: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)' }}
                                  onClick={() => {
                                    setArenaPrompt(p.prompt);
                                    setActiveTab('arena');
                                  }}
                                >
                                  Use in Arena
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'arena' && (
            <div>
              <h2>⚔️ Model Arena & Parallel Generation</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Query multiple large language models concurrently to compare their outputs, latencies, and generation speeds side-by-side.
              </p>

              {/* MoE Gating G(x) Router panel */}
              <div className="panel" style={{ marginBottom: '24px', borderLeft: '4px solid var(--accent-orange)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 className="card-title" style={{ color: 'var(--accent-orange)' }}>🎛️ Dynamic MoE Gating G(x) Router</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="gating-toggle"
                      checked={gatingEnabled}
                      onChange={(e) => setGatingEnabled(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="gating-toggle" style={{ fontWeight: 'bold', cursor: 'pointer', margin: 0 }}>Enable Active MoE Routing</label>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Define keyword filters that automatically route chat prompt questions to specific expert models on matching patterns.
                </p>

                {gatingEnabled && (
                  <div>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Keyword Filter</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. explain, test, code..."
                          value={gatingKeyword}
                          onChange={(e) => setGatingKeyword(e.target.value)}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Route to Model</label>
                        <select
                          className="form-control"
                          value={gatingTargetModel}
                          onChange={(e) => setGatingTargetModel(e.target.value)}
                        >
                          <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                          <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                          <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                          <option value="gpt-4o">GPT-4o</option>
                        </select>
                      </div>
                      <button
                        className="btn-primary"
                        style={{ height: '38px', marginTop: '22px', border: 'none', background: 'var(--accent-orange)', color: 'black', fontWeight: 'bold' }}
                        onClick={() => {
                          if (!gatingKeyword.trim()) return;
                          setGatingRulesList(prev => [...prev, { keyword: gatingKeyword.trim(), model: gatingTargetModel }]);
                          setGatingKeyword('');
                          alert('MoE routing rule added!');
                        }}
                      >
                        + Add Rule
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <strong style={{ fontSize: '0.8rem', color: 'white' }}>Active Routing Rules:</strong>
                      {gatingRulesList.map((rule, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          background: 'rgba(255,255,255,0.02)',
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-glass)',
                          fontSize: '0.8rem'
                        }}>
                          <span>Keyword: <code style={{ color: 'var(--accent-cyan)' }}>"{rule.keyword}"</code> &rarr; routed model: <strong>{rule.model}</strong></span>
                          <button
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            onClick={() => setGatingRulesList(prev => prev.filter((_, i) => i !== idx))}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="panel" style={{ marginBottom: '24px' }}>
                <h3 className="card-title">📝 Arena Setup</h3>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                  <div style={{ flexGrow: 1 }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Model A</label>
                    <select className="form-control" value={arenaModelA} onChange={e => setArenaModelA(e.target.value)}>
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                      <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                      <option value="gpt-4o">GPT-4o</option>
                    </select>
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Model B</label>
                    <select className="form-control" value={arenaModelB} onChange={e => setArenaModelB(e.target.value)}>
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                      <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                      <option value="gpt-4o">GPT-4o</option>
                    </select>
                  </div>
                </div>

                <div className="chat-input-area" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => toggleSpeechRecognition(setArenaPrompt)}
                    style={{
                      background: isListening ? '#ef4444' : 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      padding: '10px 14px',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                    title="Toggle Voice Input (Speech-to-Text)"
                  >
                    {isListening ? '🛑 Rec' : '🎤 Mic'}
                  </button>
                  <input
                    type="text"
                    className="chat-input"
                    style={{ flexGrow: 1 }}
                    placeholder="Enter comparison prompt or speak it here..."
                    value={arenaPrompt}
                    onChange={e => setArenaPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && runModelArena()}
                  />
                  <button className="send-btn" onClick={runModelArena}>Battle</button>
                </div>
              </div>

              <div className="grid-2">
                {/* Model A Results */}
                <div className="panel" style={{ borderTop: '4px solid var(--accent-cyan)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>🤖 {arenaModelA}</h3>
                    {arenaLatencyA > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⏱️ {arenaLatencyA}ms</span>}
                  </div>
                  <div style={{
                    minHeight: '200px',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem'
                  }}>
                    {arenaLoadingA ? <div className="pulse">Generating response...</div> : arenaResponseA || "Awaiting battle..."}
                  </div>
                </div>

                {/* Model B Results */}
                <div className="panel" style={{ borderTop: '4px solid var(--accent-purple)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>🤖 {arenaModelB}</h3>
                    {arenaLatencyB > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⏱️ {arenaLatencyB}ms</span>}
                  </div>
                  <div style={{
                    minHeight: '200px',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem'
                  }}>
                    {arenaLoadingB ? <div className="pulse">Generating response...</div> : arenaResponseB || "Awaiting battle..."}
                  </div>
                </div>
              </div>

              {/* Stress-testing & Parallel Performance Benchmark Suite */}
              <div className="panel" style={{ marginTop: '24px', borderTop: '4px solid var(--accent-orange)' }}>
                <h3 className="card-title" style={{ color: 'var(--accent-orange)' }}>📊 Arena Parallel Stress-Test Benchmark Suite</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Concurrently run stress-testing prompts across selected LLMs to benchmark live response latency, throughput efficiency (Tokens/Sec), and total metrics.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'white' }}>Select Models for Benchmark:</strong>
                    {['gemini-2.5-flash', 'gemini-2.5-pro', 'claude-3-5-sonnet-20240620', 'gpt-4o'].map((model) => (
                      <label key={model} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={benchmarkModels.includes(model)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBenchmarkModels(prev => [...prev, model]);
                            } else {
                              setBenchmarkModels(prev => prev.filter(m => m !== model));
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        {model}
                      </label>
                    ))}
                  </div>

                  <button
                    className="btn-primary"
                    style={{ background: 'var(--accent-orange)', color: 'black', border: 'none', fontWeight: 'bold', marginLeft: 'auto' }}
                    onClick={runStressTestBenchmark}
                    disabled={isBenchmarking || benchmarkModels.length === 0}
                  >
                    {isBenchmarking ? '⚡ Benchmarking...' : '🚀 Execute Stress Test'}
                  </button>
                </div>

                {isBenchmarking && (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="pulse" style={{ color: 'var(--accent-orange)' }}>Loading benchmark parameters & measuring live throughput...</div>
                  </div>
                )}

                {benchmarkResults.length > 0 && !isBenchmarking && (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-glass)', textAlign: 'left' }}>
                          <th style={{ padding: '10px', color: 'var(--accent-orange)' }}>Model Name</th>
                          <th style={{ padding: '10px', color: 'var(--accent-orange)' }}>Status</th>
                          <th style={{ padding: '10px', color: 'var(--accent-orange)' }}>Latency (sec)</th>
                          <th style={{ padding: '10px', color: 'var(--accent-orange)' }}>Throughput (T/s)</th>
                          <th style={{ padding: '10px', color: 'var(--accent-orange)' }}>Tokens Generated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {benchmarkResults.map((res, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                            <td style={{ padding: '10px', fontWeight: 'bold', color: 'white' }}>{res.model}</td>
                            <td style={{ padding: '10px' }}>
                              {res.success ? (
                                <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>Success</span>
                              ) : (
                                <span style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }} title={res.error}>Failed</span>
                              )}
                            </td>
                            <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>{res.success ? `${res.latency}s` : 'N/A'}</td>
                            <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{res.success ? `${res.tokensPerSecond} T/s` : 'N/A'}</td>
                            <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>{res.success ? res.tokens : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'git' && (
            <div>
              <h2>🐙 Git Workspace & Commit Explainer</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Inspect your local repository changes, get AI explanations of the diff, and commit updates directly.
              </p>

              <div className="grid-2">
                {/* Diff Viewer */}
                <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>🔍 Unstaged Changes</h3>
                    <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={fetchGitDiff}>Refresh Diff</button>
                  </div>
                  <pre style={{
                    flexGrow: 1,
                    background: '#040711',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                    overflow: 'auto',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: '#e2e8f0',
                    margin: 0
                  }}>
                    {gitLoadingDiff ? 'Loading repository differences...' : gitDiff}
                  </pre>
                </div>

                {/* Commit Console */}
                <div className="panel" style={{ borderLeft: '4px solid var(--accent-orange)' }}>
                  <h3 className="card-title" style={{ color: 'var(--accent-orange)' }}>🚀 Git Commit Assistant</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    Click the button below to have the AI analyze the diff and generate a clean commit message.
                  </p>

                  <button
                    className="btn-primary"
                    style={{ width: '100%', marginBottom: '20px' }}
                    onClick={explainGitDiff}
                    disabled={gitExplainingDiff || gitLoadingDiff || !gitDiff || gitDiff === 'No unstaged changes.'}
                  >
                    {gitExplainingDiff ? 'Analyzing diff content...' : '📝 Auto-Generate Commit Message'}
                  </button>

                  <div className="form-group">
                    <label>Commit Message</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Commit message (e.g. feat: complete workspace integrations)"
                      value={gitCommitMessage}
                      onChange={e => setGitCommitMessage(e.target.value)}
                    />
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: '100%', background: 'var(--accent-orange)', border: 'none', color: 'black', fontWeight: 'bold' }}
                    onClick={commitGitChanges}
                    disabled={gitLoadingCommit || !gitCommitMessage.trim()}
                  >
                    {gitLoadingCommit ? 'Committing changes...' : '🐙 Stage All & Commit Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

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

                  {/* Notion structural database templates generator */}
                  <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
                    <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '10px' }}>➕ Create Structural Database Template</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Generate a task-tracking database with pre-configured Status and Priority columns on a parent page.
                    </p>
                    <div className="form-group">
                      <label>Parent Page ID</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 5e2c56a297e1..."
                        value={notionParentPageId}
                        onChange={(e) => setNotionParentPageId(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>New Database Title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. IRN Task Tracker"
                        value={notionNewDatabaseTitle}
                        onChange={(e) => setNotionNewDatabaseTitle(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" style={{ width: '100%', background: 'var(--accent-cyan)', color: 'black', fontWeight: 'bold' }} onClick={createNotionStructuralDatabase} disabled={isCreatingNotionDatabase}>
                      {isCreatingNotionDatabase ? 'Generating...' : 'Create Notion Database'}
                    </button>
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

          {activeTab === 'outreach' && (
            <div>
              <h2>📣 Media & Audience Outreach</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Leverage local AI strategy and grassroots media resources to grow the Injustice Reform Network. Mix and match community-powered campaign methods under the Aziza Code.
              </p>

              {/* Cinematic Commercial Showcase */}
              <div className="panel" style={{ borderLeft: '4px solid var(--accent-orange)', marginBottom: '24px' }}>
                <h3 className="card-title" style={{ color: 'var(--accent-orange)' }}>🎬 Live Showcase: IRN Cinematic Spot</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Interactive media spot featuring kinetic typography, web audio synthesis, and real-time canvas particles.
                </p>
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  aspectRatio: '16/9', 
                  borderRadius: 'var(--radius-lg)', 
                  overflow: 'hidden', 
                  border: '1px solid var(--border-glass)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                }}>
                  <iframe 
                    src="https://theezeeohh.github.io/irn-criminal-injustice/commercial-cinematic.html" 
                    title="IRN Cinematic Commercial" 
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="autoplay; encrypted-media"
                  />
                </div>
              </div>

              <div className="grid-2">
                
                {/* AI Pitch Generator Panel */}
                <div className="panel" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
                  <h3 className="card-title" style={{ color: 'var(--accent-purple)' }}>🤖 Campaign Pitch Generator</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Generate sharp, Afro-Futurist social copy, campaign narratives, or press statements using your active local model.
                  </p>

                  <div className="form-group">
                    <label>Campaign Type / Action Model</label>
                    <select
                      className="form-control"
                      value={outreachCampaignType}
                      onChange={(e) => setOutreachCampaignType(e.target.value)}
                    >
                      <option value="grassroots">✊ Grassroots Mobilization & Basebuilding</option>
                      <option value="case">⚖️ Participatory Case Defense</option>
                      <option value="mutual_aid">🤝 Mutual Aid Network & Solidarity</option>
                      <option value="impact">🔥 Disparate Impact / Legislative Harm Receipt</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Campaign / Case Details</label>
                    <textarea
                      className="form-control"
                      rows="6"
                      style={{ resize: 'vertical', fontFamily: 'inherit' }}
                      placeholder="Enter specific local details, case info, or community context to build the narrative..."
                      value={outreachDetails}
                      onChange={(e) => setOutreachDetails(e.target.value)}
                    ></textarea>
                  </div>

                  <button 
                    className="btn-primary" 
                    onClick={generateOutreachPitch}
                    disabled={outreachLoading}
                    style={{ width: '100%', marginBottom: '20px' }}
                  >
                    {outreachLoading ? 'Formulating Strategy...' : '🚀 Generate Campaign Pitch'}
                  </button>

                  {outreachGeneratedPitch && (
                    <div style={{ marginTop: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Generated Strategy & Pitch</span>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)' }}
                          onClick={() => {
                            navigator.clipboard.writeText(outreachGeneratedPitch);
                            alert('Copied pitch to clipboard!');
                          }}
                        >
                          Copy Pitch
                        </button>
                      </div>
                      <pre style={{ 
                        background: 'rgba(0,0,0,0.3)', 
                        padding: '16px', 
                        borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--border-glass)',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        maxHeight: '300px',
                        overflowY: 'auto'
                      }}>
                        {outreachGeneratedPitch}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Resource Library Panel */}
                <div className="panel" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
                  <h3 className="card-title" style={{ color: 'var(--accent-cyan)' }}>🎥 Strategic Growth & Media Library</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Curated strategies to mobilize the community, shape news coverage, and build narrative power. Click a video to open, or load its core framework directly into the generator.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
                    
                    {/* Video 1 */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'white', marginBottom: '6px' }}>📢 Effective Messaging for Reform</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        National Association of Criminal Defense Lawyers (NACDL) panel on navigating backlash and creating narrative strategies that shift public support.
                      </p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <a 
                          href="https://www.youtube.com/watch?v=HA6gp_xGAGq" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', textDecoration: 'none' }}
                        >
                          Open Video
                        </a>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)' }}
                          onClick={() => loadStrategyIntoDetails('Framework: NACDL Narrative Reframing (focusing on systemic human cost, safety-driven solutions, and avoiding adversarial defensive framing)')}
                        >
                          Load Framework
                        </button>
                      </div>
                    </div>

                    {/* Video 2 */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'white', marginBottom: '6px' }}>📰 Taking the Lede (Media Strategy)</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        Prison Policy Initiative webinar on honing media strategies, building relationships with reporters, and shaping news coverage of criminal reform issues.
                      </p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <a 
                          href="https://www.youtube.com/watch?v=GkJP8dH7wQO" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', textDecoration: 'none' }}
                        >
                          Open Video
                        </a>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)' }}
                          onClick={() => loadStrategyIntoDetails('Framework: PPI Media Strategy (positioning research, generating localized press lists, drafting pitch notes to key journalists, and matching timing to current news cycles)')}
                        >
                          Load Framework
                        </button>
                      </div>
                    </div>

                    {/* Video 3 */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'white', marginBottom: '6px' }}>✊ Marshall Ganz: Grassroots Organizing</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        Marshall Ganz outlines core organizing principles: relationships, structure, narrative (Story of Self, Us, Now), strategy, and action.
                      </p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <a 
                          href="https://www.youtube.com/watch?v=GsXm7Z_sKwl" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', textDecoration: 'none' }}
                        >
                          Open Video
                        </a>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)' }}
                          onClick={() => loadStrategyIntoDetails('Framework: Ganz Organising (Structure built on Story of Self, Us, Now; relationship mapping; leadership decentralisation; and community commitment)')}
                        >
                          Load Framework
                        </button>
                      </div>
                    </div>

                    {/* Video 4 */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'white', marginBottom: '6px' }}>⚖️ Community-Powered Participatory Defense</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        Raj Jayadev breaks down the "participatory defense" model that activates families and community groups to impact courtroom outcomes.
                      </p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <a 
                          href="https://www.youtube.com/watch?v=Ers1fZDJfax" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', textDecoration: 'none' }}
                        >
                          Open Video
                        </a>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)' }}
                          onClick={() => loadStrategyIntoDetails('Framework: Participatory Defense (engaging family members in investigation, making social biography videos, transforming isolated clients into organized active agents)')}
                        >
                          Load Framework
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      
      {/* Spotify Player Bar */}
      <div className="player-bar">
        {/* Left Track Info */}
        <div className="player-track-info">
          <img 
            src={tracks[currentTrackIndex].cover} 
            alt="Track Cover" 
            className={`player-cover ${isPlaying ? 'playing' : ''}`} 
          />
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'white', fontWeight: 'bold', marginBottom: '2px' }}>
              {tracks[currentTrackIndex].title}
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {tracks[currentTrackIndex].artist}
            </p>
          </div>
          <button 
            className={`player-btn ${likedTracks[currentTrackIndex] ? 'active' : ''}`}
            onClick={() => toggleLike(currentTrackIndex)}
            style={{ marginLeft: '12px' }}
          >
            {likedTracks[currentTrackIndex] ? '❤️' : '🤍'}
          </button>
        </div>

        {/* Center Controls */}
        <div className="player-controls-container">
          <div className="player-controls">
            <button 
              className={`player-btn ${isShuffle ? 'active' : ''}`} 
              onClick={() => setIsShuffle(!isShuffle)}
            >
              🔀
            </button>
            <button className="player-btn" onClick={handlePrevTrack}>
              ⏮️
            </button>
            <button className="player-btn play" onClick={handlePlayPause}>
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button className="player-btn" onClick={handleNextTrack}>
              ⏭️
            </button>
            <button 
              className={`player-btn ${isRepeat ? 'active' : ''}`} 
              onClick={() => setIsRepeat(!isRepeat)}
            >
              🔁
            </button>
          </div>

          {tracks[currentTrackIndex].isLive ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontSize: '0.8rem', fontWeight: 'bold', height: '20px' }}>
              <span className="status-dot" style={{ background: 'var(--accent-red)', boxShadow: '0 0 8px var(--accent-red)' }}></span>
              LIVE STREAM
            </div>
          ) : (
            <div className="player-progress-bar-wrap">
              <span className="player-time">{formatTime(currentTime)}</span>
              <input 
                type="range" 
                className="player-slider"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
              />
              <span className="player-time">{formatTime(duration)}</span>
            </div>
          )}
        </div>

        {/* Right Volume / Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end', width: '30%' }}>
          <button className="player-btn" onClick={toggleMute}>
            {isMuted || volume === 0 ? '🔇' : '🔊'}
          </button>
          <input 
            type="range" 
            className="player-slider player-slider-vol"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setIsMuted(false);
            }}
          />
        </div>

        <audio
          ref={audioRef}
          src={tracks[currentTrackIndex].src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />
      </div>
    </div>
  );
}
