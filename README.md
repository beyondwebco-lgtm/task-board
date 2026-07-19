# 📋 TaskBoard - Clean & Minimal Team Task Assignment Web App

TaskBoard is a fast, lightweight, and modern web application built for seamless task assignment and team workflow tracking. Designed with a modern white theme and royal blue accents, it provides a 5-member team card dashboard with real-time updates and PostgreSQL (Neon / Supabase) persistence.

![TaskBoard Dashboard](https://img.shields.io/badge/TaskBoard-v1.0.0-blue)
![Next.js](https://img.shields.io/badge/Framework-Next.js%2014-black)
![React](https://img.shields.io/badge/Frontend-React%2018-61dafb)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Neon%20%2F%20Supabase-336791)

---

## ✨ Features

- **Responsive White-Themed Dashboard**: Minimal, modern UI with soft ambient shadows, rounded cards (`16px`), and royal blue accents.
- **5 Team Member Cards Grid**:
  - **Neelam Vishwa** (*Senior Frontend Engineer*)
  - **Rahul** (*Full Stack Developer*)
  - **Priya** (*UI/UX Designer*)
  - **Arjun** (*Backend Engineer*)
  - **Sneha** (*Product Manager*)
- **Complete Task CRUD**:
  - **Add Task**: Assign tasks to any member with title, description, status, priority, and due date.
  - **Edit Task**: Reassign or update task details seamlessly.
  - **Delete Task**: Safe task removal with confirmation modal.
  - **Status Change**: Clickable status pill (`Pending`, `In Progress`, `Completed`) for instant status updates.
- **Instant UI Updates**: Newly added/edited tasks appear immediately under the assigned member card without page reloads.
- **PostgreSQL Database Persistence**:
  - Fully compatible with Neon Tech and Supabase PostgreSQL.
  - Includes a schema initialization script ([`schema.sql`](./schema.sql)).
  - Includes an out-of-the-box fallback state if `.env.local` is not configured yet.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS Design System with CSS Variables (`globals.css`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database Connection**: `pg`, `@neondatabase/serverless`, `@supabase/supabase-js`

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later installed
- npm / yarn / pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/task-board.git
   cd task-board
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deploying to Vercel

1. Push your repository to GitHub.
2. Import the project into **[Vercel](https://vercel.com/)**.
3. In your Vercel Project Settings, navigate to **Settings** → **Environment Variables**.
4. Add your Neon PostgreSQL database connection string:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://<user>:<password>@<host>/<db>?sslmode=require`
5. Click **Deploy**. Vercel will automatically build and deploy your app with live cloud PostgreSQL persistence!

---

## 🗄️ Setting Up PostgreSQL (Neon / Supabase)

To connect your own PostgreSQL database:

1. Create a `.env.local` file in the project root:
   ```env
   DATABASE_URL="postgres://user:password@ep-xyz.neon.tech/neondb?sslmode=require"
   ```

2. Execute the database script in [`schema.sql`](./schema.sql) inside your Neon SQL Editor or Supabase SQL Console to create the `members` and `tasks` tables.

---

## 📂 Project Structure

```
task-board/
├── app/
│   ├── api/             # REST API routes for members, tasks, and db-status
│   ├── globals.css      # Design system, light theme tokens, and layout styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main dashboard page
├── components/          # React components (Navbar, MemberCard, TaskCard, TaskModal, etc.)
├── lib/
│   └── db.ts            # Database abstraction layer (PostgreSQL + Fallback)
├── schema.sql           # PostgreSQL table definitions and default seed data
├── package.json
└── README.md
```

---

## 📄 License

This project is licensed under the MIT License.