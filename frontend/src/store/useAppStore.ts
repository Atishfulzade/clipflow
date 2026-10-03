import { create } from 'zustand';
import { apiClient } from '@/lib/apiClient';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  creatorNiche: string;
  platformsUsed: string[];
  postingFrequency: string;
  isOnboarded: boolean;
  role?: string;
  teams?: any[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Video {
  id: string;
  projectId: string;
  title: string;
  duration: string;
  status: 'PENDING' | 'TRANSCRIBING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  youtubeUrl?: string;
  videoUrl?: string;
  thumbnail: string;
  transcript: { start: number; end: number; text: string }[];
  commentsCount: number;
}

export interface Clip {
  id: string;
  videoId: string;
  title: string;
  start: number;
  end: number;
  viralityScore: number;
  retentionScore: number;
  confidenceScore: number;
  clipUrl: string;
  transcriptText: string;
  captionsStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface Post {
  id: string;
  clipId: string;
  platform: 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK' | 'LINKEDIN' | 'X';
  status: 'DRAFT' | 'READY' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  scheduledTime?: string;
  publishedTime?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  postUrl?: string;
  errorLog?: string;
}

export interface Channel {
  id: string;
  platform: 'YOUTUBE' | 'TIKTOK' | 'INSTAGRAM';
  name: string;
  handle: string;
  avatarUrl: string;
  subscribers: number;
  views: number;
  avgUploads: string;
  bestPostTime: string;
  trendingKeywords: string[];
}

export interface CoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  plan: 'FREE' | 'CREATOR' | 'PRO' | 'AGENCY';
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'INCOMPLETE';
  priceId: string;
  currentPeriodEnd: string;
}

export interface ConnectedChannel {
  id: string;
  userId: string;
  platform: string;
  channelId: string;
  channelName: string;
  channelUrl?: string;
  createdAt: string;
}

export interface BrandPreset {
  id: string;
  name: string;
  userId: string;
  captionStyle: string;
  brandColor: string;
  watermarkText: string | null;
  enableEmojis: boolean;
  enableProgressBar: boolean;
  enableWatermark: boolean;
  captionFont: string;
  captionPosition: string;
  createdAt: string;
  updatedAt: string;
}

interface AppState {
  // Auth & Onboarding State
  user: UserProfile;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingUser: boolean;
  setUser: (user: Partial<UserProfile>) => void;
  completeOnboarding: (niche: string, platforms: string[], frequency: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password?: string; name?: string; role?: string }) => Promise<void>;
  googleLogin: (credentials: { code?: string; accessToken?: string }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  
  // Brand Kit State
  brandColor: string;
  watermarkText: string;
  setBrandKit: (color: string, text: string) => void;

  // Brand Presets
  brandPresets: BrandPreset[];
  fetchBrandPresets: () => Promise<void>;
  saveBrandPreset: (presetData: Omit<BrandPreset, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  deleteBrandPreset: (id: string) => Promise<void>;

  // Toast System State (Snackbar disabled)
  toasts: Toast[];
  addToast: (message: string, type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO') => void;
  removeToast: (id: string) => void;

  // Projects & Videos
  projects: Project[];
  videos: Video[];
  clips: Clip[];
  posts: Post[];
  
  addProject: (name: string, description: string) => Promise<string>;
  addVideo: (projectId: string, title: string, youtubeUrl?: string, videoUrl?: string) => Promise<string>;
  runVideoProcessor: (videoId: string) => void;
  fetchProjectsAndVideos: () => Promise<void>;
  
  // Scheduling Calendar & Social Channels
  connectedChannels: ConnectedChannel[];
  fetchChannels: () => Promise<void>;
  disconnectChannel: (id: string) => Promise<void>;
  fetchPosts: () => Promise<void>;
  schedulePost: (clipId: string, platform: Post['platform'], time: string, title: string, desc: string, hashtags?: string[]) => Promise<void>;
  publishPostImmediately: (postId: string) => Promise<void>;
  cancelPost: (postId: string) => Promise<void>;
  updatePostStatus: (postId: string, status: Post['status']) => void;

  // Video Rendering & Subtitle Burn-in
  renderClip: (clipId: string, options: {
    captionStyle: string;
    enableEmojis: boolean;
    enableProgressBar: boolean;
    enableWatermark: boolean;
    brandColor: string;
    watermarkText: string;
    captionFont: string;
    captionPosition: string;
  }) => Promise<Clip>;
  
  // Competitor Channels
  competitorChannels: Channel[];
  addCompetitorChannel: (url: string) => void;
  
  // AI Channel Coach
  coachMessages: CoachMessage[];
  sendCoachMessage: (text: string) => void;

  // Analytics State
  analyticsData: any | null;
  fetchAnalytics: () => Promise<void>;

  // Billing & Subscriptions
  subscription: Subscription | null;
  fetchSubscription: () => Promise<void>;
  createCheckout: (plan: 'CREATOR' | 'PRO' | 'AGENCY') => Promise<string>;
  confirmMockCheckout: (sessionId: string, plan: string) => Promise<void>;

  // Team Workspace members & invitations
  members: any[];
  pendingInvites: any[];
  receivedInvitations: any[];
  fetchMembers: (teamId: string) => Promise<void>;
  inviteMember: (inviteData: { teamId: string; email: string; role: string; projectId?: string; inviteeName: string }) => Promise<void>;
  updateMemberRole: (id: string, role: string, projectId?: string) => Promise<void>;
  removeMember: (id: string, teamId: string) => Promise<void>;
  cancelInvitation: (id: string, teamId: string) => Promise<void>;
  approveInvitation: (id: string, teamId: string) => Promise<void>;
  fetchReceivedInvitations: () => Promise<void>;
  acceptReceivedInvitation: (id: string) => Promise<void>;
  declineReceivedInvitation: (id: string) => Promise<void>;

  // Real-time Notifications & Alerts
  notifications: any[];
  unreadNotificationsCount: number;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  setupNotificationStream: () => () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: {
    name: '',
    email: '',
    creatorNiche: '',
    platformsUsed: [],
    postingFrequency: '',
    isOnboarded: false
  },
  token: typeof window !== 'undefined' ? localStorage.getItem('vibecut_token') : null,
  isAuthenticated: false,
  isLoadingUser: true,
  
  setUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
  
  completeOnboarding: async (niche, platforms, frequency) => {
    const updatedUser = await apiClient.post<any>('/api/auth/profile', {
      creatorNiche: niche,
      platformsUsed: platforms,
      postingFrequency: frequency,
    });
    set({ user: updatedUser });
  },

  login: async (email, password) => {
    const res = await apiClient.post<{ token: string; user: UserProfile }>('/api/auth/login', { email, password });
    localStorage.setItem('vibecut_token', res.token);
    set({ token: res.token, user: res.user, isAuthenticated: true });
  },

  register: async (data) => {
    const res = await apiClient.post<{ token: string; user: UserProfile }>('/api/auth/register', data);
    localStorage.setItem('vibecut_token', res.token);
    set({ token: res.token, user: res.user, isAuthenticated: true });
  },

  googleLogin: async (credentials) => {
    const res = await apiClient.post<{ token: string; user: UserProfile }>('/api/auth/google', credentials);
    localStorage.setItem('vibecut_token', res.token);
    set({ token: res.token, user: res.user, isAuthenticated: true });
  },

  forgotPassword: async (email) => {
    await apiClient.post<any>('/api/auth/forgot-password', { email });
  },

  resetPassword: async (token, newPassword) => {
    await apiClient.post<any>('/api/auth/reset-password', { token, newPassword });
  },

  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout', {});
    } catch (err) {
      console.error('Logout request failed', err);
    }
    localStorage.removeItem('vibecut_token');
    set({
      token: null,
      isAuthenticated: false,
      user: {
        name: '',
        email: '',
        creatorNiche: '',
        platformsUsed: [],
        postingFrequency: '',
        isOnboarded: false
      }
    });
  },

  checkAuth: async () => {
    set({ isLoadingUser: true });
    const token = typeof window !== 'undefined' ? localStorage.getItem('vibecut_token') : null;
    if (!token) {
      set({ isAuthenticated: false, isLoadingUser: false });
      return;
    }
    try {
      const userProfile = await apiClient.get<UserProfile>('/api/auth/me');
      set({ user: userProfile, isAuthenticated: true, token });
    } catch (err) {
      console.error('Failed to verify token', err);
      localStorage.removeItem('vibecut_token');
      set({ token: null, isAuthenticated: false });
    } finally {
      set({ isLoadingUser: false });
    }
  },

  brandColor: '#8b5cf6',
  watermarkText: 'VIBECUT.AI',
  setBrandKit: (brandColor, watermarkText) => set({ brandColor, watermarkText }),

  brandPresets: [],
  
  fetchBrandPresets: async () => {
    try {
      const presets = await apiClient.get<BrandPreset[]>('/api/presets');
      set({ brandPresets: presets });
    } catch (err) {
      console.error('Failed to fetch brand presets', err);
    }
  },
  
  saveBrandPreset: async (presetData) => {
    const newPreset = await apiClient.post<BrandPreset>('/api/presets', presetData);
    set((state) => ({
      brandPresets: [newPreset, ...state.brandPresets]
    }));
  },
  
  deleteBrandPreset: async (id) => {
    await apiClient.delete(`/api/presets/${id}`);
    set((state) => ({
      brandPresets: state.brandPresets.filter(p => p.id !== id)
    }));
  },

  // Toast System is disabled (no-op) as requested to remove the snackbar
  toasts: [],
  addToast: (message, type) => {
    // No-op: Toast/Snackbar removed by request
  },
  removeToast: (id) => {
    // No-op: Toast/Snackbar removed by request
  },

  analyticsData: null,
  fetchAnalytics: async () => {
    try {
      const data = await apiClient.get<any>('/api/analytics');
      set({ analyticsData: data });
    } catch (err) {
      console.error('Failed to fetch analytics from API', err);
    }
  },

  subscription: null,
  fetchSubscription: async () => {
    try {
      const sub = await apiClient.get<Subscription>('/api/billing');
      set({ subscription: sub });
    } catch (err) {
      console.error('Failed to fetch subscription from API', err);
    }
  },

  createCheckout: async (plan) => {
    const res = await apiClient.post<{ checkoutUrl: string }>('/api/billing/checkout', { plan, userId: 'mock-user-id' });
    return res.checkoutUrl;
  },

  confirmMockCheckout: async (sessionId, plan) => {
    const sub = await apiClient.post<Subscription>('/api/billing/confirm', { sessionId, plan, userId: 'mock-user-id' });
    set({ subscription: sub });
  },

  members: [],
  pendingInvites: [],
  receivedInvitations: [],

  fetchMembers: async (teamId) => {
    try {
      const res = await apiClient.get<{ members: any[]; pendingInvites: any[] }>(`/api/team/members?teamId=${teamId}`);
      set({ members: res.members, pendingInvites: res.pendingInvites || [] });
    } catch (err) {
      console.error('Failed to fetch team members', err);
    }
  },

  inviteMember: async (inviteData) => {
    await apiClient.post<any>('/api/team/invite', inviteData);
    await get().fetchMembers(inviteData.teamId);
  },

  updateMemberRole: async (id, role, projectId) => {
    const activeTeamId = get().user?.teams?.[0]?.teamId;
    await apiClient.put(`/api/team/members/${id}`, { role, projectId });
    if (activeTeamId) {
      await get().fetchMembers(activeTeamId);
    }
  },

  removeMember: async (id, teamId) => {
    await apiClient.delete(`/api/team/members/${id}`);
    await get().fetchMembers(teamId);
  },

  cancelInvitation: async (id, teamId) => {
    await apiClient.delete(`/api/team/invitations/${id}`);
    await get().fetchMembers(teamId);
  },

  approveInvitation: async (id, teamId) => {
    await apiClient.post(`/api/team/invitations/${id}/approve`, {});
    await get().fetchMembers(teamId);
  },

  fetchReceivedInvitations: async () => {
    try {
      const res = await apiClient.get<any[]>('/api/team/invitations/received');
      set({ receivedInvitations: res });
    } catch (err) {
      console.error('Failed to fetch received invitations', err);
    }
  },

  acceptReceivedInvitation: async (id) => {
    await apiClient.post(`/api/team/invitations/${id}/accept`, {});
    await get().fetchReceivedInvitations();
    await get().checkAuth();
  },

  declineReceivedInvitation: async (id) => {
    await apiClient.post(`/api/team/invitations/${id}/decline`, {});
    await get().fetchReceivedInvitations();
  },

  projects: [],
  videos: [],
  clips: [],
  posts: [],
  competitorChannels: [],
  coachMessages: [],
  
  addProject: async (name, description) => {
    const project = await apiClient.post<Project>('/api/projects', { name, description, userId: 'mock-user-id' });
    set((state) => ({
      projects: [project, ...state.projects]
    }));
    return project.id;
  },
  
  addVideo: async (projectId, title, youtubeUrl, videoUrl) => {
    const res = await apiClient.post<{ video: Video }>('/api/videos', { projectId, title, youtubeUrl, videoUrl });
    set((state) => ({
      videos: [res.video, ...state.videos]
    }));
    return res.video.id;
  },
  
  runVideoProcessor: (videoId) => {
    const poll = async () => {
      try {
        const vidDetail = await apiClient.get<Video & { clips: Clip[] }>(`/api/videos/${videoId}`);
        
        set((state) => ({
          videos: state.videos.map(v => v.id === videoId ? { 
            ...v, 
            status: vidDetail.status, 
            duration: vidDetail.duration ? String(vidDetail.duration) : v.duration, 
            transcript: vidDetail.transcript || [] 
          } : v),
          clips: [
            ...state.clips.filter(c => c.videoId !== videoId),
            ...(vidDetail.clips || [])
          ]
        }));

        if (vidDetail.status === 'COMPLETED' || vidDetail.status === 'FAILED') {
          return;
        }

        setTimeout(poll, 3000);
      } catch (err) {
        console.error('API polling failed', err);
        set((state) => ({
          videos: state.videos.map(v => v.id === videoId ? { ...v, status: 'FAILED' } : v)
        }));
      }
    };

    poll();
  },

  fetchProjectsAndVideos: async () => {
    try {
      const projects = await apiClient.get<Project[]>('/api/projects');
      const videos = await apiClient.get<Video[]>('/api/videos');
      
      let allClips: Clip[] = [];
      const updatedVideos = [...videos];
      
      for (let i = 0; i < updatedVideos.length; i++) {
        const vid = updatedVideos[i];
        if (vid.status === 'COMPLETED') {
          try {
            const detail = await apiClient.get<Video & { clips: Clip[] }>(`/api/videos/${vid.id}`);
            if (detail.clips) {
              allClips.push(...detail.clips);
            }
            updatedVideos[i] = {
              ...vid,
              transcript: detail.transcript || []
            };
          } catch (e) {
            console.error('Failed fetching details for video:', vid.id, e);
          }
        } else {
          updatedVideos[i] = {
            ...vid,
            transcript: vid.transcript || []
          };
        }
      }

      set((state) => ({
        projects,
        videos: updatedVideos,
        clips: allClips.length > 0 ? [...state.clips.filter(c => !allClips.some(ac => ac.id === c.id)), ...allClips] : state.clips
      }));
    } catch (err) {
      console.error('Failed fetching data from backend API', err);
    }
  },
  
  connectedChannels: [],
  
  fetchChannels: async () => {
    try {
      const userId = get().user?.id || 'mock-user-id';
      const channels = await apiClient.get<ConnectedChannel[]>(`/api/channels?userId=${userId}`);
      set({ connectedChannels: channels });
    } catch (err) {
      console.error('Failed to fetch channels from API', err);
    }
  },

  disconnectChannel: async (id) => {
    await apiClient.delete(`/api/channels/${id}`);
    set((state) => ({
      connectedChannels: state.connectedChannels.filter(c => c.id !== id)
    }));
  },

  fetchPosts: async () => {
    try {
      const userId = get().user?.id || 'mock-user-id';
      const posts = await apiClient.get<Post[]>(`/api/posts?userId=${userId}`);
      set({ posts });
    } catch (err) {
      console.error('Failed to fetch posts from API', err);
    }
  },

  schedulePost: async (clipId, platform, time, title, desc, hashtags) => {
    const userId = get().user?.id || 'mock-user-id';
    const post = await apiClient.post<Post>('/api/posts/schedule', {
      clipId,
      platform,
      scheduledTime: time,
      title,
      description: desc,
      hashtags: hashtags || ['shorts'],
      userId
    });
    set((state) => ({
      posts: [...state.posts.filter(p => p.id !== post.id), post]
    }));
  },

  publishPostImmediately: async (postId) => {
    const updatedPost = await apiClient.post<Post>(`/api/posts/${postId}/publish`, {});
    set((state) => ({
      posts: state.posts.map(p => p.id === postId ? updatedPost : p)
    }));
  },

  cancelPost: async (postId) => {
    await apiClient.delete(`/api/posts/${postId}`);
    set((state) => ({
      posts: state.posts.filter(p => p.id !== postId)
    }));
  },

  updatePostStatus: (postId, status) => {
    set((state) => ({
      posts: state.posts.map(p => p.id === postId ? { ...p, status } : p)
    }));
  },

  renderClip: async (clipId, options) => {
    const updatedClip = await apiClient.post<Clip>(`/api/clips/${clipId}/render`, options);
    set((state) => ({
      clips: state.clips.map(c => c.id === clipId ? updatedClip : c)
    }));
    return updatedClip;
  },
  
  addCompetitorChannel: (url) => {
    const id = `comp-${Date.now()}`;
    const name = url.replace('https://youtube.com/', '').replace('@', '').split('/')[0] || 'Target Channel';
    const newChannel: Channel = {
      id,
      platform: 'YOUTUBE',
      name: name.charAt(0).toUpperCase() + name.slice(1),
      handle: `@${name}`,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=60',
      subscribers: 1200000,
      views: 95000000,
      avgUploads: '2 videos / week',
      bestPostTime: '4:00 PM EST',
      trendingKeywords: ['Coding', 'Web dev', 'SaaS', 'Tutorials']
    };
    set((state) => ({
      competitorChannels: [...state.competitorChannels, newChannel]
    }));
  },
  
  sendCoachMessage: (text) => {
    const userMsg: CoachMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    set((state) => ({
      coachMessages: [...state.coachMessages, userMsg]
    }));
    
    // Responsive local AI Coach Chat bubbles
    setTimeout(() => {
      let coachReplyText = "Analyzing your channel performance... Based on your click-through rate, your titles are too long. Try truncating them under 50 characters and adding high-contrast visual cues to your clip thumbnails.";
      if (text.toLowerCase().includes('views')) {
        coachReplyText = "Views drop-off happens primarily in the first 3 seconds. Your hook lacks visual animation. Try placing caption highlights or dynamic zoom effects in the editor on the first spoken sentence.";
      } else if (text.toLowerCase().includes('ideas')) {
        coachReplyText = "Looking at your niche, 'Next.js 15 Server Actions vs WebSockets' is trending with low competition. I recommend creating a 45s comparison short on this topic.";
      }
      
      const coachMsg: CoachMessage = {
        id: `msg-${Date.now()}-c`,
        sender: 'coach',
        text: coachReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      set((state) => ({
        coachMessages: [...state.coachMessages, coachMsg]
      }));
    }, 1500);
  },

  // Notifications State & Actions
  notifications: [],
  unreadNotificationsCount: 0,

  fetchNotifications: async () => {
    try {
      const res = await apiClient.get<any[]>('/api/notifications');
      const unread = res.filter((n) => !n.read).length;
      set({ notifications: res, unreadNotificationsCount: unread });
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  },

  markNotificationAsRead: async (id) => {
    try {
      const updated = await apiClient.post<any>(`/api/notifications/${id}/read`, {});
      set((state) => {
        const updatedList = state.notifications.map((n) => (n.id === id ? updated : n));
        const unread = updatedList.filter((n) => !n.read).length;
        return { notifications: updatedList, unreadNotificationsCount: unread };
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      await apiClient.post('/api/notifications/read-all', {});
      set((state) => {
        const updatedList = state.notifications.map((n) => ({ ...n, read: true }));
        return { notifications: updatedList, unreadNotificationsCount: 0 };
      });
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  },

  setupNotificationStream: () => {
    const token = localStorage.getItem('vibecut_token');
    if (!token) return () => {};
    if (typeof window === 'undefined') return () => {};

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const eventSource = new EventSource(`${baseUrl}/api/notifications/stream`, {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        set((state) => {
          if (state.notifications.some((n) => n.id === notification.id)) return state;
          
          const updatedList = [notification, ...state.notifications];
          const unread = updatedList.filter((n) => !n.read).length;
          
          state.addToast(notification.message, notification.type === 'ERROR' ? 'ERROR' : notification.type === 'SUCCESS' ? 'SUCCESS' : 'INFO');
          
          return { notifications: updatedList, unreadNotificationsCount: unread };
        });
      } catch (err) {
        console.error('Failed to parse SSE notification message:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Notification Stream error, reconnecting...', err);
    };

    return () => {
      eventSource.close();
      console.log('SSE Notification Stream disconnected.');
    };
  }
}));
