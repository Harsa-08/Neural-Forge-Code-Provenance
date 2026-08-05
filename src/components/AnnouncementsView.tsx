import React, { useState } from 'react';
import { Announcement, User } from '../types';
import { Megaphone, Pin, Calendar, UserCheck, PlusCircle, Trash2, X } from 'lucide-react';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  user?: User | null;
  onCreateAnnouncement?: (data: Partial<Announcement>) => Promise<boolean>;
  onDeleteAnnouncement?: (id: string) => Promise<boolean>;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  user,
  onCreateAnnouncement,
  onDeleteAnnouncement,
}) => {
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [newAnnData, setNewAnnData] = useState({
    title: '',
    content: '',
    category: 'General' as Announcement['category'],
    pinned: false,
  });

  const canPublish = user?.role === 'admin' || user?.role === 'lead';

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnData.title || !newAnnData.content || !onCreateAnnouncement) return;

    const ok = await onCreateAnnouncement(newAnnData);
    if (ok) {
      setShowPublishModal(false);
      setNewAnnData({
        title: '',
        content: '',
        category: 'General',
        pinned: false,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/40 text-[#622569] dark:text-purple-300 rounded-2xl shrink-0">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Poppins']">
              Chapter Notices & Announcements
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Official circulars, competition alerts, and chapter management news
            </p>
          </div>
        </div>

        {canPublish && (
          <button
            onClick={() => setShowPublishModal(true)}
            className="px-4 py-2.5 bg-[#622569] hover:bg-[#9b51e0] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Publish Notice
          </button>
        )}
      </div>

      <div className="space-y-6">
        {announcements.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-700">
            <Megaphone className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-600 dark:text-slate-400">No notices published yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Check back later for chapter announcements.</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann.id}
              className={`bg-white dark:bg-slate-800 rounded-3xl border shadow-sm p-6 sm:p-8 space-y-4 relative transition-all ${
                ann.pinned ? 'border-purple-300 dark:border-purple-800 ring-1 ring-purple-100 dark:ring-purple-900/30' : 'border-slate-200/80 dark:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    ann.category === 'Important' ? 'bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300' : 'bg-purple-50 dark:bg-purple-900/40 text-[#622569] dark:text-purple-300'
                  }`}>
                    {ann.category}
                  </span>
                  {ann.pinned && (
                    <span className="text-[10px] font-bold bg-[#622569] text-white px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{ann.date}</span>
                  </div>

                  {user?.role === 'admin' && onDeleteAnnouncement && (
                    <button
                      onClick={() => onDeleteAnnouncement(ann.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Poppins']">{ann.title}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {ann.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Issued by <strong>{ann.authorName}</strong> ({ann.authorRole})</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PUBLISH ANNOUNCEMENT MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 relative shadow-2xl border border-slate-100 dark:border-slate-700 animate-slideUp">
            <button
              onClick={() => setShowPublishModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-[#622569] dark:text-purple-300 rounded-2xl">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Publish Chapter Notice</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Issue official circulars or news to chapter members</p>
              </div>
            </div>

            <form onSubmit={handlePublishSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  value={newAnnData.title}
                  onChange={(e) => setNewAnnData({ ...newAnnData, title: e.target.value })}
                  placeholder="e.g. Registration Open for Annual Paper Contest"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={newAnnData.category}
                  onChange={(e) => setNewAnnData({ ...newAnnData, category: e.target.value as any })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="General">General</option>
                  <option value="Important">Important</option>
                  <option value="Event Alert">Event Alert</option>
                  <option value="Achievement">Achievement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Content *</label>
                <textarea
                  rows={4}
                  required
                  value={newAnnData.content}
                  onChange={(e) => setNewAnnData({ ...newAnnData, content: e.target.value })}
                  placeholder="Write the full announcement text here..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinned-check"
                  checked={newAnnData.pinned}
                  onChange={(e) => setNewAnnData({ ...newAnnData, pinned: e.target.checked })}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="pinned-check" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  Pin this announcement to top
                </label>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#622569] hover:bg-[#9b51e0] rounded-xl transition-all shadow-md"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
