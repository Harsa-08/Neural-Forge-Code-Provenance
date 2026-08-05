import React, { useState, useEffect } from 'react';
import { User, Event, Project, Announcement, Opportunity, Resource, ActivityLog } from './types';
import { api, removeStoredToken } from './api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { ProfileView } from './components/ProfileView';
import { EventsView } from './components/EventsView';
import { ProjectsView } from './components/ProjectsView';
import { OpportunitiesView } from './components/OpportunitiesView';
import { ResourcesView } from './components/ResourcesView';
import { MembersView } from './components/MembersView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { AdminView } from './components/AdminView';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Data state
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAppData = async () => {
    try {
      const [summary, memRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getMembers(),
      ]);
      setEvents(summary.events);
      setProjects(summary.projects);
      setAnnouncements(summary.announcements);
      setOpportunities(summary.opportunities);
      setResources(summary.resources);
      if (memRes.success) setMembers(memRes.members);
    } catch (err) {
      console.error('Failed to load portal data', err);
    }
  };

  const loadActivityLogs = async () => {
    try {
      const res = await api.getActivityLogs();
      if (res.success) setActivityLogs(res.logs);
    } catch {
      // admin endpoint may not be wired yet
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const meRes = await api.getMe();
        if (meRes.success && meRes.user) setCurrentUser(meRes.user);
      } catch (err) {
        console.warn('No active session', err);
      } finally {
        setAuthChecking(false);
      }
    };
    initAuth();
    loadAppData();
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    showToast(`Welcome, ${user.username}!`);
    loadAppData();
  };

  const handleLogout = () => {
    removeStoredToken();
    setCurrentUser(null);
    setActiveTab('auth');
    showToast('Signed out successfully.');
  };

  // ── Event handlers ────────────────────────────────────────────────────

  const handleRegisterEvent = async (eventId: string) => {
    if (!currentUser) {
      setActiveTab('auth');
      showToast('Please sign in to register for events.', 'error');
      return;
    }
    try {
      const res = await api.registerEvent(eventId);
      if (res.success && res.event) {
        setEvents(events.map(e => (e.id === eventId ? res.event! : e)));
        showToast(res.registered ? 'Successfully registered!' : 'Registration cancelled.');
      } else {
        showToast(res.message || 'Action failed', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    }
  };

  const handleCreateEvent = async (eventData: Partial<Event>): Promise<boolean> => {
    try {
      const res = await api.createEvent(eventData);
      if (res.success && res.event) {
        setEvents([res.event, ...events]);
        showToast('Event created successfully!');
        return true;
      } else {
        showToast(res.message || 'Failed to create event', 'error');
        return false;
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
      return false;
    }
  };

  const handleDeleteEvent = async (eventId: string): Promise<boolean> => {
    try {
      const res = await api.deleteEvent(eventId);
      if (res.success) {
        setEvents(events.filter(e => e.id !== eventId));
        showToast('Event deleted.');
        return true;
      }
      showToast(res.message || 'Failed to delete event', 'error');
      return false;
    } catch {
      showToast('Network error.', 'error');
      return false;
    }
  };

  // ── Project handlers ──────────────────────────────────────────────────

  const handleLikeProject = async (projectId: string) => {
    if (!currentUser) {
      setActiveTab('auth');
      showToast('Please sign in to like projects.', 'error');
      return;
    }
    try {
      const res = await api.toggleLikeProject(projectId);
      if (res.success && res.project) {
        setProjects(projects.map(p => (p.id === projectId ? res.project! : p)));
      }
    } catch {
      showToast('Failed to update like.', 'error');
    }
  };

  const handleSubmitProject = async (projectData: Partial<Project>): Promise<boolean> => {
    try {
      const res = await api.submitProject(projectData);
      if (res.success && res.project) {
        setProjects([res.project, ...projects]);
        showToast('Project submitted successfully!');
        return true;
      } else {
        showToast(res.message || 'Submission failed', 'error');
        return false;
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
      return false;
    }
  };

  const handleDeleteProject = async (projectId: string): Promise<boolean> => {
    try {
      const res = await api.deleteProject(projectId);
      if (res.success) {
        setProjects(projects.filter(p => p.id !== projectId));
        showToast('Project deleted.');
        return true;
      }
      showToast(res.message || 'Failed to delete', 'error');
      return false;
    } catch {
      showToast('Network error.', 'error');
      return false;
    }
  };

  // ── Opportunity handlers ──────────────────────────────────────────────

  const handleCreateOpportunity = async (oppData: Partial<Opportunity>): Promise<boolean> => {
    try {
      const res = await api.createOpportunity(oppData);
      if (res.success && res.opportunity) {
        setOpportunities([res.opportunity, ...opportunities]);
        showToast('Opportunity posted!');
        return true;
      } else {
        showToast(res.message || 'Failed to post', 'error');
        return false;
      }
    } catch {
      showToast('Network error.', 'error');
      return false;
    }
  };

  const handleDeleteOpportunity = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deleteOpportunity(id);
      if (res.success) {
        setOpportunities(opportunities.filter(o => o.id !== id));
        showToast('Opportunity removed.');
        return true;
      }
      showToast(res.message || 'Failed to delete', 'error');
      return false;
    } catch {
      showToast('Network error.', 'error');
      return false;
    }
  };

  // ── Resource handlers ─────────────────────────────────────────────────

  const handleCreateResource = async (resData: Partial<Resource>): Promise<boolean> => {
    try {
      const res = await api.createResource(resData);
      if (res.success && res.resource) {
        setResources([res.resource, ...resources]);
        showToast('Resource shared!');
        return true;
      } else {
        showToast(res.message || 'Failed to share', 'error');
        return false;
      }
    } catch {
      showToast('Network error.', 'error');
      return false;
    }
  };

  const handleDeleteResource = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deleteResource(id);
      if (res.success) {
        setResources(resources.filter(r => r.id !== id));
        showToast('Resource removed.');
        return true;
      }
      showToast(res.message || 'Failed to delete', 'error');
      return false;
    } catch {
      showToast('Network error.', 'error');
      return false;
    }
  };

  // ── Announcement handlers ─────────────────────────────────────────────

  const handleCreateAnnouncement = async (data: Partial<Announcement>): Promise<boolean> => {
    try {
      const res = await api.createAnnouncement(data);
      if (res.success && res.announcement) {
        setAnnouncements([res.announcement, ...announcements]);
        showToast('Announcement published!');
        return true;
      }
      showToast(res.message || 'Failed to publish', 'error');
      return false;
    } catch {
      showToast('Network error.', 'error');
      return false;
    }
  };

  const handleDeleteAnnouncement = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deleteAnnouncement(id);
      if (res.success) {
        setAnnouncements(announcements.filter(a => a.id !== id));
        showToast('Announcement removed.');
        return true;
      }
      showToast(res.message || 'Failed to delete', 'error');
      return false;
    } catch {
      showToast('Network error.', 'error');
      return false;
    }
  };

  // ── Profile handler ───────────────────────────────────────────────────

  const handleUpdateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    try {
      const res = await api.updateProfile(profileData);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        showToast('Profile updated successfully!');
        loadAppData();
        return true;
      } else {
        showToast(res.message || 'Update failed', 'error');
        return false;
      }
    } catch {
      showToast('Network error.', 'error');
      return false;
    }
  };

  // ── Admin handlers ────────────────────────────────────────────────────

  const handleUpdateMemberRole = async (userId: string, role: User['role']): Promise<boolean> => {
    try {
      const res = await api.updateMemberRole(userId, role);
      if (res.success) {
        setMembers(members.map(m => (m.id === userId ? { ...m, role } : m)));
        showToast('Member role updated.');
        return true;
      }
      showToast(res.message || 'Failed to update role', 'error');
      return false;
    } catch {
      showToast('Network error.', 'error');
      return false;
    }
  };

  const handleDeleteMember = async (userId: string): Promise<boolean> => {
    try {
      const res = await api.deleteMember(userId);
      if (res.success) {
        setMembers(members.filter(m => m.id !== userId));
        showToast('Member removed.');
        return true;
      }
      showToast(res.message || 'Failed to remove member', 'error');
      return false;
    } catch {
      showToast('Network error.', 'error');
      return false;
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
        <p className="text-sm font-semibold tracking-wide">Connecting to IET Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 font-sans overflow-x-hidden transition-colors duration-200">
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <div className="flex flex-1 relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={currentUser}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />

        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'auth' && <AuthView onAuthSuccess={handleAuthSuccess} />}

          {activeTab === 'dashboard' && (
            currentUser ? (
              <DashboardView
                user={currentUser}
                events={events}
                projects={projects}
                announcements={announcements}
                setActiveTab={setActiveTab}
                onRegisterEvent={handleRegisterEvent}
                onLikeProject={handleLikeProject}
              />
            ) : (
              <AuthView onAuthSuccess={handleAuthSuccess} />
            )
          )}

          {activeTab === 'events' && (
            <EventsView
              events={events}
              user={currentUser}
              onRegisterEvent={handleRegisterEvent}
              onCreateEvent={handleCreateEvent}
              onDeleteEvent={handleDeleteEvent}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              user={currentUser}
              onLikeProject={handleLikeProject}
              onSubmitProject={handleSubmitProject}
              onDeleteProject={handleDeleteProject}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'opportunities' && (
            <OpportunitiesView
              opportunities={opportunities}
              user={currentUser}
              onCreateOpportunity={handleCreateOpportunity}
              onDeleteOpportunity={handleDeleteOpportunity}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'resources' && (
            <ResourcesView
              resources={resources}
              user={currentUser}
              onCreateResource={handleCreateResource}
              onDeleteResource={handleDeleteResource}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'members' && (
            <MembersView
              members={members}
              searchQuery={searchQuery}
              user={currentUser}
            />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementsView
              announcements={announcements}
              user={currentUser}
              onCreateAnnouncement={handleCreateAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          )}

          {activeTab === 'profile' && (
            currentUser ? (
              <ProfileView
                user={currentUser}
                onUpdateProfile={handleUpdateProfile}
              />
            ) : (
              <AuthView onAuthSuccess={handleAuthSuccess} />
            )
          )}

          {activeTab === 'admin' && currentUser?.role === 'admin' && (
            <AdminView
              user={currentUser}
              members={members}
              events={events}
              projects={projects}
              opportunities={opportunities}
              resources={resources}
              announcements={announcements}
              activityLogs={activityLogs}
              onLoadActivityLogs={loadActivityLogs}
              onUpdateMemberRole={handleUpdateMemberRole}
              onDeleteMember={handleDeleteMember}
              onDeleteEvent={handleDeleteEvent}
              onDeleteProject={handleDeleteProject}
              onDeleteOpportunity={handleDeleteOpportunity}
              onDeleteResource={handleDeleteResource}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          )}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-slideUp max-w-sm">
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
