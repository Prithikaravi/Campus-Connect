# CampusConnect Server

## Setup
```
cd server
npm install
copy .env.example .env      (then edit .env: MONGO_URI and JWT_SECRET)
npm run seed                (loads demo data)
npm run dev                 (API on http://localhost:5000)
```

## Demo accounts (password for all: `Demo@1234`)
| Role    | Email                          |
|---------|--------------------------------|
| ADMIN   | admin@campusconnect.demo       |
| FACULTY | faculty@campusconnect.demo     |
| CLUB    | club@campusconnect.demo        |
| STUDENT | student@campusconnect.demo     |

## Response format
- Auth: `{ token, user }`
- Errors (any status >= 400): `{ message }`
- Lists return plain arrays; users list returns `{ users, total, page, pages }`; notifications return `{ notifications, unreadCount }`

## API endpoints
(P = public, A = any logged-in user, or roles listed)

**Auth** — `POST /api/auth/register` (P) · `POST /api/auth/login` (P) · `GET /api/auth/me` (A)

**Users** — `GET /api/users/me` · `PUT /api/users/me` · `PUT /api/users/me/password` · `GET /api/users` (ADMIN, FACULTY) · `GET /api/users/:id` (self/ADMIN/FACULTY) · `PUT /api/users/:id/role` (ADMIN) · `PATCH /api/users/:id/status` (ADMIN) · `DELETE /api/users/:id` (ADMIN)

**Events** — `GET /api/events?q=&category=&status=&club=&upcoming=true&mine=true` (P) · `GET /api/events/:id` (P) · `GET /api/events/registered/me` · `POST /api/events` (FACULTY, CLUB, ADMIN) · `PUT /api/events/:id` · `DELETE /api/events/:id` · `POST /api/events/:id/register` (STUDENT, FACULTY) · `DELETE /api/events/:id/register` · `GET /api/events/:id/registrations` (organizer/ADMIN/FACULTY) · `POST /api/events/:id/remind` · `POST /api/events/:id/feedback` · `GET /api/events/:id/feedback`

**Attendance** — `GET /api/attendance/:eventId` · `POST /api/attendance/:eventId` `{userIds:[]}` · `DELETE /api/attendance/:eventId/:userId` (FACULTY, CLUB, ADMIN) · `GET /api/attendance/me/history`

**Clubs** — `GET /api/clubs?q=&category=` (P) · `GET /api/clubs/:id` (P) · `GET /api/clubs/joined/me` · `POST /api/clubs` (CLUB, FACULTY, ADMIN) · `PUT /api/clubs/:id` · `DELETE /api/clubs/:id` · `POST /api/clubs/:id/join` · `DELETE /api/clubs/:id/leave` · `GET /api/clubs/:id/members` · `PUT|DELETE /api/clubs/:id/members/:userId` · `POST /api/clubs/:id/invite` `{email}` · `POST /api/clubs/:id/activities` · `DELETE /api/clubs/:id/activities/:activityId` · `GET /api/clubs/:id/analytics`

**Announcements** — `GET /api/announcements?q=&priority=` (audience-filtered) · `POST` · `PUT /:id` · `DELETE /:id` (FACULTY, CLUB, ADMIN)

**Notifications** — `GET /api/notifications` · `GET /api/notifications/unread-count` · `PUT /api/notifications/read-all` · `PUT /api/notifications/:id/read` · `DELETE /api/notifications/:id`

**Discussions** — `GET /api/discussions?q=&category=&sort=popular` · `POST` · `GET|PUT|DELETE /:id` · `POST /:id/like` · `POST /:id/report` · `GET|POST /:id/comments` · `DELETE /api/discussions/comments/:commentId`

**Achievements** — `GET /api/achievements?type=` · `POST` · `PUT /:id` · `DELETE /:id` · `GET /api/achievements/user/:userId` (FACULTY, ADMIN)

**Analytics** — `GET /api/analytics/dashboard` (student dashboard in one call) · `/student` · `/passport?userId=` · `/faculty` (FACULTY, ADMIN) · `/admin` (ADMIN) · `/registrations` · `/attendance` (ADMIN, FACULTY)
