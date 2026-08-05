import React, { useState } from 'react';
import { User } from '../types';
import { Mail, Phone, MapPin, Building, Calendar, Edit3, Github, Linkedin, ShieldCheck, Sparkles, Check, X, Tag } from 'lucide-react';
import { PhoneInput } from './PhoneInput';

interface ProfileViewProps {
  user: User;
  onUpdateProfile: (updatedData: Partial<User>) => Promise<boolean>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const [formData, setFormData] = useState({
    username: user.username,
    phone: user.phone || '',
    gender: user.gender || 'Male',
    dob: user.dob || '',
    city: user.city || '',
    institution: user.institution || '',
    bio: user.bio || '',
    githubUrl: user.githubUrl || '',
    linkedinUrl: user.linkedinUrl || '',
    avatarUrl: user.avatarUrl || '',
    skills: user.skills || [],
    interests: user.interests || [],
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await onUpdateProfile(formData);
    setSaving(false);
    if (success) {
      setIsEditing(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({ ...formData, interests: [...formData.interests, newInterest.trim()] });
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setFormData({ ...formData, interests: formData.interests.filter(i => i !== interestToRemove) });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Cover Banner */}
        <div className="h-44 bg-gradient-to-r from-purple-900 via-pink-600 to-yellow-400 relative">
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[#622569] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>MEMBER RECORD VERIFIED</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-8 relative pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-20 mb-6">
            <div className="flex items-end gap-6">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={user.username}
                className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-md bg-white shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-slate-900 font-['Poppins'] tracking-tight">{user.username}</h1>
                  {user.role === 'lead' && (
                    <span className="bg-purple-100 text-[#622569] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Chapter Lead
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-1">{user.institution}</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2.5 rounded-xl bg-[#622569] hover:bg-[#9b51e0] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* EDIT FORM or READ-ONLY VIEW */}
          {isEditing ? (
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await onUpdateProfile(formData);
                if (ok) setIsEditing(false);
              }} 
              className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Edit3 className="w-5 h-5 text-[#622569] dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Update Profile Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <PhoneInput
                    value={formData.phone || ''}
                    onChange={(fullNumber) => setFormData({ ...formData, phone: fullNumber })}
                    required={false}
                    label="Phone Number"
                    id="profile-phone-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Institution</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bio / Statement</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell members about your technical background and interests..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Avatar Image Link</label>
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                {/* Skills Tag Management */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="e.g. Python, React, IoT"
                      className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2.5 bg-[#622569] hover:bg-[#9b51e0] text-white text-xs font-bold rounded-xl transition-all"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-[#622569] dark:text-purple-300 text-xs font-medium rounded-lg flex items-center gap-1">
                        {s}
                        <X className="w-3 h-3 cursor-pointer hover:text-rose-500 transition-colors" onClick={() => removeSkill(s)} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#622569] hover:bg-[#9b51e0] rounded-xl transition-all shadow-md"
                >
                  Save Profile
                </button>
              </div>
            </form>
          ) : (
            /* READ ONLY VIEW */
            <div className="space-y-6 pt-4 border-t border-slate-100">
              {/* Bio Statement */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">About Member</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {user.bio || 'No bio provided yet.'}
                </p>
              </div>

              {/* Data Grid matching original prompt structure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Mail className="w-3.5 h-3.5 text-purple-600" />
                    <span>Email Address</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{user.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Phone className="w-3.5 h-3.5 text-purple-600" />
                    <span>Phone Number</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{user.phone || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span>Date of Birth & Gender</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{user.dob || 'N/A'} • {user.gender || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" />
                    <span>City</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{user.city || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1 md:col-span-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Building className="w-3.5 h-3.5 text-purple-600" />
                    <span>Institution</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{user.institution}</p>
                </div>
              </div>

              {/* Skills & Interests */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((s) => (
                      <span key={s} className="px-3 py-1 bg-purple-100 text-[#622569] text-xs font-semibold rounded-lg">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No skills listed yet</span>
                  )}
                </div>
              </div>

              {/* Social Connections */}
              <div className="pt-4 border-t border-slate-100 flex gap-4">
                {user.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-[#622569]"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub Profile</span>
                  </a>
                )}
                {user.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-[#622569]"
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
