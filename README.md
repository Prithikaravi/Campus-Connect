CampusConnect – Server Documentation
A college community portal for students, clubs, faculty and admins. This document covers the backend (server/) added in the initial commit f296a7e (48 files, ~3,800 lines).
Tech stack: Node.js, Express, MongoDB (Mongoose), JWT authentication.
________________________________________
1. Project Structure
server/
├── server.js              # App entry point
├── seed.js                # Loads demo data
├── config/db.js           # MongoDB connection
├── controllers/           # Business logic (10 files)
├── routes/                # API route definitions (10 files)
├── models/                # Mongoose schemas (12 files)
├── middleware/            # auth.js, error.js
├── utils/                 # Helper functions (6 files)
├── .env.example           # Environment variable template
├── .gitignore             # node_modules, .env
└── package.json
Folder	Purpose
controllers/	Request handling: achievement, analytics, announcement, attendance, auth, club, discussion, event, notification, user
routes/	One route file per controller, mapped under /api/...
models/	Achievement, Announcement, Attendance, Club, ClubMembership, Comment, DiscussionPost, Event, EventRegistration, Feedback, Notification, User
middleware/	auth.js (JWT + role checks), error.js (central error handler)
utils/	asyncHandler, escapeRegex, fail, generateToken, notify, stats
________________________________________
2. Setup & Run
cd server
npm install
copy .env.example .env      # then edit MONGO_URI and JWT_SECRET
npm run seed                # loads demo data
npm run dev                 # API runs on http://localhost:5000
Environment variables (.env)
Variable	Description	Example
PORT	Server port	5000
MONGO_URI	MongoDB connection string (local or Atlas)	mongodb://127.0.0.1:27017/campusconnect
JWT_SECRET	Secret used to sign tokens	long random string
JWT_EXPIRES_IN	Token validity	7d
CLIENT_URL	Frontend URL (CORS)	http://localhost:5173
Never commit your real .env – it is already in .gitignore.
Database connection (config/db.js)
Exits with an error if MONGO_URI is missing; otherwise connects with Mongoose and logs the host. Any connection failure stops the server.
________________________________________
3. User Roles & Demo Accounts
Four roles: ADMIN, FACULTY, CLUB, STUDENT. Password for all demo accounts: Demo@1234
Role	Email
ADMIN	admin@campusconnect.demo

FACULTY	faculty@campusconnect.demo

CLUB	club@campusconnect.demo

STUDENT	student@campusconnect.demo

________________________________________
4. API Conventions
•	Auth response: { token, user }
•	Errors (status ≥ 400): { message }
•	Lists return plain arrays, except:
•	Users list → { users, total, page, pages }
•	Notifications → { notifications, unreadCount }
•	Send the token as Authorization: Bearer <token> for protected routes.
Legend: P = public, A = any logged-in user, otherwise roles are listed.
________________________________________
5. API Endpoints
Auth
Method	Endpoint	Access
POST	/api/auth/register	P
POST	/api/auth/login	P
GET	/api/auth/me	A
Users
Method	Endpoint	Access
GET / PUT	/api/users/me	A
PUT	/api/users/me/password	A
GET	/api/users	ADMIN, FACULTY
GET	/api/users/:id	Self / ADMIN / FACULTY
PUT	/api/users/:id/role	ADMIN
PATCH	/api/users/:id/status	ADMIN
DELETE	/api/users/:id	ADMIN
Events
Method	Endpoint	Access
GET	/api/events?q=&category=&status=&club=&upcoming=true&mine=true	P
GET	/api/events/:id	P
GET	/api/events/registered/me	A
POST	/api/events	FACULTY, CLUB, ADMIN
PUT / DELETE	/api/events/:id	Organizer / ADMIN
POST / DELETE	/api/events/:id/register	STUDENT, FACULTY (register)
GET	/api/events/:id/registrations	Organizer / ADMIN / FACULTY
POST	/api/events/:id/remind	Organizer
POST / GET	/api/events/:id/feedback	Submit / view feedback
Attendance
Method	Endpoint	Access
GET	/api/attendance/:eventId	Logged in
POST	/api/attendance/:eventId — body { userIds: [] }	FACULTY, CLUB, ADMIN
DELETE	/api/attendance/:eventId/:userId	FACULTY, CLUB, ADMIN
GET	/api/attendance/me/history	A
Clubs
Method	Endpoint	Access
GET	/api/clubs?q=&category=	P
GET	/api/clubs/:id	P
GET	/api/clubs/joined/me	A
POST	/api/clubs	CLUB, FACULTY, ADMIN
PUT / DELETE	/api/clubs/:id	Club owner / ADMIN
POST	/api/clubs/:id/join	A
DELETE	/api/clubs/:id/leave	A
GET	/api/clubs/:id/members	A
PUT / DELETE	/api/clubs/:id/members/:userId	Club managers
POST	/api/clubs/:id/invite — body { email }	Club managers
POST / DELETE	/api/clubs/:id/activities[/:activityId]	Club managers
GET	/api/clubs/:id/analytics	Club managers
Announcements
Method	Endpoint	Access
GET	/api/announcements?q=&priority=	A (filtered by audience)
POST / PUT / DELETE	/api/announcements[/:id]	FACULTY, CLUB, ADMIN
Notifications
Method	Endpoint
GET	/api/notifications
GET	/api/notifications/unread-count
PUT	/api/notifications/read-all
PUT	/api/notifications/:id/read
DELETE	/api/notifications/:id
Discussions
Method	Endpoint
GET	/api/discussions?q=&category=&sort=popular
POST	/api/discussions
GET / PUT / DELETE	/api/discussions/:id
POST	/api/discussions/:id/like
POST	/api/discussions/:id/report
GET / POST	/api/discussions/:id/comments
DELETE	/api/discussions/comments/:commentId
Achievements (Growth Passport)
Method	Endpoint	Access
GET	/api/achievements?type=	A (own achievements)
POST	/api/achievements	A
PUT / DELETE	/api/achievements/:id	Owner / ADMIN
GET	/api/achievements/user/:userId	FACULTY, ADMIN
Analytics
Method	Endpoint	Access
GET	/api/analytics/dashboard	STUDENT dashboard in one call
GET	/api/analytics/student	A
GET	/api/analytics/passport?userId=	Self; FACULTY/ADMIN for any student
GET	/api/analytics/faculty	FACULTY, ADMIN
GET	/api/analytics/admin	ADMIN
GET	/api/analytics/registrations	ADMIN, FACULTY
GET	/api/analytics/attendance	ADMIN, FACULTY
________________________________________
6. Feature Details
6.1 Achievements
•	Create: requires title; optional description, type, organization, date, hours, certificateUrl. hours defaults to 0.
•	A notification "Achievement earned 🏆" is sent to the user on creation, linking to /passport.
•	Update / delete: only the owner or an ADMIN (otherwise 403 Access denied); missing record → 404.
6.2 Analytics
•	Student dashboard – one request returns: user, stats, level, trend, earned badges, latest 4 achievements, next 5 registered events, joined clubs, 6 upcoming events, 4 announcements (Everyone / Students / own Department), 5 latest notifications and the unread count.
•	Growth Passport – student profile, stats, level, badges, trend, clubs and club activity count, achievements, certificates, achievement breakdown by type, attended events, and a timeline of the 12 most recent items (events attended, achievements, clubs joined).
•	Faculty analytics – total/upcoming events, registrations, attendance, attendance rate (%), per-event registrations vs attendance (last 8 events), and top 5 students by attendance. Faculty see only their own events; ADMIN sees all.
•	Admin analytics – totals (students, faculty, clubs, events, registrations, attendance, weekly active users, discussion posts), attendance rate, top 5 events and clubs, events by category, students by department, and a 6-month registration trend.
•	Registrations / attendance lists – latest 200 records with user and event details.
6.3 Notifications
Created through the notify utility (used e.g. when an achievement is added) and surfaced via /api/notifications, including an unread counter.
________________________________________
7. Suggested Next Steps
•	Connect the React frontend (CLIENT_URL = http://localhost:5173) to these endpoints.
•	Add automated API tests and request validation.
•	Rename .env copy.example to .env.example (the commit file name includes "copy", but the README expects .env.example).

