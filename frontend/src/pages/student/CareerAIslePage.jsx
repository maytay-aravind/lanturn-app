import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { roadmapService } from '../../services/roadmap.service.js';
import toast from 'react-hot-toast';
import {
  Globe, Server, Layers, Brain, Smartphone, BarChart2, RefreshCw,
  Shield, Cloud, Palette, Link, Gamepad2, FlaskConical, Cpu,
  Database, TrendingUp, Plus, X, Loader2, ExternalLink,
  BookOpen, Code2, Clock, Trash2, Sparkles, CheckCircle2,
  ChevronLeft, ChevronRight, ArrowRight, Map,
} from 'lucide-react';

// ── Domain icon mapping (lucide) ────────────────────────────
const DOMAIN_ICONS = {
  frontend:   Globe,
  backend:    Server,
  fullstack:  Layers,
  aiml:       Brain,
  android:    Smartphone,
  datasci:    BarChart2,
  devops:     RefreshCw,
  cybersec:   Shield,
  cloud:      Cloud,
  uiux:       Palette,
  blockchain: Link,
  gamedev:    Gamepad2,
  qa:         FlaskConical,
  embedded:   Cpu,
  dataeng:    Database,
};

// ── Stage node colors (cycles) ───────────────────────────────
const STAGE_COLORS = [
  { bg: 'bg-indigo-600',  border: 'border-indigo-600',  text: 'text-indigo-600',  light: 'bg-indigo-50',  hex: '#4f46e5' },
  { bg: 'bg-amber-400',   border: 'border-amber-400',   text: 'text-amber-500',   light: 'bg-amber-50',   hex: '#f59e0b' },
  { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', hex: '#10b981' },
  { bg: 'bg-rose-500',    border: 'border-rose-500',    text: 'text-rose-600',    light: 'bg-rose-50',    hex: '#f43f5e' },
  { bg: 'bg-violet-500',  border: 'border-violet-500',  text: 'text-violet-600',  light: 'bg-violet-50',  hex: '#8b5cf6' },
];

// ── Domain picker modal ──────────────────────────────────────
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
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Choose a Career Path</h2>
            <p className="text-sm text-slate-500 mt-0.5">{domains.length} domains available</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>
        <div className="px-6 py-3 border-b border-slate-100 flex-shrink-0">
          <input className="input" placeholder="Search career paths..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((domain) => {
              const DIcon = DOMAIN_ICONS[domain.id] ?? Globe;
              const isEnrolled = enrolledIds.has(domain.id);
              return (
                <motion.button
                  key={domain.id}
                  whileHover={!isEnrolled ? { scale: 1.02 } : {}}
                  whileTap={!isEnrolled ? { scale: 0.98 } : {}}
                  disabled={isEnrolled || enrolling === domain.id}
                  onClick={() => !isEnrolled && onEnroll(domain.id)}
                  className={`text-left p-4 rounded-2xl ring-1 transition-all duration-200 ${
                    isEnrolled
                      ? 'bg-slate-50 ring-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-white ring-slate-200 hover:ring-indigo-300 hover:shadow-md cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      {enrolling === domain.id
                        ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                        : <DIcon className="h-4 w-4 text-indigo-600" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm">{domain.title}</span>
                        {isEnrolled && <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-xs">Enrolled</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{domain.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{domain.estimatedMonths}mo</span>
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{domain.stageCount} stages</span>
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

// ── Topic row ────────────────────────────────────────────────
function TopicRow({ topic, checked, onToggle, isLoading, accentColor, stageCompleted }) {
  return (
    <motion.button
      layout
      onClick={onToggle}
      disabled={isLoading}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`flex items-center justify-between w-full text-left py-3 px-4 rounded-xl mb-1.5 group transition-colors ${
        checked
          ? 'bg-emerald-50 ring-1 ring-emerald-200'
          : stageCompleted
          ? 'bg-slate-50 ring-1 ring-slate-200'
          : 'bg-slate-50/50 hover:bg-slate-100 ring-1 ring-transparent hover:ring-slate-200'
      }`}
    >
      <span className={`text-sm pr-3 font-medium transition-all duration-300 ${
        checked ? 'line-through text-emerald-600/60' : 'text-slate-700 group-hover:text-slate-900'
      }`}>
        {topic}
      </span>
      <div className="flex-shrink-0">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: accentColor }} />
        ) : checked ? (
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </motion.div>
        ) : (
          <div className="h-5 w-5 rounded-full border-2 border-slate-300 group-hover:border-slate-400 transition-colors" />
        )}
      </div>
    </motion.button>
  );
}

// ── Stage content panel (left or right) ─────────────────────
function StagePanel({ stage, stageIndex, side, completedSet, onToggleTopic, pendingKey, color, stageCompleted }) {
  const completedCount = stage.topics.filter((_, ti) => completedSet.has(`${stageIndex}-${ti}`)).length;
  const pct = stage.topics.length ? Math.round((completedCount / stage.topics.length) * 100) : 0;
  const startWeek = stageIndex * stage.durationWeeks + 1;
  const endWeek   = startWeek + stage.durationWeeks - 1;

  const panelBg    = stageCompleted ? 'bg-[#ecfdf5]' : 'bg-white';
  const accentHex  = stageCompleted ? '#10b981' : color.hex;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: side === 'right' ? 48 : -48, y: 12, boxShadow: '6px 6px 0px #0f172a' }}
      animate={{ opacity: 1, x: 0, y: 0, boxShadow: '6px 6px 0px #0f172a' }}
      transition={{ delay: stageIndex * 0.08, duration: 0.45, type: 'spring', stiffness: 200, damping: 24 }}
      whileHover={{ scale: 1.02, x: -2, y: -2, boxShadow: '8px 8px 0px #0f172a' }}
      className={`${panelBg} border-[3px] border-slate-900 rounded-2xl overflow-hidden z-10`}
      style={{ width: 380 }}
    >
      {/* Coloured top accent bar */}
      <motion.div
        className="h-1.5 w-full"
        animate={{ background: stageCompleted
          ? 'linear-gradient(90deg, #10b981, #059669)'
          : `linear-gradient(90deg, ${color.hex}, ${color.hex}cc)`
        }}
        transition={{ duration: 0.6 }}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Timeframe: Weeks {startWeek}–{endWeek}
            </p>
            <p className="text-base font-bold text-slate-900 mt-0.5">{stage.title}</p>
          </div>
          {stageCompleted && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="h-9 w-9 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-200 flex-shrink-0"
            >
              <CheckCircle2 className="h-5 w-5 text-white" />
            </motion.div>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              animate={{
                width: `${pct}%`,
                background: stageCompleted
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : `linear-gradient(90deg, ${color.hex}, ${color.hex}bb)`,
              }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </div>
          <motion.span
            animate={{ color: stageCompleted ? '#059669' : '#94a3b8' }}
            className="text-xs font-semibold flex-shrink-0 w-10 text-right"
          >
            {pct}%
          </motion.span>
        </div>

        {/* Topics */}
        <div className="mb-4">
          {stage.topics.map((topic, ti) => {
            const key = `${stageIndex}-${ti}`;
            return (
              <TopicRow
                key={ti}
                topic={topic}
                checked={completedSet.has(key)}
                isLoading={pendingKey === key}
                onToggle={() => onToggleTopic(stageIndex, ti, !completedSet.has(key))}
                accentColor={accentHex}
                stageCompleted={stageCompleted}
              />
            );
          })}
        </div>

        {/* Project card */}
        <motion.div
          animate={{
            background: stageCompleted
              ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
              : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
          }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl p-4 mb-4 ring-1 ring-slate-200"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
             style={{ color: accentHex }}>
            <Code2 className="h-3.5 w-3.5" /> Stage Project
          </p>
          <p className="text-sm font-semibold text-slate-900">{stage.project.title}</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{stage.project.description}</p>
        </motion.div>

        {/* Resources */}
        {stage.resources.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">
              Recommended Study Resources
            </p>
            <div className="space-y-2">
              {stage.resources.map((res, ri) => (
                <motion.a
                  key={ri}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="flex items-center gap-2 text-sm font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                  {res.title}
                </motion.a>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Center timeline for a single roadmap ─────────────────────
function RoadmapTimeline({ roadmap, onRemove }) {
  const qc = useQueryClient();
  const [pendingKey, setPendingKey] = useState(null);
  const [removing, setRemoving] = useState(false);
  const DIcon = DOMAIN_ICONS[roadmap.domainId] ?? Globe;

  const completedSet = useMemo(
    () => new Set(roadmap.completedSet || []),
    [roadmap.completedSet]
  );

  const toggleMutation = useMutation({
    mutationFn: ({ stageIndex, topicIndex, completed }) =>
      roadmapService.toggleTopic(roadmap.roadmapId, stageIndex, topicIndex, completed),
    onMutate: ({ stageIndex, topicIndex }) => setPendingKey(`${stageIndex}-${topicIndex}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roadmaps', 'me'] }),
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
    <div className="space-y-6">
      {/* Roadmap header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className={`h-20 bg-gradient-to-r ${roadmap.domain.gradient} relative flex items-center px-6 gap-4`}>
          <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <DIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">{roadmap.domain.title}</h2>
            <p className="text-white/75 text-xs">{roadmap.domain.description}</p>
          </div>
        </div>
        <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold text-slate-900">{roadmap.percentComplete}%</p>
              <p className="text-xs text-slate-500">{roadmap.completedTopics}/{roadmap.totalTopics} topics</p>
            </div>
            <div className="flex-1 min-w-[160px]">
              <div className="progress-track">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${roadmap.percentComplete}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div className="flex gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{roadmap.domain.stages.length} stages</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />~{roadmap.domain.estimatedMonths} months</span>
            </div>
          </div>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="btn-secondary btn-sm text-red-500 hover:bg-red-50 hover:ring-red-200 flex items-center gap-1.5"
          >
            {removing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Remove
          </button>
        </div>
      </motion.div>

      {/* Center alternating timeline */}
      <div className="relative py-8">
        {/* Animated vertical center line */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ transformOrigin: 'top' }}
          className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 z-0"
        >
          <div className="h-full w-full" style={{
            background: 'linear-gradient(180deg, #818cf8 0%, #c4b5fd 50%, #e0e7ff 100%)'
          }} />
        </motion.div>

        <div className="space-y-0">
          {roadmap.domain.stages.map((stage, si) => {
            const side = si % 2 === 0 ? 'right' : 'left';
            const color = STAGE_COLORS[si % STAGE_COLORS.length];
            const completedCount = stage.topics.filter((_, ti) => completedSet.has(`${si}-${ti}`)).length;
            const stageCompleted = completedCount === stage.topics.length && stage.topics.length > 0;
            const nodeColor = stageCompleted ? '#10b981' : color.hex;

            return (
              <motion.div
                key={si}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: si * 0.08, duration: 0.4 }}
                className="relative flex items-center justify-center"
                style={{ minHeight: 300, paddingBottom: 48 }}
              >
                {/* Left slot */}
                <div className="flex-1 flex justify-end pr-10">
                  {side === 'left' && (
                    <StagePanel
                      stage={stage}
                      stageIndex={si}
                      side="left"
                      completedSet={completedSet}
                      onToggleTopic={(sI, tI, c) => toggleMutation.mutate({ stageIndex: sI, topicIndex: tI, completed: c })}
                      pendingKey={pendingKey}
                      color={color}
                      stageCompleted={stageCompleted}
                    />
                  )}
                </div>

                {/* Center node */}
                <div className="flex-shrink-0 flex flex-col items-center z-10">
                  {/* Stage pill node */}
                  <motion.div
                    layout
                    animate={{
                      backgroundColor: stageCompleted ? '#10b981' : color.hex,
                      boxShadow: '6px 6px 0px #0f172a',
                    }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
                    whileHover={{ scale: 1.05, x: -2, y: -2, boxShadow: '8px 8px 0px #0f172a' }}
                    className="rounded-2xl px-6 py-5 text-center cursor-default border-[3px] border-slate-900 z-10"
                    style={{ minWidth: 170 }}
                  >
                    <motion.p
                      animate={{ opacity: 1 }}
                      className={`${(color.hex === '#f59e0b' && !stageCompleted) ? 'text-slate-900/80' : 'text-white/90'} text-[11px] font-black uppercase tracking-widest`}
                    >
                      {stageCompleted ? '✓ Complete' : `Stage ${si + 1}`}
                    </motion.p>
                    <p className={`${(color.hex === '#f59e0b' && !stageCompleted) ? 'text-slate-900' : 'text-white'} text-base font-black leading-tight mt-1.5`}>
                      {stage.title}
                    </p>
                  </motion.div>
                </div>

                {/* Right slot */}
                <div className="flex-1 flex justify-start pl-10">
                  {side === 'right' && (
                    <StagePanel
                      stage={stage}
                      stageIndex={si}
                      side="right"
                      completedSet={completedSet}
                      onToggleTopic={(sI, tI, c) => toggleMutation.mutate({ stageIndex: sI, topicIndex: tI, completed: c })}
                      pendingKey={pendingKey}
                      color={color}
                      stageCompleted={stageCompleted}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* End marker */}
        <div className="flex justify-center relative z-10">
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-500 text-white px-5 py-2.5 text-sm font-semibold shadow-lg">
            <CheckCircle2 className="h-4 w-4" /> Journey Complete!
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function CareerAIslePage() {
  const qc = useQueryClient();
  const [showPicker, setShowPicker] = useState(false);
  const [enrolling, setEnrolling] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  const { data: domains = [] } = useQuery({
    queryKey: ['roadmaps', 'domains'],
    queryFn: roadmapService.listDomains,
    staleTime: Infinity,
  });

  const { data: myRoadmaps = [], isLoading } = useQuery({
    queryKey: ['roadmaps', 'me'],
    queryFn: roadmapService.getMyRoadmaps,
  });

  const enrolledIds = useMemo(() => new Set(myRoadmaps.map((r) => r.domainId)), [myRoadmaps]);

  const activeRoadmap = myRoadmaps.find((r) => r.roadmapId === activeTab) ?? myRoadmaps[0] ?? null;

  const handleEnroll = async (domainId) => {
    setEnrolling(domainId);
    try {
      const result = await roadmapService.enroll(domainId);
      await qc.invalidateQueries({ queryKey: ['roadmaps', 'me'] });
      setActiveTab(result.roadmap_id);
      toast.success('Career path added! Let\'s go 🚀');
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
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
              <Map className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">CareerAIsle</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 ml-[44px]">Structured, stage-by-stage career learning paths</p>
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

      {/* Roadmap tabs */}
      {myRoadmaps.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {myRoadmaps.map((rm) => {
            const DIcon = DOMAIN_ICONS[rm.domainId] ?? Globe;
            const isActive = activeRoadmap?.roadmapId === rm.roadmapId;
            return (
              <motion.button
                key={rm.roadmapId}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(rm.roadmapId)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white ring-1 ring-slate-200 text-slate-600 hover:ring-slate-300'
                }`}
              >
                <DIcon className="h-4 w-4" />
                <span>{rm.domainTitle}</span>
                <span className={`text-xs font-medium ${isActive ? 'opacity-70' : 'text-slate-400'}`}>
                  {rm.percentComplete}%
                </span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {myRoadmaps.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-14 text-center space-y-4"
        >
          <div className="h-16 w-16 rounded-3xl bg-indigo-50 flex items-center justify-center mx-auto">
            <Map className="h-8 w-8 text-indigo-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Start your career journey</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Pick a career domain and get a structured stage-by-stage roadmap with topics, projects, and curated resources.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {domains.slice(0, 5).map((d) => {
              const DIcon = DOMAIN_ICONS[d.id] ?? Globe;
              return (
                <button
                  key={d.id}
                  onClick={() => setShowPicker(true)}
                  className="flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <DIcon className="h-3.5 w-3.5" /> {d.title}
                </button>
              );
            })}
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowPicker(true)}
            className="btn-primary mt-2 inline-flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" /> Browse Career Paths
          </motion.button>
        </motion.div>
      )}

      {/* Active roadmap timeline */}
      {activeRoadmap && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRoadmap.roadmapId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <RoadmapTimeline
              roadmap={activeRoadmap}
              onRemove={() => setActiveTab(myRoadmaps.find((r) => r.roadmapId !== activeRoadmap.roadmapId)?.roadmapId ?? null)}
            />
          </motion.div>
        </AnimatePresence>
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
