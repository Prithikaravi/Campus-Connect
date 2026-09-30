require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const Club = require('./models/Club');
const ClubMembership = require('./models/ClubMembership');
const Event = require('./models/Event');
const EventRegistration = require('./models/EventRegistration');
const Attendance = require('./models/Attendance');
const Feedback = require('./models/Feedback');
const Announcement = require('./models/Announcement');
const Notification = require('./models/Notification');
const DiscussionPost = require('./models/DiscussionPost');
const Comment = require('./models/Comment');
const Achievement = require('./models/Achievement');

// Demo password for ALL seeded accounts (not a real password)
const DEMO_PASSWORD = 'Demo@1234';

const day = 86400000;
const daysFromNow = (n) => new Date(Date.now() + n * day);
const img = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;
const IMG = {
  hackathon: img('photo-1504384308090-c894fdcc538d'),
  workshop: img('photo-1517048676732-d65bc937f952'),
  conference: img('photo-1540575467063-178a50c2df87'),
  crowd: img('photo-1511578314322-379afb476865'),
  students: img('photo-1522202176988-66273c2fd55f'),
  classroom: img('photo-1523580494863-6f3031224c94'),
  sports: img('photo-1461896836934-ffe607ba8211'),
  robotics: img('photo-1485827404703-89b55fcc595e'),
  camera: img('photo-1452587925148-ce544e77e70d'),
  music: img('photo-1514525253161-7a46d19cd819'),
  volunteer: img('photo-1559027615-cd4628902d4a'),
  code: img('photo-1555066931-4365d14bab8c'),
};

const run = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing in .env');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing old data...');
  await Promise.all([
    User, Club, ClubMembership, Event, EventRegistration, Attendance, Feedback,
    Announcement, Notification, DiscussionPost, Comment, Achievement,
  ].map((m) => m.deleteMany({})));

  // ---------- USERS ----------
  const mk = (name, email, role, extra = {}) => ({ name, email, password: DEMO_PASSWORD, role, ...extra });
  const [admin, faculty, faculty2, clubCoding, clubRobotics, clubCultural, demoStudent] = await User.create([
    mk('Campus Admin', 'admin@campusconnect.demo', 'ADMIN', { department: 'Administration' }),
    mk('Dr. Priya Raman', 'faculty@campusconnect.demo', 'FACULTY', { department: 'CSE', phone: '9876500001' }),
    mk('Prof. Arun Kumar', 'arun.faculty@campusconnect.demo', 'FACULTY', { department: 'ECE', phone: '9876500002' }),
    mk('Coding Club', 'club@campusconnect.demo', 'CLUB', { department: 'CSE' }),
    mk('Robotics Club', 'robotics@campusconnect.demo', 'CLUB', { department: 'ECE' }),
    mk('Cultural Club', 'cultural@campusconnect.demo', 'CLUB', { department: 'Arts' }),
    mk('Demo Student', 'student@campusconnect.demo', 'STUDENT', {
      department: 'CSE', year: 3, section: 'A', phone: '9876543210',
      skills: ['React', 'Node.js', 'MongoDB', 'Python'], interests: ['Web Development', 'AI', 'Robotics'],
      bio: 'Curious CSE student who loves building things and joining campus activities.',
    }),
  ]);

  const studentData = [
    ['Aarav Sharma', 'CSE', 3, 'A'], ['Diya Nair', 'CSE', 2, 'B'], ['Rohan Iyer', 'ECE', 3, 'A'],
    ['Sneha Reddy', 'IT', 4, 'A'], ['Karthik Menon', 'MECH', 2, 'C'], ['Ananya Das', 'CSE', 1, 'A'],
    ['Vikram Singh', 'EEE', 3, 'B'], ['Meera Pillai', 'IT', 2, 'A'], ['Arjun Patel', 'ECE', 4, 'B'],
  ];
  const otherStudents = await User.create(
    studentData.map(([name, department, year, section], i) =>
      mk(name, `${name.split(' ')[0].toLowerCase()}@campusconnect.demo`, 'STUDENT', {
        department, year, section, skills: ['Teamwork', 'Communication'], phone: `98765${10000 + i}`,
      })
    )
  );
  const students = [demoStudent, ...otherStudents];

  // ---------- CLUBS ----------
  const clubs = await Club.create([
    { name: 'Coding Club', category: 'Technical', owner: clubCoding._id, facultyCoordinator: faculty._id, studentCoordinator: otherStudents[0]._id,
      description: 'Learn, build and ship. We run hackathons, coding contests and hands-on workshops on web, app and AI development.',
      logo: IMG.code, coverImage: IMG.hackathon,
      activities: [{ title: 'Weekly DSA practice', description: 'Every Saturday problem-solving session', volunteerHours: 0 }, { title: 'Open-source Sunday', description: 'First contributions to open-source projects', volunteerHours: 2 }] },
    { name: 'Robotics Club', category: 'Technical', owner: clubRobotics._id, facultyCoordinator: faculty2._id, studentCoordinator: otherStudents[2]._id,
      description: 'From line followers to autonomous bots. Join us to build robots and compete in national robotics events.',
      logo: IMG.robotics, coverImage: IMG.robotics, activities: [{ title: 'Line follower build night', description: 'Team build sessions', volunteerHours: 0 }] },
    { name: 'Cultural Club', category: 'Cultural', owner: clubCultural._id, facultyCoordinator: faculty2._id,
      description: 'Music, dance, drama and art. We organise the annual cultural fest and celebrate campus talent all year.',
      logo: IMG.music, coverImage: IMG.crowd, activities: [{ title: 'Open mic evening', description: 'Monthly stage for new talent', volunteerHours: 0 }] },
    { name: 'Sports Club', category: 'Sports', owner: faculty2._id, facultyCoordinator: faculty2._id,
      description: 'Inter-department tournaments, fitness drives and coaching camps for cricket, football, basketball and athletics.',
      logo: IMG.sports, coverImage: IMG.sports, activities: [] },
    { name: 'Photography Club', category: 'Arts', owner: faculty._id, facultyCoordinator: faculty._id, studentCoordinator: otherStudents[5]._id,
      description: 'Capture campus life. Photo walks, editing workshops and exhibitions for every skill level.',
      logo: IMG.camera, coverImage: IMG.camera, activities: [{ title: 'Sunrise photo walk', description: 'Golden hour campus shoot', volunteerHours: 0 }] },
    { name: 'NSS Volunteers', category: 'Social Service', owner: faculty._id, facultyCoordinator: faculty._id,
      description: 'Give back to the community: blood donation camps, cleanliness drives and teaching programmes for local schools.',
      logo: IMG.volunteer, coverImage: IMG.volunteer, activities: [{ title: 'Village teaching programme', description: 'Weekend classes for school kids', volunteerHours: 4 }] },
  ]);
  const [coding, robotics, cultural, sports, photo, nss] = clubs;
  clubCoding.club = coding._id; clubRobotics.club = robotics._id; clubCultural.club = cultural._id;
  await Promise.all([clubCoding.save(), clubRobotics.save(), clubCultural.save()]);

  // memberships
  const membershipPairs = [];
  students.forEach((s, i) => {
    membershipPairs.push([coding, s]);
    if (i % 2 === 0) membershipPairs.push([robotics, s]);
    if (i % 3 === 0) membershipPairs.push([cultural, s]);
    if (i % 3 === 1) membershipPairs.push([sports, s]);
    if (i % 4 === 0) membershipPairs.push([nss, s]);
    if (i % 5 === 2) membershipPairs.push([photo, s]);
  });
  await ClubMembership.insertMany(membershipPairs.map(([c, s]) => ({ club: c._id, user: s._id, role: 'MEMBER' })));
  for (const c of clubs) {
    await Club.updateOne({ _id: c._id }, { memberCount: await ClubMembership.countDocuments({ club: c._id }) });
  }

  // ---------- EVENTS ----------
  const ev = (o) => ({ time: '10:00 AM', status: 'UPCOMING', registrationDeadline: o.date, ...o });
  const events = await Event.create([
    ev({ title: 'National Hackathon 2026', category: 'Hackathon', date: daysFromNow(12), time: '9:00 AM', venue: 'Innovation Hub, Main Block', capacity: 120, club: coding._id, organizer: clubCoding._id, image: IMG.hackathon,
      description: '24-hour hackathon to build real solutions for campus and community problems. Teams of 3-5. Mentors, food and prizes worth ₹50,000 included.' }),
    ev({ title: 'Full-Stack Workshop: React + Node', category: 'Workshop', date: daysFromNow(5), time: '2:00 PM', venue: 'Computer Lab 3', capacity: 60, club: coding._id, organizer: clubCoding._id, image: IMG.workshop,
      description: 'Hands-on session covering React, Express and MongoDB. Build and deploy a mini project in one afternoon. Bring your laptop.' }),
    ev({ title: 'RoboRace: Line Follower Challenge', category: 'Competition', date: daysFromNow(18), time: '11:00 AM', venue: 'Robotics Arena', capacity: 40, club: robotics._id, organizer: clubRobotics._id, image: IMG.robotics,
      description: 'Build a line-following robot and race it through a tricky track. Teams of up to 3. Judged on speed and accuracy.' }),
    ev({ title: 'Inter-Department Cricket Tournament', category: 'Sports', date: daysFromNow(9), time: '8:00 AM', venue: 'College Ground', capacity: 200, club: sports._id, organizer: faculty2._id, image: IMG.sports,
      description: 'Department vs department knockout cricket tournament. Register your team and represent your department.' }),
    ev({ title: 'Rhythm 2026 – Annual Cultural Fest', category: 'Cultural', date: daysFromNow(25), time: '5:00 PM', venue: 'Open Air Auditorium', capacity: 500, club: cultural._id, organizer: clubCultural._id, image: IMG.music,
      description: 'Music, dance, drama and more. Three days of performances, food stalls and celebrity guest nights.' }),
    ev({ title: 'Campus Frames: Photo Walk', category: 'Workshop', date: daysFromNow(3), time: '6:30 AM', venue: 'Main Gate', capacity: 30, club: photo._id, organizer: faculty._id, image: IMG.camera,
      description: 'Sunrise photo walk around campus with tips on composition and light from senior photographers.' }),
    ev({ title: 'Blood Donation & Cleanliness Drive', category: 'Volunteering', date: daysFromNow(7), time: '9:30 AM', venue: 'Health Centre & Campus', capacity: 100, club: nss._id, organizer: faculty._id, image: IMG.volunteer,
      description: 'Donate blood, help clean the campus and earn volunteer hours for your Growth Passport.' }),
    ev({ title: 'AI in Industry – Expert Seminar', category: 'Seminar', date: daysFromNow(15), time: '3:00 PM', venue: 'Seminar Hall A', capacity: 150, organizer: faculty._id, image: IMG.conference,
      description: 'Industry experts discuss how AI is changing careers, with a live Q&A on skills and internships.' }),
    ev({ title: 'Cyber Security CTF Lab', category: 'Technical', date: daysFromNow(6), time: '1:00 PM', venue: 'Network Lab', capacity: 3, club: coding._id, organizer: clubCoding._id, image: IMG.code,
      description: 'Limited-seat capture-the-flag lab. Only 3 seats – register fast!' }),
    // past events
    ev({ title: 'Intro to Git & GitHub', category: 'Workshop', date: daysFromNow(-10), status: 'COMPLETED', venue: 'Computer Lab 1', capacity: 80, club: coding._id, organizer: clubCoding._id, image: IMG.workshop,
      description: 'Version control basics, branching and pull requests for beginners.' }),
    ev({ title: 'Robotics Basics Bootcamp', category: 'Workshop', date: daysFromNow(-20), status: 'COMPLETED', venue: 'Robotics Arena', capacity: 50, club: robotics._id, organizer: clubRobotics._id, image: IMG.robotics,
      description: 'Sensors, motors and microcontrollers – build your first robot.' }),
    ev({ title: 'Tech Quiz Bowl', category: 'Competition', date: daysFromNow(-5), status: 'COMPLETED', venue: 'Seminar Hall B', capacity: 100, club: coding._id, organizer: clubCoding._id, image: IMG.students,
      description: 'Team quiz on technology, programming and general science.' }),
    ev({ title: 'Annual Sports Day', category: 'Sports', date: daysFromNow(-30), status: 'COMPLETED', venue: 'College Ground', capacity: 300, club: sports._id, organizer: faculty2._id, image: IMG.sports,
      description: 'Track and field events, relay races and team games.' }),
  ]);
  const byTitle = (t) => events.find((e) => e.title.startsWith(t));
  const ctf = byTitle('Cyber Security CTF');
  const past = events.filter((e) => e.status === 'COMPLETED');

  // ---------- REGISTRATIONS + ATTENDANCE + FEEDBACK ----------
  const regs = [];
  const demoUpcoming = ['National Hackathon', 'Full-Stack Workshop', 'Campus Frames', 'Blood Donation'].map(byTitle);
  const demoPast = ['Intro to Git', 'Robotics Basics', 'Tech Quiz'].map(byTitle);
  [...demoUpcoming, ...demoPast].forEach((e) => regs.push({ event: e._id, user: demoStudent._id }));

  otherStudents.forEach((s, i) => {
    events.forEach((e, j) => {
      if (e._id.equals(ctf._id)) return;
      if ((i * 7 + j * 3) % 4 !== 0) regs.push({ event: e._id, user: s._id });
    });
  });
  otherStudents.slice(0, 3).forEach((s) => regs.push({ event: ctf._id, user: s._id })); // CTF is full

  const uniq = new Map();
  regs.forEach((r) => uniq.set(`${r.event}-${r.user}`, r));
  await EventRegistration.insertMany([...uniq.values()]);

  // capacity safety: trim not needed (capacities > registrations except CTF exactly 3)
  const attendance = [];
  const feedback = [];
  const pastIds = new Set(past.map((e) => String(e._id)));
  [...uniq.values()].filter((r) => pastIds.has(String(r.event))).forEach((r, idx) => {
    const isDemo = String(r.user) === String(demoStudent._id);
    if (isDemo || idx % 3 !== 0) {
      attendance.push({ event: r.event, user: r.user, markedBy: faculty._id });
      if (isDemo || idx % 2 === 0) feedback.push({ event: r.event, user: r.user, rating: isDemo ? 5 - (idx % 2) : 3 + (idx % 3), comment: ['Really well organised!', 'Learned a lot, loved the hands-on part.', 'Great speakers and atmosphere.'][idx % 3] });
    }
  });
  await Attendance.insertMany(attendance);
  await Feedback.insertMany(feedback);
  for (const e of events) {
    await Event.updateOne({ _id: e._id }, { registeredCount: await EventRegistration.countDocuments({ event: e._id, status: 'REGISTERED' }) });
  }

  // ---------- ACHIEVEMENTS ----------
  await Achievement.create([
    { user: demoStudent._id, title: 'Smart India Hackathon – College Finalist', type: 'Hackathon', organization: 'Govt. of India', date: daysFromNow(-90), description: 'Built a smart attendance solution as a team of 6.' },
    { user: demoStudent._id, title: 'MongoDB Associate Developer Certification', type: 'Certification', organization: 'MongoDB University', date: daysFromNow(-60), certificateUrl: 'https://learn.mongodb.com/' },
    { user: demoStudent._id, title: 'Inter-college Football – Runners Up', type: 'Sports', organization: 'City University League', date: daysFromNow(-120) },
    { user: demoStudent._id, title: 'NSS Blood Donation Camp Volunteer', type: 'Volunteering', organization: 'NSS Volunteers', date: daysFromNow(-45), hours: 12, description: 'Helped manage registration and donor care.' },
    { user: demoStudent._id, title: "Dean's List 2025", type: 'Academic', organization: 'College', date: daysFromNow(-200) },
    { user: otherStudents[0]._id, title: 'Google Cloud Study Jams Completion', type: 'Certification', organization: 'Google', date: daysFromNow(-30) },
    { user: otherStudents[1]._id, title: 'Best Dancer – Cultural Fest 2025', type: 'Cultural', organization: 'College', date: daysFromNow(-150) },
    { user: otherStudents[2]._id, title: 'Robotics Nationals – Top 10', type: 'Competition', organization: 'e-Yantra', date: daysFromNow(-70) },
  ]);

  // ---------- ANNOUNCEMENTS ----------
  const codingMembers = await ClubMembership.find({ club: coding._id });
  await Announcement.create([
    { title: 'Semester exam timetable released', content: 'The end-semester examination timetable is now available on the college portal. Please check your schedule and report clashes to your department office by Friday.', author: faculty._id, priority: 'HIGH', audience: { type: 'STUDENTS' } },
    { title: 'Welcome to CampusConnect!', content: 'Discover events, join clubs, track your achievements and build your Student Growth Passport – all in one place.', author: admin._id, priority: 'NORMAL', audience: { type: 'EVERYONE' }, image: IMG.students },
    { title: 'Hackathon registrations open', content: 'National Hackathon 2026 registrations are open for all students. Limited seats – register early from the Events page.', author: clubCoding._id, priority: 'HIGH', audience: { type: 'EVERYONE', club: coding._id } },
    { title: 'CSE department: guest lecture on Friday', content: 'A guest lecture on cloud architectures will be held for all CSE students in Seminar Hall A.', author: faculty._id, priority: 'NORMAL', audience: { type: 'DEPARTMENT', department: 'CSE' } },
    { title: 'Final-year project review schedule', content: 'Final-year students should submit their project abstracts before the review dates announced by the department.', author: faculty2._id, priority: 'URGENT', audience: { type: 'YEAR', year: 4 } },
    { title: 'Coding Club: weekly meetup moved', content: 'This week\'s Coding Club meetup is moved to Saturday, 4 PM in Computer Lab 3.', author: clubCoding._id, priority: 'LOW', audience: { type: 'CLUB_MEMBERS', club: coding._id } },
    { title: 'Faculty meeting – curriculum review', content: 'All faculty are requested to attend the curriculum review meeting in the conference room.', author: admin._id, priority: 'NORMAL', audience: { type: 'FACULTY' } },
  ]);

  // ---------- NOTIFICATIONS (demo student) ----------
  await Notification.create([
    { user: demoStudent._id, type: 'EVENT_REGISTRATION', title: 'Registration successful', message: 'You are registered for "National Hackathon 2026".', link: `/events/${byTitle('National Hackathon')._id}` },
    { user: demoStudent._id, type: 'ANNOUNCEMENT', title: 'New announcement: Semester exam timetable released', message: 'The end-semester examination timetable is now available.', link: '/announcements' },
    { user: demoStudent._id, type: 'ACHIEVEMENT', title: 'Achievement earned 🏆', message: '"MongoDB Associate Developer Certification" was added to your Growth Passport.', link: '/passport', read: true },
    { user: demoStudent._id, type: 'EVENT_REMINDER', title: 'Event reminder', message: 'Reminder: "Full-Stack Workshop: React + Node" is in 5 days at Computer Lab 3.', link: `/events/${byTitle('Full-Stack Workshop')._id}` },
    { user: demoStudent._id, type: 'CLUB_INVITE', title: 'Club invitation', message: 'You are invited to join Photography Club.', link: `/clubs/${photo._id}` },
    { user: demoStudent._id, type: 'ATTENDANCE', title: 'Attendance recorded', message: 'Your attendance for "Tech Quiz Bowl" was recorded.', link: '/passport', read: true },
  ]);

  // ---------- DISCUSSIONS ----------
  const posts = await DiscussionPost.create([
    { title: 'Best resources to prepare for placements?', category: 'Placements', author: otherStudents[3]._id, content: 'Final year here. What resources are you all using for aptitude and coding rounds? Sharing what worked for you would help everyone.', likes: [demoStudent._id, otherStudents[0]._id, otherStudents[1]._id] },
    { title: 'Looking for teammates for the National Hackathon', category: 'Events', author: demoStudent._id, content: 'I can handle the frontend (React). Looking for someone strong in backend and someone who enjoys UI design. Reply here!', likes: [otherStudents[0]._id, otherStudents[5]._id] },
    { title: 'Study group for Data Structures – semester 5', category: 'Academics', author: otherStudents[0]._id, content: 'Starting a weekly DSA study group in the library. Everyone is welcome, all levels.', likes: [demoStudent._id] },
    { title: 'Photography club photo walk was amazing 📸', category: 'Clubs', author: otherStudents[5]._id, content: 'Thanks to everyone who came for the sunrise walk. Will share the best shots this weekend!', likes: [] },
    { title: 'Library timings during exams?', category: 'Help', author: otherStudents[4]._id, content: 'Does anyone know if the library will stay open late during the exam week?', likes: [otherStudents[1]._id] },
  ]);
  const commentData = [
    [posts[0], otherStudents[1], 'I used a mix of LeetCode for coding and IndiaBix for aptitude. Consistency matters most!'],
    [posts[0], demoStudent, 'Mock interviews with friends helped me a lot too.'],
    [posts[1], otherStudents[0], 'I can do the backend – Node and MongoDB. DM me!'],
    [posts[1], otherStudents[5], 'I would love to help with the UI design.'],
    [posts[2], otherStudents[2], 'Count me in. Which day works?'],
    [posts[4], faculty, 'The library will remain open till 9 PM during exam week.'],
  ];
  await Comment.insertMany(commentData.map(([p, a, content]) => ({ post: p._id, author: a._id, content })));
  for (const p of posts) await DiscussionPost.updateOne({ _id: p._id }, { commentsCount: await Comment.countDocuments({ post: p._id }) });

  console.log('\n✅ Seed complete!\n');
  console.log('Demo accounts (password for all):', DEMO_PASSWORD);
  console.log('  ADMIN   : admin@campusconnect.demo');
  console.log('  FACULTY : faculty@campusconnect.demo');
  console.log('  CLUB    : club@campusconnect.demo   (Coding Club)');
  console.log('  STUDENT : student@campusconnect.demo\n');
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Seed failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
