'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
    contextData: any;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    reasoning_details?: any;
}

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, contextData }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Filter out large datasets from context to stay within token limits
            const simplifiedContext = {
                stats: contextData.stats,
                aggregations: {
                    ...contextData.aggregations,
                    attributionData: {
                        ...contextData.aggregations?.attributionData,
                        tableData: undefined // Too large to send
                    }
                }
            };

            const apiMessages = [
                {
                    role: 'system',
                    content: `You are a "Short & Crisp" AI Analytics Assistant for the ML Attribution Dashboard. 
                    Your goal is to provide high-impact, brief insights. Avoid long paragraphs.
                    
                    RULES:
                    1. NO markdown formatting. NO stars (bold/italics), NO hashtags (headers). Use plain text ONLY.
                    2. Use simple dashes (-) for lists instead of stars.
                    3. Keep explanations to 1-2 sentences max.
                    4. Focus on the most critical "Top 3" insights.
                    
                    Dashboard Context:
                    ${JSON.stringify(simplifiedContext, null, 2)}`
                },
                ...messages.map(m => ({
                    role: m.role,
                    content: m.content,
                    ...(m.reasoning_details ? { reasoning_details: m.reasoning_details } : {})
                })),
                { role: 'user', content: input }
            ];

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "stepfun/step-3.5-flash:free",
                    "messages": apiMessages,
                    "reasoning": { "enabled": true }
                })
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error.message || "Unknown API error");
            }

            if (!result.choices || result.choices.length === 0) {
                throw new Error("No response from AI model");
            }

            const assistantMessage = result.choices[0].message;

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: assistantMessage.content,
                reasoning_details: assistantMessage.reasoning_details
            }]);
        } catch (error: any) {
            console.error("Error calling OpenRouter:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Sorry, I encountered an error: ${error.message || "Please try again later."}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 bg-[#1e293b]/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight">AI Analytics Guide</h2>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Powered by Step 3.5 Flash</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Messages Federated */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(circle_at_top_right,rgba(30,41,59,0.5),transparent)]">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                                <Bot className="text-blue-400" size={32} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold uppercase tracking-widest text-sm">How can I help you today?</h3>
                                <p className="text-xs text-slate-500 max-w-xs mt-2 uppercase tracking-wide leading-relaxed">
                                    I have analyzed your cloud billing and attribution data. Ask me about cost trends, initiative splits, or model distribution.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {['What is the total spend?', 'Which initiative costs most?', 'Summarize the data', 'Active models count'].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setInput(suggestion)}
                                        className="text-[10px] font-bold uppercase tracking-wider p-2 px-3 border border-slate-800 rounded-lg text-slate-400 hover:border-blue-500/50 hover:text-blue-400 transition-all hover:bg-blue-500/5"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-slate-800 text-slate-400' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    }`}>
                                    {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg'
                                    : 'bg-slate-800/50 text-slate-200 border border-slate-700 rounded-tl-none'
                                    }`}>
                                    {m.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex gap-3 items-center text-blue-400">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <Bot size={16} />
                                </div>
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-6 bg-[#0f172a] border-t border-slate-800">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex gap-3"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask anything about the data..."
                            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                    <p className="text-[9px] text-slate-600 mt-3 text-center font-bold uppercase tracking-widest">
                        AI can make mistakes. Please verify important financial metrics.
                    </p>
                </div>
            </div>
        </div>
    );
};
