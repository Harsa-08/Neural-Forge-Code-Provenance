import React, { useState } from 'react';
import { User, NotificationItem } from '../types';
import { ShieldCheck, LogOut, Search, Bell, Sparkles, User as UserIcon, Menu, X, AlertCircle, Sun, Moon } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  notifications?: NotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAllNotifications?: () => void;
  onDeleteNotification?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  searchQuery,
  setSearchQuery,
  isDarkMode = false,
  toggleDarkMode,
  notifications = [],
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onClearAllNotifications = () => {},
  onDeleteNotification = () => {},
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navError, setNavError] = useState<string | null>(null);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const handleNavClick = (tabId: string) => {
    if (tabId === 'profile' && !user) {
      setActiveTab('auth');
    } else {
      setActiveTab(tabId);
    }
    setMobileMenuOpen(false);
    setNotifPanelOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 lg:px-8 py-4 flex items-center justify-between gap-4 shadow-sm transition-colors duration-200">
      {/* Brand & Mobile Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger menu */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors"
          id="mobile-hamburger-btn"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div 
          onClick={() => handleNavClick('dashboard')}
          className="cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#622569] to-[#9b51e0] flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-purple-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-[#622569] dark:text-purple-400 tracking-tight font-['Poppins']">IET CONNECT</span>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-[#622569]/10 dark:bg-purple-500/20 text-[#622569] dark:text-purple-300 rounded-md tracking-wider">PORTAL</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Institution of Engineering and Technology</p>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search members, projects, events..."
          className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs pl-10 pr-4 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-[#9b51e0] dark:focus:border-purple-400 focus:ring-2 focus:ring-[#9b51e0]/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-3 relative">
        {/* Dark Mode Toggle Button */}
        {toggleDarkMode && (
          <button
            onClick={toggleDarkMode}
            className="p-2.5 text-slate-600 dark:text-slate-300 hover:text-[#622569] dark:hover:text-purple-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors cursor-pointer"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
          </button>
        )}

        {user ? (
          <>
            <div className="relative">
              <button
                onClick={() => setNotifPanelOpen(!notifPanelOpen)}
                className={`relative p-2.5 text-slate-600 dark:text-slate-300 hover:text-[#622569] dark:hover:text-purple-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors ${
                  notifPanelOpen ? 'bg-purple-50 dark:bg-slate-800 text-[#622569] dark:text-purple-300 border-purple-300 dark:border-purple-700' : ''
                }`}
                title="Notifications"
                id="notification-bell-btn"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </span>
                )}
              </button>

              <NotificationPanel
                notifications={notifications}
                isOpen={notifPanelOpen}
                onClose={() => setNotifPanelOpen(false)}
                onMarkAsRead={onMarkAsRead}
                onMarkAllAsRead={onMarkAllAsRead}
                onClearAll={onClearAllNotifications}
                onDeleteNotification={onDeleteNotification}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  setNotifPanelOpen(false);
                }}
              />
            </div>


            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors text-left group"
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={user.username}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-100 dark:border-slate-700 shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden sm:block font-sans">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">{user.username}</p>
                    {user.role === 'lead' && (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#622569] dark:text-purple-400" title="Chapter Lead" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[100px]">{user.institution.split('-')[0]}</p>
                </div>
              </button>

              <button
                onClick={onLogout}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200/60 dark:border-slate-800 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => handleNavClick('auth')}
            className="flex items-center gap-1.5 bg-[#622569] hover:bg-[#9b51e0] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* Floating navigation error block */}
      {navError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-lg max-w-md w-full animate-fadeIn">
          <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
          <span>{navError}</span>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[73px] z-40 bg-slate-900/40 backdrop-blur-sm md:hidden animate-fadeIn" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="absolute left-0 top-0 w-72 bg-white h-full shadow-2xl border-r border-slate-100 p-5 flex flex-col justify-between animate-slideRight"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation Menu</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  title="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#622569] dark:hover:text-purple-300 flex items-center gap-2"
                >
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => handleNavClick('events')}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#622569] dark:hover:text-purple-300 flex items-center gap-2"
                >
                  <span>Events & Workshops</span>
                </button>

                <button
                  onClick={() => handleNavClick('projects')}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#622569] dark:hover:text-purple-300 flex items-center gap-2"
                >
                  <span>Member Projects</span>
                </button>

                <button
                  onClick={() => handleNavClick('opportunities')}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#622569] dark:hover:text-purple-300 flex items-center gap-2"
                >
                  <span>Opportunities</span>
                </button>

                <button
                  onClick={() => handleNavClick('resources')}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#622569] dark:hover:text-purple-300 flex items-center gap-2"
                >
                  <span>Learning Resources</span>
                </button>

                <button
                  onClick={() => handleNavClick('members')}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#622569] dark:hover:text-purple-300 flex items-center gap-2"
                >
                  <span>Member Directory</span>
                </button>

                <button
                  onClick={() => handleNavClick('announcements')}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#622569] dark:hover:text-purple-300 flex items-center gap-2"
                >
                  <span>Announcements</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              {user ? (
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs rounded-xl border border-rose-200 transition-colors"
                >
                  Log Out
                </button>
              ) : (
                <button
                  onClick={() => handleNavClick('auth')}
                  className="w-full py-2 bg-[#622569] hover:bg-[#9b51e0] text-white font-semibold text-xs rounded-xl transition-all"
                >
                  Access Portal
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
