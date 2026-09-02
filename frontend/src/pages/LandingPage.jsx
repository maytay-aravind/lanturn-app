import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus, Cpu, Briefcase, FileText, Radar, MessageSquare, BarChart3, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

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
  const { user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  // Parallax scroll driver for background flower pattern
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          document.body.style.setProperty('--scroll-y', String(window.scrollY));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      {/* ── Nav ──────────────────────────────────────────── */}
      <nav 
        className="fixed top-0 w-full z-50 border-b border-brand-100 shadow-sm" 
        style={{ 
          backgroundImage: 'url(/orange-pattern.jpg)', 
          backgroundRepeat: 'repeat'
        }}
      >
        <div className="w-full h-full bg-white/70 backdrop-blur-md">
          <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
            <Link to="/" className="flex items-center gap-1.5 flex-shrink-0">
              <img src="/hero-logo.png" alt="LanTURN Logo" className="h-10 w-auto object-contain" />
              <span className="font-headline text-2xl font-bold tracking-tighter text-brand-900 flex items-center gap-1">
                LanTURN <span className="w-2 h-2 rounded-full bg-accent inline-block" />
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-brand-800 hover:text-brand-900 transition-colors font-semibold text-sm drop-shadow-sm">How It Works</a>
              <a href="#features" className="text-brand-800 hover:text-brand-900 transition-colors font-semibold text-sm drop-shadow-sm">Features</a>
              <a href="#stats" className="text-brand-800 hover:text-brand-900 transition-colors font-semibold text-sm drop-shadow-sm">Stats</a>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              {user ? (
                <Link to="/dashboard" className="text-sm font-semibold bg-brand-900 text-white px-5 py-2.5 rounded-lg hover:bg-brand-800 transition-all flex items-center gap-2 shadow-md">
                  Return to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-bold text-brand-900 hover:text-accent transition-colors drop-shadow-sm">Sign In</Link>
                  <Link to="/login?mode=signup" className="text-sm font-semibold bg-brand-900 text-white px-5 py-2.5 rounded-lg hover:bg-brand-800 transition-all flex items-center gap-2 shadow-md">
                    Get Started
                  </Link>
                </>
              )}
            </div>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center text-brand-900 hover:bg-brand-900/10 transition-colors"
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          {/* Mobile drawer */}
          {mobileNavOpen && (
            <div className="md:hidden border-t border-brand-100 bg-white/95 backdrop-blur-md animate-slide-up">
              <div className="px-6 py-4 flex flex-col gap-3 max-w-7xl mx-auto">
                <a href="#how-it-works" onClick={() => setMobileNavOpen(false)} className="text-sm font-semibold text-brand-800 py-2 hover:text-brand-900">How It Works</a>
                <a href="#features" onClick={() => setMobileNavOpen(false)} className="text-sm font-semibold text-brand-800 py-2 hover:text-brand-900">Features</a>
                <a href="#stats" onClick={() => setMobileNavOpen(false)} className="text-sm font-semibold text-brand-800 py-2 hover:text-brand-900">Stats</a>
                <div className="pt-3 border-t border-brand-100 flex flex-col gap-2">
                  {user ? (
                    <Link to="/dashboard" onClick={() => setMobileNavOpen(false)} className="text-center text-sm font-semibold bg-brand-900 text-white px-5 py-3 rounded-lg">Return to Dashboard</Link>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setMobileNavOpen(false)} className="text-center text-sm font-bold text-brand-900 py-2">Sign In</Link>
                      <Link to="/login?mode=signup" onClick={() => setMobileNavOpen(false)} className="text-center text-sm font-semibold bg-brand-900 text-white px-5 py-3 rounded-lg">Get Started</Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative px-4 sm:px-6 md:px-12 pt-28 sm:pt-32 pb-12 sm:pb-20 md:pt-40 md:pb-32 max-w-7xl mx-auto overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          <div className="z-10 animate-fade-in relative">
            {/* Semi-transparent backdrop for text readability over pattern */}
            <div className="absolute -inset-8 bg-[#F5F0E8]/80 backdrop-blur-sm rounded-2xl -z-10" />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-100 bg-white mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold tracking-wide uppercase text-brand-500">AI Placement Platform</span>
            </div>
            <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-brand-900 leading-[1.05] mb-6">
              Your Career<br />Starts Here<span className="text-accent">.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-brand-700 mb-8 sm:mb-10 max-w-lg leading-relaxed">
              AI-powered placement platform connecting students with the right employers based on skills, potential, and cultural fit.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="text-sm font-semibold bg-brand-900 text-white px-6 py-3.5 rounded-lg hover:bg-brand-800 transition-all flex items-center gap-2 group shadow-soft-md hover:shadow-soft-lg"
                >
                  Return to Dashboard
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login?mode=signup"
                    className="text-sm font-semibold bg-brand-900 text-white px-6 py-3.5 rounded-lg hover:bg-brand-800 transition-all flex items-center gap-2 group shadow-soft-md hover:shadow-soft-lg"
                  >
                    Get Started Free
                    <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block group-hover:scale-150 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-brand-900 border border-brand-200 bg-white/80 px-6 py-3.5 rounded-lg hover:bg-white transition-colors flex items-center gap-2"
                  >
                    Already a user?
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero Logo Image with Dot Matrix Background */}
          <div className="relative z-10 w-full max-w-sm mx-auto rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 animate-slide-up bg-transparent border-[6px] border-brand-900/10" style={{ minHeight: '280px' }}>
            {/* Dot matrix background */}
            <div className="absolute inset-0 z-0 bg-white/10" style={{ backgroundImage: 'radial-gradient(rgba(136,14,79,0.3) 2px, transparent 2px)', backgroundSize: '24px 24px' }} />
            {/* The Logo */}
            <img src="/hero-logo.png" alt="LanTURN Hero" width="384" height="320" loading="eager" decoding="async" fetchPriority="high" className="relative z-10 w-full h-auto object-contain drop-shadow-[0_15px_15px_rgba(136,14,79,0.3)] hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </section>

      {/* ── Trusted By ───────────────────────────────────── */}
      <section 
        className="border-y border-brand-100 relative overflow-hidden"
        style={{ 
          backgroundImage: 'url(/orange-pattern.jpg)', 
          backgroundRepeat: 'repeat'
        }}
      >
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-8 opacity-80 hover:opacity-100 transition-all duration-500 relative z-10">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-800 whitespace-nowrap drop-shadow-sm">Powered by</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
            <div className="font-headline font-black text-2xl md:text-3xl tracking-tighter text-brand-900 drop-shadow-sm text-center">Siva Sivani Degree College</div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="py-20 bg-surface-muted border-b border-brand-100" id="stats">
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
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl font-bold text-brand-900 mb-4">How It Works</h2>
            <p className="text-brand-400 max-w-2xl mx-auto">Three simple steps to connect your potential with the perfect opportunity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`bg-surface-muted border border-brand-100 p-6 sm:p-8 rounded-lg shadow-soft-md hover:shadow-soft-lg transition-all relative group ${
                  i === 1 ? 'md:translate-y-6' : i === 2 ? 'md:translate-y-12' : ''
                }`}
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
        {/* Dot matrix overlay */}
        <div className="absolute inset-0 opacity-20 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#E8E8E8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      </section>

      {/* ── Features Grid ────────────────────────────────── */}
      <section className="py-24 bg-surface-muted border-t border-brand-100" id="features">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
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
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6">Ready to start?</h2>
          <p className="text-white/70 mb-10">Join thousands of students who have already illuminated their career path with LanTURN.</p>
          {user ? (
            <Link to="/dashboard" className="inline-block bg-white text-brand-900 font-bold text-sm px-8 py-3 rounded-lg hover:bg-white/90 transition-colors shadow-soft-sm">
              Return to your Dashboard
            </Link>
          ) : (
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
          )}
        </div>
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-white border-t border-brand-100 w-full py-12 px-6 md:px-12">
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
