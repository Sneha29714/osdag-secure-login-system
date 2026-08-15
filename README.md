# Secure Login System

This project implements a secure login system in two different ways:

* **Custom backend:** Node.js + Express + PostgreSQL
* **Managed backend:** Appwrite

The same `index.html` testing client provided with the task is used for the implementations. I did not create a separate UI since the task focuses mainly on authentication, authorization, and file access.

---

## Project Structure

```text
osdag-secure-login-system/
│
├── appwrite/
│   ├── index.html
│   ├── appwrite-adapter.js
│   ├── mock-api.js
│   └── seed-data.json
│
├── custom-backend/
│   ├── index.js
│   ├── db.js
│   ├── package.json
│   ├── package-lock.json
│   └── ...
│
├── README.md
└── .gitignore
```

The `mock-api.js` and `seed-data.json` files were provided with the task as sample files. They are not used as the actual backend implementation.

---

# Custom Backend

The custom backend is built using:

* Node.js
* Express.js
* PostgreSQL
* Express sessions
* PostgreSQL session store
* Password hashing
* HTTP-only cookies
* Login rate limiting

It supports:

* Registration
* Login
* Logout
* Viewing the logged-in user's profile
* Listing the user's files
* Accessing a particular file
* Preventing access to another user's files

---

## Authentication

For the custom backend, I decided to use **server-side sessions instead of JWTs**.

After login, the server creates a session for the user. The session ID is sent to the browser in an HTTP-only cookie. On every protected request, the server checks the session and gets the user ID from it.

The basic flow is:

```text
Login
  ↓
Check email + password
  ↓
Create session
  ↓
Send session cookie
  ↓
Protected request
  ↓
Check session
  ↓
Identify logged-in user
```

### Why I chose sessions

I chose sessions mainly because this application is browser-based and I wanted the server to have direct control over the authentication state.

One advantage is that logout is simple: I can destroy the session on the server and immediately invalidate it.

With JWTs, the server normally does not keep the token state, so handling immediate logout/revocation needs additional logic such as short token expiry, refresh tokens, or a blacklist.

JWT would still be a good choice for a stateless API or a system with multiple independent clients, but for this project I found server-side sessions simpler and more appropriate.

---

# Logout

Logout is not implemented by just deleting the cookie on the client.

When `/logout` is called, the server destroys the current session and then clears the authentication cookie.

```text
POST /logout
     ↓
Destroy server-side session
     ↓
Clear authentication cookie
     ↓
User is logged out
```

So even if an old session ID were available, the server would no longer consider that session authenticated.

---

# User Profile

The custom backend has a protected `/me` route.

The important part here is that the user ID comes from the authenticated session, not from a user ID supplied by the client.

For example:

```text
Request
   ↓
Session
   ↓
Authenticated user ID
   ↓
Database query
   ↓
Current user's profile
```

This means a user cannot simply change an ID in the request to retrieve somebody else's profile.

---

# File Access

Each test user has files associated with their account.

The custom backend provides:

```text
GET /files
GET /files/:id
```

`GET /files` returns only the files belonging to the currently logged-in user.

For a single file, the server also checks ownership.

The important idea is that I don't only check whether a file exists. I check whether it belongs to the authenticated user.

Conceptually, the database query is:

```sql
SELECT *
FROM files
WHERE id = $1
AND user_id = $2;
```

Here `$2` comes from the authenticated session.

So if User A tries to access a file belonging to User B, the ownership check fails and the request is rejected.

---

# Password Security

Passwords are never stored as plaintext.

During registration, the password is hashed before being stored in PostgreSQL.

During login, the supplied password is compared with the stored hash.

I also added login rate limiting so that repeated failed login attempts cannot be made without restriction.

Failed logins use a generic error message rather than revealing whether a particular email address is registered.

For example, the application does not tell the user:

```text
This email does not exist
```

instead of:

```text
Wrong password
```

Both cases result in a generic authentication failure.

---

# Appwrite Implementation

The second implementation uses Appwrite instead of my own authentication and storage backend.

The Appwrite-related code is inside:

```text
appwrite/
```

The provided `index.html` is used as the testing client, and `appwrite-adapter.js` connects the client to Appwrite.

---

## What Appwrite Handles

Appwrite provides most of the backend infrastructure required for this implementation.

For example:

* User registration
* Password authentication
* Session management
* Authentication APIs
* File storage
* File access APIs
* Storage permissions

This means I don't need to implement password storage, session storage, or the actual file-storage system from scratch for the Appwrite version.

---

## What I Configured / Implemented

I still had to configure and connect the application to Appwrite.

This includes:

* Appwrite project configuration
* Authentication configuration
* Storage bucket configuration
* Storage permissions
* Appwrite client setup
* Authentication flow in the testing client
* File access logic
* Connecting the frontend to Appwrite APIs
* Setting up the test users and files

So the main difference is that the custom version implements these backend services myself, while the Appwrite version uses Appwrite's managed services.

---

# Mock Files Provided With the Task

The task includes:

```text
mock-api.js
seed-data.json
```

These were useful for understanding the expected client-side behavior and API structure.

However, they are **not used as the actual backend**.

The actual implementations are:

```text
custom-backend/
```

and:

```text
appwrite/
```

The Appwrite implementation communicates with the actual Appwrite services.

---

# Test Users

I have seeded at least three separate users.

Each user has:

* Their own account
* Their own profile
* Their own files

Example:

```text
User 1 → Profile + Files
User 2 → Profile + Files
User 3 → Profile + Files
```

### Test credentials

```text
User 1
Email: <email>
Password: <password>

User 2
Email: <email>
Password: <password>

User 3
Email: <email>
Password: <password>
```

These credentials are only for testing/evaluation.

For the custom backend, the seed script can be used to create the test data.

```bash
npm run seed
```

The exact seed command should be replaced above if the implementation uses a different command.

---

# Setup

## Requirements

For the custom backend:

* Node.js
* npm
* PostgreSQL

For the Appwrite version:

* An Appwrite project
* Appwrite Authentication
* An Appwrite Storage bucket

---

## Custom Backend

Clone the repository:

```bash
git clone <REPOSITORY_URL>
cd osdag-secure-login-system
```

Go to the backend:

```bash
cd custom-backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using `.env.example`.

Example:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
```

Then run the project:

```bash
npm run dev
```

To create the test users and files:

```bash
npm run seed
```

---

## Appwrite

Go to the Appwrite implementation:

```bash
cd appwrite
```

Configure the Appwrite project and storage bucket with the required IDs and permissions.

Then serve the provided `index.html` using a local web server.

For example:

```bash
npx serve .
```

The Appwrite configuration should contain only the required client-side configuration. Private secrets should not be committed to the repository.

---

# Testing User Isolation

One of the main things I tested is whether one user can access another user's data.

For example:

### User A

Login as User A and call:

```text
GET /me
```

The response should contain User A's profile.

Then:

```text
GET /files
```

should return only User A's files.

If User A tries to request a file that belongs to User B:

```text
GET /files/<user-B-file-id>
```

the request should be rejected.

The same idea applies to the Appwrite implementation.

---

# Main Security Checks

The following security checks are included:

* Passwords are hashed.
* Passwords are not stored in plaintext.
* Login errors are generic.
* Login attempts are rate limited.
* Protected routes require a valid authenticated session.
* Logout invalidates the session on the server.
* `/me` uses the authenticated user rather than a user ID supplied by the client.
* File queries check ownership.
* Users cannot access another user's files.
* Secrets are kept in environment variables.
* `.env` is excluded from Git.

---

# JWT vs Sessions

I considered both JWT and session-based authentication.

|                                     | Session | JWT                     |
| ----------------------------------- | ------- | ----------------------- |
| Server stores authentication state  | Yes     | No                      |
| Easy server-side logout             | Yes     | Not by itself           |
| Stateless                           | No      | Yes                     |
| Good for this browser-based project | Yes     | Yes                     |
| Revocation                          | Simple  | Requires extra handling |

I chose sessions because they made the logout and authorization flow easier to control on the server.

If this project were a larger stateless API used by several different clients, I would consider JWTs more seriously.

---

# What I Would Improve

If I had more time, I would mainly focus on testing and production readiness.

Some things I would improve are:

* Add more automated tests for authentication.
* Add more tests specifically for cross-user file access.
* Add tests for session invalidation after logout.
* Add stronger request validation.
* Improve error handling.
* Add more detailed logging for security-related events.
* Add more Appwrite integration tests.
* Improve the file download/access handling.
* Add proper HTTPS and secure-cookie configuration for production.
* Add deployment documentation.

---

# Repository

GitHub:

`<REPOSITORY_URL>`

The two implementations are kept separately:

```text
appwrite/
custom-backend/
```

This makes it easier to compare the custom authentication/session approach with the managed Appwrite approach.
