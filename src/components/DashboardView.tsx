import React from 'react';
import { User, Event, Project, Announcement } from '../types';
import { Calendar, FolderGit2, Award, ArrowUpRight, Megaphone, CheckCircle2, Sparkles, Clock, Briefcase, BookOpen, Phone, MapPinIcon, ExternalLink, Github } from 'lucide-react';

interface DashboardViewProps {
  user: User;
  events: Event[];
  projects: Project[];
  announcements: Announcement[];
  setActiveTab: (tab: string) => void;
  onRegisterEvent: (eventId: string) => void;
  onLikeProject: (projectId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  events,
  projects,
  announcements,
  setActiveTab,
  onRegisterEvent,
  onLikeProject,
}) => {
  const registeredEvents = events.filter(e => e.registeredUserIds.includes(user.id));
  const userProjects = projects.filter(p => p.authorId === user.id);
  const upcomingEvents = events.slice(0, 3);
  const featuredProjects = projects.slice(0, 2);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-48 h-48 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-16 w-32 h-32 rounded-full bg-yellow-300 blur-2xl" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-sm font-medium mb-4 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Welcome back</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Hello, {user.username}! 👋</h1>
          <p className="text-white/80 mb-6 max-w-xl">
            You're connected as an active member of <strong className="text-white">{user.institution}</strong>. Explore everything your chapter has to offer.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('events')}
              className="px-4 py-2 bg-white text-indigo-700 font-semibold text-sm rounded-xl hover:bg-white/90 transition-all flex items-center gap-2 shadow"
            >
              <Calendar className="w-4 h-4" />
              Explore Events
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className="px-4 py-2 bg-white/20 text-white font-semibold text-sm rounded-xl hover:bg-white/30 transition-all flex items-center gap-2 backdrop-blur-sm border border-white/30"
            >
              <FolderGit2 className="w-4 h-4" />
              Member Projects
            </button>
            <button
              onClick={() => setActiveTab('opportunities')}
              className="px-4 py-2 bg-white/20 text-white font-semibold text-sm rounded-xl hover:bg-white/30 transition-all flex items-center gap-2 backdrop-blur-sm border border-white/30"
            >
              <Briefcase className="w-4 h-4" />
              Opportunities
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className="px-4 py-2 bg-white/20 text-white font-semibold text-sm rounded-xl hover:bg-white/30 transition-all flex items-center gap-2 backdrop-blur-sm border border-white/30"
            >
              <BookOpen className="w-4 h-4" />
              Learning Hub
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Registered Events', value: registeredEvents.length, color: 'from-blue-500 to-indigo-600', icon: Calendar },
          { label: 'Projects Published', value: userProjects.length, color: 'from-emerald-500 to-teal-600', icon: FolderGit2 },
          { label: 'Chapter Points', value: `${user.points || 100} pts`, color: 'from-amber-500 to-orange-600', icon: Award },
          { label: 'Membership Role', value: user.role.charAt(0).toUpperCase() + user.role.slice(1), color: 'from-purple-500 to-pink-600', icon: Sparkles },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-xl p-5 text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/80 text-sm font-medium">{label}</p>
              <div className="p-2 bg-white/20 rounded-lg">
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Events & Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Events</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Register for chapter workshops and sessions</p>
              </div>
              <button
                onClick={() => setActiveTab('events')}
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                View All ({events.length})
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.map((evt) => {
                const isReg = evt.registeredUserIds.includes(user.id);
                return (
                  <div key={evt.id} className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-28 relative overflow-hidden">
                      <img src={evt.bannerUrl} alt={evt.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <span className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        {evt.category}
                      </span>
                    </div>
                    <div className="p-3 space-y-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{evt.title}</h4>
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{evt.date} • {evt.time}</span>
                      </div>
                      <button
                        onClick={() => onRegisterEvent(evt.id)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          isReg
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isReg ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Registered
                          </>
                        ) : (
                          'Register Now'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Featured Projects */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Member Showcase</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Highlighted projects from your chapter</p>
              </div>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                View All ({projects.length})
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredProjects.map((proj) => {
                const isLiked = proj.likedByUserIds.includes(user.id);
                return (
                  <div key={proj.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-600 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-500">
                          {proj.domain}
                        </span>
                        <button
                          onClick={() => onLikeProject(proj.id)}
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all border ${
                            isLiked
                              ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700 text-rose-600 dark:text-rose-400'
                              : 'bg-white dark:bg-slate-600 border-slate-200 dark:border-slate-500 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          ♥ {proj.likes}
                        </button>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{proj.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{proj.tagline}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-600">
                      <span>By <strong className="text-slate-700 dark:text-slate-200">{proj.authorName}</strong></span>
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                        >
                          <Github className="w-3 h-3" /> Repo
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Announcements & Profile */}
        <div className="space-y-6">
          {/* Announcements */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Official Notices</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Chapter announcements</p>
              </div>
            </div>
            <div className="space-y-3">
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full">
                      {ann.category}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">{ann.date}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{ann.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Profile Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-200 dark:ring-indigo-700"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{user.username}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-600 mb-4">
              <p className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">{user.city || 'City not set'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">{user.phone || 'Phone not set'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">{user.institution}</span>
              </p>
            </div>

            <button
              onClick={() => setActiveTab('profile')}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all"
            >
              Manage Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
