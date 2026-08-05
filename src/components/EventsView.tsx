import React, { useState } from 'react';
import { Event, User } from '../types';
import { Calendar, Clock, MapPin, Users, CheckCircle2, Search, PlusCircle, Video, UserCheck, Sparkles, X, Link, Play, Image as ImageIcon } from 'lucide-react';

interface EventsViewProps {
  events: Event[];
  user: User | null;
  onRegisterEvent: (eventId: string) => void;
  onCreateEvent: (eventData: Partial<Event>) => Promise<boolean>;
  searchQuery: string;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  user,
  onRegisterEvent,
  onCreateEvent,
  searchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTimeline, setSelectedTimeline] = useState<'all' | 'future' | 'present' | 'past'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeEventModal, setActiveEventModal] = useState<Event | null>(null);

  // New Event Form State
  const [newEventData, setNewEventData] = useState({
    title: '',
    description: '',
    category: 'Workshop' as Event['category'],
    date: '',
    time: '10:00 AM - 01:00 PM',
    location: '',
    isVirtual: false,
    virtualLink: '',
    speaker: '',
    speakerRole: '',
    maxCapacity: 100,
  });

  const categories = ['All', 'Hackathon', 'Workshop', 'Webinar', 'Guest Lecture', 'Conference'];
  const timelines: { id: 'all' | 'future' | 'present' | 'past'; label: string }[] = [
    { id: 'all', label: 'All Timeline' },
    { id: 'future', label: 'Upcoming (Future)' },
    { id: 'present', label: 'Ongoing Now (Present)' },
    { id: 'past', label: 'Completed (Past)' },
  ];

  const filteredEvents = events.filter((evt) => {
    const matchesCat = selectedCategory === 'All' || evt.category === selectedCategory;
    const evtTime = evt.timeline || (evt.status === 'completed' ? 'past' : evt.status === 'ongoing' ? 'present' : 'future');
    const matchesTimeline = selectedTimeline === 'all' || evtTime === selectedTimeline;
    const matchesSearch =
      !searchQuery ||
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesTimeline && matchesSearch;
  });


  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventData.title || !newEventData.date) return;
    const ok = await onCreateEvent(newEventData);
    if (ok) {
      setShowCreateModal(false);
      setNewEventData({
        title: '',
        description: '',
        category: 'Workshop',
        date: '',
        time: '10:00 AM - 01:00 PM',
        location: '',
        isVirtual: false,
        virtualLink: '',
        speaker: '',
        speakerRole: '',
        maxCapacity: 100,
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Poppins']">Chapter Events & Workshops</h1>
          <p className="text-xs text-slate-500 mt-1">Participate in technical symposiums, hackathons, and webinars</p>
        </div>

        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-[#622569] hover:bg-[#9b51e0] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Host Event</span>
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
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-100 text-[#622569] border border-purple-300'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((evt) => {
          const isReg = user ? evt.registeredUserIds.includes(user.id) : false;
          const seatsLeft = evt.maxCapacity - evt.registeredUserIds.length;
          const evtTime = evt.timeline || (evt.status === 'completed' ? 'past' : evt.status === 'ongoing' ? 'present' : 'future');

          return (
            <div
              key={evt.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Banner */}
                <div className="h-44 relative overflow-hidden bg-slate-900">
                  <img
                    src={evt.bannerUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-white/90 backdrop-blur-md text-[#622569] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {evt.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${
                      evtTime === 'present'
                        ? 'bg-amber-500 text-slate-900 animate-pulse'
                        : evtTime === 'past'
                        ? 'bg-slate-700/90 text-slate-200'
                        : 'bg-[#622569]/90 text-white'
                    }`}>
                      {evtTime === 'present' ? '🔥 Ongoing' : evtTime === 'past' ? '📁 Past' : '🌟 Future'}
                    </span>
                  </div>


                  {evt.isVirtual && (
                    <span className="absolute top-3 right-3 bg-blue-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-md">
                      <Video className="w-3 h-3" /> Online
                    </span>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-[11px] text-purple-200 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-300" />
                      {evt.date} • {evt.time}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3
                    onClick={() => setActiveEventModal(evt)}
                    className="font-bold text-slate-900 text-base leading-snug font-['Poppins'] hover:text-[#622569] cursor-pointer line-clamp-2"
                  >
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="space-y-1.5 pt-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>

                    {evt.speaker && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="truncate">Speaker: <strong>{evt.speaker}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer / CTA */}
              <div className="p-5 pt-0 border-t border-slate-100/80 flex items-center justify-between gap-3 mt-4">
                <div className="text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-700">{evt.registeredUserIds.length}</span> / {evt.maxCapacity} Seats
                </div>

                <button
                  onClick={() => onRegisterEvent(evt.id)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isReg
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[#622569] hover:bg-[#9b51e0] text-white shadow-sm'
                  }`}
                >
                  {isReg ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Registered</span>
                    </>
                  ) : (
                    <span>Register</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* EVENT DETAILS MODAL */}
      {activeEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl animate-scaleUp">
            <button
              onClick={() => setActiveEventModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#622569] bg-purple-100 px-3 py-1 rounded-full">
                {activeEventModal.category}
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-['Poppins']">{activeEventModal.title}</h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{activeEventModal.description}</p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <p>📍 <strong>Location:</strong> {activeEventModal.location}</p>
              <p>📅 <strong>Date & Time:</strong> {activeEventModal.date} ({activeEventModal.time})</p>
              {activeEventModal.speaker && (
                <p>🗣️ <strong>Key Speaker:</strong> {activeEventModal.speaker} ({activeEventModal.speakerRole})</p>
              )}
              {activeEventModal.isVirtual && activeEventModal.virtualLink && (
                <p className="flex items-center gap-1 text-purple-700">
                  <Link className="w-3.5 h-3.5" />
                  <strong>Link:</strong> <a href={activeEventModal.virtualLink} target="_blank" rel="noreferrer" className="underline">{activeEventModal.virtualLink}</a>
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveEventModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onRegisterEvent(activeEventModal.id);
                  setActiveEventModal(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#622569] hover:bg-[#9b51e0] shadow"
              >
                Toggle Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 relative shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-700 animate-slideUp">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-[#622569] dark:text-purple-300 rounded-2xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Publish Chapter Event</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Host workshops, hackathons, or lectures for IET members</p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newEventData.title}
                  onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                  placeholder="e.g. AI & Robotics Symposium 2026"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newEventData.description}
                  onChange={(e) => setNewEventData({ ...newEventData, description: e.target.value })}
                  placeholder="Details about workshop objectives, prerequisites, key takeaways..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newEventData.category}
                    onChange={(e) => setNewEventData({ ...newEventData, category: e.target.value as any })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Guest Lecture">Guest Lecture</option>
                    <option value="Conference">Conference</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newEventData.date}
                    onChange={(e) => setNewEventData({ ...newEventData, date: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Time</label>
                  <input
                    type="text"
                    value={newEventData.time}
                    onChange={(e) => setNewEventData({ ...newEventData, time: e.target.value })}
                    placeholder="e.g. 10:00 AM - 01:00 PM"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={newEventData.maxCapacity}
                    onChange={(e) => setNewEventData({ ...newEventData, maxCapacity: Number(e.target.value) })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location / Venue</label>
                <input
                  type="text"
                  value={newEventData.location}
                  onChange={(e) => setNewEventData({ ...newEventData, location: e.target.value })}
                  placeholder="Auditorium B / Tech Lab / Virtual Stream"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#622569] hover:bg-[#9b51e0] rounded-xl transition-all shadow-md"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
