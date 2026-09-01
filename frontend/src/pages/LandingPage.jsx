import { Link } from 'react-router-dom';
import { ArrowRight, Play, UserPlus, Cpu, Briefcase, FileText, Radar, MessageSquare, BarChart3 } from 'lucide-react';
import DotMatrixFlower, { TileFlower, TileShape, ShapeSVG } from '../components/DotMatrixFlower.jsx';

const STATS = [
  { value: '500+', label: 'Placements' },
  { value: '120+', label: 'Employers' },
  { value: '95%', label: 'Match Rate' },
];

const STEPS = [
  { num: 1, icon: UserPlus, title: 'Create Profile', desc: 'Upload your resume, transcripts, and portfolio. Our system builds a comprehensive skills graph from your data.' },
  { num: 2, icon: Cpu, title: 'AI Matches', desc: 'Our algorithm analyzes your profile against thousands of active job requirements to find perfect alignments.' },
  { num: 3, icon: Briefcase, title: 'Get Placed', desc: 'Review matches, prep with our interview assistant, and accept offers from employers looking for your exact skill set.' },
];

const FEATURES = [
  { icon: FileText, title: 'Resume AI', desc: 'Automated resume parsing and optimization to highlight your strongest assets.' },
  { icon: Radar, title: 'Smart Matching', desc: 'Predictive models that match you with roles where you are statistically likely to succeed.' },
  { icon: MessageSquare, title: 'Career Assistant', desc: '24/7 AI chatbot for interview prep, salary negotiation tips, and career advice.' },
  { icon: BarChart3, title: 'Skill Analysis', desc: 'Identify gaps in your knowledge based on current industry demands and trends.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-muted" style={{ backgroundImage: 'radial-gradient(circle at center, #E8E8E8 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-brand-100" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <Link to="/" className="font-headline text-2xl font-bold tracking-tighter text-brand-900 flex items-center gap-2">
            LanTURN <span className="w-2 h-2 rounded-full bg-accent inline-block" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-brand-400 hover:text-brand-900 transition-colors font-medium text-sm">How It Works</a>
            <a href="#features" className="text-brand-400 hover:text-brand-900 transition-colors font-medium text-sm">Features</a>
            <a href="#stats" className="text-brand-400 hover:text-brand-900 transition-colors font-medium text-sm">Stats</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-brand-900 hover:text-accent transition-colors">Login</Link>
            <Link to="/login" className="text-sm font-semibold bg-brand-900 text-white px-5 py-2.5 rounded-lg hover:bg-brand-800 transition-all flex items-center gap-2">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 pt-32 pb-20 md:pt-40 md:pb-32 max-w-7xl mx-auto overflow-hidden">
        {/* Filled tiles + basic dot-matrix shapes — high contrast like reference side panels */}
        <div className="absolute top-8 right-6 hidden lg:flex items-center gap-3">
          <TileFlower tile="orange" variant="lotus" size={96} />
          <div className="flex flex-col gap-3">
            <ShapeSVG shape="star" size={28} color="#1A1A1A" />
            <ShapeSVG shape="circle" size={22} color="#880E4F" />
          </div>
          <TileShape tile="pink" shape="square" size={72} />
        </div>
        <div className="absolute bottom-6 left-6 hidden lg:flex items-center gap-3">
          <TileFlower tile="green" variant="diamond" size={84} />
          <ShapeSVG shape="cross" size={26} color="#1A1A1A" />
          <TileFlower tile="yellow" variant="small" size={72} dotColor="#880E4F" />
          <ShapeSVG shape="triangle" size={24} color="#E91E63" />
        </div>
        <div className="absolute top-28 left-[46%] hidden xl:flex items-center gap-2">
          <ShapeSVG shape="diamond" size={20} color="#1A1A1A" />
          <TileShape tile="pink" shape="circle" size={54} dotColor="#FFFFFF" />
        </div>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="z-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-100 bg-white mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold tracking-wide uppercase text-brand-500">AI Placement Platform</span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-brand-900 leading-[1.1] mb-6">
              Your Career<br />Starts Here<span className="text-accent">.</span>
            </h1>
            <p className="text-lg md:text-xl text-brand-400 mb-10 max-w-lg leading-relaxed">
              AI-powered placement platform connecting students with the right employers based on skills, potential, and cultural fit.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-semibold bg-brand-900 text-white px-6 py-3.5 rounded-lg hover:bg-brand-800 transition-all flex items-center gap-2 group shadow-soft-md hover:shadow-soft-lg"
              >
                Get Started Free
                <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block group-hover:scale-150 transition-transform" />
              </Link>
              <button className="text-sm font-semibold bg-transparent text-brand-900 border border-brand-200 px-6 py-3.5 rounded-lg hover:bg-brand-50 transition-colors flex items-center gap-2">
                <Play className="h-4 w-4" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="relative z-10 w-full bg-white rounded-lg border border-brand-100 shadow-soft-lg overflow-hidden p-6 flex flex-col gap-4 animate-slide-up">
            {/* Mock header */}
            <div className="flex justify-between items-center border-b border-brand-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-brand-500" />
                </div>
                <div>
                  <div className="h-3 w-24 bg-brand-100 rounded mb-2" />
                  <div className="h-2 w-16 bg-brand-50 rounded" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-lg border border-brand-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-brand-200" />
                </div>
              </div>
            </div>
            {/* Mock stat cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-muted rounded-lg p-4 border border-brand-100">
                <div className="h-2 w-16 bg-brand-100 rounded mb-4" />
                <div className="flex items-end gap-2 mb-2">
                  <div className="h-8 w-16 bg-brand-900 rounded" />
                  <span className="text-xs text-accent font-semibold">+14%</span>
                </div>
                <div className="w-full h-12 flex items-end gap-1">
                  {[40, 60, 30, 80, 50].map((h, i) => (
                    <div key={i} className={`w-full rounded-t ${i === 3 ? 'bg-brand-900' : 'bg-brand-200'}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="bg-surface-muted rounded-lg p-4 border border-brand-100 flex flex-col justify-between">
                <div className="h-2 w-20 bg-brand-100 rounded mb-4" />
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-accent" />
                    </div>
                    <div className="h-3 w-24 bg-brand-100 rounded" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-brand-400" />
                    </div>
                    <div className="h-3 w-16 bg-brand-100 rounded" />
                  </div>
                </div>
              </div>
            </div>
            {/* Mock list */}
            <div className="flex-grow bg-surface-muted rounded-lg p-4 border border-brand-100">
              <div className="h-2 w-24 bg-brand-100 rounded mb-4" />
              <div className="space-y-3">
                {[32, 24].map((w, i) => (
                  <div key={i} className="h-10 w-full bg-white border border-brand-100 rounded flex items-center px-4 justify-between">
                    <div className={`h-2 bg-brand-100 rounded`} style={{ width: `${w * 4}px` }} />
                    <div className="h-2 w-12 bg-brand-50 rounded" />
                  </div>
                ))}
              </div>
            </div>
            {/* Decorative geometric shapes */}
            <div className="absolute -z-10 top-10 -right-10 w-40 h-40 border border-brand-100/40 rounded-full" />
            <div className="absolute -z-10 -bottom-10 -left-10 w-32 h-32 border border-brand-100/40 rotate-45" />
          </div>
        </div>
      </section>

      {/* ── Trusted By ───────────────────────────────────── */}
      <section className="relative border-y border-brand-100 bg-white py-10 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-between px-4 md:px-12 pointer-events-none hidden md:flex">
          <div className="flex items-center gap-2">
            <TileFlower tile="orange" variant="small" size={52} />
            <ShapeSVG shape="star" size={18} color="#1A1A1A" />
          </div>
          <div className="flex items-center gap-2">
            <ShapeSVG shape="circle" size={16} color="#E91E63" />
            <TileShape tile="green" shape="square" size={44} />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500 relative z-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 whitespace-nowrap">Trusted by students from</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
            {['IIT BOMBAY', 'NIT TRICHY', 'VIT', 'SRM', 'BITS PILANI'].map(name => (
              <div key={name} className="font-headline font-bold text-xl tracking-tighter text-brand-900">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="relative py-20 bg-surface-muted border-b border-brand-100 overflow-hidden" id="stats">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3">
          <TileFlower tile="pink" variant="diamond" size={68} />
          <ShapeSVG shape="circle" size={20} color="#1A1A1A" />
          <TileShape tile="yellow" shape="star" size={54} dotColor="#880E4F" />
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3">
          <TileShape tile="green" shape="square" size={54} />
          <ShapeSVG shape="cross" size={22} color="#1A1A1A" />
          <TileFlower tile="orange" variant="lotus" size={68} />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-brand-100">
            {STATS.map(s => (
              <div key={s.label} className="text-center py-6 md:py-0">
                <div className="font-headline text-5xl font-bold text-brand-900 mb-2 flex justify-center items-baseline gap-1">
                  {s.value.replace(/[^0-9]/g, '')}<span className="text-accent text-4xl">{s.value.replace(/[0-9]/g, '')}</span>
                </div>
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-24 bg-white relative overflow-hidden" id="how-it-works">
        {/* Corner tile clusters — like reference's tile borders */}
        <div className="absolute top-6 left-6 hidden lg:flex items-start gap-2">
          <TileFlower tile="orange" variant="lotus" size={88} />
          <div className="flex flex-col gap-2 mt-2">
            <ShapeSVG shape="diamond" size={18} color="#1A1A1A" />
            <TileShape tile="pink" shape="square" size={42} />
          </div>
        </div>
        <div className="absolute top-6 right-6 hidden lg:flex items-start gap-2">
          <div className="flex flex-col gap-2 mt-2">
            <TileShape tile="yellow" shape="circle" size={42} dotColor="#880E4F" />
            <ShapeSVG shape="star" size={18} color="#1A1A1A" />
          </div>
          <TileFlower tile="green" variant="diamond" size={88} />
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2">
          <ShapeSVG shape="cross" size={20} color="#1A1A1A" />
          <TileFlower tile="orange" variant="small" size={56} />
          <ShapeSVG shape="triangle" size={18} color="#E91E63" />
          <TileShape tile="pink" shape="star" size={56} />
          <ShapeSVG shape="circle" size={16} color="#1A1A1A" />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl font-bold text-brand-900 mb-4">How It Works</h2>
            <p className="text-brand-400 max-w-2xl mx-auto">Three simple steps to connect your potential with the perfect opportunity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="bg-surface-muted border border-brand-100 p-8 rounded-lg shadow-soft-md hover:shadow-soft-lg transition-all relative group"
                style={{ transform: `translateY(${i * 24}px)` }}
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-brand-900 text-white font-headline font-bold text-xl flex items-center justify-center rounded-lg shadow-soft-sm">
                  {step.num}
                </div>
                <div className="w-12 h-12 bg-brand-100 rounded-lg mb-6 flex items-center justify-center text-brand-900 group-hover:bg-brand-900 group-hover:text-white transition-colors">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="font-headline text-xl font-bold text-brand-900 mb-3">{step.title}</h3>
                <p className="text-sm text-brand-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────── */}
      <section className="relative py-24 bg-surface-muted border-t border-brand-100 overflow-hidden" id="features">
        <div className="absolute top-8 right-8 hidden lg:flex items-center gap-2">
          <TileFlower tile="green" variant="lotus" size={82} />
          <ShapeSVG shape="star" size={20} color="#1A1A1A" />
          <TileShape tile="orange" shape="diamond" size={64} />
        </div>
        <div className="absolute bottom-8 left-8 hidden lg:flex items-center gap-2">
          <TileFlower tile="pink" variant="small" size={72} />
          <ShapeSVG shape="circle" size={18} color="#1A1A1A" />
          <TileShape tile="yellow" shape="square" size={52} dotColor="#880E4F" />
          <ShapeSVG shape="cross" size={16} color="#E91E63" />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="mb-16">
            <h2 className="font-headline text-4xl font-bold text-brand-900 mb-4">Platform Features</h2>
            <p className="text-brand-400 max-w-2xl">The tools you need to accelerate your transition from campus to career.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white border border-brand-100 p-6 rounded-lg hover:-translate-y-1 transition-all shadow-soft-sm hover:shadow-soft-md">
                <div className="mb-6 flex justify-between items-start">
                  <f.icon className="h-7 w-7 text-brand-900" />
                  <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                </div>
                <h3 className="font-headline text-lg font-bold text-brand-900 mb-2">{f.title}</h3>
                <p className="text-sm text-brand-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────── */}
      <section className="py-24 bg-brand-900 text-white relative overflow-hidden">
        {/* Tiles pop on dark — white dots on colored tiles + yellow accents */}
        <div className="absolute top-6 left-6 hidden md:flex items-center gap-2">
          <TileFlower tile="orange" variant="lotus" size={78} />
          <ShapeSVG shape="star" size={20} color="#FFC107" />
        </div>
        <div className="absolute top-8 right-8 hidden md:flex items-center gap-2">
          <ShapeSVG shape="circle" size={18} color="#FFC107" />
          <TileFlower tile="pink" variant="diamond" size={78} />
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-3">
          <TileShape tile="yellow" shape="square" size={48} dotColor="#880E4F" />
          <ShapeSVG shape="cross" size={20} color="white" />
          <TileFlower tile="green" variant="small" size={58} />
          <ShapeSVG shape="triangle" size={18} color="#FFC107" />
          <TileShape tile="orange" shape="circle" size={48} />
        </div>
        {/* Extra large ghost lotus behind text — reference's big mandala */}
        <DotMatrixFlower size={400} color="white" variant="lotus" rotate={14} className="absolute -top-20 -right-20 hidden lg:flex" style={{ opacity: 0.06 }} />
        <DotMatrixFlower size={340} color="white" variant="lotus" rotate={-12} className="absolute -bottom-24 -left-20 hidden lg:flex" style={{ opacity: 0.05 }} />
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6">Ready to start?</h2>
          <p className="text-white/70 mb-10">Join thousands of students who have already illuminated their career path with LanTURN.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={e => { e.preventDefault(); window.location.href = '/login'; }}>
            <input
              className="flex-grow bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 text-sm"
              placeholder="Enter your student email"
              type="email"
            />
            <button className="bg-white text-brand-900 font-bold text-sm px-8 py-3 rounded-lg hover:bg-white/90 transition-colors whitespace-nowrap" type="submit">
              Join Now
            </button>
          </form>
        </div>
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="relative bg-white border-t border-brand-100 w-full py-12 px-6 md:px-12 overflow-hidden">
        <div className="absolute top-4 right-12 hidden md:flex items-center gap-2">
          <TileFlower tile="yellow" variant="small" size={48} dotColor="#880E4F" />
          <ShapeSVG shape="star" size={16} color="#1A1A1A" />
          <TileShape tile="pink" shape="diamond" size={44} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-headline text-xl font-bold text-brand-900">LanTURN</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="text-sm text-brand-400 hover:text-brand-900 transition-colors" href="#">Privacy Policy</a>
            <a className="text-sm text-brand-400 hover:text-brand-900 transition-colors" href="#">Terms of Service</a>
            <a className="text-sm text-brand-400 hover:text-brand-900 transition-colors" href="#">Contact Support</a>
          </div>
          <p className="text-sm text-brand-300">
            © {new Date().getFullYear()} LanTURN. AI-Powered Excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}
