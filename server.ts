import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDb, saveDb, logActivity } from './server/store.js';
import { User, Event, Project, Announcement, Opportunity, Resource } from './src/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests
  app.use(express.json());

  // Initialize DB store
  let db = initDb();

  // Helper to sync db
  const persist = () => saveDb(db);

  // Helper to get user from authorization header
  const getUserFromReq = (req: express.Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const userId = authHeader.replace('Bearer iet_token_', '').trim();
    return db.users.find(u => u.id === userId) || null;
  };

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'IET CONNECT API', time: new Date().toISOString() });
  });

  // Auth: Register
  app.post('/api/auth/register', (req, res) => {
    try {
      const { username, email, password, phone, gender, dob, city, institution } = req.body;

      if (!email || !password || !username) {
        return res.status(400).json({ success: false, message: 'Username, Email and Password are required.' });
      }

      const normalizedEmail = String(email).toLowerCase().trim();
      const existingUser = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
      }

      const newUser: User & { passwordHash: string } = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        username: String(username).trim(),
        email: normalizedEmail,
        passwordHash: String(password),
        phone: String(phone || ''),
        gender: String(gender || 'Other'),
        dob: String(dob || ''),
        city: String(city || ''),
        institution: String(institution || 'IET Student Chapter'),
        role: 'member',
        bio: 'New IET CONNECT Member excited to learn and contribute.',
        skills: ['Engineering', 'Problem Solving'],
        interests: ['Technology', 'Networking'],
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        points: 50,
        joinedAt: new Date().toISOString().split('T')[0]
      };

      db.users.push(newUser);
      logActivity(db, newUser.id, newUser.username, newUser.avatarUrl, 'joined the platform', 'IET Connect Portal', newUser.id);
      persist();

      const { passwordHash, ...safeUser } = newUser;
      const token = `iet_token_${newUser.id}`;

      res.status(201).json({
        success: true,
        user: safeUser,
        token,
        message: 'Account created successfully! Welcome to IET CONNECT.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error during registration.' });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      }

      const normalizedEmail = String(email).toLowerCase().trim();
      const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

      if (!user || user.passwordHash !== String(password)) {
        return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email and password.' });
      }

      logActivity(db, user.id, user.username, user.avatarUrl, 'signed in', 'IET Connect Portal');
      persist();

      const { passwordHash, ...safeUser } = user;
      const token = `iet_token_${user.id}`;

      res.json({
        success: true,
        user: safeUser,
        token,
        message: 'Welcome back to IET CONNECT!'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Server error during login.' });
    }
  });

  // Auth: Get Current User profile
  app.get('/api/auth/me', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized or invalid token.' });
    }
    const { passwordHash, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  });

  // Update Profile
  app.put('/api/users/profile', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userIndex = db.users.findIndex(u => u.id === user.id);
    const {
      username, phone, gender, dob, city, institution, bio, skills, interests, githubUrl, linkedinUrl, avatarUrl
    } = req.body;

    const existingUser = db.users[userIndex];
    const updatedUser = {
      ...existingUser,
      username: username ?? existingUser.username,
      phone: phone ?? existingUser.phone,
      gender: gender ?? existingUser.gender,
      dob: dob ?? existingUser.dob,
      city: city ?? existingUser.city,
      institution: institution ?? existingUser.institution,
      bio: bio ?? existingUser.bio,
      skills: Array.isArray(skills) ? skills : existingUser.skills,
      interests: Array.isArray(interests) ? interests : existingUser.interests,
      githubUrl: githubUrl ?? existingUser.githubUrl,
      linkedinUrl: linkedinUrl ?? existingUser.linkedinUrl,
      avatarUrl: avatarUrl ?? existingUser.avatarUrl
    };

    db.users[userIndex] = updatedUser;
    logActivity(db, updatedUser.id, updatedUser.username, updatedUser.avatarUrl, 'updated profile details', 'Profile');
    persist();

    const { passwordHash, ...safeUser } = updatedUser;
    res.json({ success: true, user: safeUser, message: 'Profile updated successfully!' });
  });

  // Get Members Directory
  app.get('/api/members', (_req, res) => {
    const safeMembers = db.users.map(({ passwordHash, ...member }) => member);
    res.json({ success: true, members: safeMembers });
  });

  // --- EVENTS API ---
  app.get('/api/events', (_req, res) => {
    res.json({ success: true, events: db.events });
  });

  app.post('/api/events', (req, res) => {
    const user = getUserFromReq(req);
    const { title, description, category, date, time, location, isVirtual, virtualLink, speaker, speakerRole, organizer, bannerUrl, maxCapacity, tags } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({ success: false, message: 'Title, description and date are required.' });
    }

    const newEvent: Event = {
      id: `evt_${Date.now()}`,
      title,
      description,
      category: category || 'Workshop',
      date,
      time: time || '10:00 AM - 12:00 PM',
      location: location || 'TBA',
      isVirtual: Boolean(isVirtual),
      virtualLink,
      speaker,
      speakerRole,
      organizer: organizer || 'IET Chapter',
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      maxCapacity: Number(maxCapacity) || 100,
      registeredUserIds: [],
      tags: Array.isArray(tags) ? tags : ['IET', 'Event'],
      status: 'upcoming'
    };

    db.events.unshift(newEvent);
    if (user) {
      logActivity(db, user.id, user.username, user.avatarUrl, 'created event', newEvent.title, newEvent.id);
    }
    persist();

    res.status(201).json({ success: true, event: newEvent, message: 'Event created successfully!' });
  });

  app.put('/api/events/:id', (req, res) => {
    const { id } = req.params;
    const user = getUserFromReq(req);
    const eventIndex = db.events.findIndex(e => e.id === id);

    if (eventIndex === -1) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const existing = db.events[eventIndex];
    const updated: Event = {
      ...existing,
      ...req.body,
      id: existing.id // preserve ID
    };

    db.events[eventIndex] = updated;
    if (user) {
      logActivity(db, user.id, user.username, user.avatarUrl, 'updated event details', updated.title, updated.id);
    }
    persist();

    res.json({ success: true, event: updated, message: 'Event updated successfully!' });
  });

  app.delete('/api/events/:id', (req, res) => {
    const { id } = req.params;
    const user = getUserFromReq(req);
    const eventIndex = db.events.findIndex(e => e.id === id);

    if (eventIndex === -1) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const [deleted] = db.events.splice(eventIndex, 1);
    if (user) {
      logActivity(db, user.id, user.username, user.avatarUrl, 'deleted event', deleted.title, deleted.id);
    }
    persist();

    res.json({ success: true, message: 'Event deleted successfully.' });
  });

  // Toggle Event Registration
  app.post('/api/events/:id/register', (req, res) => {
    const { id } = req.params;
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Please login to register for events.' });
    }

    const event = db.events.find(e => e.id === id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const registeredIndex = event.registeredUserIds.indexOf(user.id);
    let isRegistered = false;

    if (registeredIndex === -1) {
      if (event.registeredUserIds.length >= event.maxCapacity) {
        return res.status(400).json({ success: false, message: 'Event is at full capacity.' });
      }
      event.registeredUserIds.push(user.id);
      isRegistered = true;
    } else {
      event.registeredUserIds.splice(registeredIndex, 1);
      isRegistered = false;
    }

    logActivity(
      db,
      user.id,
      user.username,
      user.avatarUrl,
      isRegistered ? 'registered for event' : 'cancelled registration for event',
      event.title,
      event.id
    );
    persist();

    res.json({
      success: true,
      registered: isRegistered,
      event,
      message: isRegistered ? 'Successfully registered for event!' : 'Unregistered from event.'
    });
  });

  // --- PROJECTS API ---
  app.get('/api/projects', (_req, res) => {
    res.json({ success: true, projects: db.projects });
  });

  app.post('/api/projects', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Please login to submit projects.' });
    }

    const { title, tagline, description, domain, teamMembers, githubUrl, demoUrl, tags, imageUrl } = req.body;

    if (!title || !description || !githubUrl) {
      return res.status(400).json({ success: false, message: 'Title, description and GitHub repository URL are required.' });
    }

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      title,
      tagline: tagline || title,
      description,
      domain: domain || 'Web Development',
      authorId: user.id,
      authorName: user.username,
      authorInstitution: user.institution,
      teamMembers: Array.isArray(teamMembers) ? teamMembers : [user.username],
      githubUrl,
      demoUrl,
      likes: 1,
      likedByUserIds: [user.id],
      tags: Array.isArray(tags) ? tags : ['IET', domain || 'Tech'],
      createdAt: new Date().toISOString().split('T')[0],
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'
    };

    db.projects.unshift(newProject);
    logActivity(db, user.id, user.username, user.avatarUrl, 'submitted project', newProject.title, newProject.id);
    persist();

    res.status(201).json({ success: true, project: newProject, message: 'Project submitted successfully!' });
  });

  app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const user = getUserFromReq(req);
    const index = db.projects.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const existing = db.projects[index];
    const updated: Project = {
      ...existing,
      ...req.body,
      id: existing.id
    };

    db.projects[index] = updated;
    if (user) {
      logActivity(db, user.id, user.username, user.avatarUrl, 'updated project', updated.title, updated.id);
    }
    persist();

    res.json({ success: true, project: updated, message: 'Project updated successfully!' });
  });

  app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const user = getUserFromReq(req);
    const index = db.projects.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const [deleted] = db.projects.splice(index, 1);
    if (user) {
      logActivity(db, user.id, user.username, user.avatarUrl, 'deleted project', deleted.title, deleted.id);
    }
    persist();

    res.json({ success: true, message: 'Project deleted successfully.' });
  });

  // Toggle Project Like
  app.post('/api/projects/:id/like', (req, res) => {
    const { id } = req.params;
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Please login to appreciate projects.' });
    }

    const project = db.projects.find(p => p.id === id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const likedIndex = project.likedByUserIds.indexOf(user.id);
    let liked = false;

    if (likedIndex === -1) {
      project.likedByUserIds.push(user.id);
      project.likes += 1;
      liked = true;
    } else {
      project.likedByUserIds.splice(likedIndex, 1);
      project.likes = Math.max(0, project.likes - 1);
      liked = false;
    }

    logActivity(
      db,
      user.id,
      user.username,
      user.avatarUrl,
      liked ? 'liked project' : 'unliked project',
      project.title,
      project.id
    );
    persist();

    res.json({ success: true, liked, likesCount: project.likes, project });
  });

  // --- ANNOUNCEMENTS API ---
  app.get('/api/announcements', (_req, res) => {
    res.json({ success: true, announcements: db.announcements });
  });

  app.post('/api/announcements', (req, res) => {
    const user = getUserFromReq(req);
    const { title, content, category, pinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const newAnnouncement: Announcement = {
      id: `ann_${Date.now()}`,
      title,
      content,
      category: category || 'General',
      authorName: user ? user.username : 'IET Admin',
      authorRole: user ? `${user.role.toUpperCase()} · IET Connect` : 'Executive Committee',
      date: new Date().toISOString().split('T')[0],
      pinned: Boolean(pinned)
    };

    db.announcements.unshift(newAnnouncement);
    if (user) {
      logActivity(db, user.id, user.username, user.avatarUrl, 'published announcement', newAnnouncement.title, newAnnouncement.id);
    }
    persist();

    res.status(201).json({ success: true, announcement: newAnnouncement, message: 'Announcement published!' });
  });

  app.put('/api/announcements/:id', (req, res) => {
    const { id } = req.params;
    const user = getUserFromReq(req);
    const index = db.announcements.findIndex(a => a.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    const existing = db.announcements[index];
    const updated: Announcement = {
      ...existing,
      ...req.body,
      id: existing.id
    };

    db.announcements[index] = updated;
    if (user) {
      logActivity(db, user.id, user.username, user.avatarUrl, 'updated announcement', updated.title, updated.id);
    }
    persist();

    res.json({ success: true, announcement: updated, message: 'Announcement updated successfully!' });
  });

  app.delete('/api/announcements/:id', (req, res) => {
    const { id } = req.params;
    const user = getUserFromReq(req);
    const index = db.announcements.findIndex(a => a.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    const [deleted] = db.announcements.splice(index, 1);
    if (user) {
      logActivity(db, user.id, user.username, user.avatarUrl, 'deleted announcement', deleted.title, deleted.id);
    }
    persist();

    res.json({ success: true, message: 'Announcement removed successfully.' });
  });

  // --- OPPORTUNITIES API ---
  app.get('/api/opportunities', (_req, res) => {
    res.json({ success: true, opportunities: db.opportunities || [] });
  });

  app.post('/api/opportunities', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Please login to post opportunities.' });
    }

    const { title, companyOrOrg, type, location, stipendOrSalary, deadline, description, applyUrl, requirements, tags, logoUrl, bannerUrl, status, timeline } = req.body;

    if (!title || !companyOrOrg || !description || !applyUrl) {
      return res.status(400).json({ success: false, message: 'Title, Organization, Description, and Apply URL are required.' });
    }

    const newOpportunity: Opportunity = {
      id: `opp_${Date.now()}`,
      title,
      companyOrOrg,
      type: type || 'Internship',
      location: location || 'Remote',
      stipendOrSalary: stipendOrSalary || 'Stipend / Competitive',
      deadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      description,
      applyUrl,
      requirements: Array.isArray(requirements) ? requirements : ['Active student / chapter member'],
      tags: Array.isArray(tags) ? tags : ['IET', 'Opportunity'],
      postedDate: new Date().toISOString().split('T')[0],
      logoUrl: logoUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      status: status || 'Open',
      timeline: timeline || 'present'
    };

    if (!db.opportunities) db.opportunities = [];
    db.opportunities.unshift(newOpportunity);
    logActivity(db, user.id, user.username, user.avatarUrl, 'posted opportunity', newOpportunity.title, newOpportunity.id);
    persist();

    res.status(201).json({ success: true, opportunity: newOpportunity, message: 'Opportunity posted successfully!' });
  });

  app.put('/api/opportunities/:id', (req, res) => {
    const { id } = req.params;
    const user = getUserFromReq(req);
    if (!db.opportunities) db.opportunities = [];
    const index = db.opportunities.findIndex(o => o.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    const existing = db.opportunities[index];
    const updated: Opportunity = {
      ...existing,
      ...req.body,
      id: existing.id
    };

    db.opportunities[index] = updated;
    if (user) {
      logActivity(db, user.id, user.username, user.avatarUrl, 'updated opportunity', updated.title, updated.id);
    }
    persist();

    res.json({ success: true, opportunity: updated, message: 'Opportunity updated successfully!' });
  });

  app.delete('/api/opportunities/:id', (req, res) => {
    const { id } = req.params;
    const user = getUserFromReq(req);
    if (!db.opportunities) db.opportunities = [];
    const index = db.opportunities.findIndex(o => o.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    const [deleted] = db.opportunities.splice(index, 1);
    if (user) {
      logActivity(db, user.id, user.username, user.avatarUrl, 'deleted opportunity', deleted.title, deleted.id);
    }
    persist();

    res.json({ success: true, message: 'Opportunity removed successfully.' });
  });

  // --- RESOURCES API ---
  app.get('/api/resources', (_req, res) => {
    res.json({ success: true, resources: db.resources || [] });
  });

  app.post('/api/resources', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Please login to share learning resources.' });
    }

    const { title, description, category, type, authorOrProvider, url, thumbnailUrl, tags, level, featured, timeline } = req.body;

    if (!title || !description || !url) {
      return res.status(400).json({ success: false, message: 'Title, description and resource URL are required.' });
    }

    const newResource: Resource = {
      id: `res_${Date.now()}`,
      title,
      description,
      category: category || 'Engineering & Tech',
      type: type || 'E-Book',
      authorOrProvider: authorOrProvider || 'IET Community',
      url,
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80',
      tags: Array.isArray(tags) ? tags : ['Engineering', 'IET'],
      level: level || 'All Levels',
      featured: Boolean(featured),
      timeline: timeline || 'present',
      publishedYear: String(new Date().getFullYear())
    };

    if (!db.resources) db.resources = [];
    db.resources.unshift(newResource);
    logActivity(db, user.id, user.username, user.avatarUrl, 'shared resource', newResource.title, newResource.id);
    persist();

    res.status(201).json({ success: true, resource: newResource, message: 'Resource shared with community!' });
  });

  app.put('/api/resources/:id', (req, res) => {
    const { id } = req.params;
    const user = getUserFromReq(req);
    if (!db.resources) db.resources = [];
    const index = db.resources.findIndex(r => r.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    const existing = db.resources[index];
    const updated: Resource = {
      ...existing,
      ...req.body,
      id: existing.id
    };

    db.resources[index] = updated;
    if (user) {
      logActivity(db, user.id, user.username, user.avatarUrl, 'updated resource', updated.title, updated.id);
    }
    persist();

    res.json({ success: true, resource: updated, message: 'Resource updated successfully!' });
  });

  app.delete('/api/resources/:id', (req, res) => {
    const { id } = req.params;
    const user = getUserFromReq(req);
    if (!db.resources) db.resources = [];
    const index = db.resources.findIndex(r => r.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    const [deleted] = db.resources.splice(index, 1);
    if (user) {
      logActivity(db, user.id, user.username, user.avatarUrl, 'deleted resource', deleted.title, deleted.id);
    }
    persist();

    res.json({ success: true, message: 'Resource deleted successfully.' });
  });

  // --- ADMIN MANAGEMENT ENDPOINTS ---

  app.get('/api/admin/activity', (_req, res) => {
    res.json({ success: true, logs: db.activityLogs || [] });
  });

  app.get('/api/admin/stats', (_req, res) => {
    res.json({
      success: true,
      stats: {
        totalUsers: db.users.length,
        totalEvents: db.events.length,
        totalProjects: db.projects.length,
        totalOpportunities: (db.opportunities || []).length,
        totalResources: (db.resources || []).length,
        totalAnnouncements: db.announcements.length,
      }
    });
  });

  app.put('/api/admin/users/:id/role', (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const adminUser = getUserFromReq(req);

    if (!role || !['admin', 'lead', 'member'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const targetUser = db.users.find(u => u.id === id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    targetUser.role = role as User['role'];
    if (adminUser) {
      logActivity(
        db,
        adminUser.id,
        adminUser.username,
        adminUser.avatarUrl,
        `updated role of ${targetUser.username} to ${role}`,
        targetUser.username,
        targetUser.id
      );
    }
    persist();

    const { passwordHash, ...safeUser } = targetUser;
    res.json({ success: true, user: safeUser, message: `Member role updated to ${role}.` });
  });

  app.delete('/api/admin/users/:id', (req, res) => {
    const { id } = req.params;
    const adminUser = getUserFromReq(req);
    const index = db.users.findIndex(u => u.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    const [deletedUser] = db.users.splice(index, 1);
    if (adminUser) {
      logActivity(
        db,
        adminUser.id,
        adminUser.username,
        adminUser.avatarUrl,
        'removed member account',
        deletedUser.username,
        deletedUser.id
      );
    }
    persist();

    res.json({ success: true, message: 'Member account removed.' });
  });

  // Vite middleware / static files setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IET CONNECT Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
