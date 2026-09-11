import { PrismaClient, Plan, SubscriptionStatus, VideoStatus, CaptionStatus, PostStatus, Role, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Dependency Cleanup (Order prevents foreign key constraint issues)
  console.log('🧹 Clearing existing database records...');
  await prisma.notification.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.analytics.deleteMany();
  await prisma.post.deleteMany();
  await prisma.clip.deleteMany();
  await prisma.transcript.deleteMany();
  await prisma.video.deleteMany();
  await prisma.project.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed User
  console.log('👤 Seeding default user...');
  const user = await prisma.user.create({
    data: {
      id: 'mock-user-id',
      email: 'alex@vibecut.ai',
      passwordHash: bcrypt.hashSync('password', 10),
      name: 'Alex Creator',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      creatorNiche: 'SaaS & Tech Bootstrapping',
      platformsUsed: ['YOUTUBE', 'TIKTOK', 'INSTAGRAM'],
      postingFrequency: 'DAILY',
      role: Role.OWNER,
      isOnboarded: true,
    },
  });

  // Seed Team
  console.log('👥 Seeding default team...');
  const team = await prisma.team.create({
    data: {
      id: 'mock-team-id',
      name: "Alex's Team",
    },
  });

  // Seed Team Member for Alex (OWNER)
  await prisma.teamMember.create({
    data: {
      teamId: team.id,
      userId: user.id,
      role: Role.OWNER,
    },
  });

  // Seed Editor User
  console.log('👤 Seeding editor user...');
  const editorUser = await prisma.user.create({
    data: {
      id: 'mock-editor-id',
      email: 'sarah@vibecut.ai',
      passwordHash: bcrypt.hashSync('password', 10),
      name: 'Sarah Editor',
      role: Role.EDITOR,
      isOnboarded: true,
    },
  });

  // Seed Team Member for Sarah (EDITOR)
  await prisma.teamMember.create({
    data: {
      teamId: team.id,
      userId: editorUser.id,
      role: Role.EDITOR,
    },
  });

  // 3. Seed User Subscription
  console.log('💳 Seeding user subscription...');
  await prisma.subscription.create({
    data: {
      userId: user.id,
      stripeSubscriptionId: 'sub_mock_12345',
      plan: Plan.PRO,
      status: SubscriptionStatus.ACTIVE,
      priceId: 'price_pro_monthly',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  // 4. Seed Connected Channels
  console.log('🔗 Seeding connected social channels...');
  await prisma.channel.createMany({
    data: [
      {
        userId: user.id,
        platform: 'YOUTUBE',
        channelId: 'UC_mock_alex_bootstraps',
        channelName: 'Alex Bootstraps',
        channelUrl: 'https://youtube.com/@alexbootstraps',
        accessToken: 'mock_yt_access_token',
        refreshToken: 'mock_yt_refresh_token',
      },
      {
        userId: user.id,
        platform: 'TIKTOK',
        channelId: 'tiktok_mock_alex',
        channelName: 'Alex Shorts',
        channelUrl: 'https://tiktok.com/@alexshorts',
        accessToken: 'mock_tt_access_token',
      },
      {
        userId: user.id,
        platform: 'INSTAGRAM',
        channelId: 'ig_mock_alex',
        channelName: 'Alex Reels',
        channelUrl: 'https://instagram.com/alex_reels',
        accessToken: 'mock_ig_access_token',
      },
    ],
  });

  // 5. Seed AI Content Ideas
  console.log('💡 Seeding AI content ideas...');
  await prisma.idea.createMany({
    data: [
      {
        userId: user.id,
        prompt: '3 SaaS Growth Hacks',
        type: 'SHORT',
        content: {
          title: '3 SaaS Growth Hacks (Zero Budget)',
          script: 'Hook: Stop spending money on ads. Here are 3 growth hacks to scale your SaaS...\n1. Side project marketing: Build a free utility tool that solves a minor problem, host it under a subdomain, and direct users back to your main SaaS.\n2. Cold email scrapers: Find your competitors users complaining on social media, extract their emails, and reach out offering a better solution.\n3. Reddit and Quora social listening: Automate finding threads talking about your niche and join the conversation in a value-first way.',
          hooks: ['Stop spending money on ads!', 'How to get 100 SaaS users for free'],
          description: '3 organic marketing techniques for SaaS founders',
        },
      },
      {
        userId: user.id,
        prompt: 'Why AI agents are coding better than juniors',
        type: 'SHORT',
        content: {
          title: 'AI Agents vs Junior Devs',
          script: 'Hook: Are junior developer jobs dead? Let\'s look at the numbers. AI agents can now search codebases, write complete features, build, test, and deploy in seconds...\nBut wait, they still make mistakes. They lack human architectural context and client understanding. \nThe key isn\'t that junior developer jobs are dead, it is that junior developers who don\'t learn how to manage AI agents will be replaced by those who do.',
          hooks: ['Are junior dev jobs dead?', 'How to write code 10x faster with agents'],
          description: 'Analysis of the evolving role of software engineering in the age of AI agents',
        },
      },
    ],
  });

  // 6. Seed Project A (YouTube Growth Channel)
  console.log('📁 Seeding projects...');
  const projectA = await prisma.project.create({
    data: {
      id: 'proj-youtube-shorts',
      name: 'YouTube Growth Channel',
      description: 'Short clips from long video podcasts explaining startup growth',
      userId: user.id,
      teamId: team.id,
    },
  });

  // Seed Project B (SaaS Launch Promo)
  await prisma.project.create({
    data: {
      id: 'proj-saas-launch',
      name: 'SaaS Launch Promo',
      description: 'Marketing video cuts for our new AI SaaS release',
      userId: user.id,
      teamId: team.id,
    },
  });

  // 7. Seed Video 1 & Transcript
  console.log('📹 Seeding videos and transcripts...');
  const video1 = await prisma.video.create({
    data: {
      id: 'vid-saas-scale',
      projectId: projectA.id,
      title: 'How to Scale a SaaS to $10k/Month',
      description: 'A complete guide to scaling software products using organic channels.',
      youtubeUrl: 'https://www.youtube.com/watch?v=mock_saas_scale',
      duration: 720.0,
      status: VideoStatus.COMPLETED,
    },
  });

  await prisma.transcript.create({
    data: {
      videoId: video1.id,
      text: 'Welcome to today\'s guide on scaling SaaS products. Today we are talking about going from zero to ten thousand dollars per month. The biggest mistake founders make is trying to scale before they have product market fit. Focus on talking to users first.',
      segments: [
        { start: 0.0, end: 4.5, text: "Welcome to today's guide on scaling SaaS products." },
        { start: 4.5, end: 9.0, text: 'Today we are talking about going from zero to ten thousand dollars per month.' },
        { start: 9.0, end: 14.5, text: 'The biggest mistake founders make is trying to scale before they have product market fit.' },
        { start: 14.5, end: 18.0, text: 'Focus on talking to users first.' },
      ],
    },
  });

  // Seed Video 2 & Transcript
  const video2 = await prisma.video.create({
    data: {
      id: 'vid-ai-agents',
      projectId: projectA.id,
      title: 'AI Agents is Changing Software Engineering',
      description: 'A video covering how agentic coding models are automating dev tasks.',
      youtubeUrl: 'https://www.youtube.com/watch?v=mock_ai_agents',
      duration: 480.0,
      status: VideoStatus.COMPLETED,
    },
  });

  await prisma.transcript.create({
    data: {
      videoId: video2.id,
      text: 'AI agents are moving fast. We are seeing models that don\'t just write a single line of code, but run entire loops, test, compile and deploy. You need to learn how to operate these agents if you want to stay competitive.',
      segments: [
        { start: 0.0, end: 3.5, text: 'AI agents are moving fast.' },
        { start: 3.5, end: 8.0, text: "We are seeing models that don't just write a single line of code." },
        { start: 8.0, end: 12.5, text: 'But run entire loops, test, compile and deploy.' },
        { start: 12.5, end: 16.0, text: 'You need to learn how to operate these agents if you want to stay competitive.' },
      ],
    },
  });

  // 8. Seed Viral Clips
  console.log('✂️ Seeding viral clips...');
  const clip1 = await prisma.clip.create({
    data: {
      id: 'clip-saas-mistake',
      videoId: video1.id,
      title: 'The #1 SaaS Growth Mistake',
      start: 9.0,
      end: 18.0,
      viralityScore: 98,
      retentionScore: 94,
      confidenceScore: 96,
      clipUrl: '/uploads/mock-assets/render-output-1.mp4',
      transcriptText: 'The biggest mistake founders make is trying to scale before they have product market fit. Focus on talking to users first.',
      captionsStatus: CaptionStatus.PENDING,
    },
  });

  const clip2 = await prisma.clip.create({
    data: {
      id: 'clip-saas-zero',
      videoId: video1.id,
      title: 'Going from 0 to $10k/mo',
      start: 0.0,
      end: 9.0,
      viralityScore: 88,
      retentionScore: 85,
      confidenceScore: 86,
      clipUrl: '/uploads/mock-assets/render-output-2.mp4',
      transcriptText: 'Welcome to today\'s guide on scaling SaaS products. Today we are talking about going from zero to ten thousand dollars per month.',
      captionsStatus: CaptionStatus.PENDING,
    },
  });

  const clip3 = await prisma.clip.create({
    data: {
      id: 'clip-ai-future',
      videoId: video2.id,
      title: 'The Future of Agentic Devs',
      start: 0.0,
      end: 12.5,
      viralityScore: 95,
      retentionScore: 91,
      confidenceScore: 93,
      clipUrl: '/uploads/mock-assets/render-output-3.mp4',
      transcriptText: 'AI agents are moving fast. We are seeing models that don\'t just write a single line of code, but run entire loops, test, compile and deploy.',
      captionsStatus: CaptionStatus.PENDING,
    },
  });

  // 9. Seed Social Media Posts
  console.log('📅 Seeding scheduled and published posts...');
  await prisma.post.createMany({
    data: [
      {
        id: 'post-saas-reels',
        clipId: clip1.id,
        platform: 'INSTAGRAM_REELS',
        status: PostStatus.PUBLISHED,
        title: 'The #1 SaaS Growth Mistake',
        description: 'Don\'t make this mistake when launching your SaaS. Scaling too early kills companies!',
        hashtags: ['saas', 'startup', 'marketing', 'founder'],
        postUrl: 'https://instagram.com/reel/mock_reels_1',
        publishedTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: 'post-saas-shorts',
        clipId: clip1.id,
        platform: 'YOUTUBE_SHORTS',
        status: PostStatus.PUBLISHED,
        title: 'Stop scaling too early!',
        description: 'Talk to users first. Understand their needs before spending thousands on ads.',
        hashtags: ['shorts', 'startup', 'tech', 'marketing'],
        postUrl: 'https://youtube.com/shorts/mock_shorts_1',
        publishedTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        id: 'post-saas-tiktok',
        clipId: clip1.id,
        platform: 'TIKTOK',
        status: PostStatus.SCHEDULED,
        title: 'SaaS founders beware',
        description: 'This one mistake kills 90% of SaaS startups. Make sure you talk to users first.',
        hashtags: ['tiktok', 'startup', 'founder', 'business'],
        scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      },
      {
        id: 'post-ai-shorts',
        clipId: clip3.id,
        platform: 'YOUTUBE_SHORTS',
        status: PostStatus.READY,
        title: 'AI Agents are running loops!',
        description: 'Agentic coding models are here and they are automating dev tasks in seconds.',
        hashtags: ['ai', 'coding', 'tech', 'software'],
      },
    ],
  });

  // 10. Seed Analytics (Daily timeseries data for the last 14 days)
  console.log('📈 Seeding analytics history...');
  const analyticsData: any[] = [];
  const platforms = ['YOUTUBE_SHORTS', 'INSTAGRAM_REELS', 'TIKTOK'];
  
  // Base numbers to start growing from
  const platformBases = {
    YOUTUBE_SHORTS: { views: 800, likes: 60, comments: 4, shares: 12 },
    INSTAGRAM_REELS: { views: 500, likes: 35, comments: 2, shares: 8 },
    TIKTOK: { views: 1200, likes: 110, comments: 8, shares: 25 },
  };

  for (let i = 14; i >= 1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Seed views for the main clip
    platforms.forEach((platform) => {
      const base = platformBases[platform as keyof typeof platformBases];
      // Random organic growth factor
      const growthFactor = 1.0 + (14 - i) * 0.15 + (Math.random() * 0.1);
      
      const views = Math.floor(base.views * growthFactor);
      const likes = Math.floor(base.likes * growthFactor);
      const comments = Math.floor(base.comments * growthFactor);
      const shares = Math.floor(base.shares * growthFactor);
      const watchTime = parseFloat((views * 0.25 + Math.random() * 20).toFixed(1)); // in minutes
      const ctr = parseFloat((4.5 + Math.random() * 3).toFixed(2)); // in percent

      analyticsData.push({
        clipId: clip1.id,
        platform,
        views,
        likes,
        comments,
        shares,
        watchTime,
        ctr,
        date,
      });
    });
  }

  await prisma.analytics.createMany({
    data: analyticsData,
  });

  // 11. Seed System Notifications
  console.log('🔔 Seeding system notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: 'Welcome to VibeCut AI!',
        message: 'Your account is active. Connect your channels to begin posting and analyzing viral clips.',
        type: NotificationType.SUCCESS,
        read: true,
      },
      {
        userId: user.id,
        title: 'Clip Render Complete',
        message: 'Your viral clip "The #1 SaaS Growth Mistake" has finished rendering successfully.',
        type: NotificationType.INFO,
        read: false,
      },
    ],
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
