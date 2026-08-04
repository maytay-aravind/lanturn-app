import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { roadmapService } from '../../services/roadmap.service.js';
import toast from 'react-hot-toast';
import {
  MapPin, Plus, Trash2, ChevronDown, ChevronRight, CheckCircle2,
  Circle, ExternalLink, BookOpen, Code2, Award, Clock, Zap, Loader2,
  TrendingUp, X, Sparkles, Flag, ArrowRight,
} from 'lucide-react';

// ── Difficulty badge colors ─────────────────────────────────
const DIFF_COLORS = {
  Beginner:     'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Intermediate: 'bg-amber-50 text-amber-700 ring-amber-200',
  Advanced:     'bg-red-50 text-red-700 ring-red-200',
};

// ── Animated circular progress ring ────────────────────────
function ProgressRing({ percent, size = 56, stroke = 5, color = '#4f46e5' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${dash} ${circ}` }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
            fontSize="13" fontWeight="700" fill={color}>
        {percent}%
      </text>
    </svg>
  );
}

// ── Domain picker modal ────────────────────────────────────
function DomainPickerModal({ domains, enrolledIds, onEnroll, onClose, enrolling }) {
  const [search, setSearch] = useState('');
  const filtered = domains.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Choose a Career Path</h2>
            <p className="text-sm text-slate-500 mt-0.5">{domains.length} domains available · pick one or more</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>
        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-100 flex-shrink-0">
          <input
            className="input"
            placeholder="Search career domains..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        {/* Domains grid */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((domain) => {
              const isEnrolled = enrolledIds.has(domain.id);
              return (
                <motion.button
                  key={domain.id}
                  layout
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isEnrolled || enrolling === domain.id}
                  onClick={() => !isEnrolled && onEnroll(domain.id)}
                  className={`text-left p-4 rounded-2xl ring-1 transition-all duration-200 ${
                    isEnrolled
                      ? 'bg-slate-50 ring-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-white ring-slate-200 hover:ring-brand-300 hover:shadow-md cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{domain.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm">{domain.title}</span>
                        {isEnrolled && (
                          <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-xs">Enrolled</span>
                        )}
                        {enrolling === domain.id && (
                          <Loader2 className="h-3 w-3 animate-spin text-brand-500" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{domain.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{domain.estimatedMonths}mo</span>
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{domain.stageCount} stages</span>
                        <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{domain.totalTopics} topics</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Single topic row ─────────────────────────────────────
function TopicRow({ topic, checked, onToggle, isLoading }) {
  return (
    <motion.button
      layout
      whileTap={{ scale: 0.97 }}
      onClick={onToggle}
      disabled={isLoading}
      className="flex items-center gap-3 w-full text-left py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors group"
    >
      <div className="flex-shrink-0">
        {isLoading ? (
          <Loader2 className="h-4 w-4 text-brand-400 animate-spin" />
        ) : checked ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <Circle className="h-4 w-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
        )}
      </div>
      <span className={`text-sm transition-colors ${checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
        {topic}
      </span>
    </motion.button>
  );
}

// ── Stage card (expandable) ──────────────────────────────
function StageCard({ stage, stageIndex, completedSet, onToggleTopic, pendingKey, stageCompleted, totalTopics }) {
  const [expanded, setExpanded] = useState(stageIndex === 0);
  const completedCount = stage.topics.filter((_, ti) => completedSet.has(`${stageIndex}-${ti}`)).length;
  const pct = totalTopics ? Math.round((completedCount / stage.topics.length) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: stageIndex * 0.05 }}
      className={`relative rounded-2xl ring-1 transition-all duration-300 overflow-hidden ${
        stageCompleted ? 'ring-emerald-300 bg-emerald-50/40' : 'ring-slate-200 bg-white'
      }`}
    >
      {/* Stage header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left"
      >
        {/* Stage number */}
        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 font-bold ${
          stageCompleted ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-slate-100 text-slate-500'
        }`}>
          {stageCompleted ? '✓' : stage.badge}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900 text-sm">{stage.title}</h3>
            <span className={`badge ring-1 text-xs ${DIFF_COLORS[stage.difficulty] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
              {stage.difficulty}
            </span>
            {stageCompleted && <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-xs">Completed ✓</span>}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{stage.description}</p>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 progress-track h-1.5">
              <motion.div
                className="progress-fill h-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={stageCompleted ? { background: 'linear-gradient(90deg, #10b981, #059669)' } : {}}
              />
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0">{completedCount}/{stage.topics.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-slate-400 hidden sm:flex items-center gap-1">
            <Clock className="h-3 w-3" />{stage.durationWeeks}w
          </span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </motion.div>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-5 pb-5 pt-3 space-y-5">

              {/* Topics checklist */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> Topics
                </p>
                <div className="space-y-0.5">
                  {stage.topics.map((topic, ti) => {
                    const key = `${stageIndex}-${ti}`;
                    return (
                      <TopicRow
                        key={ti}
                        topic={topic}
                        checked={completedSet.has(key)}
                        isLoading={pendingKey === key}
                        onToggle={() => onToggleTopic(stageIndex, ti, !completedSet.has(key))}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Project */}
              <div className="rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 ring-1 ring-brand-200 p-4">
                <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5" /> Stage Project
                </p>
                <p className="font-semibold text-slate-900 text-sm">{stage.project.title}</p>
                <p className="text-xs text-slate-600 mt-1">{stage.project.description}</p>
              </div>

              {/* Resources */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" /> Resources
                </p>
                <div className="space-y-1.5">
                  {stage.resources.map((res, ri) => (
                    <a
                      key={ri}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-800 hover:underline transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                      {res.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Active roadmap view ──────────────────────────────────
function RoadmapView({ roadmap, onRemove }) {
  const qc = useQueryClient();
  const [pendingKey, setPendingKey] = useState(null);
  const [removing, setRemoving] = useState(false);

  const completedSet = useMemo(
    () => new Set(roadmap.completedSet || []),
    [roadmap.completedSet]
  );

  const toggleMutation = useMutation({
    mutationFn: ({ stageIndex, topicIndex, completed }) =>
      roadmapService.toggleTopic(roadmap.roadmapId, stageIndex, topicIndex, completed),
    onMutate: ({ stageIndex, topicIndex }) => {
      setPendingKey(`${stageIndex}-${topicIndex}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roadmaps', 'me'] });
    },
    onError: () => toast.error('Failed to update topic'),
    onSettled: () => setPendingKey(null),
  });

  const handleRemove = async () => {
    if (!window.confirm(`Remove the "${roadmap.domainTitle}" roadmap? Your progress will be lost.`)) return;
    setRemoving(true);
    try {
      await roadmapService.remove(roadmap.roadmapId);
      qc.invalidateQueries({ queryKey: ['roadmaps', 'me'] });
      toast.success('Roadmap removed');
      onRemove();
    } catch {
      toast.error('Failed to remove roadmap');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Roadmap header card */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className={`h-24 bg-gradient-to-r ${roadmap.domain.gradient} relative`}>
          <div className="absolute inset-0 flex items-center px-6 gap-4">
            <span className="text-5xl">{roadmap.domain.icon}</span>
            <div>
              <h2 className="text-white font-bold text-xl">{roadmap.domain.title}</h2>
              <p className="text-white/80 text-sm">{roadmap.domain.description}</p>
            </div>
          </div>
        </div>

        <div className="p-5 flex items-center gap-5 flex-wrap">
          <ProgressRing percent={roadmap.percentComplete} color={roadmap.domain.color} />

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900">{roadmap.percentComplete}% Complete</p>
            <p className="text-sm text-slate-500">{roadmap.completedTopics} of {roadmap.totalTopics} topics done</p>
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Flag className="h-3 w-3" />{roadmap.domain.stages.length} stages</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />~{roadmap.domain.estimatedMonths} months</span>
            </div>
          </div>

          <button
            onClick={handleRemove}
            disabled={removing}
            className="btn-secondary btn-sm flex items-center gap-1.5 text-red-500 hover:bg-red-50 hover:ring-red-200"
          >
            {removing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Remove
          </button>
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-brand-300 via-slate-200 to-transparent z-0" />

        <div className="space-y-4 relative z-10">
          {roadmap.domain.stages.map((stage, si) => {
            const completedCount = stage.topics.filter((_, ti) => completedSet.has(`${si}-${ti}`)).length;
            const stageCompleted = completedCount === stage.topics.length;
            return (
              <div key={si} className="flex gap-4">
                {/* Node */}
                <div className="flex-shrink-0 mt-[18px]">
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: si * 0.06, type: 'spring' }}
                    className={`h-7 w-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow-sm ${
                      stageCompleted
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : completedCount > 0
                        ? 'border-brand-400 bg-brand-50 text-brand-600'
                        : 'border-slate-300 bg-white text-slate-400'
                    }`}
                  >
                    {stageCompleted ? '✓' : si + 1}
                  </motion.div>
                </div>

                {/* Card */}
                <div className="flex-1 min-w-0">
                  <StageCard
                    stage={stage}
                    stageIndex={si}
                    completedSet={completedSet}
                    onToggleTopic={(stageIndex, topicIndex, completed) =>
                      toggleMutation.mutate({ stageIndex, topicIndex, completed })
                    }
                    pendingKey={pendingKey}
                    stageCompleted={stageCompleted}
                    totalTopics={stage.topics.length}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────
export default function CareerAIslePage() {
  const qc = useQueryClient();
  const [showPicker, setShowPicker] = useState(false);
  const [enrolling, setEnrolling] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  const { data: domains = [] } = useQuery({
    queryKey: ['roadmaps', 'domains'],
    queryFn: roadmapService.listDomains,
    staleTime: Infinity, // static data
  });

  const { data: myRoadmaps = [], isLoading } = useQuery({
    queryKey: ['roadmaps', 'me'],
    queryFn: roadmapService.getMyRoadmaps,
  });

  // Auto-select first roadmap tab
  const activeRoadmap = myRoadmaps.find((r) => r.roadmapId === activeTab) ?? myRoadmaps[0] ?? null;

  const enrolledIds = useMemo(() => new Set(myRoadmaps.map((r) => r.domainId)), [myRoadmaps]);

  const handleEnroll = async (domainId) => {
    setEnrolling(domainId);
    try {
      const result = await roadmapService.enroll(domainId);
      await qc.invalidateQueries({ queryKey: ['roadmaps', 'me'] });
      setActiveTab(result.roadmap_id);
      toast.success('Roadmap added! Let\'s get started 🚀');
      setShowPicker(false);
    } catch (err) {
      toast.error(err.message || 'Failed to enroll');
    } finally {
      setEnrolling(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            <h1 className="text-2xl font-bold text-slate-900">CareerAIsle</h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">Your personalized career roadmaps — track progress, learn systematically</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowPicker(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Career Path
        </motion.button>
      </div>

      {/* Empty state */}
      {myRoadmaps.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-12 text-center space-y-4"
        >
          <span className="text-6xl block">🗺️</span>
          <h2 className="text-xl font-bold text-slate-900">Start your career journey</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Pick a career domain and get a structured, stage-by-stage roadmap with topics, projects, and curated resources.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {domains.slice(0, 6).map((d) => (
              <span key={d.id} className="pill cursor-pointer" onClick={() => setShowPicker(true)}>
                {d.icon} {d.title}
              </span>
            ))}
            {domains.length > 6 && (
              <span className="pill cursor-pointer" onClick={() => setShowPicker(true)}>
                +{domains.length - 6} more
              </span>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowPicker(true)}
            className="btn-primary mt-4 inline-flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" /> Browse Career Paths
          </motion.button>
        </motion.div>
      )}

      {/* Active roadmaps */}
      {myRoadmaps.length > 0 && (
        <div className="space-y-5">
          {/* Roadmap tabs */}
          {myRoadmaps.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {myRoadmaps.map((rm) => (
                <motion.button
                  key={rm.roadmapId}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(rm.roadmapId)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all ${
                    activeRoadmap?.roadmapId === rm.roadmapId
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white ring-1 ring-slate-200 text-slate-600 hover:ring-slate-300'
                  }`}
                >
                  <span>{rm.domain.icon}</span>
                  <span className="hidden sm:block">{rm.domainTitle}</span>
                  <span className="text-xs opacity-70">{rm.percentComplete}%</span>
                </motion.button>
              ))}
            </div>
          )}

          {/* Overview stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Active Paths', value: myRoadmaps.length, icon: MapPin, color: 'text-brand-600 bg-brand-50' },
              { label: 'Total Topics', value: myRoadmaps.reduce((s, r) => s + r.totalTopics, 0), icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
              { label: 'Completed', value: myRoadmaps.reduce((s, r) => s + r.completedTopics, 0), icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Avg Progress', value: `${Math.round(myRoadmaps.reduce((s, r) => s + r.percentComplete, 0) / myRoadmaps.length)}%`, icon: TrendingUp, color: 'text-violet-600 bg-violet-50' },
            ].map(({ label, value, icon: Icon, color }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-4 flex items-center gap-3"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color} flex-shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 leading-none">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Active roadmap timeline */}
          {activeRoadmap && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRoadmap.roadmapId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <RoadmapView
                  roadmap={activeRoadmap}
                  onRemove={() => setActiveTab(myRoadmaps.find(r => r.roadmapId !== activeRoadmap.roadmapId)?.roadmapId ?? null)}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Domain picker modal */}
      <AnimatePresence>
        {showPicker && (
          <DomainPickerModal
            domains={domains}
            enrolledIds={enrolledIds}
            onEnroll={handleEnroll}
            onClose={() => setShowPicker(false)}
            enrolling={enrolling}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
