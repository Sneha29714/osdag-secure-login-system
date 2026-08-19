## Setup Instructions

### Prerequisites

Make sure the following are installed:

- Node.js (v18 or later recommended)
- PostgreSQL
- Git
- A web browser
- An Appwrite Cloud project

---

## 1. Clone the Repository

```bash
git clone https://github.com/Sneha29714/osdag-secure-login-system.git
cd osdag-secure-login-system
```

## 2. Custom Backend Setup

The Custom Backend uses Node.js, Express.js, PostgreSQL, and server-side sessions.

### Step 2.1: Create the PostgreSQL Database

Create a PostgreSQL database named:

`auth_system`

### Step 2.2: Create the Database Tables

The database schema is provided in:

`custom-backend/schema.sql`

Create a PostgreSQL database and execute `custom-backend/schema.sql` in its Query Tool.

### Step 2.3: Configure Environment Variables

Copy:

`custom-backend/.env.example`

to:

`custom-backend/.env`

Configure:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_system
DB_USER=postgres
DB_PASSWORD=your_postgres_password

SESSION_SECRET=replace_with_a_long_random_secret
```

### Step 2.4: Install Dependencies

```bash
cd custom-backend
npm install
```
### Step 2.5: Seed Test Users and Files

Run:
```bash
node seed.js
```

The seeded accounts are:
| User   | Email                    | Password    |
| ------ | ------------------------ | ----------- |
| User 1 | `fossee.test1@gmail.com` | `FOSSEE123` |
| User 2 | `fossee.test2@gmail.com` | `FOSSEE123` |
| User 3 | `fossee.test3@gmail.com` | `FOSSEE123` |

### Step 2.6: Start the Custom Backend

Run:
```bash
npm run dev
```
The Custom Backend runs at:

`http://127.0.0.1:3000`

---

## 3. Appwrite Backend Setup

The Appwrite implementation uses:

- Appwrite Authentication
- Appwrite TablesDB
- Appwrite Storage

### Step 3.1: Configure Environment Variables

Copy:

`appwrite-backend/.env.example`

to:

`appwrite-backend/.env`

Configure:

```env
APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_TABLE_ID=files
APPWRITE_BUCKET_ID=your_bucket_id
APPWRITE_API_KEY=your_api_key
```

### Step 3.3: Install Dependencies

```bash
cd appwrite-backend
npm install
```
### Step 3.4: Seed Appwrite Test Data

```bash
node appwrite-seed.js
```

The seeded files are:

| User   | File        | Storage ID    | Table Row ID |
| ------ | ----------- | ------------- | ------------ |
| User 1 | `text1.txt` | `seed-file-1` | `seed-row-1` |
| User 2 | `text2.txt` | `seed-file-2` | `seed-row-2` |
| User 3 | `text3.txt` | `seed-file-3` | `seed-row-3` |

---

## 4. Run the Test Client

The common test client is located at:

`appwrite/index.html`

It supports both:

- Custom REST Backend
- Appwrite Backend

Open the file using a local development server such as VS Code Live Server.

---

# OSDAG Secure Login System

A secure authentication and file-access system implemented using two backend approaches:

* **Custom REST Backend** using Node.js, Express.js, PostgreSQL, and server-side sessions.
* **Appwrite Backend** using Appwrite Authentication, TablesDB, and Storage.

A common test client is provided to test both implementations.

---

## Features

* User registration and login
* Session-based authentication
* Secure password hashing
* Login rate limiting
* Protected `/me` endpoint
* User-specific file listing and access
* File download
* Logout and session invalidation
* Appwrite-based authentication and storage
* Seed scripts for test users and files

---

## Authentication Approach

### Why Session-Based Authentication Instead of JWT?

The Custom Backend uses **server-side sessions** rather than JWTs.

Sessions were chosen because they provide straightforward server-side control over authentication state and allow the session to be invalidated immediately during logout. The session identifier is stored in an HTTP-only cookie, while the session data is maintained server-side using PostgreSQL.

JWTs could also be used, but they would require additional handling for token expiration, storage, and revocation.

---

## Logout Implementation

When the user logs out:

1. The server destroys the user's session from the session store.
2. The session cookie is cleared.
3. Subsequent requests no longer have a valid authenticated session.

This ensures that the logged-out session cannot be reused.

---

## User Data Isolation

User data is isolated using the authenticated user's ID.

For protected file operations, the backend identifies the current user from the session and restricts database queries to files belonging to that user.

For example, requesting another user's file ID does not bypass the ownership check. The same authorization logic is applied to file details and file downloads.

---

## Appwrite Implementation

The Appwrite implementation uses:

* **Appwrite Authentication** for user authentication and session management.
* **TablesDB** for storing file metadata.
* **Storage** for storing the actual files.

### Appwrite Handles

Appwrite provides the underlying authentication, session management, database operations, and file storage services.

### Configured by the Application

The project configures:

* Appwrite project
* Database and files table
* Storage bucket
* Required permissions
* Environment variables
* Seed users and test data

The application code performs the required database queries, file operations, and user-access checks.

---

## API Endpoints

| Method | Endpoint              | Description                 | Authentication |
| ------ | --------------------- | --------------------------- | -------------- |
| POST   | `/register`           | Register a new user         | No             |
| POST   | `/login`              | Log in a user               | No             |
| POST   | `/logout`             | Log out and destroy session | Yes            |
| GET    | `/me`                 | Get current user            | Yes            |
| GET    | `/files`              | Get user's files            | Yes            |
| GET    | `/files/:id`          | Get file details            | Yes            |
| GET    | `/files/:id/download` | Download a file             | Yes            |

---

## Project Structure

```text
osdag-secure-login-system/
├── appwrite/
│   ├── appwrite-adapter.js
│   └── index.html
│
├── appwrite-backend/
│    ├── .env.example
│    ├── appwrite-seed.js
│    ├── package-lock.json
│    └── package.json
│
├── custom-backend/
│   ├── .env.example
│   ├── db.js
│   ├── index.js
│   ├── package-lock.json
│   ├── package.json
│   ├── schema.sql
│   └── seed.js
│
├── uploads   
│    ├── text1.txt
│    ├── text2.txt
│    └── text3.txt
│
│
└── README.md
```

---

## Test Data

The seed scripts provide three test users:

| User   | Email                    | Password    |
| ------ | ------------------------ | ----------- |
| User 1 | `fossee.test1@gmail.com` | `FOSSEE123` |
| User 2 | `fossee.test2@gmail.com` | `FOSSEE123` |
| User 3 | `fossee.test3@gmail.com` | `FOSSEE123` |

Each user has an associated test file.

---

## Security

* Passwords are hashed before storage.
* Authentication uses HTTP-only session cookies.
* Protected endpoints require authentication.
* File access is restricted to the owning user.
* Login attempts are rate-limited.
* Authentication errors use generic responses to avoid unnecessary user enumeration.
* Sensitive configuration values are stored in environment variables.

---

## Improvements / Future Work

Given more time, I would add:

* Automated unit and integration tests for authentication, authorization,    sessions, and file access.
* More comprehensive input validation
* HTTPS and production-specific cookie configuration

---

## Setup Instructions

See the [Setup Instructions](#setup-instructions) above for configuring the Custom Backend, Appwrite Backend, database, seed data, and test client.
