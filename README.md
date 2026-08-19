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


```markdown
## 2. Custom Backend Setup

The Custom Backend uses Node.js, Express.js, PostgreSQL, and server-side sessions.

### Step 2.1: Create the PostgreSQL Database

Create a PostgreSQL database named:

```text
auth_system

This can be done using pgAdmin.

Step 2.2: Create the Database Tables

The database schema is provided in:

schema.sql

After creating the auth_system database:

Open pgAdmin.
Select the auth_system database.
Open the Query Tool.
Copy the contents of schema.sql into the Query Tool.
Execute the SQL script.

This creates the required tables for the Custom Backend.

Step 2.3: Configure Environment Variables

Go to:

custom-backend/.env.example

Create a copy named:

custom-backend/.env

Configure:

PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_system
DB_USER=postgres
DB_PASSWORD=your_postgres_password

SESSION_SECRET=replace_with_a_long_random_secret

Replace your_postgres_password with your PostgreSQL password.

Use a strong random value for SESSION_SECRET.

Do not commit the .env file to Git.

Step 2.4: Install Dependencies

Open a terminal inside the custom-backend directory:

cd custom-backend
npm install

Step 2.5: Seed Test Users and Files

Run:

node seed.js

This creates the predefined test users and their associated test files.

The seeded accounts are:
| User   | Email                    | Password    |
| ------ | ------------------------ | ----------- |
| User 1 | `fossee.test1@gmail.com` | `FOSSEE123` |
| User 2 | `fossee.test2@gmail.com` | `FOSSEE123` |
| User 3 | `fossee.test3@gmail.com` | `FOSSEE123` |

Step 2.6: Start the Custom Backend

Run:

npm run dev

The Custom Backend runs at:

http://127.0.0.1:3000

3. Appwrite Backend Setup

The Appwrite implementation uses:

Appwrite Authentication
Appwrite TablesDB
Appwrite Storage
Step 3.1: Configure the Appwrite Project

Create or use an Appwrite project and configure:

Authentication
A database
A files table
A Storage bucket

The required Appwrite IDs are provided through environment variables.

Step 3.2: Configure Environment Variables

Go to:

appwrite-backend/.env.example

Create a copy named:

appwrite-backend/.env

Configure:

APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_TABLE_ID=files
APPWRITE_BUCKET_ID=your_bucket_id
APPWRITE_API_KEY=your_api_key

Replace the placeholder values with the corresponding values from your Appwrite project.

The Appwrite API key is sensitive and must not be committed to Git.

Step 3.3: Install Dependencies

Open a terminal inside the Appwrite backend directory:

cd appwrite-backend
npm install
Step 3.4: Seed Appwrite Test Data

Run:

node appwrite-seed.js

The seed script creates or verifies:

3 test users
3 Storage files
3 corresponding rows in the files table

The seeded files are:

| User   | File        | Storage ID    | Table Row ID |
| ------ | ----------- | ------------- | ------------ |
| User 1 | `text1.txt` | `seed-file-1` | `seed-row-1` |
| User 2 | `text2.txt` | `seed-file-2` | `seed-row-2` |
| User 3 | `text3.txt` | `seed-file-3` | `seed-row-3` |

The seed script is idempotent. Running it multiple times detects existing users, Storage files, and database rows instead of creating duplicates.

4. Run the Test Client

The common test client is located at:

appwrite/index.html

The test client can be used with both:

Custom REST Backend
Appwrite Backend

It is recommended to open the HTML file using a local development server such as the VS Code Live Server extension.
