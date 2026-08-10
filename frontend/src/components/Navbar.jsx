import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service.js';
import {
  LayoutDashboard, Briefcase, FileText, User, Sparkles,
  Search, Bell, LogOut, ChevronDown, Menu, X, Settings,
  Building2, Map, Bot, Moon, Sun
} from 'lucide-react';
import { useState, useEffect } from 'react';

const STUDENT_LINKS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Internal Jobs' },
  { to: '/job-search', icon: Search, label: 'Job Search' },
  { to: '/applications', icon: FileText, label: 'Applications' },
  { to: '/ai', icon: Sparkles, label: 'AI Assistant' },
  { to: '/career-aisle', icon: Map, label: 'CareerAIsle' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const EMPLOYER_LINKS = [
  { to: '/employer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employer/jobs', icon: Briefcase, label: 'My Jobs' },
  { to: '/employer/ai-assistant', icon: Bot, label: 'AI Assistant' },
  { to: '/employer/profile', icon: Building2, label: 'Company Profile' },
  { to: '/employer/notifications', icon: Bell, label: 'Notifications' },
];

export default function Navbar() {
  const { session, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme') === 'dark';
    if (saved) document.documentElement.classList.add('dark-theme');
    return saved;
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  const { data: notifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.list({ limit: 20 }),
    enabled: !!session,
    refetchInterval: 60000,
  });

  const unread = notifs?.items?.filter((n) => !n.read).length ?? 0;
  const links = role === 'employer' ? EMPLOYER_LINKS : STUDENT_LINKS;
  const displayName = session?.profile?.personal?.name || session?.email?.split('@')[0] || 'User';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center px-4 gap-3">
        {/* Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-2 mr-4 flex-shrink-0">
          <img src="/logo.jpeg" alt="lanTURN Logo" className="logo-light h-10 w-auto object-contain mix-blend-multiply keep-color" style={{ imageRendering: '-webkit-optimize-contrast', clipPath: 'inset(16%)', margin: '0 -14px' }} />
          <img src="/logo-dark.jpeg" alt="lanTURN Logo" className="logo-dark h-10 w-auto object-contain keep-color" style={{ imageRendering: '-webkit-optimize-contrast' }} />
          <span className="text-lg font-extrabold gradient-text hidden sm:block tracking-tight">LanTURN</span>
        </NavLink>

        {/* Desktop nav — hidden (sidebar used on desktop) */}
        <div className="hidden lg:flex items-center gap-1 flex-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex-1 lg:flex-none" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="h-4.5 w-4.5" style={{ width: '18px', height: '18px' }} /> : <Moon className="h-4.5 w-4.5" style={{ width: '18px', height: '18px' }} />}
          </button>

          {/* Notifications */}
          <NavLink
            to={role === 'employer' ? '/employer/notifications' : '/notifications'}
            className="relative h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Bell className="h-4.5 w-4.5" style={{ width: '18px', height: '18px' }} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </NavLink>

          {/* User menu */}
          <div className="relative group">
            <button className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              <div className="h-6 w-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block max-w-[100px] truncate">{displayName}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white shadow-lg ring-1 ring-slate-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 animate-scale-in">
              <NavLink
                to={role === 'employer' ? '/employer/profile' : '/profile'}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full"
              >
                <User className="h-3.5 w-3.5" /> Profile
              </NavLink>
              <div className="divider my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100"
          >
            {mobileOpen ? <X className="h-4.5 w-4.5" style={{ width: '18px', height: '18px' }} /> : <Menu className="h-4.5 w-4.5" style={{ width: '18px', height: '18px' }} />}
          </button>
        </div>
      </header>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="fixed top-14 left-0 right-0 z-40 bg-white border-b border-slate-100 shadow-lg animate-slide-up lg:hidden">
          <nav className="p-3 space-y-0.5">
            {links.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}