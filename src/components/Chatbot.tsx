'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    MessageSquare, X, Send, Bot, User, Loader2, Sparkles,
    Terminal, Database, BarChart3, ShieldAlert, Cpu,
    ArrowRightCircle, CheckCircle2, RotateCcw
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from './ThemeProvider';
import { BRAND_CONFIG, getBrand } from '@/config/branding';

/** Utility for Tailwind class merging */
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
    contextData: any;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    status: 'sending' | 'delivered' | 'error';
    error?: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, contextData }) => {
    const currentBrand = getBrand();

    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom whenever messages update
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    /** Generate dynamic context for the system prompt */
    const getSystemContext = () => {
        const fullContext = {
            stats: contextData?.stats || {},
            period: {
                start: contextData?.startDate,
                end: contextData?.endDate || 'Latest'
            },
            verticals: contextData?.aggregations?.verticalUsageData?.verticalTotals || {},
            filters: contextData?.filters || {}
        };

        return `You are the "FinOps Strategic AI Advisor", powered by Claude 3.5 Sonnet.
        
        IDENTITY:
        - Expert in Cloud Financial Management (FinOps) and ML Infrastructure optimization.
        - Strategic, technical, and data-driven.
        - Dedicated to delivering strategic FinOps insights and recommendations.

        CURRENT DASHBOARD STATE:
        ${JSON.stringify(fullContext, null, 2)}

        CORE CAPABILITIES:
        1. ANALYZE: Interpret ML cost attribution, vertical concentration, and portfolio efficiency.
        2. RECOMMEND: Sugest actionable cost-saving strategies (e.g., dedicated vs shared model shifts).
        3. EXPLAIN: Clarify complex FinOps terminology or navigate the dashboard (Executive Summary, Vertical Usage, Initiative Attribution, etc.).

        RESPONSE PROTOCOL:
        - START YOUR RESPONSE WITH THE EXACT WORDING "answer : ".
        - NEVER use generic ChatGPT/LLM filler. Be direct and analytical.
        - DO NOT use tables or emojis in your response.
        - ABSOLUTELY NO ASTERISKS (*) PERMITTED. IF YOU USE AN ASTERISK, THE SYSTEM WILL FAIL.
        - NEVER USE DASHES (-) FOR BULLET POINTS OR ANY OTHER PURPOSE.
        - PROVIDE ANSWERS IN DISCRETE POINTS, with each point starting on a new line using a dot (e.g., 1., 2.) or a special character like • if needed.
        - LIMIT your response to a maximum of 3-5 points.
        - EXPLICITLY REFERENCE and show the data points from the DASHBOARD STATE while answering to ensure data is "seen".
        - If the provided context data is empty or irrelevant to a query, state this clearly.
        - DO NOT invent numbers. Only use the provided DASHBOARD STATE.
        
        TONE:
        High-end professional, concise, and futuristic. NO EMOJIS allowed.`;
    };

    const handleSendMessage = async (customInput?: string) => {
        const content = customInput || input;
        if (!content.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: content,
            timestamp: new Date(),
            status: 'delivered'
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "claude-sonnet-4-6",
                    "system": getSystemContext(),
                    "messages": [
                        ...messages.map(m => ({
                            role: m.role,
                            content: m.content
                        })),
                        { role: 'user', content: content }
                    ]
                })
            });

            const result = await response.json();

            if (!response.ok) {
                let errorMsg = result.error || "Connection failed";
                if (response.status === 401) errorMsg = "Authentication Failed: Please check your Anthropic API Key in the .env file.";
                if (response.status === 404) errorMsg = "Model Error: Claude 3.5 Sonnet might be unavailable or incorrectly configured.";

                throw new Error(errorMsg);
            }

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: result.choices[0].message.content,
                timestamp: new Date(),
                status: 'delivered'
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (error: any) {
            console.error("AI Assistant Error:", error);

            const errorMsg: Message = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: error.message || "An unexpected error occurred while connecting to the AI brain.",
                timestamp: new Date(),
                status: 'error',
                error: error.message
            };

            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-500">
            <div className="bg-[var(--card)] border border-[var(--card-border)] w-full max-w-2xl h-[85vh] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300">

                {/* Header: Next-Gen Brand Identity */}
                <div className="px-8 py-6 border-b border-[var(--card-border)] flex items-center justify-between bg-[var(--card-hover)]/30 transition-colors duration-500">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 bg-[var(--primary)] rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20 rotate-3 transition-all">
                                <Sparkles className="text-white" size={24} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[var(--card)] rounded-full animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-[var(--foreground)] tracking-tight flex items-center gap-2">
                                STRATEGIC AI ADVISOR
                                <span className="bg-[var(--primary)]/20 text-[var(--primary)] text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-[0.1em]">BETA</span>
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                    Powered by Claude 3.5 Sonnet
                                    <ArrowRightCircle size={10} className="text-[var(--muted)]/50" />
                                    {currentBrand.name} Core
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-[var(--card-hover)] rounded-2xl text-[var(--muted)] hover:text-[var(--foreground)] transition-all active:scale-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[var(--card)] relative transition-colors duration-500">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none text-[var(--foreground)]">
                        <div className="absolute top-10 left-10"><Database size={100} /></div>
                        <div className="absolute bottom-10 right-10"><BarChart3 size={100} /></div>
                    </div>

                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-8">
                            <div className="space-y-4">
                                <div className="w-20 h-20 bg-[var(--primary-glow)] rounded-[2rem] flex items-center justify-center border border-[var(--primary)]/10 mx-auto shadow-inner">
                                    <Bot className="text-[var(--primary)]/80" size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-[var(--foreground)] font-black uppercase tracking-[0.2em] text-sm">Strategic Interface Active</h3>
                                    <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-wider leading-relaxed">
                                        I have full read access to your current FinOps dashboard data. How shall we optimize your infrastructure today?
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 w-full">
                                {[
                                    { text: 'Analyze vertical cost concentration', icon: <Cpu size={14} /> },
                                    { text: 'Suggest model consolidation strategies', icon: <Database size={14} /> },
                                    { text: 'Identify high-risk shared owners', icon: <ShieldAlert size={14} /> }
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion.text}
                                        onClick={() => handleSendMessage(suggestion.text)}
                                        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest p-4 border border-[var(--card-border)] rounded-2xl text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all hover:bg-[var(--primary-glow)] group text-left duration-300"
                                    >
                                        <div className="p-1.5 bg-[var(--card-hover)] group-hover:bg-[var(--primary)]/20 rounded-lg text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors">
                                            {suggestion.icon}
                                        </div>
                                        {suggestion.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((m) => (
                        <div key={m.id} className={cn("flex animate-in slide-in-from-bottom-4 duration-300", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                            <div className={cn("flex gap-4 max-w-[90%]", m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                                <div className={cn(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border transition-all duration-500",
                                    m.role === 'user'
                                        ? 'bg-[var(--card-hover)] text-[var(--muted)] border-[var(--card-border)]'
                                        : 'bg-[var(--primary)] text-white border-[var(--primary)]'
                                )}>
                                    {m.role === 'user' ? <User size={20} /> : <Sparkles size={20} />}
                                </div>
                                <div className="space-y-2">
                                    <div className={cn(
                                        "p-5 rounded-3xl text-sm leading-relaxed transition-all duration-500",
                                        m.role === 'user'
                                            ? 'bg-[var(--primary)] text-white rounded-tr-none shadow-xl'
                                            : m.status === 'error'
                                                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-tl-none font-bold'
                                                : 'bg-[var(--card-hover)] text-[var(--foreground)] border border-[var(--card-border)] rounded-tl-none shadow-sm'
                                    )}>
                                        {m.status === 'error' && (
                                            <div className="flex items-center gap-2 mb-2 text-rose-500 text-[10px] uppercase font-black tracking-widest">
                                                <ShieldAlert size={14} />
                                                System Failure
                                            </div>
                                        )}
                                        {/* Precision Formatter: Renders __bold__ as bold text without underscores or asterisks */}
                                        <div className="whitespace-pre-wrap">
                                            {m.content.split(/(__.*?__)/).map((part, i) => {
                                                if (part.startsWith('__') && part.endsWith('__')) {
                                                    return <strong key={i} className="font-extrabold text-[var(--primary)]">{part.slice(2, -2)}</strong>;
                                                }
                                                // Strip any rogue asterisks if they creep in
                                                return part.replace(/\*/g, '');
                                            })}
                                        </div>
                                    </div>
                                    <div className={cn("flex items-center gap-2 px-1", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                                        <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">
                                            {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {m.role === 'assistant' && m.status === 'delivered' && (
                                            <CheckCircle2 size={10} className="text-emerald-500" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex gap-4 items-center animate-in fade-in duration-300">
                                <div className="w-10 h-10 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
                                    <Loader2 className="animate-spin" size={20} />
                                </div>
                                <div className="p-4 bg-[var(--card-hover)] border border-[var(--card-border)] rounded-3xl rounded-tl-none flex gap-1.5 px-6">
                                    <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Footer: Precision Input */}
                <div className="p-8 bg-[var(--card-hover)]/30 border-t border-[var(--card-border)] transition-colors duration-500">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                        className="flex gap-4 items-end"
                    >
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                placeholder="Consult with Claude Strategy Advisor..."
                                className="w-full bg-[var(--card)] border border-[var(--card-border)] rounded-2xl px-6 py-4 pr-12 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/5 transition-all shadow-sm"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <Terminal size={16} className="text-[var(--muted)]/50" />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="p-4 bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 disabled:grayscale rounded-2xl text-white shadow-xl shadow-[var(--primary)]/20 transition-all active:scale-95 group"
                        >
                            <Send size={24} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </form>
                    <div className="flex items-center justify-between mt-6">
                        <div className="flex gap-4">
                            <button className="flex items-center gap-1.5 text-[9px] font-black text-[var(--muted)] hover:text-[var(--primary)] uppercase tracking-widest transition-colors">
                                <RotateCcw size={12} /> Clear Cache
                            </button>
                            <button className="flex items-center gap-1.5 text-[9px] font-black text-[var(--muted)] hover:text-[var(--primary)] uppercase tracking-widest transition-colors">
                                <Terminal size={12} /> View Logs
                            </button>
                        </div>
                        <p className="text-[9px] text-[var(--muted)] font-bold uppercase tracking-[0.1em]">
                            {currentBrand.name} AI Integrity Framework v1.4
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

