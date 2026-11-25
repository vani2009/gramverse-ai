import React, { useState } from 'react';
import { ChatMessage, RagDocumentCitation } from '../../types';
import { searchRagKnowledge } from '../../data/ragKnowledge';
import { Bot, Send, User, Sparkles, BookOpen, ExternalLink, Mic, RefreshCw, MessageSquare } from 'lucide-react';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_01',
    sender: 'assistant',
    text: "Namaste! I am **GramBot AI**, your village intelligence assistant grounded in official Gram Panchayat records, Jal Jeevan Mission data, and welfare scheme guidelines.\n\nHow can I assist you with village affairs, scheme eligibility, or complaint tracking today?",
    timestamp: '10:00 AM'
  }
];

const SUGGESTED_PROMPTS = [
  "What is our GPDP budget and funds utilization for 2024-25?",
  "What are the eligibility rules and documents for PM-KISAN?",
  "How many tap connections exist in Kothri Kalan under JJM?",
  "What is the official SLA timeline for fixing a broken handpump?",
  "What benefits are provided under PMAY-G for kutcha houses?"
];

export const GramBotChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const { answer, citations } = searchRagKnowledge(query);

      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const toggleVoice = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      setTimeout(() => {
        setIsRecordingVoice(false);
        setInputText("What is our GPDP budget and funds utilization for 2024-25?");
      }, 1800);
    } else {
      setIsRecordingVoice(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
            <Bot className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-wide">GramBot AI</h3>
              <span className="text-[10px] font-semibold bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                RAG Grounded
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80">
              LangChain + Gemini + FAISS Village Vector Store
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages(INITIAL_MESSAGES)}
          className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition"
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" /> Suggested:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="text-[11px] bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 px-2.5 py-1 rounded-full border border-slate-200 whitespace-nowrap transition shadow-2xs hover:border-emerald-200"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div className="space-y-2">
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[9px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {/* RAG Source Citations (as required by PDF) */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Retrieved Knowledge Citations ({msg.citations.length})</span>
                  </div>

                  <div className="space-y-1.5">
                    {msg.citations.map((cite, cIdx) => (
                      <div
                        key={cIdx}
                        className="bg-white p-2 rounded-lg border border-emerald-100 text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between text-slate-900 font-semibold">
                          <span>{cite.docTitle}</span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">
                            {cite.id}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 italic">
                          Ref: {cite.sourceDoc}
                        </div>
                        <p className="text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                          &ldquo;{cite.excerpt}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-500 text-xs bg-white p-3 rounded-2xl border border-slate-200 max-w-xs shadow-xs">
            <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
            <span>GramBot is searching village records & schemes...</span>
          </div>
        )}
      </div>

      {/* Voice Simulation Indicator */}
      {isRecordingVoice && (
        <div className="bg-rose-50 border-t border-rose-200 px-4 py-2 flex items-center justify-between text-xs text-rose-800 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span>Listening in Hindi / Malvi / English... Speak your question.</span>
          </div>
          <span className="font-mono text-[10px]">Recording...</span>
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={toggleVoice}
          className={`p-2.5 rounded-xl border transition ${
            isRecordingVoice
              ? 'bg-rose-600 text-white border-rose-600 animate-bounce'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border-slate-200'
          }`}
          title="Voice query simulation"
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Ask GramBot about schemes, GPDP budget, complaints, or water status..."
          className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
