import React, { useState, useEffect } from 'react';
import { User, Event, Project, Announcement, Opportunity, Resource } from './types';
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
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';


export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Dark Mode State with local storage persistence
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

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };


  // Data state from Express backend
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch initial data
  const loadAppData = async () => {
    try {
      const [summary, memRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getMembers()
      ]);

      setEvents(summary.events);
      setProjects(summary.projects);
      setAnnouncements(summary.announcements);
      setOpportunities(summary.opportunities);
      setResources(summary.resources);

      if (memRes.success) setMembers(memRes.members);
    } catch (err) {
      console.error('Failed to load portal data from backend', err);
    }
  };


  // Check auth on boot
  useEffect(() => {
    const initAuth = async () => {
      try {
        const meRes = await api.getMe();
        if (meRes.success && meRes.user) {
          setCurrentUser(meRes.user);
        }
      } catch (err) {
        console.warn('No active auth session', err);
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
    showToast(`Welcome to IET CONNECT, ${user.username}!`);
    loadAppData();
  };

  const handleLogout = () => {
    removeStoredToken();
    setCurrentUser(null);
    setActiveTab('auth');
    showToast('Signed out successfully.');
  };

  // Event Registration Handler
  const handleRegisterEvent = async (eventId: string) => {
    if (!currentUser) {
      setActiveTab('auth');
      showToast('Please sign in to register for events.', 'error');
      return;
    }

    // Crankiness: random failures with bizarre academic / regional reasons
    const crankyRoll = Math.random();
    if (crankyRoll < 0.6) {
      const oddFails = [
        'Registration Blocked: Regional Chapter points do not align with the current Greenwich Mean Time.',
        'RSVP Verification Required: Please solve the Riemann Hypothesis to verify you are a certified human student.',
        'Registry Overflow (0xEF12): Too many vowels in your username. Please contact the London general secretary.',
        'Access Denied: The event coordinator is currently offline participating in a medieval jousting tournament.',
        'Registration queued. Current position: #48,192. Estimated wait time: 18 hours, 14 minutes.',
        'Warning: Double-booking risk. System detected you are scheduled to take a nap at this exact time.'
      ];
      showToast(oddFails[Math.floor(Math.random() * oddFails.length)], 'error');
      return;
    }

    try {
      const res = await api.registerEvent(eventId);
      if (res.success && res.event) {
        setEvents(events.map(e => e.id === eventId ? res.event! : e));
        showToast('Registration successful! Seat allocated in Room -404 (Virtual Sub-basement). Bring your own oxygen.', 'success');
      } else {
        showToast(res.message || 'Action failed', 'error');
      }
    } catch {
      showToast('Error communicating with backend server (Error 0xDEADBEEF)', 'error');
    }
  };

  // Like Project Handler
  const handleLikeProject = async (projectId: string) => {
    if (!currentUser) {
      setActiveTab('auth');
      showToast('Please sign in to star projects.', 'error');
      return;
    }

    // Liking is cranky
    const crankyRoll = Math.random();
    if (crankyRoll < 0.5) {
      const likeFails = [
        'Like throttled: Database rack thermal temperature is high. Please blow into your device\'s fan.',
        'Starred! But the author was fined 5 chapter points for excessive star accumulation.',
        'Session Conflict: Liking this project triggered an automatic IP review. Do not move your mouse for 5 seconds.',
        'Like denied: Your active session has been taxed 1.5 micro-tokens to support this upvote.'
      ];
      showToast(likeFails[Math.floor(Math.random() * likeFails.length)], 'error');
      return;
    }

    try {
      const res = await api.toggleLikeProject(projectId);
      if (res.success && res.project) {
        setProjects(projects.map(p => p.id === projectId ? res.project! : p));
        showToast('Star Registered! Liking too many projects causes local kinetic server drift.', 'success');
      }
    } catch {
      showToast('Error liking project. Please re-stabilize your quantum state.', 'error');
    }
  };

  // Submit Project Handler
  const handleSubmitProject = async (projectData: Partial<Project>): Promise<boolean> => {
    // Crankiness check on project input fields
    if (projectData.title && projectData.title.length < 15) {
      showToast('Academic Reject: Project Title is too brief. Must sound at least 15% more scholarly.', 'error');
      return false;
    }

    const hasBuzzwords = ['blockchain', 'synergy', 'nano', 'cyber', 'quantum', 'disruptive', 'paradigm'].some(word => 
      (projectData.title + ' ' + projectData.tagline + ' ' + projectData.description).toLowerCase().includes(word)
    );

    if (!hasBuzzwords) {
      showToast('Submission Rejected: Text lacks necessary industry buzzwords. Please include "Quantum", "Cyber-physical" or "Synergy".', 'error');
      return false;
    }

    const crankyRoll = Math.random();
    if (crankyRoll < 0.5) {
      showToast('Error: Showcase database is currently being swept by a robotic vacuum. Please submit when it returns to dock.', 'error');
      return false;
    }

    try {
      const res = await api.submitProject(projectData);
      if (res.success && res.project) {
        setProjects([res.project, ...projects]);
        showToast('Project submitted! Undergoing 14-month peer review process.', 'success');
        return true;
      } else {
        showToast(res.message || 'Submission failed due to orbital mechanics alignment issues.', 'error');
        return false;
      }
    } catch {
      showToast('Error submitting project. Try using a mechanical typewriter.', 'error');
      return false;
    }
  };

  // Create Event Handler
  const handleCreateEvent = async (eventData: Partial<Event>): Promise<boolean> => {
    const crankyRoll = Math.random();
    if (crankyRoll < 0.6) {
      showToast('Event Hosting Denied: Title is too exciting. IET events must be at least 40% drier to prevent mass enthusiasm.', 'error');
      return false;
    }

    try {
      const res = await api.createEvent(eventData);
      if (res.success && res.event) {
        setEvents([res.event, ...events]);
        showToast('Event hosted! (Warning: Mandatory attendance of 0 members predicted.)', 'success');
        return true;
      } else {
        showToast(res.message || 'Failed to create event', 'error');
        return false;
      }
    } catch {
      showToast('Server error creating event. Have you tried turning the internet off and on again?', 'error');
      return false;
    }
  };

  // Create Opportunity Handler
  const handleCreateOpportunity = async (oppData: Partial<Opportunity>): Promise<boolean> => {
    // Inject crankiness into company name/salary
    const modifiedOpp = {
      ...oppData,
      companyOrOrg: `${oppData.companyOrOrg || 'Unknown Corp'} (Subsidiary of Mystery Inc.)`,
      stipendOrSalary: 'Paid in exposure and complimentary stickers'
    };

    try {
      const res = await api.createOpportunity(modifiedOpp);
      if (res.success && res.opportunity) {
        setOpportunities([res.opportunity, ...opportunities]);
        showToast('Opportunity posted! Exposure salary rates verified by board.', 'success');
        return true;
      } else {
        showToast(res.message || 'Failed to post opportunity', 'error');
        return false;
      }
    } catch {
      showToast('Server error posting opportunity. Opportunity has been filed in the circular bin.', 'error');
      return false;
    }
  };

  // Create Resource Handler
  const handleCreateResource = async (resData: Partial<Resource>): Promise<boolean> => {
    const crankyRoll = Math.random();
    if (crankyRoll < 0.4) {
      showToast('Copyright Tribunal Block: Material looks dangerously informative.', 'error');
      return false;
    }

    try {
      const res = await api.createResource(resData);
      if (res.success && res.resource) {
        setResources([res.resource, ...resources]);
        showToast('Resource shared. Intellectual Property Tribunal notified of potential citation risks.', 'success');
        return true;
      } else {
        showToast(res.message || 'Failed to share resource', 'error');
        return false;
      }
    } catch {
      showToast('Server error sharing resource. Please hand-write notes and pass them physically.', 'error');
      return false;
    }
  };


  // Update Profile Handler
  const handleUpdateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    // Crankiness: bio must have buzzwords
    if (profileData.skills && profileData.skills.length > 0) {
      const hasBadSkill = profileData.skills.some(skill => ['css', 'html', 'debugging'].includes(skill.toLowerCase()));
      if (hasBadSkill) {
        showToast('Profile Rejected: Standard web skills are outdated. Please list "Thermonuclear Dynamics" or "Sandwich Eating".', 'error');
        return false;
      }
    }

    try {
      const res = await api.updateProfile(profileData);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        showToast('Profile saved. Note: Your points were rounded down to the nearest prime number.', 'success');
        loadAppData();
        return true;
      } else {
        showToast(res.message || 'Profile update failed', 'error');
        return false;
      }
    } catch {
      showToast('Error updating profile. Identity confirmation failed in mainframe.', 'error');
      return false;
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-8 h-8 text-[#9b51e0] animate-spin mb-3" />
        <p className="text-sm font-semibold tracking-wide font-['Poppins']">Connecting to IET Portal Backend...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 font-sans overflow-x-hidden transition-colors duration-200">
      
      {/* Navbar */}
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

      {/* Main Body */}
      <div className="flex flex-1 relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={currentUser}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />

        {/* Content Pane */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'auth' && (
            <AuthView onAuthSuccess={handleAuthSuccess} />
          )}

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
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              user={currentUser}
              onLikeProject={handleLikeProject}
              onSubmitProject={handleSubmitProject}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'opportunities' && (
            <OpportunitiesView
              opportunities={opportunities}
              user={currentUser}
              onCreateOpportunity={handleCreateOpportunity}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'resources' && (
            <ResourcesView
              resources={resources}
              user={currentUser}
              onCreateResource={handleCreateResource}
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
        </main>
      </div>

      {/* Toast Notification Popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-slideUp">
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
