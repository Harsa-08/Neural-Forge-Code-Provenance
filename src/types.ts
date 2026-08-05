export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  city: string;
  institution: string;
  role: 'member' | 'lead' | 'admin';
  bio?: string;
  skills?: string[];
  interests?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  avatarUrl?: string;
  points?: number;
  joinedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: 'Hackathon' | 'Workshop' | 'Webinar' | 'Guest Lecture' | 'Conference';
  date: string;
  time: string;
  location: string;
  isVirtual: boolean;
  virtualLink?: string;
  speaker?: string;
  speakerRole?: string;
  organizer: string;
  bannerUrl: string;
  maxCapacity: number;
  registeredUserIds: string[];
  tags: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  timeline?: 'past' | 'present' | 'future';
  recordingUrl?: string;
  galleryUrls?: string[];
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  domain: 'AI / ML' | 'Web Development' | 'IoT & Embedded' | 'Robotics' | 'Cybersecurity' | 'Mobile App';
  authorId: string;
  authorName: string;
  authorInstitution: string;
  teamMembers: string[];
  githubUrl: string;
  demoUrl?: string;
  likes: number;
  likedByUserIds: string[];
  tags: string[];
  createdAt: string;
  imageUrl?: string;
  status?: 'Active' | 'Completed' | 'Research';
  timeline?: 'past' | 'present' | 'future';
  achievements?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  companyOrOrg: string;
  type: 'Internship' | 'Full-Time Job' | 'Research Fellowship' | 'Hackathon Grant' | 'Mentorship';
  location: string;
  stipendOrSalary?: string;
  deadline: string;
  description: string;
  applyUrl: string;
  requirements: string[];
  tags: string[];
  postedDate: string;
  logoUrl?: string;
  bannerUrl?: string;
  status: 'Open' | 'Closing Soon' | 'Closed';
  timeline?: 'past' | 'present' | 'future';
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'Engineering & Tech' | 'AI & Data Science' | 'Web & Cloud' | 'Electronics & IoT' | 'Career & Interview';
  type: 'E-Book' | 'Course' | 'Documentation' | 'Video Lecture' | 'Toolkit';
  authorOrProvider: string;
  url: string;
  thumbnailUrl: string;
  tags: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  featured?: boolean;
  timeline?: 'past' | 'present' | 'future';
  publishedYear?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Important' | 'Event Alert' | 'Achievement' | 'General';
  authorName: string;
  authorRole: string;
  date: string;
  pinned: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  action: string;
  target: string;
  targetId?: string;
  timestamp: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}
