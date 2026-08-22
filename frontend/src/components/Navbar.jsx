import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage, LANGUAGES } from '../contexts/LanguageContext.jsx';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service.js';
import {
  ArrowLeft, Bell, LogOut, ChevronDown, Moon, Sun, Globe, User,
} from 'lucide-react';
import { useState } from 'react';

const DASHBOARD_PATHS = ['/dashboard', '/employer/dashboard', '/admin'];

export default function Navbar() {
  const { session, role, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme') === 'dark';
    if (saved) document.documentElement.classList.add('dark-theme');
    return saved;
  });

  const isOnDashboard = DASHBOARD_PATHS.includes(location.pathname);

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

  const dashboardPath = role === 'employer' ? '/employer/dashboard' : role === 'admin' ? '/admin' : '/dashboard';

  const { data: notifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.list({ limit: 20 }),
    enabled: !!session,
    refetchInterval: 60000,
  });

  const unread = notifs?.items?.filter((n) => !n.read).length ?? 0;
  const displayName = session?.profile?.personal?.name || session?.email?.split('@')[0] || 'User';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center px-4 gap-3">
      {/* Back button (on non-dashboard pages) or Logo (on dashboard) */}
      {isOnDashboard ? (
        <NavLink to={dashboardPath} className="flex items-center gap-2 mr-4 flex-shrink-0">
          <img src="/logo.jpeg" alt="lanTURN Logo" className="logo-light h-10 w-auto object-contain mix-blend-multiply keep-color" style={{ imageRendering: '-webkit-optimize-contrast', clipPath: 'inset(16%)', margin: '0 -14px' }} />
          <img src="/logo-dark.jpeg" alt="lanTURN Logo" className="logo-dark h-10 w-auto object-contain keep-color" style={{ imageRendering: '-webkit-optimize-contrast', clipPath: 'inset(16%)', margin: '0 -14px' }} />
          <span className="text-lg font-extrabold gradient-text hidden sm:block tracking-tight">LanTURN</span>
        </NavLink>
      ) : (
        <button
          onClick={() => navigate(dashboardPath)}
          className="flex items-center gap-2 h-9 px-3 rounded-xl text-brand-600 hover:bg-slate-100 hover:text-brand-900 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <img src="/logo.jpeg" alt="lanTURN" className="logo-light h-7 w-auto object-contain mix-blend-multiply keep-color" style={{ imageRendering: '-webkit-optimize-contrast', clipPath: 'inset(16%)', margin: '0 -8px' }} />
          <img src="/logo-dark.jpeg" alt="lanTURN" className="logo-dark h-7 w-auto object-contain keep-color" style={{ imageRendering: '-webkit-optimize-contrast', clipPath: 'inset(16%)', margin: '0 -8px' }} />
        </button>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <NavLink
          to={role === 'employer' ? '/employer/notifications' : '/notifications'}
          className="relative h-9 w-9 rounded-xl flex items-center justify-center text-brand-500 hover:bg-slate-100 hover:text-brand-900 transition-colors"
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
          <button className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-medium text-brand-700 hover:bg-slate-100 transition-colors">
            <div className="h-6 w-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold flex-shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block max-w-[100px] truncate">{displayName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-brand-400" />
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-52 rounded-xl bg-white shadow-lg ring-1 ring-brand-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 animate-scale-in">
            <NavLink
              to={role === 'employer' ? '/employer/profile' : '/profile'}
              className="flex items-center gap-2 px-3 py-2 text-sm text-brand-700 hover:bg-slate-50 w-full"
            >
              <User className="h-3.5 w-3.5" /> {t('nav.profile')}
            </NavLink>

            <div className="divider my-1" />

            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 text-sm text-brand-700 hover:bg-slate-50 w-full"
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {isDark ? t('nav.lightMode') : t('nav.darkMode')}
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLangMenuOpen(!langMenuOpen);
                }}
                className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-brand-700 hover:bg-slate-50 w-full"
              >
                <span className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" />
                  {t('nav.language')}
                </span>
                <span className="text-xs text-brand-400">{currentLang.nativeName}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-full top-0 mr-1 w-40 rounded-xl bg-white shadow-lg ring-1 ring-brand-200 py-1 z-50 animate-scale-in">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 text-sm w-full transition-colors ${
                        language === lang.code
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-brand-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                      {language === lang.code && (
                        <span className="ml-auto text-brand-500">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="divider my-1" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
            >
              <LogOut className="h-3.5 w-3.5" /> {t('nav.signOut')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
