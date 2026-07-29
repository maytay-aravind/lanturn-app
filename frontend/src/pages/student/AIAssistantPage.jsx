import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiService } from '../../services/ai.service.js';
import { magicalService } from '../../services/magical.service.js';
import { jobService } from '../../services/job.service.js';
import toast from 'react-hot-toast';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import {
  Sparkles, Send, MessageSquare, FileSearch, Target, Star,
  ChevronRight, Bot, User, Loader2, RefreshCw, CheckCircle2,
  AlertCircle,
} from 'lucide-react';

// ─── Tab bar ─────────────────────────────────────────────────
const TABS = [
  { id: 'chat',     icon: MessageSquare, label: 'Career Chat' },
  { id: 'review',  icon: FileSearch,    label: 'Resume Review' },
  { id: 'match',   icon: Target,        label: 'Job Match' },
  { id: 'interview', icon: Star,        label: 'Interview Prep' },
];

// ─── Score ring ───────────────────────────────────────────────
function ScoreRing({ score, size = 80, label = 'Score' }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
              fontSize="16" fontWeight="700" fill={color}>{score}</text>
      </svg>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

// ─── Career Chat tab ──────────────────────────────────────────
function ChatTab() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI Career Assistant 👋 Ask me anything — interview tips, resume advice, career planning, or job market insights." }
  ]);
  const [input, setInput] = useState('');
  const [threadId, setThreadId] = useState(null);
  const bottomRef = useRef(null);

  const chatMutation = useMutation({
    mutationFn: (msg) => aiService.careerChat({ message: msg, threadId, mode: 'career_guidance' }),
    onSuccess: (data) => {
      setThreadId(data.threadId);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message || 'AI unavailable right now');
      setMessages((prev) => [...prev, { role: 'assistant', content: '⚠️ I ran into an error. Please try again.' }]);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    const msg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    chatMutation.mutate(msg);
  };

  const SUGGESTIONS = [
    'How do I prepare for a system design interview?',
    'Review my elevator pitch for a software engineering role',
    'What are the most in-demand skills for 2025?',
    'Help me negotiate a job offer',
  ];

  return (
    <div className="flex flex-col h-[520px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-2xl mb-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 items-end ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              m.role === 'assistant' ? 'bg-brand-100' : 'bg-slate-200'
            }`}>
              {m.role === 'assistant'
                ? <Bot className="h-3.5 w-3.5 text-brand-600" />
                : <User className="h-3.5 w-3.5 text-slate-600" />
              }
            </div>
            <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
              {m.content}
            </div>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex gap-2 items-end">
            <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center">
              <Bot className="h-3.5 w-3.5 text-brand-600" />
            </div>
            <div className="chat-bubble-ai flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
              <span className="text-slate-400 text-xs">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only on first message) */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setInput(s); }}
              className="text-xs px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-slate-600 hover:ring-brand-300 hover:text-brand-700 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Ask me anything about your career..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          disabled={chatMutation.isPending}
        />
        <button
          onClick={handleSend}
          disabled={chatMutation.isPending || !input.trim()}
          className="btn-primary h-11 w-11 p-0 flex items-center justify-center flex-shrink-0 rounded-xl"
        >
          {chatMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── Resume Review tab ────────────────────────────────────────
function ResumeReviewTab() {
  const [result, setResult] = useState(null);
  const [source, setSource] = useState('magical'); // 'magical' | 'gemini'
  const [targetRole, setTargetRole] = useState('');

  const magicalMutation = useMutation({
    mutationFn: () => magicalService.reviewResume(),
    onSuccess: (data) => setResult({ ...data, _source: 'magical' }),
    onError: (err) => toast.error(err.response?.data?.error?.message || 'MagicalAPI review failed'),
  });

  const geminiMutation = useMutation({
    mutationFn: () => aiService.reviewResume({ targetRole }),
    onSuccess: (data) => setResult({ ...data, _source: 'gemini' }),
    onError: (err) => toast.error(err.response?.data?.error?.message || 'AI review failed'),
  });

  const isPending = magicalMutation.isPending || geminiMutation.isPending;

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl bg-slate-50 space-y-3">
        <p className="text-sm font-medium text-slate-700">Choose review engine</p>
        <div className="flex gap-3">
          <label className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-colors ${source === 'magical' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white'}`}>
            <input type="radio" name="source" value="magical" className="sr-only" onChange={() => setSource('magical')} />
            <p className="font-semibold text-sm text-slate-900">MagicalAPI</p>
            <p className="text-xs text-slate-500">ATS score + detailed feedback</p>
          </label>
          <label className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-colors ${source === 'gemini' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white'}`}>
            <input type="radio" name="source" value="gemini" className="sr-only" onChange={() => setSource('gemini')} />
            <p className="font-semibold text-sm text-slate-900">Gemini AI</p>
            <p className="text-xs text-slate-500">Score + strengths/weaknesses</p>
          </label>
        </div>
        {source === 'gemini' && (
          <div>
            <label className="label">Target Role (optional)</label>
            <input className="input" placeholder="e.g. Software Engineer" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
          </div>
        )}
        <button
          onClick={() => source === 'magical' ? magicalMutation.mutate() : geminiMutation.mutate()}
          disabled={isPending}
          className="btn-primary flex items-center gap-2"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
          {isPending ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </div>

      {result && (
        <div className="space-y-4 animate-slide-up">
          {/* Score */}
          {(result.score !== undefined || result.ats_score !== undefined) && (
            <div className="card p-5 flex items-center gap-6">
              <ScoreRing score={result.score ?? result.ats_score ?? 0} label="Score" />
              <div>
                <p className="font-semibold text-slate-900">Resume Score</p>
                <p className="text-sm text-slate-500">Powered by {result._source === 'magical' ? 'MagicalAPI' : 'Gemini AI'}</p>
              </div>
            </div>
          )}

          {/* Strengths */}
          {result.strengths?.length > 0 && (
            <div className="card p-5">
              <p className="section-title mb-3 text-emerald-700">✅ Strengths</p>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />{s}</li>)}
              </ul>
            </div>
          )}

          {/* Weaknesses / suggestions */}
          {(result.weaknesses?.length > 0 || result.suggestions?.length > 0) && (
            <div className="card p-5">
              <p className="section-title mb-3 text-amber-700">⚠️ Improvements</p>
              <ul className="space-y-1">
                {(result.weaknesses || []).map((w, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />{w}</li>)}
                {(result.suggestions || []).map((s, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><ChevronRight className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" /><span><b>{s.area}</b>: {s.fix}</span></li>)}
              </ul>
            </div>
          )}

          {/* Missing keywords */}
          {result.keywordsMissing?.length > 0 && (
            <div className="card p-5">
              <p className="section-title mb-3 text-red-700">🔍 Missing Keywords</p>
              <div className="flex flex-wrap gap-2">
                {result.keywordsMissing.map((k) => <span key={k} className="badge-red">{k}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Interview Prep tab ───────────────────────────────────────
function InterviewPrepTab() {
  const [skills, setSkillInput] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const interviewMutation = useMutation({
    mutationFn: () => aiService.interviewQuestions({
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      difficulty,
    }),
    onSuccess: (data) => setResult(data),
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Failed to generate questions'),
  });

  const CATEGORIES = ['technical', 'behavioral', 'situational'];
  const categoryColor = { technical: 'badge-blue', behavioral: 'badge-purple', situational: 'badge-yellow' };

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl bg-slate-50 space-y-3">
        <div>
          <label className="label">Skills / Topics</label>
          <input
            className="input"
            placeholder="e.g. React, Node.js, System Design"
            value={skills}
            onChange={(e) => setSkillInput(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Difficulty</label>
          <div className="flex gap-2">
            {['easy', 'medium', 'hard'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`btn btn-sm flex-1 capitalize ${difficulty === d ? 'btn-primary' : 'btn-secondary'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => interviewMutation.mutate()}
          disabled={interviewMutation.isPending || !skills.trim()}
          className="btn-primary flex items-center gap-2"
        >
          {interviewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
          {interviewMutation.isPending ? 'Generating...' : 'Generate Questions'}
        </button>
      </div>

      {result?.questions && (
        <div className="space-y-3 animate-slide-up">
          {result.questions.map((q, i) => (
            <div key={i} className="card p-4">
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-800 flex-1">Q{i + 1}. {q.question}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={categoryColor[q.category] || 'badge-default'}>{q.category}</span>
                    <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${expanded === i ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </button>
              {expanded === i && q.hint && (
                <div className="mt-3 pt-3 border-t border-slate-100 animate-fade-in">
                  <p className="text-xs text-slate-500 font-medium mb-1">💡 Hint</p>
                  <p className="text-sm text-slate-700">{q.hint}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Job Match tab ────────────────────────────────────────────
function JobMatchTab() {
  const [jobId, setJobId] = useState('');
  const [result, setResult] = useState(null);

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.list({ limit: 50 }),
  });

  const magicalMutation = useMutation({
    mutationFn: () => magicalService.matchJob({ jobId }),
    onSuccess: (data) => setResult({ ...data, _source: 'magical' }),
    onError: () => geminiMutation.mutate(),
  });

  const geminiMutation = useMutation({
    mutationFn: () => aiService.matchJob({ jobId }),
    onSuccess: (data) => setResult({ ...data, _source: 'gemini' }),
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Match failed'),
  });

  const isPending = magicalMutation.isPending || geminiMutation.isPending;

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl bg-slate-50 space-y-3">
        <div>
          <label className="label">Select a Job</label>
          <select className="select" value={jobId} onChange={(e) => setJobId(e.target.value)}>
            <option value="">-- Choose job --</option>
            {(jobs?.items || []).map((j) => (
              <option key={j.jobId} value={j.jobId}>{j.title} — {j.companyName}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => magicalMutation.mutate()}
          disabled={isPending || !jobId}
          className="btn-primary flex items-center gap-2"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
          {isPending ? 'Matching...' : 'Match Resume to Job'}
        </button>
      </div>

      {result && (
        <div className="space-y-4 animate-slide-up">
          <div className="card p-5 flex items-center gap-6">
            <ScoreRing score={result.matchScore ?? result.score ?? 0} label="Match" />
            <div>
              <p className="font-semibold text-slate-900">Resume Match Score</p>
              {result.experienceFit && (
                <span className={`badge mt-1 ${result.experienceFit === 'strong' ? 'badge-green' : result.experienceFit === 'partial' ? 'badge-yellow' : 'badge-red'}`}>
                  {result.experienceFit} experience fit
                </span>
              )}
            </div>
          </div>

          {result.summary && (
            <div className="card p-5">
              <p className="section-title mb-2">Summary</p>
              <p className="text-sm text-slate-700">{result.summary}</p>
            </div>
          )}

          {result.matchedSkills?.length > 0 && (
            <div className="card p-5">
              <p className="section-title text-emerald-700 mb-3">✅ Matched Skills</p>
              <div className="flex flex-wrap gap-2">
                {result.matchedSkills.map((s) => <span key={s} className="badge-green">{s}</span>)}
              </div>
            </div>
          )}

          {result.missingSkills?.length > 0 && (
            <div className="card p-5">
              <p className="section-title text-red-700 mb-3">❌ Missing Skills</p>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((s) => <span key={s} className="badge-red">{s}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────
export default function AIAssistantPage() {
  const [tab, setTab] = useState('chat');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Career Assistant</h1>
          <p className="text-sm text-slate-500">Powered by Gemini AI + MagicalAPI</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-2xl bg-slate-100">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card p-5">
        {tab === 'chat'      && <ChatTab />}
        {tab === 'review'    && <ResumeReviewTab />}
        {tab === 'match'     && <JobMatchTab />}
        {tab === 'interview' && <InterviewPrepTab />}
      </div>
    </div>
  );
}
