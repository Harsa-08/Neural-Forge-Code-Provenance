import React, { useState } from 'react';
import { User } from '../types';
import { MapPin, Mail, Github, Linkedin, ShieldCheck, Users, Award } from 'lucide-react';

interface MembersViewProps {
  members: User[];
  searchQuery: string;
  user: User | null;
}

export const MembersView: React.FC<MembersViewProps> = ({ members, searchQuery, user }) => {
  const [selectedCity, setSelectedCity] = useState<string>('All');

  const cities = ['All', ...Array.from(new Set(members.map(m => m.city).filter(Boolean)))];

  const filteredMembers = members.filter((m) => {
    const matchesCity = selectedCity === 'All' || m.city === selectedCity;
    const matchesSearch =
      !searchQuery ||
      m.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.skills && m.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCity && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Member Directory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect with student engineers, researchers, and chapter leads across your network.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-xl text-sm font-semibold self-start sm:self-auto">
          <Users className="w-4 h-4" />
          {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* City Filters */}
      {cities.length > 1 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Filter by City</p>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all border ${
                  selectedCity === city
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-300'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-600 dark:text-slate-400">No members match your search</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try a different city or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col hover:shadow-md transition-shadow"
            >
              {/* Card Top */}
              <div className="p-5 flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <img
                    src={member.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={member.username}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-800"
                    referrerPolicy="no-referrer"
                  />
                  {member.role === 'lead' && (
                    <span className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-900 p-1 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{member.username}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{member.institution}</p>
                </div>

                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  member.role === 'lead'
                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {member.role === 'lead' ? 'Chapter Lead' : 'Member'}
                </span>
              </div>

              {/* Details */}
              <div className="px-4 pb-4 space-y-2 flex-1">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 space-y-2 border border-slate-100 dark:border-slate-600">
                  <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </p>
                  {member.city && (
                    <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{member.city}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{member.points || 50} points</span>
                  </p>
                </div>

                {/* Social Links */}
                {(member.githubUrl || member.linkedinUrl) && (
                  <div className="flex gap-2 pt-1">
                    {member.githubUrl && (
                      <a
                        href={member.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                      >
                        <Github className="w-3.5 h-3.5" />
                        GitHub
                      </a>
                    )}
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
