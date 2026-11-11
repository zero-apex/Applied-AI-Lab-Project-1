import React, { useState } from 'react';
import { ComparableStats, Listing } from '../services/dataService';
import { MessageSquare, Send, Sparkles, AlertCircle, Bot, User, CornerDownRight } from 'lucide-react';

interface AskTheDataBoxProps {
  stats: ComparableStats;
  comparables: Listing[];
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

export const AskTheDataBox: React.FC<AskTheDataBoxProps> = ({ stats, comparables }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Hello! I am your Capital Host Advisory data analyst. I am strictly grounded in the ${stats.count} comparables computed for ${stats.neighbourhood} (${stats.bedrooms === 0 ? 'Studio' : `${stats.bedrooms}-bedroom`}, Entire home/apt, <= ${stats.minNightsCap} nights). Ask me anything about these numbers, percentiles, licensing, or exclusions. Note: I will state "not in the data" if you ask for details outside this dataset.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    `What is the spread between the 25th ($${stats.p25.toFixed(2)}) and 75th ($${stats.p75.toFixed(2)}) percentiles?`,
    `How many listings in this area were excluded for needing 31+ nights?`,
    `Are all ${stats.count} comparables licensed in DC?`,
    `What are the most common property types in this slice?`,
  ];

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    const newMessages: Message[] = [...messages, { sender: 'user', text: q }];
    setMessages(newMessages);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      // Send a representative sample of up to 20 comparables for deep context
      const sampleRows = comparables.slice(0, 20).map((c) => ({
        id: c.id,
        property_type: c.property_type,
        price: c.price,
        minimum_nights: c.minimum_nights,
        number_of_reviews: c.number_of_reviews,
        review_scores_rating: c.review_scores_rating,
        has_license: c.has_license,
        estimated_revenue_l365d: c.estimated_revenue_l365d,
      }));

      const res = await fetch('/api/ask-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          stats: {
            neighbourhood: stats.neighbourhood,
            bedrooms: stats.bedrooms,
            minNightsCap: stats.minNightsCap,
            count: stats.count,
            p25: stats.p25,
            median: stats.median,
            p75: stats.p75,
            p99: stats.p99,
            minPrice: stats.minPrice,
            maxPrice: stats.maxPrice,
            totalAreaEntireHomes: stats.totalAreaEntireHomes,
            excluded31PlusCount: stats.excluded31PlusCount,
            blankMinNightsCount: stats.blankMinNightsCount,
            totalAreaBedroomCount: stats.totalAreaBedroomCount,
            licensedCount: stats.licensedCount,
            licensedMedianPrice: stats.licensedMedianPrice,
            licensedMedianRevenue: stats.licensedMedianRevenue,
            unlicensedCount: stats.unlicensedCount,
            unlicensedMedianPrice: stats.unlicensedMedianPrice,
            unlicensedMedianRevenue: stats.unlicensedMedianRevenue,
            propertyTypeCounts: stats.propertyTypeCounts,
            commonPropertyTypes: stats.commonPropertyTypes,
          },
          sampleRows,
        }),
      });

      if (!res.ok) {
        throw new Error(`API responded with ${res.status}`);
      }

      const data = await res.json();
      setMessages([...newMessages, { sender: 'assistant', text: data.answer || 'No response generated.' }]);
    } catch (err: any) {
      console.error('Error contacting Ask-the-data API:', err);
      setMessages([
        ...newMessages,
        {
          sender: 'assistant',
          text: `Unable to reach the advisory server: ${err.message || 'Network error'}. All key numbers are visible on the dashboard above.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/[0.04] rounded-2xl border border-white/10 shadow-xl shadow-black/40 p-6 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-zinc-100 tracking-tight">
              Ask-the-Data Assistant
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Directly query the verified dataset stats. Conforms to the strict rule on numbers: Gemini only explains code-computed metrics.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Strict No-Hallucination Policy</span>
        </div>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
          Suggested Data Queries
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((sq, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleSend(sq)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-violet-500/40 text-zinc-300 hover:text-white transition-all duration-150 text-left flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <CornerDownRight className="w-3 h-3 text-violet-400" />
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread */}
      <div className="bg-black/30 rounded-xl p-4.5 border border-white/10 max-h-80 overflow-y-auto mb-4 space-y-3.5 scrollbar-thin backdrop-blur-md">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-xl bg-violet-600/25 border border-violet-500/30 text-violet-300 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-violet-950/40">
                <Bot className="w-4 h-4 text-violet-300" />
              </div>
            )}

            <div
              className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-xl ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-xs shadow-md shadow-violet-950/40 font-medium'
                  : 'bg-white/[0.05] text-zinc-200 border border-white/10 rounded-bl-xs shadow-md shadow-black/20'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-white/[0.08] border border-white/10 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5 text-xs text-zinc-400 py-2">
            <div className="w-7 h-7 rounded-xl bg-violet-600/25 border border-violet-500/30 text-violet-300 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4 text-violet-300" />
            </div>
            <span className="italic font-mono text-xs text-violet-300">Analyzing computed stats...</span>
          </div>
        )}
      </div>

      {/* Query Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2.5"
      >
        <input
          type="text"
          placeholder="Ask a question about the active comparables or filter numbers..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/80 focus:border-violet-500/60 transition-all duration-150"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all duration-150 shadow-md shadow-violet-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};
