const EventRegistration = require('../models/EventRegistration');
const Attendance = require('../models/Attendance');
const ClubMembership = require('../models/ClubMembership');
const Achievement = require('../models/Achievement');
const DiscussionPost = require('../models/DiscussionPost');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Last n calendar months as [{key:'2026-8', label:'Sep'}]
exports.monthBuckets = (n = 6) => {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS[d.getMonth()], count: 0 });
  }
  return out;
};

const monthKey = (date) => `${new Date(date).getFullYear()}-${new Date(date).getMonth()}`;
exports.monthKey = monthKey;

exports.computeEngagement = ({ attended, registered, clubs, achievements, posts, volunteerHours }) =>
  Math.min(
    100,
    attended * 10 + registered * 3 + clubs * 5 + achievements * 8 + posts * 2 + Math.floor(volunteerHours / 2)
  );

exports.getLevel = (score) => {
  const levels = [
    { name: 'Newcomer', min: 0 },
    { name: 'Explorer', min: 20 },
    { name: 'Contributor', min: 40 },
    { name: 'Leader', min: 60 },
    { name: 'Campus Champion', min: 80 },
  ];
  let idx = 0;
  levels.forEach((l, i) => { if (score >= l.min) idx = i; });
  const next = levels[idx + 1];
  return {
    name: levels[idx].name,
    nextLevel: next ? next.name : null,
    progress: next ? Math.round(((score - levels[idx].min) / (next.min - levels[idx].min)) * 100) : 100,
  };
};

exports.getBadges = (s) => {
  const defs = [
    { id: 'first-step', name: 'First Step', icon: '👣', description: 'Attended your first event', earned: s.eventsAttended >= 1 },
    { id: 'event-enthusiast', name: 'Event Enthusiast', icon: '🎟️', description: 'Attended 5 events', earned: s.eventsAttended >= 5 },
    { id: 'club-player', name: 'Club Player', icon: '🤝', description: 'Joined a club', earned: s.clubsJoined >= 1 },
    { id: 'community-builder', name: 'Community Builder', icon: '🏛️', description: 'Joined 3 clubs', earned: s.clubsJoined >= 3 },
    { id: 'achiever', name: 'Achiever', icon: '🏆', description: 'Added 3 achievements', earned: s.achievements >= 3 },
    { id: 'voice-of-campus', name: 'Voice of Campus', icon: '💬', description: 'Wrote 3 forum posts', earned: s.posts >= 3 },
    { id: 'volunteer-hero', name: 'Volunteer Hero', icon: '💚', description: '10+ volunteer hours', earned: s.volunteerHours >= 10 },
    { id: 'rising-star', name: 'Rising Star', icon: '⭐', description: 'Engagement score 50+', earned: s.engagementScore >= 50 },
    { id: 'campus-champion', name: 'Campus Champion', icon: '👑', description: 'Engagement score 80+', earned: s.engagementScore >= 80 },
  ];
  return defs;
};

// Everything a student dashboard / passport / analytics page needs
exports.buildStudentStats = async (userId) => {
  const [registered, attendanceDocs, memberships, achievements, posts] = await Promise.all([
    EventRegistration.countDocuments({ user: userId, status: 'REGISTERED' }),
    Attendance.find({ user: userId }).populate('event', 'title date category image').sort({ createdAt: -1 }),
    ClubMembership.countDocuments({ user: userId }),
    Achievement.find({ user: userId }).sort({ date: -1 }),
    DiscussionPost.countDocuments({ author: userId }),
  ]);

  const volunteerHours = achievements.reduce((sum, a) => sum + (a.hours || 0), 0);
  const attendedEvents = attendanceDocs.filter((a) => a.event).map((a) => a.event);

  const trend = exports.monthBuckets(6);
  attendedEvents.forEach((ev) => {
    const b = trend.find((t) => t.key === monthKey(ev.date));
    if (b) b.count += 1;
  });

  const stats = {
    eventsRegistered: registered,
    eventsAttended: attendedEvents.length,
    clubsJoined: memberships,
    achievements: achievements.length,
    volunteerHours,
    posts,
  };
  stats.engagementScore = exports.computeEngagement({
    attended: stats.eventsAttended,
    registered,
    clubs: memberships,
    achievements: achievements.length,
    posts,
    volunteerHours,
  });

  return {
    stats,
    level: exports.getLevel(stats.engagementScore),
    badges: exports.getBadges(stats),
    trend: trend.map(({ label, count }) => ({ month: label, attended: count })),
    attendedEvents,
    achievementList: achievements,
  };
};
