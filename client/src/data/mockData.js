// ------------------------------------------------------------------
// MOCK DATA. Replace each export with an Axios call when the backend
// is ready (see the comment above each one).
// ------------------------------------------------------------------

export const clubCategories = ["Technical", "Cultural", "Sports", "Arts", "Entrepreneurship", "Social Service"];
export const eventCategories = ["Technical", "Cultural", "Sports", "Workshop", "Career"];

// GET /api/clubs
export const clubs = [
  { _id: "1", name: "Code Crafters", category: "Technical", members: 128, joined: true, coordinator: "Dr. Anitha Rao",
    description: "Weekly coding sessions, hackathons and open-source contributions for every skill level.",
    activities: ["Weekly coding circles", "Inter-college hackathons", "Open-source sprints"] },
  { _id: "2", name: "Rhythm & Beats", category: "Cultural", members: 84, joined: true, coordinator: "Prof. Karthik Menon",
    description: "Music, dance and performance club that runs the annual cultural fest.",
    activities: ["Open mic nights", "Dance workshops", "Annual cultural fest"] },
  { _id: "3", name: "Campus Strikers", category: "Sports", members: 96, joined: false, coordinator: "Mr. Suresh Kumar",
    description: "Inter-department tournaments, fitness sessions and coaching camps.",
    activities: ["Football and cricket leagues", "Morning fitness sessions", "Coaching camps"] },
  { _id: "4", name: "Canvas Collective", category: "Arts", members: 52, joined: false, coordinator: "Prof. Meera Nair",
    description: "A space for painting, sketching, photography and digital art.",
    activities: ["Art exhibitions", "Photo walks", "Digital art workshops"] },
  { _id: "5", name: "Venture Lab", category: "Entrepreneurship", members: 67, joined: true, coordinator: "Dr. Vivek Sharma",
    description: "Pitch practice, startup mentoring and founder talks for student entrepreneurs.",
    activities: ["Pitch nights", "Founder talks", "Startup mentoring"] },
  { _id: "6", name: "Helping Hands", category: "Social Service", members: 110, joined: false, coordinator: "Prof. Lakshmi Iyer",
    description: "Volunteering drives, blood donation camps and community outreach programs.",
    activities: ["Blood donation camps", "Village outreach", "Tree plantation drives"] },
];

// GET /api/events
export const events = [
  { _id: "1", title: "HackSprint 2026", category: "Technical", date: "2026-10-12", time: "09:00 AM", venue: "Main Auditorium",
    organizer: "Code Crafters", participants: 142, status: "Open", registered: true,
    description: "A 24-hour hackathon where teams build solutions for real campus problems. Mentors from industry will guide teams throughout." },
  { _id: "2", title: "Cultural Night", category: "Cultural", date: "2026-10-18", time: "06:00 PM", venue: "Open Air Theatre",
    organizer: "Rhythm & Beats", participants: 260, status: "Open", registered: false,
    description: "An evening of music, dance and drama performed by students across departments." },
  { _id: "3", title: "Inter-Department Football Cup", category: "Sports", date: "2026-10-22", time: "04:00 PM", venue: "College Ground",
    organizer: "Campus Strikers", participants: 96, status: "Filling fast", registered: false,
    description: "Knockout tournament between departments. Teams of 7, with a trophy and certificates for the top three." },
  { _id: "4", title: "Resume and LinkedIn Workshop", category: "Career", date: "2026-10-25", time: "11:00 AM", venue: "Seminar Hall B",
    organizer: "Placement Cell", participants: 75, status: "Open", registered: false,
    description: "Learn how to write a resume recruiters actually read and build a profile that gets noticed." },
  { _id: "5", title: "Startup Pitch Day", category: "Workshop", date: "2026-11-02", time: "10:00 AM", venue: "Innovation Hub",
    organizer: "Venture Lab", participants: 48, status: "Open", registered: false,
    description: "Pitch your idea to a panel of founders and investors and get feedback you can act on." },
  { _id: "6", title: "Intro to MongoDB Workshop", category: "Workshop", date: "2026-11-06", time: "02:00 PM", venue: "Computer Lab 3",
    organizer: "Code Crafters", participants: 60, status: "Closed", registered: false,
    description: "Hands-on session on documents, collections and aggregation pipelines. Bring your laptop." },
];

// GET /api/announcements
export const announcements = [
  { _id: "1", title: "Mid-semester exam timetable released", priority: "High", postedBy: "Examination Cell", date: "2026-09-27",
    description: "The timetable for mid-semester examinations is now available on the college portal. Check your dates and seating carefully." },
  { _id: "2", title: "Library timings extended during exams", priority: "Medium", postedBy: "Central Library", date: "2026-09-25",
    description: "The library will stay open until 9 PM on weekdays from 5 October to 20 October." },
  { _id: "3", title: "Applications open for Student Council", priority: "Medium", postedBy: "Student Affairs", date: "2026-09-22",
    description: "Interested students can apply for council positions until 10 October. Forms are available at the Student Affairs office." },
  { _id: "4", title: "Campus Wi-Fi maintenance on Sunday", priority: "Low", postedBy: "IT Department", date: "2026-09-20",
    description: "Wi-Fi will be unavailable from 2 AM to 6 AM this Sunday for scheduled maintenance." },
];

// GET /api/notifications (later: Socket.IO pushes new ones live)
export const notifications = [
  { _id: "1", type: "event", title: "New event: HackSprint 2026", message: "Code Crafters posted a new event.", time: "10 min ago", read: false },
  { _id: "2", type: "reminder", title: "Event reminder", message: "Cultural Night starts in 2 days.", time: "2 hours ago", read: false },
  { _id: "3", type: "club", title: "Code Crafters announcement", message: "Weekly coding circle moved to Thursday 5 PM.", time: "Yesterday", read: false },
  { _id: "4", type: "registration", title: "Registration confirmed", message: "You are registered for HackSprint 2026.", time: "2 days ago", read: true },
  { _id: "5", type: "campus", title: "Campus announcement", message: "Mid-semester exam timetable released.", time: "3 days ago", read: true },
];

// GET /api/users/me (student profile)
export const studentProfile = {
  department: "Computer Science and Engineering", year: "3rd Year",
  interests: ["Web development", "Cybersecurity", "Robotics", "Geopolitics"],
  skills: ["React", "Node.js", "MongoDB", "Python", "Git", "Public speaking"],
  achievements: ["Finalist, State Coding Contest 2026", "Winner, Tech Quiz 2025", "Volunteer of the Month, Aug 2026"],
  eventsAttended: [
    { title: "Intro to Cybersecurity", date: "2026-08-14" },
    { title: "Robotics Bootcamp", date: "2026-07-21" },
    { title: "Startup Pitch Day", date: "2026-06-30" },
  ],
};

// Student Growth Passport (later: computed by the backend)
export const growthPassport = {
  engagementScore: 78, clubs: 3, eventsAttended: 8, achievements: 5, skills: 6,
};

// GET /api/discussions
export const discussionCategories = ["All", "Academics", "Placements", "Events", "Clubs", "General"];
export const discussions = [
  { _id: "1", category: "Placements", title: "How are you preparing for aptitude rounds?", author: "Riya S.", date: "2026-09-28",
    body: "Looking for resources and a study routine that worked for you.",
    replies: [{ author: "Arjun P.", text: "Practice a set of timed problems daily. It helps a lot." }] },
  { _id: "2", category: "Events", title: "Looking for teammates for HackSprint", author: "Kabir M.", date: "2026-09-27",
    body: "I do backend with Node and MongoDB. Need a frontend and a designer.", replies: [] },
  { _id: "3", category: "Academics", title: "Best notes for Operating Systems?", author: "Sneha R.", date: "2026-09-25",
    body: "Any recommendations for concise notes before the mid-sem?",
    replies: [
      { author: "Dev K.", text: "The department drive has solved question papers." },
      { author: "Nisha T.", text: "Try the lecture slides plus previous year questions." },
    ] },
];