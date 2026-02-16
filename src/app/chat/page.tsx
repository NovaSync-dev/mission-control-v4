'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { PageWrapper, PageHeader } from '@/components/page-wrapper';
import { TabBar } from '@/components/tab-bar';
import { GlassCard } from '@/components/glass-card';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAutoRefresh, useTab } from '@/lib/hooks';
import { MessageSquare, Terminal, Send, Mic, MicOff, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ChatSession, ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';

const CHANNEL_COLORS: Record<string, string> = {
  telegram: 'bg-blue-500/20 text-blue-400',
  discord: 'bg-indigo-500/20 text-indigo-400',
  web: 'bg-cyan/20 text-cyan',
  cli: 'bg-green-500/20 text-green-400',
};

function ChatTab() {
  const { data: sessionsData } = useAutoRefresh<{ sessions: ChatSession[] }>('/api/chat-history');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessions = sessionsData?.sessions || [];

  useEffect(() => {
    if (!selectedSession) return;
    fetch(`/api/chat-history?session=${selectedSession}`)
      .then(r => r.json())
      .then(d => setMessages(d.messages || []))
      .catch(() => setMessages([]));
  }, [selectedSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date().toISOString() }]);
    await fetch('/api/chat-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    });
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    setIsListening(!isListening);
    if (!isListening) {
      const SpeechRecognition = (window as unknown as Record<string, unknown>).webkitSpeechRecognition || (window as unknown as Record<string, unknown>).SpeechRecognition;
      const recognition = new (SpeechRecognition as new () => { lang: string; onresult: (e: { results: { transcript: string }[][] }) => void; onend: () => void; start: () => void })();
      recognition.lang = 'en-US';
      recognition.onresult = (e) => { setInput(e.results[0][0].transcript); };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-4">
      {/* Session sidebar */}
      <div className="w-64 shrink-0 glass-card p-3 overflow-y-auto hidden lg:block">
        <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-3 px-1">Sessions</h3>
        {sessions.length === 0 ? (
          <p className="text-[10px] text-muted-foreground p-2">No transcripts found</p>
        ) : sessions.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSession(s.id)}
            className={cn(
              'w-full text-left p-2.5 rounded-lg mb-1 transition-all',
              selectedSession === s.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/[0.03]'
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`text-[8px] px-1 py-0 ${CHANNEL_COLORS[s.channel] || 'bg-white/10'}`}>{s.channel}</Badge>
              <span className="text-[10px] text-muted-foreground">{new Date(s.updatedAt).toLocaleDateString()}</span>
            </div>
            <p className="text-xs truncate">{s.name}</p>
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col glass-card overflow-hidden">
        {!selectedSession ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState title="Select a session" description="Choose a chat session from the sidebar to view messages" />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                const prevMsg = messages[i - 1];
                const showDate = !prevMsg || new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();

                return (
                  <div key={i}>
                    {showDate && msg.timestamp && (
                      <div className="text-center my-4">
                        <span className="text-[10px] text-muted-foreground bg-white/[0.03] px-3 py-1 rounded-full">
                          {new Date(msg.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
                    >
                      <div className={cn(
                        'max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed',
                        isUser ? 'bg-primary/20 text-foreground rounded-br-md' : 'bg-white/[0.04] rounded-bl-md'
                      )}>
                        {msg.channel && (
                          <Badge className={`text-[8px] px-1 py-0 mb-1 ${CHANNEL_COLORS[msg.channel] || ''}`}>{msg.channel}</Badge>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {msg.timestamp && (
                          <p className="text-[9px] text-muted-foreground mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-white/[0.06]">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 text-xs bg-white/[0.03] border-white/[0.06]"
                />
                <Button size="icon" variant="ghost" onClick={toggleVoice}
                  className={cn('h-9 w-9', isListening && 'text-status-down animate-pulse')}>
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button size="icon" onClick={handleSend} className="h-9 w-9 bg-primary/20 hover:bg-primary/30">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CommandTab() {
  const [output, setOutput] = useState<string[]>([]);
  const [cmd, setCmd] = useState('');

  const commands = [
    { name: 'System Status', cmd: 'status', icon: '📊' },
    { name: 'Refresh All', cmd: 'refresh', icon: '🔄' },
    { name: 'Check Health', cmd: 'health', icon: '❤️' },
    { name: 'List Agents', cmd: 'agents', icon: '🤖' },
    { name: 'View Logs', cmd: 'logs', icon: '📋' },
    { name: 'Clear Cache', cmd: 'clear-cache', icon: '🧹' },
  ];

  const runCommand = async (command: string) => {
    setOutput(prev => [...prev, `> ${command}`, `Running ${command}...`]);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setOutput(prev => [...prev, JSON.stringify(data, null, 2), '']);
    } catch (err) {
      setOutput(prev => [...prev, `Error: ${err}`, '']);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Quick Commands</h3>
        {commands.map(c => (
          <button key={c.cmd} onClick={() => runCommand(c.cmd)}
            className="w-full text-left p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all text-xs flex items-center gap-2">
            <span>{c.icon}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>
      <div className="lg:col-span-2 glass-card p-4 flex flex-col h-[calc(100vh-14rem)]">
        <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed text-muted-foreground mb-3">
          {output.length === 0 ? (
            <p className="text-muted-foreground/50">Click a command or type below...</p>
          ) : output.map((line, i) => (
            <div key={i} className={cn(line.startsWith('>') && 'text-cyan font-medium')}>
              {line}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 text-cyan text-[11px] font-mono">
            <Hash className="w-3 h-3" />
          </div>
          <Input
            value={cmd}
            onChange={e => setCmd(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && cmd.trim()) { runCommand(cmd.trim()); setCmd(''); } }}
            placeholder="Enter command..."
            className="flex-1 text-xs font-mono bg-transparent border-none focus-visible:ring-0 p-0 h-auto"
          />
        </div>
      </div>
    </div>
  );
}

function ChatContent() {
  const [tab, setTab] = useTab('chat');
  const tabs = [
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-3 h-3" /> },
    { id: 'command', label: 'Command', icon: <Terminal className="w-3 h-3" /> },
  ];

  return (
    <PageWrapper>
      <PageHeader title="Chat" description="Communication & command center">
        <TabBar tabs={tabs} activeTab={tab} onTabChange={setTab} layoutId="chat-tab" />
      </PageHeader>
      {tab === 'chat' && <ChatTab />}
      {tab === 'command' && <CommandTab />}
    </PageWrapper>
  );
}

export default function ChatPage() {
  return <Suspense><ChatContent /></Suspense>;
}
