import React, { useState } from 'react';
import { Opportunity, User } from '../types';
import { Briefcase, MapPin, DollarSign, Calendar, ExternalLink, PlusCircle, X, CheckCircle, Tag, Building2 } from 'lucide-react';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  user: User | null;
  onCreateOpportunity: (oppData: Partial<Opportunity>) => Promise<boolean>;
  searchQuery: string;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  user,
  onCreateOpportunity,
  searchQuery,
}) => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedTimeline, setSelectedTimeline] = useState<'all' | 'present' | 'past' | 'future'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeOppModal, setActiveOppModal] = useState<Opportunity | null>(null);

  const [newOppData, setNewOppData] = useState({
    title: '',
    companyOrOrg: '',
    type: 'Internship' as Opportunity['type'],
    location: 'Remote',
    stipendOrSalary: '',
    deadline: '',
    description: '',
    applyUrl: '',
    requirementsStr: '',
    tagsStr: '',
    logoUrl: '',
    bannerUrl: '',
    status: 'Open' as 'Open' | 'Closing Soon' | 'Closed',
    timeline: 'present' as 'past' | 'present' | 'future',
  });

  const types = ['All', 'Internship', 'Full-Time Job', 'Research Fellowship', 'Hackathon Grant', 'Mentorship'];
  const timelines: { id: 'all' | 'present' | 'past' | 'future'; label: string }[] = [
    { id: 'all', label: 'All Opportunities' },
    { id: 'present', label: 'Open Now' },
    { id: 'future', label: 'Upcoming' },
    { id: 'past', label: 'Past & Archived' },
  ];

  const filteredOpps = opportunities.filter((opp) => {
    const matchesType = selectedType === 'All' || opp.type === selectedType;
    const oppTime = opp.timeline || (opp.status === 'Closed' ? 'past' : opp.status === 'Upcoming' ? 'future' : 'present');
    const matchesTimeline = selectedTimeline === 'all' || oppTime === selectedTimeline;
    const matchesSearch =
      !searchQuery ||
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.companyOrOrg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesTimeline && matchesSearch;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOppData.title || !newOppData.companyOrOrg || !newOppData.description || !newOppData.applyUrl) return;

    const requirements = newOppData.requirementsStr
      ? newOppData.requirementsStr.split('\n').map(s => s.trim()).filter(Boolean)
      : ['Active IET student member', 'Enrolled in STEM / Engineering degree'];

    const tags = newOppData.tagsStr
      ? newOppData.tagsStr.split(',').map(s => s.trim()).filter(Boolean)
      : ['IET', newOppData.type];

    const ok = await onCreateOpportunity({
      ...newOppData,
      requirements,
      tags,
    });

    if (ok) {
      setShowCreateModal(false);
      setNewOppData({
        title: '',
        companyOrOrg: '',
        type: 'Internship',
        location: 'Remote',
        stipendOrSalary: '',
        deadline: '',
        description: '',
        applyUrl: '',
        requirementsStr: '',
        tagsStr: '',
        logoUrl: '',
        bannerUrl: '',
        status: 'Open',
        timeline: 'present',
      });
    }
  };

  const timelineBadge = (t: string) => {
    if (t === 'past') return { label: 'Closed', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' };
    if (t === 'future') return { label: 'Upcoming', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' };
    return { label: 'Open', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' };
  };

  const inputCls = "w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all";
  const labelCls = "block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1";

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Career & Opportunities</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Internships, scholarships, grants, and mentorship programs for IET members.</p>
        </div>
        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Post Opportunity
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
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Type</p>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all border ${
                  selectedType === t
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      {filteredOpps.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700">
          <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-600 dark:text-slate-400">No opportunities match your filters</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting the timeline or type.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOpps.map((opp) => {
            const oppTime = opp.timeline || (opp.status === 'Closed' ? 'past' : opp.status === 'Upcoming' ? 'future' : 'present');
            const badge = timelineBadge(oppTime);
            return (
              <div
                key={opp.id}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Banner */}
                <div className="h-36 relative overflow-hidden bg-slate-100 dark:bg-slate-700">
                  <img
                    src={opp.bannerUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'}
                    alt={opp.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {opp.type}
                  </div>
                  <div className="absolute bottom-2 left-3 text-white text-sm font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{opp.companyOrOrg}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <h3
                    onClick={() => setActiveOppModal(opp)}
                    className="font-bold text-slate-900 dark:text-white text-sm cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 mb-2"
                  >
                    {opp.title}
                  </h3>
                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 flex-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{opp.location}</span>
                    </div>
                    {opp.stipendOrSalary && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{opp.stipendOrSalary}</span>
                      </div>
                    )}
                    {opp.deadline && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Deadline: {opp.deadline}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setActiveOppModal(opp)}
                      className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                      Details
                    </button>
                    {oppTime === 'present' && (
                      <button
                        onClick={() => window.open(opp.applyUrl, '_blank')}
                        className="flex-1 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center justify-center gap-1"
                      >
                        Apply <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OPPORTUNITY DETAILS MODAL */}
      {activeOppModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full relative shadow-2xl border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveOppModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="h-48 relative overflow-hidden rounded-t-2xl">
              <img src={activeOppModal.bannerUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                {activeOppModal.logoUrl && (
                  <img src={activeOppModal.logoUrl} alt="" className="w-10 h-10 rounded-xl border-2 border-white object-cover" />
                )}
                <div>
                  <span className="bg-indigo-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {activeOppModal.type}
                  </span>
                  <p className="text-white font-semibold mt-1">{activeOppModal.companyOrOrg}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeOppModal.title}</h2>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Location', value: activeOppModal.location, icon: MapPin },
                  { label: 'Stipend / Support', value: activeOppModal.stipendOrSalary || 'Competitive', icon: DollarSign },
                  { label: 'Deadline', value: activeOppModal.deadline || 'Rolling', icon: Calendar },
                  { label: 'Status', value: activeOppModal.status || 'Open', icon: CheckCircle },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-600">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mb-1">
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">Description</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{activeOppModal.description}</p>
              </div>

              {activeOppModal.requirements && activeOppModal.requirements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">Eligibility & Requirements</h4>
                  <ul className="space-y-1.5">
                    {activeOppModal.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => setActiveOppModal(null)}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Close
                </button>
                {(activeOppModal.timeline === 'present' || activeOppModal.status === 'Open') && (
                  <button
                    onClick={() => window.open(activeOppModal.applyUrl, '_blank')}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center justify-center gap-2"
                  >
                    Apply Now <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE OPPORTUNITY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full relative shadow-2xl border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Post an Opportunity</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Share an internship, scholarship, or mentorship with the chapter.</p>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Opportunity Title *</label>
                    <input
                      type="text"
                      required
                      value={newOppData.title}
                      onChange={(e) => setNewOppData({ ...newOppData, title: e.target.value })}
                      placeholder="e.g. Embedded Firmware Engineering Intern"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Organization / Sponsor *</label>
                    <input
                      type="text"
                      required
                      value={newOppData.companyOrOrg}
                      onChange={(e) => setNewOppData({ ...newOppData, companyOrOrg: e.target.value })}
                      placeholder="e.g. Siemens Tech Labs"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Type</label>
                    <select
                      value={newOppData.type}
                      onChange={(e) => setNewOppData({ ...newOppData, type: e.target.value as Opportunity['type'] })}
                      className={inputCls}
                    >
                      <option value="Internship">Internship</option>
                      <option value="Full-Time Job">Full-Time Job</option>
                      <option value="Research Fellowship">Research Fellowship</option>
                      <option value="Hackathon Grant">Hackathon Grant</option>
                      <option value="Mentorship">Mentorship</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Location</label>
                    <input
                      type="text"
                      value={newOppData.location}
                      onChange={(e) => setNewOppData({ ...newOppData, location: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Stipend / Award</label>
                    <input
                      type="text"
                      value={newOppData.stipendOrSalary}
                      onChange={(e) => setNewOppData({ ...newOppData, stipendOrSalary: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Deadline</label>
                    <input
                      type="date"
                      value={newOppData.deadline}
                      onChange={(e) => setNewOppData({ ...newOppData, deadline: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Timeline</label>
                    <select
                      value={newOppData.timeline}
                      onChange={(e) => setNewOppData({ ...newOppData, timeline: e.target.value as 'past' | 'present' | 'future' })}
                      className={inputCls}
                    >
                      <option value="present">Open Now</option>
                      <option value="future">Upcoming</option>
                      <option value="past">Past</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Apply URL *</label>
                    <input
                      type="url"
                      required
                      value={newOppData.applyUrl}
                      onChange={(e) => setNewOppData({ ...newOppData, applyUrl: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Description *</label>
                    <textarea
                      rows={3}
                      required
                      value={newOppData.description}
                      onChange={(e) => setNewOppData({ ...newOppData, description: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Requirements (one per line)</label>
                    <textarea
                      rows={2}
                      value={newOppData.requirementsStr}
                      onChange={(e) => setNewOppData({ ...newOppData, requirementsStr: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
                  >
                    Publish Opportunity
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
