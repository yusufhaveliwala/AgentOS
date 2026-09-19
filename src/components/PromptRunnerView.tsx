import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  RotateCcw,
  Clock,
  Cpu,
  Sliders,
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
  Code2,
  FileText,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

interface PromptHistoryItem {
  id: string;
  prompt: string;
  systemInstruction?: string;
  result: string;
  model: string;
  latencyMs: number;
  timestamp: string;
}

const SAMPLE_PROMPTS = [
  'Explain the key differences between monolithic LLM prompts and autonomous multi-agent DAG execution.',
  'Write a TypeScript utility that implements exponential backoff retry with jitter for async tasks.',
  'What are the primary attack vectors in AI agent tool-calling systems and how do guardrails mitigate them?',
  'Decompose the task "Refactor legacy authentication to OAuth2 PKCE" into 4 structured sub-tasks.',
];

export const PromptRunnerView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentResult, setCurrentResult] = useState<PromptHistoryItem | null>(null);
  const [history, setHistory] = useState<PromptHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('agentos_prompt_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('agentos_prompt_history', JSON.stringify(history));
    } catch (err) {
      console.error('Failed to save history to localStorage', err);
    }
  }, [history]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    const startTime = Date.now();

    try {
      const res = await fetch('/api/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          systemInstruction: systemInstruction.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const newItem: PromptHistoryItem = {
        id: `prompt_${Date.now()}`,
        prompt: prompt.trim(),
        systemInstruction: systemInstruction.trim() || undefined,
        result: data.result,
        model: data.model || 'gemini-3.8-flash',
        latencyMs: data.latencyMs || Date.now() - startTime,
        timestamp: data.timestamp || new Date().toISOString(),
      };

      setCurrentResult(newItem);
      setHistory((prev) => [newItem, ...prev.slice(0, 19)]); // Keep last 20
    } catch (err: any) {
      console.error('Prompt error:', err);
      setError(err?.message || 'Failed to generate result. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = () => {
    if (!currentResult?.result) return;
    navigator.clipboard.writeText(currentResult.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearCurrent = () => {
    setPrompt('');
    setError(null);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const selectHistoryItem = (item: PromptHistoryItem) => {
    setPrompt(item.prompt);
    if (item.systemInstruction) {
      setSystemInstruction(item.systemInstruction);
      setShowSystemSettings(true);
    }
    setCurrentResult(item);
    setError(null);
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('agentos_prompt_history');
    } catch {}
  };

  return (
    <div id="prompt-runner-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Direct AI Prompt & Result</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Submit any custom prompt or task to observe direct generation and AI model completions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 font-mono">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Model:</span>
            <span className="text-indigo-300 font-semibold">gemini-3.8-flash</span>
          </div>

          <button
            type="button"
            onClick={() => setShowSystemSettings(!showSystemSettings)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              showSystemSettings
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Parameters</span>
            {showSystemSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form & Sample Prompts */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Optional System Instruction Drawer */}
              {showSystemSettings && (
                <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
                      <Sliders className="w-3 h-3 text-indigo-400" />
                      <span>System Instruction (Optional)</span>
                    </span>
                    {systemInstruction && (
                      <button
                        type="button"
                        onClick={() => setSystemInstruction('')}
                        className="text-[11px] text-slate-500 hover:text-slate-300"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <textarea
                    value={systemInstruction}
                    onChange={(e) => setSystemInstruction(e.target.value)}
                    placeholder="e.g., You are an expert AI software architect. Be concise, rigorous, and provide code examples."
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono resize-none"
                  />
                </div>
              )}

              {/* Main Prompt Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <label htmlFor="prompt-input" className="font-semibold text-slate-300 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Your Prompt</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    {prompt.length} chars • Ctrl + Enter to run
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    id="prompt-input"
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your prompt here... (e.g. Ask a question, request code, or ask for an analysis)"
                    rows={6}
                    disabled={isLoading}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y min-h-[140px]"
                  />
                </div>
              </div>

              {/* Actions & Submit */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  {prompt && (
                    <button
                      type="button"
                      onClick={clearCurrent}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                    !prompt.trim() || isLoading
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-[0.98]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating Result...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{error}</div>
              </div>
            )}
          </div>

          {/* Quick Prompt Ideas */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-2.5">
            <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Prompt Starters</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(sample);
                    if (textareaRef.current) textareaRef.current.focus();
                  }}
                  className="text-left p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-800/40 text-xs text-slate-300 transition-all leading-snug line-clamp-2"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          {/* Prompt History List */}
          {history.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="font-semibold text-slate-400 flex items-center space-x-1.5">
                  <History className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Recent Prompts ({history.length})</span>
                </div>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear History</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => selectHistoryItem(item)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all text-xs flex items-center justify-between ${
                      currentResult?.id === item.id
                        ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-200'
                        : 'bg-slate-950/50 border-slate-800/60 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="truncate pr-3 font-medium">"{item.prompt}"</div>
                    <div className="shrink-0 text-[10px] text-slate-500 font-mono">
                      {item.latencyMs}ms
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Result Output */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col min-h-[480px]">
            {/* Result Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                <span className="text-xs font-bold text-white tracking-wide uppercase">AI Result</span>
                {currentResult && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono border border-indigo-500/20">
                    {currentResult.model}
                  </span>
                )}
              </div>

              {currentResult && (
                <div className="flex items-center space-x-2 text-xs">
                  <div className="flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{currentResult.latencyMs}ms</span>
                  </div>

                  <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5">
                    <button
                      type="button"
                      onClick={() => setViewMode('formatted')}
                      className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors ${
                        viewMode === 'formatted' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Formatted
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('raw')}
                      className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors ${
                        viewMode === 'raw' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Raw
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
                    title="Copy result"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Result Content Body */}
            <div className="flex-1 py-4">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center py-16 space-y-3 text-slate-400">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                    <Sparkles className="w-4 h-4 text-indigo-400 absolute inset-0 m-auto" />
                  </div>
                  <p className="text-xs font-medium text-slate-300">Evaluating prompt with Gemini...</p>
                  <p className="text-[11px] text-slate-500">Streaming tokens and synthesizing response</p>
                </div>
              ) : currentResult ? (
                <div className="space-y-4">
                  {/* Prompt Quote Badge */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Prompt: </span>
                    <span className="italic text-slate-300">"{currentResult.prompt}"</span>
                  </div>

                  {/* Rendered Result */}
                  {viewMode === 'formatted' ? (
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-slate-200 text-sm leading-relaxed overflow-x-auto selection:bg-indigo-600 selection:text-white">
                      <div className="prose prose-invert max-w-none text-slate-200 text-sm [&>p]:mb-3 [&>ul]:mb-3 [&>ol]:mb-3 [&>h1]:text-lg [&>h2]:text-base [&>h3]:text-sm [&>h1]:font-bold [&>h2]:font-bold [&>h3]:font-semibold [&>h1]:text-white [&>h2]:text-white [&>h3]:text-white [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>pre]:bg-slate-900 [&>pre]:p-3 [&>pre]:rounded-lg [&>pre]:border [&>pre]:border-slate-800 [&>code]:text-indigo-300 [&>code]:bg-slate-900 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:font-mono [&>code]:text-xs [&>blockquote]:border-l-2 [&>blockquote]:border-indigo-500 [&>blockquote]:pl-3 [&>blockquote]:text-slate-400">
                        <Markdown>{currentResult.result}</Markdown>
                      </div>
                    </div>
                  ) : (
                    <pre className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-slate-200 text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                      {currentResult.result}
                    </pre>
                  )}

                  {/* Footer metadata */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                    <span>Generated at {new Date(currentResult.timestamp).toLocaleTimeString()}</span>
                    <span>{currentResult.result.length} characters</span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-3 text-slate-500">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400">No prompt result yet</p>
                    <p className="text-[11px] text-slate-500 max-w-xs">
                      Enter your prompt on the left or select a sample starter to see the generated AI completion.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
