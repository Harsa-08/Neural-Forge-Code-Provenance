import React, { useState, useEffect } from 'react';
import {
  User, Event, Project, Opportunity, Resource, Announcement, ActivityLog,
} from '../types';
import {
  Users, Calendar, FolderGit2, Briefcase, BookOpen, Megaphone,
  ShieldCheck, Trash2, Activity, BarChart3, Clock, ChevronDown,
  RefreshCw, Shield, AlertTriangle,
} from 'lucide-react';

interface AdminViewProps {
  user: User;
  members: User[];
  events: Event[];
  projects: Project[];
  opportunities: Opportunity[];
  resources: Resource[];
  announcements: Announcement[];
  activityLogs: ActivityLog[];
  onLoadActivityLogs: () => void;
  onUpdateMemberRole: (userId: string, role: User['role']) => Promise<boolean>;
  onDeleteMember: (userId: string) => Promise<boolean>;
  onDeleteEvent: (id: string) => Promise<boolean>;
  onDeleteProject: (id: string) => Promise<boolean>;
  onDeleteOpportunity: (id: string) => Promise<boolean>;
  onDeleteResource: (id: string) => Promise<boolean>;
  onDeleteAnnouncement: (id: string) => Promise<boolean>;
}

type ContentTab = 'users' | 'events' | 'projects' | 'opportunities' | 'resources' | 'announcements';

const ROLE_COLORS: Record<User['role'], string> = {
  admin: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  lead: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  member: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
};

export const AdminView: React.FC<AdminViewProps> = ({
  user,
  members,
  events,
  projects,
  opportunities,
  resources,
  announcements,
  activityLogs,
  onLoadActivityLogs,
  onUpdateMemberRole,
  onDeleteMember,
  onDeleteEvent,
  onDeleteProject,
  onDeleteOpportunity,
  onDeleteResource,
  onDeleteAnnouncement,
}) => {
  const [activeContentTab, setActiveContentTab] = useState<ContentTab>('users');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string; handler: () => Promise<boolean> } | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    handleRefreshLogs();
  }, []);

  const handleRefreshLogs = async () => {
    setLoadingLogs(true);
    await onLoadActivityLogs();
    setLoadingLogs(false);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    await confirmDelete.handler();
    setConfirmDelete(null);
  };

  const stats = [
    { label: 'Total Members', value: members.length, icon: Users, color: 'from-indigo-500 to-indigo-600' },
    { label: 'Events', value: events.length, icon: Calendar, color: 'from-purple-500 to-purple-600' },
    { label: 'Projects', value: projects.length, icon: FolderGit2, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Opportunities', value: opportunities.length, icon: Briefcase, color: 'from-amber-500 to-amber-600' },
    { label: 'Resources', value: resources.length, icon: BookOpen, color: 'from-cyan-500 to-cyan-600' },
    { label: 'Announcements', value: announcements.length, icon: Megaphone, color: 'from-rose-500 to-rose-600' },
  ];

  const contentTabs: { id: ContentTab; label: string; count: number }[] = [
    { id: 'users', label: 'Members', count: members.length },
    { id: 'events', label: 'Events', count: events.length },
    { id: 'projects', label: 'Projects', count: projects.length },
    { id: 'opportunities', label: 'Opportunities', count: opportunities.length },
    { id: 'resources', label: 'Resources', count: resources.length },
    { id: 'announcements', label: 'Announcements', count: announcements.length },
  ];

  const roleCounts = {
    admin: members.filter(m => m.role === 'admin').length,
    lead: members.filter(m => m.role === 'lead').length,
    member: members.filter(m => m.role === 'member').length,
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage members, content, and monitor platform activity
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-3 py-1.5 rounded-full self-start sm:self-auto">
          Signed in as {user.username} · Admin
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white shadow-lg`}>
            <Icon className="w-5 h-5 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-white/80 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Two-column layout: Activity Feed + Role Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-bold text-slate-900 dark:text-white">User Activity Feed</h2>
            </div>
            <button
              onClick={handleRefreshLogs}
              disabled={loadingLogs}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {activityLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No activity logs yet</p>
              <p className="text-xs mt-1">User actions will appear here once the backend is wired.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                  <img
                    src={log.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                    alt={log.username}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      <strong className="font-semibold">{log.username}</strong>{' '}
                      <span className="text-slate-600 dark:text-slate-300">{log.action}</span>{' '}
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">{log.target}</span>
                    </p>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Role Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold text-slate-900 dark:text-white">Role Breakdown</h2>
          </div>

          {(['admin', 'lead', 'member'] as User['role'][]).map((role) => {
            const count = roleCounts[role];
            const pct = members.length > 0 ? Math.round((count / members.length) * 100) : 0;
            return (
              <div key={role}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[role]}`}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-xs">{count} ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      role === 'admin' ? 'bg-rose-500' : role === 'lead' ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <strong className="text-slate-700 dark:text-slate-200">{members.length}</strong> total members registered
            </p>
          </div>
        </div>
      </div>

      {/* Content Management */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-bold text-slate-900 dark:text-white text-lg">Content Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and delete any content on the platform</p>
        </div>

        {/* Content Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-100 dark:border-slate-700 px-6 gap-1 scrollbar-none">
          {contentTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveContentTab(tab.id)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeContentTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Users Tab */}
          {activeContentTab === 'users' && (
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <img
                    src={member.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                    alt={member.username}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-600 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{member.username}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{member.email} · {member.institution}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      <select
                        value={member.role}
                        onChange={(e) => onUpdateMemberRole(member.id, e.target.value as User['role'])}
                        disabled={member.id === user.id}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer appearance-none pr-6 ${ROLE_COLORS[member.role]} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <option value="member">Member</option>
                        <option value="lead">Lead</option>
                        <option value="admin">Admin</option>
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                    </div>
                    {member.id !== user.id && (
                      <button
                        onClick={() => setConfirmDelete({
                          id: member.id,
                          label: `member "${member.username}"`,
                          handler: () => onDeleteMember(member.id),
                        })}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Events Tab */}
          {activeContentTab === 'events' && (
            <div className="space-y-3">
              {events.map(evt => (
                <div key={evt.id} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  <img src={evt.bannerUrl} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{evt.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{evt.category} · {evt.date} · {evt.registeredUserIds.length} registered</p>
                  </div>
                  <button
                    onClick={() => setConfirmDelete({ id: evt.id, label: `event "${evt.title}"`, handler: () => onDeleteEvent(evt.id) })}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Projects Tab */}
          {activeContentTab === 'projects' && (
            <div className="space-y-3">
              {projects.map(proj => (
                <div key={proj.id} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                    <FolderGit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{proj.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{proj.domain} · By {proj.authorName} · ♥ {proj.likes}</p>
                  </div>
                  <button
                    onClick={() => setConfirmDelete({ id: proj.id, label: `project "${proj.title}"`, handler: () => onDeleteProject(proj.id) })}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Opportunities Tab */}
          {activeContentTab === 'opportunities' && (
            <div className="space-y-3">
              {opportunities.map(opp => (
                <div key={opp.id} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{opp.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{opp.type} · {opp.companyOrOrg} · {opp.status}</p>
                  </div>
                  <button
                    onClick={() => setConfirmDelete({ id: opp.id, label: `opportunity "${opp.title}"`, handler: () => onDeleteOpportunity(opp.id) })}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Resources Tab */}
          {activeContentTab === 'resources' && (
            <div className="space-y-3">
              {resources.map(res => (
                <div key={res.id} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  <img src={res.thumbnailUrl} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{res.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{res.category} · {res.type} · {res.level}</p>
                  </div>
                  <button
                    onClick={() => setConfirmDelete({ id: res.id, label: `resource "${res.title}"`, handler: () => onDeleteResource(res.id) })}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Announcements Tab */}
          {activeContentTab === 'announcements' && (
            <div className="space-y-3">
              {announcements.map(ann => (
                <div key={ann.id} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ann.category === 'Important' ? 'bg-rose-100 dark:bg-rose-900/40' : 'bg-purple-100 dark:bg-purple-900/40'}`}>
                    <Megaphone className={`w-5 h-5 ${ann.category === 'Important' ? 'text-rose-600 dark:text-rose-400' : 'text-purple-600 dark:text-purple-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{ann.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{ann.category} · {ann.date} · By {ann.authorName}</p>
                  </div>
                  <button
                    onClick={() => setConfirmDelete({ id: ann.id, label: `announcement "${ann.title}"`, handler: () => onDeleteAnnouncement(ann.id) })}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Confirm Deletion</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently delete the {confirmDelete.label}? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
