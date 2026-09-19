import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import {
  MessageSquare,
  Send,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Bot,
  User,
  Clock,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  CornerDownLeft,
  ChevronDown,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  latencyMs?: number;
  model?: string;
  isError?: boolean;
}

const STARTER_QUESTIONS = [
  'How does the autonomous task DAG schedule and execute interdependent sub-tasks?',
  'What is the difference between Working Memory and Episodic Memory in an AI agent?',
  'Explain how Human-in-the-Loop approval gates protect against dangerous tool operations.',
  'Write a TypeScript function that validates tool schemas before execution.',
];

export const AskAiView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('agentos_ask_ai_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem('agentos_ask_ai_messages', JSON.stringify(messages));
    } catch (err) {
      console.error('Failed to save chat to sessionStorage', err);
    }
  }, [messages]);

  useEffect(() => {
    // Scroll smoothly to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customQuestion?: string) => {
    const textToSend = (customQuestion || question).trim();
    if (!textToSend || isLoading) return;

    setErrorMessage(null);
    const userMsgId = `user_${Date.now()}`;
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    // Update conversation with user's question
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setQuestion('');
    setIsLoading(true);

    const startTime = Date.now();

    try {
      // Build lightweight conversation history to send
      const historyPayload = messages
        .filter((m) => !m.isError)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'No answer received.',
        timestamp: data.timestamp || new Date().toISOString(),
        latencyMs: data.latencyMs || Date.now() - startTime,
        model: data.model || 'gemini-3.8-flash',
      };

      setMessages([...updatedMessages, assistantMessage]);
    } catch (err: any) {
      console.error('Ask AI error:', err);
      const errorText = err?.message || 'Sorry, unable to connect to the AI model. Please try again.';
      setErrorMessage(errorText);

      // Add error message to thread so user can see context
      const errorAssistantMsg: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Error Generating Response**\n\n${errorText}\n\nYou can click **Retry** below or rephrase your question.`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages([...updatedMessages, errorAssistantMsg]);
    } finally {
      setIsLoading(false);
      // Refocus textarea after response
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setErrorMessage(null);
    try {
      sessionStorage.removeItem('agentos_ask_ai_messages');
    } catch {}
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRetryLast = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      // Remove trailing error message if any
      if (messages[messages.length - 1]?.isError) {
        setMessages((prev) => prev.slice(0, -1));
      }
      handleSend(lastUserMsg.content);
    }
  };

  return (
    <div id="ask-ai-page" className="space-y-6">
      {/* Top Banner / Navigation Header */}
      <div
        id="ask-ai-header"
        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Ask AI Assistant
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Ready</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ask any question, explore agent architectures, or get instant assistance from the AI.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Model:</span>
            <span className="text-indigo-300 font-semibold">gemini-3.8-flash</span>
          </div>

          {messages.length > 0 && (
            <button
              id="clear-chat-btn"
              type="button"
              onClick={handleClearChat}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
              title="Clear conversation history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Conversation Container */}
      <div
        id="ask-ai-chat-card"
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col min-h-[580px] max-h-[75vh]"
      >
        {/* Messages Stream */}
        <div
          id="ask-ai-messages-container"
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
        >
          {messages.length === 0 ? (
            <div
              id="ask-ai-empty-state"
              className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                <Bot className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  What would you like to ask the AI?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Type any question below or click on one of the recommended topics to start an interactive conversation.
                </p>
              </div>

              {/* Starter Questions Grid */}
              <div className="w-full max-w-2xl pt-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-center space-x-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Suggested Questions</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                  {STARTER_QUESTIONS.map((starter, idx) => (
                    <button
                      key={idx}
                      id={`starter-question-${idx}`}
                      type="button"
                      onClick={() => handleSend(starter)}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/40 text-xs text-slate-300 transition-all flex items-start space-x-2 group"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="leading-snug">{starter}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                id={`chat-message-${msg.id}`}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                } space-y-1.5`}
              >
                {/* Author Label & Metadata */}
                <div className="flex items-center space-x-2 px-1 text-[11px] text-slate-400">
                  {msg.role === 'user' ? (
                    <>
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      <span className="font-semibold text-slate-300">You</span>
                      <div className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                        <User className="w-3 h-3" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Bot className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-slate-200">AI Assistant</span>
                      {msg.latencyMs && (
                        <span className="flex items-center space-x-1 font-mono text-[10px] text-slate-500">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{msg.latencyMs}ms</span>
                        </span>
                      )}
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`group relative rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[92%] sm:max-w-[85%] md:max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm shadow-md'
                      : msg.isError
                      ? 'bg-rose-950/40 border border-rose-500/40 text-rose-200 rounded-bl-sm'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-sm shadow-md'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="prose prose-invert max-w-none text-slate-200 text-sm [&>p]:mb-2.5 [&>p:last-child]:mb-0 [&>ul]:mb-2.5 [&>ol]:mb-2.5 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-xs [&>h1]:font-bold [&>h2]:font-bold [&>h3]:font-semibold [&>h1]:text-white [&>h2]:text-white [&>h3]:text-white [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>pre]:bg-slate-900 [&>pre]:p-3 [&>pre]:rounded-lg [&>pre]:border [&>pre]:border-slate-800/80 [&>code]:text-indigo-300 [&>code]:bg-slate-900 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:font-mono [&>code]:text-xs [&>blockquote]:border-l-2 [&>blockquote]:border-indigo-500 [&>blockquote]:pl-3 [&>blockquote]:text-slate-400">
                        <Markdown>{msg.content}</Markdown>
                      </div>

                      {/* Message Action Bar */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/50 text-[11px] text-slate-400">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="flex items-center space-x-1 hover:text-white transition-colors text-[11px]"
                            title="Copy answer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        {msg.isError && (
                          <button
                            type="button"
                            onClick={handleRetryLast}
                            className="flex items-center space-x-1 text-rose-300 hover:text-rose-100 font-semibold"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Active Generation Loading Indicator */}
          {isLoading && (
            <div
              id="ask-ai-loading-indicator"
              className="flex flex-col items-start space-y-1.5 animate-fadeIn"
            >
              <div className="flex items-center space-x-2 px-1 text-[11px] text-slate-400">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Bot className="w-3 h-3" />
                </div>
                <span className="font-semibold text-slate-200">AI Assistant</span>
                <span className="text-indigo-400">generating answer...</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-bl-sm p-4 text-xs text-slate-300 shadow-md flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <span>Processing your question and synthesizing response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Question Input Footer */}
        <div
          id="ask-ai-input-container"
          className="p-4 sm:p-5 bg-slate-950/80 border-t border-slate-800 rounded-b-2xl"
        >
          {errorMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-[11px] text-rose-400 hover:text-rose-200"
              >
                Dismiss
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="space-y-2.5"
          >
            <div className="relative flex flex-col bg-slate-900 border border-slate-800 focus-within:border-indigo-500 rounded-xl transition-all shadow-inner">
              <textarea
                id="ask-ai-textarea"
                ref={textareaRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the AI a question... (Press Enter to send, Shift + Enter for new line)"
                rows={3}
                disabled={isLoading}
                className="w-full bg-transparent p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed resize-y min-h-[72px] max-h-48"
              />

              <div className="flex items-center justify-between px-3 py-2 border-t border-slate-800/60 bg-slate-900/50 rounded-b-xl text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] hidden sm:inline">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 font-mono">
                      Enter
                    </kbd>{' '}
                    to ask •{' '}
                    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 font-mono">
                      Shift + Enter
                    </kbd>{' '}
                    for newline
                  </span>
                  <span className="text-[11px] sm:hidden font-mono">
                    {question.length} chars
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {question.trim() && (
                    <button
                      type="button"
                      onClick={() => setQuestion('')}
                      disabled={isLoading}
                      className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-[11px]"
                    >
                      Clear
                    </button>
                  )}

                  <button
                    id="ask-ai-submit-button"
                    type="submit"
                    disabled={!question.trim() || isLoading}
                    className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                      !question.trim() || isLoading
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-[0.98]'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Ask AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
