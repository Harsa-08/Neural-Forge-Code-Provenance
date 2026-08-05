import React, { useState } from 'react';
import { Project, User } from '../types';
import { Github, ExternalLink, Star, PlusCircle, Search, Sparkles, X, Code2 } from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  user: User | null;
  onLikeProject: (projectId: string) => void;
  onSubmitProject: (projectData: Partial<Project>) => Promise<boolean>;
  searchQuery: string;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  user,
  onLikeProject,
  onSubmitProject,
  searchQuery,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedTimeline, setSelectedTimeline] = useState<'all' | 'present' | 'past' | 'future'>('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // New Project State
  const [newProjData, setNewProjData] = useState({
    title: '',
    tagline: '',
    description: '',
    domain: 'AI / ML' as Project['domain'],
    githubUrl: '',
    demoUrl: '',
    teamMembersStr: '',
    imageUrl: '',
    status: 'Active' as 'Active' | 'Completed' | 'Research',
    timeline: 'present' as 'past' | 'present' | 'future',
  });

  const domains = ['All', 'AI / ML', 'Web Development', 'IoT & Embedded', 'Robotics', 'Cybersecurity', 'Mobile App'];
  const timelines: { id: 'all' | 'present' | 'past' | 'future'; label: string }[] = [
    { id: 'all', label: 'All Projects' },
    { id: 'present', label: 'Ongoing Builds (Present)' },
    { id: 'past', label: 'Completed & Awarded (Past)' },
    { id: 'future', label: 'Research Proposals (Future)' },
  ];

  const filteredProjects = projects.filter((proj) => {
    const matchesDomain = selectedDomain === 'All' || proj.domain === selectedDomain;
    const projTime = proj.timeline || (proj.status === 'Completed' ? 'past' : proj.status === 'Research' ? 'future' : 'present');
    const matchesTimeline = selectedTimeline === 'all' || projTime === selectedTimeline;
    const matchesSearch =
      !searchQuery ||
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDomain && matchesTimeline && matchesSearch;
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjData.title || !newProjData.description || !newProjData.githubUrl) return;

    const team = newProjData.teamMembersStr
      ? newProjData.teamMembersStr.split(',').map(s => s.trim())
      : [user ? user.username : 'Author'];

    const ok = await onSubmitProject({
      ...newProjData,
      teamMembers: team,
    });

    if (ok) {
      setShowSubmitModal(false);
      setNewProjData({
        title: '',
        tagline: '',
        description: '',
        domain: 'AI / ML',
        githubUrl: '',
        demoUrl: '',
        teamMembersStr: '',
        imageUrl: '',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Poppins']">Member Innovation Showcase</h1>
          <p className="text-xs text-slate-500 mt-1">Explore and appreciate engineering builds by IET CONNECT chapter members</p>
        </div>

        {user && (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2.5 bg-[#622569] hover:bg-[#9b51e0] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Project</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-2xl">
          {timelines.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTimeline(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedTimeline === t.id
                  ? 'bg-[#622569] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDomain === dom
                  ? 'bg-purple-100 text-[#622569] border border-purple-300'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((proj) => {
          const isLiked = user ? proj.likedByUserIds.includes(user.id) : false;
          const projTime = proj.timeline || (proj.status === 'Completed' ? 'past' : proj.status === 'Research' ? 'future' : 'present');

          return (
            <div
              key={proj.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image Banner */}
                <div className="h-48 relative overflow-hidden bg-slate-900">
                  <img
                    src={proj.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-white/90 backdrop-blur-md text-[#622569] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {proj.domain}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${
                      projTime === 'present'
                        ? 'bg-amber-500 text-slate-900'
                        : projTime === 'past'
                        ? 'bg-emerald-600/90 text-white'
                        : 'bg-purple-600/90 text-white'
                    }`}>
                      {projTime === 'present' ? '🚀 Active Build' : projTime === 'past' ? '🏆 Completed & Awarded' : '🔮 Research Proposal'}
                    </span>
                  </div>

                  {/* Like Button Badge */}
                  <button
                    onClick={() => onLikeProject(proj.id)}
                    className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md ${
                      isLiked
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-black/40 text-white hover:bg-black/60 border border-white/20'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isLiked ? 'fill-slate-950' : ''}`} />
                    <span>{proj.likes} Stars</span>
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-[11px] text-purple-200 font-medium">By {proj.authorName} ({proj.authorInstitution})</p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-3">
                  <h3 className="font-bold text-slate-900 text-lg font-['Poppins']">{proj.title}</h3>
                  <p className="text-xs font-medium text-slate-500 italic">{proj.tagline}</p>
                  
                  {proj.achievements && (
                    <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 flex items-center gap-2 text-amber-900 text-[11px] font-semibold">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{proj.achievements}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{proj.description}</p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {proj.tags.map((t) => (
                      <span key={t} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>


              {/* Action Links Footer */}
              <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between gap-3 mt-4">
                <a
                  href={proj.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  <span>Repository</span>
                </a>

                {proj.demoUrl && (
                  <a
                    href={proj.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#622569] text-xs font-bold transition-colors flex items-center gap-2 border border-purple-200"
                  >
                    <span>Live Demo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SUBMIT PROJECT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 relative shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-700 animate-slideUp">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-[#622569] dark:text-purple-300 rounded-2xl">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Submit Member Project</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Share your innovation showcase with the IET CONNECT community</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newProjData.title}
                  onChange={(e) => setNewProjData({ ...newProjData, title: e.target.value })}
                  placeholder="e.g. Smart Solar Grid Monitor"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Tagline</label>
                <input
                  type="text"
                  value={newProjData.tagline}
                  onChange={(e) => setNewProjData({ ...newProjData, tagline: e.target.value })}
                  placeholder="e.g. Real-time IoT solar efficiency dashboard"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Domain & Field</label>
                  <select
                    value={newProjData.domain}
                    onChange={(e) => setNewProjData({ ...newProjData, domain: e.target.value as any })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="AI / ML">AI / ML</option>
                    <option value="Web Development">Web Development</option>
                    <option value="IoT & Embedded">IoT & Embedded</option>
                    <option value="Robotics">Robotics</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Mobile App">Mobile App</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={newProjData.status}
                    onChange={(e) => setNewProjData({ ...newProjData, status: e.target.value as any })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="Active">Active Build</option>
                    <option value="Completed">Completed</option>
                    <option value="Research">Research Proposal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newProjData.description}
                  onChange={(e) => setNewProjData({ ...newProjData, description: e.target.value })}
                  placeholder="Explain architecture, technology stack, problem solved..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub Repository Link *</label>
                  <input
                    type="url"
                    required
                    value={newProjData.githubUrl}
                    onChange={(e) => setNewProjData({ ...newProjData, githubUrl: e.target.value })}
                    placeholder="https://github.com/username/repo"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Demo Link (Optional)</label>
                  <input
                    type="url"
                    value={newProjData.demoUrl}
                    onChange={(e) => setNewProjData({ ...newProjData, demoUrl: e.target.value })}
                    placeholder="https://demo-app.example.com"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Team Members (Comma separated)</label>
                <input
                  type="text"
                  value={newProjData.teamMembersStr}
                  onChange={(e) => setNewProjData({ ...newProjData, teamMembersStr: e.target.value })}
                  placeholder="John Doe, Sarah Chen"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#622569] hover:bg-[#9b51e0] rounded-xl transition-all shadow-md"
                >
                  Submit Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
