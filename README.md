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

After creating the `auth_system` database:

1.Open pgAdmin.
2.Select the auth_system database.
3.Open the **Query Tool**.
4.Copy the contents of schema.sql into the Query Tool.
5.Execute the SQL script.

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
