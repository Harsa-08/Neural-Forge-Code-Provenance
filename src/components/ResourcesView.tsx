import React, { useState } from 'react';
import { Resource, User } from '../types';
import { BookOpen, ExternalLink, PlusCircle, X, FileText, Video, Bookmark, Layers, Award } from 'lucide-react';

interface ResourcesViewProps {
  resources: Resource[];
  user: User | null;
  onCreateResource: (resData: Partial<Resource>) => Promise<boolean>;
  searchQuery: string;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  user,
  onCreateResource,
  searchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTimeline, setSelectedTimeline] = useState<'all' | 'present' | 'past' | 'future'>('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeResModal, setActiveResModal] = useState<Resource | null>(null);

  const [newResData, setNewResData] = useState({
    title: '',
    description: '',
    category: 'Engineering & Tech' as Resource['category'],
    type: 'E-Book' as Resource['type'],
    authorOrProvider: '',
    url: '',
    thumbnailUrl: '',
    level: 'All Levels' as Resource['level'],
    tagsStr: '',
    timeline: 'present' as 'past' | 'present' | 'future',
  });

  const categories = ['All', 'Engineering & Tech', 'AI & Data Science', 'Web & Cloud', 'Electronics & IoT', 'Career & Interview'];
  const timelines: { id: 'all' | 'present' | 'past' | 'future'; label: string }[] = [
    { id: 'all', label: 'All Resources' },
    { id: 'present', label: 'Current Library' },
    { id: 'past', label: 'Historical & Classics' },
    { id: 'future', label: 'Upcoming Guides' },
  ];

  const filteredResources = resources.filter((res) => {
    const matchesCat = selectedCategory === 'All' || res.category === selectedCategory;
    const resTime = res.timeline || 'present';
    const matchesTimeline = selectedTimeline === 'all' || resTime === selectedTimeline;
    const matchesSearch =
      !searchQuery ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.authorOrProvider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesTimeline && matchesSearch;
  });

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResData.title || !newResData.description || !newResData.url) return;

    const tags = newResData.tagsStr
      ? newResData.tagsStr.split(',').map(s => s.trim()).filter(Boolean)
      : [newResData.category, newResData.type];

    const ok = await onCreateResource({
      ...newResData,
      authorOrProvider: newResData.authorOrProvider || (user ? user.username : 'IET Member'),
      tags,
    });

    if (ok) {
      setShowShareModal(false);
      setNewResData({
        title: '',
        description: '',
        category: 'Engineering & Tech',
        type: 'E-Book',
        authorOrProvider: '',
        url: '',
        thumbnailUrl: '',
        level: 'All Levels',
        tagsStr: '',
        timeline: 'present',
      });
    }
  };

  const typeIcon = (type: string) => {
    if (type === 'Video Lecture') return <Video className="w-4 h-4" />;
    if (type === 'Documentation') return <FileText className="w-4 h-4" />;
    if (type === 'Toolkit') return <Layers className="w-4 h-4" />;
    if (type === 'Course') return <Award className="w-4 h-4" />;
    return <BookOpen className="w-4 h-4" />;
  };

  const timelineBadge = (t: string) => {
    if (t === 'past') return { label: 'Archive', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' };
    if (t === 'future') return { label: 'Upcoming', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' };
    return { label: 'Current', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' };
  };

  const inputCls = "w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all";
  const labelCls = "block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1";

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Learning Resources</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Engineering books, courses, papers, and templates curated for IET members.</p>
        </div>
        {user && (
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Share Resource
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Timeline</p>
          <div className="flex flex-wrap gap-2">
            {timelines.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTimeline(t.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all border ${
                  selectedTimeline === t.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all border ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Grid */}
      {filteredResources.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-600 dark:text-slate-400">No resources match your filters</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting the timeline or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const resTime = res.timeline || 'present';
            const badge = timelineBadge(resTime);
            return (
              <div
                key={res.id}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="h-36 relative overflow-hidden bg-slate-100 dark:bg-slate-700">
                  <img
                    src={res.thumbnailUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80'}
                    alt={res.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {res.level}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                      {typeIcon(res.type)}
                    </div>
                    <div className="min-w-0">
                      <h3
                        onClick={() => setActiveResModal(res)}
                        className="font-bold text-slate-900 dark:text-white text-sm cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2"
                      >
                        {res.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">By {res.authorOrProvider}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 flex-1">{res.description}</p>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setActiveResModal(res)}
                      className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => window.open(res.url, '_blank')}
                      className="flex-1 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center justify-center gap-1"
                    >
                      Access <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RESOURCE DETAILS MODAL */}
      {activeResModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full relative shadow-2xl border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveResModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="h-48 relative overflow-hidden rounded-t-2xl">
              <img src={activeResModal.thumbnailUrl} alt={activeResModal.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-indigo-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {activeResModal.category}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeResModal.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">By {activeResModal.authorOrProvider} · {activeResModal.level}</p>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{activeResModal.description}</p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setActiveResModal(null)}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => window.open(activeResModal.url, '_blank')}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center justify-center gap-2"
                >
                  Access Resource <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHARE RESOURCE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full relative shadow-2xl border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Share a Resource</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Contribute a learning resource to the IET chapter library.</p>

              <form onSubmit={handleShareSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Resource Title *</label>
                    <input
                      type="text"
                      required
                      value={newResData.title}
                      onChange={(e) => setNewResData({ ...newResData, title: e.target.value })}
                      placeholder="e.g. Modern Power Electronics"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Category</label>
                    <select
                      value={newResData.category}
                      onChange={(e) => setNewResData({ ...newResData, category: e.target.value as Resource['category'] })}
                      className={inputCls}
                    >
                    <option value="Engineering & Tech">Engineering & Tech</option>
                      <option value="AI & Data Science">AI & Data Science</option>
                      <option value="Web & Cloud">Web & Cloud</option>
                      <option value="Electronics & IoT">Electronics & IoT</option>
                      <option value="Career & Interview">Career & Interview</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Resource Type</label>
                    <select
                      value={newResData.type}
                      onChange={(e) => setNewResData({ ...newResData, type: e.target.value as Resource['type'] })}
                      className={inputCls}
                    >
                    <option value="E-Book">E-Book</option>
                      <option value="Course">Course</option>
                      <option value="Documentation">Documentation</option>
                      <option value="Video Lecture">Video Lecture</option>
                      <option value="Toolkit">Toolkit</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Author / Provider</label>
                    <input
                      type="text"
                      value={newResData.authorOrProvider}
                      onChange={(e) => setNewResData({ ...newResData, authorOrProvider: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Level</label>
                    <select
                      value={newResData.level}
                      onChange={(e) => setNewResData({ ...newResData, level: e.target.value as Resource['level'] })}
                      className={inputCls}
                    >
                    <option value="All Levels">All Levels</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Resource Link *</label>
                    <input
                      type="url"
                      required
                      value={newResData.url}
                      onChange={(e) => setNewResData({ ...newResData, url: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Description *</label>
                    <textarea
                      rows={3}
                      required
                      value={newResData.description}
                      onChange={(e) => setNewResData({ ...newResData, description: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
                  >
                    Publish Resource
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
